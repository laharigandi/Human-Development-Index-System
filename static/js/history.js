/**
 * history.js — HDI Prediction History Page
 * Handles history display, filtering, pagination, and export for the history page.
 * Fetches data from server API instead of localStorage.
 */

"use strict";

// ── State Management ───────────────────────────────────────────────
const historyState = {
  history: [],
  currentPage: 1,
  itemsPerPage: 10,
  totalPages: 1,
  categoryFilter: "all",
  sortBy: "newest",
  searchQuery: "",
  deleteId: null,
};

// ── DOM References ───────────────────────────────────────────────────
const historySearch = document.getElementById("historySearch");
const categoryFilter = document.getElementById("categoryFilter");
const sortBy = document.getElementById("sortBy");
const historyBody = document.getElementById("historyBody");
const emptyState = document.getElementById("emptyState");
const paginationNav = document.getElementById("paginationNav");
const paginationList = document.getElementById("paginationList");
const totalPredictionsEl = document.getElementById("totalPredictions");
const lastPredictionEl = document.getElementById("lastPrediction");
const averageConfidenceEl = document.getElementById("averageConfidence");
const mostPredictedCategoryEl = document.getElementById("mostPredictedCategory");
const exportPdfBtn = document.getElementById("exportPdfBtn");
const exportExcelBtn = document.getElementById("exportExcelBtn");
const printHistoryBtn = document.getElementById("printHistoryBtn");
const clearAllHistoryBtn = document.getElementById("clearAllHistoryBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const confirmClearAllBtn = document.getElementById("confirmClearAllBtn");
const toastContainer = document.getElementById("toastContainer");
const backToTopBtn = document.getElementById("backToTopBtn");

// ── Country Data (for flag lookup) ───────────────────────────────────
const COUNTRIES = [
  { name: "Australia", code: "AU" },
  { name: "Austria", code: "AT" },
  { name: "Belgium", code: "BE" },
  { name: "Brazil", code: "BR" },
  { name: "Canada", code: "CA" },
  { name: "China", code: "CN" },
  { name: "Denmark", code: "DK" },
  { name: "Egypt", code: "EG" },
  { name: "Finland", code: "FI" },
  { name: "France", code: "FR" },
  { name: "Germany", code: "DE" },
  { name: "Ghana", code: "GH" },
  { name: "India", code: "IN" },
  { name: "Indonesia", code: "ID" },
  { name: "Ireland", code: "IE" },
  { name: "Israel", code: "IL" },
  { name: "Italy", code: "IT" },
  { name: "Japan", code: "JP" },
  { name: "Kenya", code: "KE" },
  { name: "Malaysia", code: "MY" },
  { name: "Mexico", code: "MX" },
  { name: "Netherlands", code: "NL" },
  { name: "New Zealand", code: "NZ" },
  { name: "Nigeria", code: "NG" },
  { name: "Norway", code: "NO" },
  { name: "Philippines", code: "PH" },
  { name: "Poland", code: "PL" },
  { name: "Portugal", code: "PT" },
  { name: "Qatar", code: "QA" },
  { name: "Russia", code: "RU" },
  { name: "Saudi Arabia", code: "SA" },
  { name: "Singapore", code: "SG" },
  { name: "South Africa", code: "ZA" },
  { name: "South Korea", code: "KR" },
  { name: "Spain", code: "ES" },
  { name: "Sweden", code: "SE" },
  { name: "Switzerland", code: "CH" },
  { name: "Thailand", code: "TH" },
  { name: "Turkey", code: "TR" },
  { name: "United Arab Emirates", code: "AE" },
  { name: "United Kingdom", code: "GB" },
  { name: "United States", code: "US" },
  { name: "Vietnam", code: "VN" },
];

// ── Helpers ───────────────────────────────────────────────────────────
function getFlagEmoji(code) {
  if (!code) return "🌐";
  return code.toUpperCase().replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt()));
}

function getCountryCode(countryName) {
  const country = COUNTRIES.find(c => c.name.toLowerCase() === countryName.toLowerCase());
  return country ? country.code : null;
}

function formatMoney(value) {
  return `$${Number(value).toLocaleString()}`;
}

function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function getCategoryBadgeClass(category) {
  const classes = {
    "Very High": "very-high",
    "High": "high",
    "Medium": "medium",
    "Low": "low"
  };
  return classes[category] || "medium";
}

function getCategoryBadgeColor(category) {
  const colors = {
    "Very High": "success",
    "High": "primary",
    "Medium": "warning",
    "Low": "danger"
  };
  return colors[category] || "secondary";
}

function createToast(message, type = "success") {
  if (!toastContainer) return;
  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-bg-${type} border-0 mb-2`;
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");
  toast.setAttribute("aria-atomic", "true");
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>`;
  toastContainer.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }, 3400);
}

// ── Load History from Server API ─────────────────────────────────────
async function loadHistory() {
  try {
    const response = await fetch("/api/predictions");
    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      throw new Error("Failed to load predictions");
    }
    const data = await response.json();
    historyState.history = data.predictions || [];
  } catch (error) {
    console.error("Error loading history:", error);
    historyState.history = [];
  }
  updateStats();
  renderHistory();
}

// ── Update Statistics Cards ───────────────────────────────────────────
function updateStats() {
  const total = historyState.history.length;
  totalPredictionsEl.textContent = total;

  // Last prediction
  if (historyState.history.length > 0) {
    const last = historyState.history[0];
    lastPredictionEl.textContent = formatDate(last.created_at);
  } else {
    lastPredictionEl.textContent = "-";
  }

  // Average confidence
  if (historyState.history.length > 0) {
    const confidences = historyState.history.map(p => {
      try {
        const conf = JSON.parse(p.confidence);
        return p.prediction ? conf[p.prediction] : 0;
      } catch {
        return 0;
      }
    }).filter(c => c > 0);
    const avg = confidences.length > 0 ? confidences.reduce((a, b) => a + b, 0) / confidences.length : 0;
    averageConfidenceEl.textContent = `${Math.round(avg)}%`;
  } else {
    averageConfidenceEl.textContent = "-";
  }

  // Most predicted category
  if (historyState.history.length > 0) {
    const categoryCounts = {};
    historyState.history.forEach(p => {
      categoryCounts[p.prediction] = (categoryCounts[p.prediction] || 0) + 1;
    });
    const mostPredicted = Object.entries(categoryCounts).reduce((a, b) => a[1] > b[1] ? a : b);
    mostPredictedCategoryEl.innerHTML = `<span class="badge bg-${getCategoryBadgeColor(mostPredicted[0])}">${mostPredicted[0]}</span>`;
  } else {
    mostPredictedCategoryEl.textContent = "-";
  }
}

// ── Filter and Sort History ───────────────────────────────────────────
function getFilteredHistory() {
  let filtered = [...historyState.history];

  // Apply category filter
  if (historyState.categoryFilter !== "all") {
    filtered = filtered.filter(h => h.prediction === historyState.categoryFilter);
  }

  // Apply search filter
  if (historyState.searchQuery) {
    const query = historyState.searchQuery.toLowerCase();
    filtered = filtered.filter(h =>
      (h.country && h.country.toLowerCase().includes(query)) ||
      (h.prediction && h.prediction.toLowerCase().includes(query))
    );
  }

  // Apply sorting
  switch (historyState.sortBy) {
    case "newest":
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      break;
    case "oldest":
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      break;
  }

  return filtered;
}

// ── Render History Table ──────────────────────────────────────────────
function renderHistory() {
  const filtered = getFilteredHistory();
  historyState.totalPages = Math.ceil(filtered.length / historyState.itemsPerPage) || 1;

  // Show empty state if no history
  if (filtered.length === 0) {
    emptyState.classList.remove("d-none");
    historyBody.innerHTML = "";
    paginationNav.classList.add("d-none");
    return;
  }

  emptyState.classList.add("d-none");
  paginationNav.classList.remove("d-none");

  // Paginate
  const startIndex = (historyState.currentPage - 1) * historyState.itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + historyState.itemsPerPage);

  // Render rows
  historyBody.innerHTML = paginated.map((item) => {
    const flagCode = getCountryCode(item.country);
    const flagEmoji = flagCode ? getFlagEmoji(flagCode) : "🌐";
    const badgeClass = getCategoryBadgeClass(item.prediction);
    const badgeColor = getCategoryBadgeColor(item.prediction);

    // Parse confidence for display
    let confidenceValue = 0;
    try {
      const conf = JSON.parse(item.confidence);
      confidenceValue = item.prediction ? conf[item.prediction] : 0;
    } catch {
      confidenceValue = 0;
    }

    return `
      <tr class="history-row">
        <td>${formatDate(item.created_at)}</td>
        <td>${item.country || "-"}</td>
        <td><span class="badge bg-${badgeColor}">${item.prediction}</span></td>
        <td>${item.score ? item.score.toFixed(3) : "-"}</td>
        <td>${Math.round(confidenceValue)}%</td>
        <td>Random Forest</td>
        <td>
          <div class="d-flex gap-1">
            <button type="button" class="action-btn view-btn" data-id="${item.id}" title="View">
              <i class="bi bi-eye"></i>
            </button>
            <button type="button" class="action-btn delete-btn" data-id="${item.id}" title="Delete">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  renderPagination();
}

// ── Render Pagination ─────────────────────────────────────────────────
function renderPagination() {
  const pages = [];
  const maxVisible = 5;
  let startPage = Math.max(1, historyState.currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(historyState.totalPages, startPage + maxVisible - 1);

  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  pages.push(`
    <li class="page-item ${historyState.currentPage === 1 ? "disabled" : ""}" id="prevPage">
      <button class="page-link" aria-label="Previous">
        <i class="bi bi-chevron-left"></i>
      </button>
    </li>
  `);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(`
      <li class="page-item ${historyState.currentPage === i ? "active" : ""}">
        <button class="page-link" data-page="${i}">${i}</button>
      </li>
    `);
  }

  pages.push(`
    <li class="page-item ${historyState.currentPage === historyState.totalPages ? "disabled" : ""}" id="nextPage">
      <button class="page-link" aria-label="Next">
        <i class="bi bi-chevron-right"></i>
      </button>
    </li>
  `);

  paginationList.innerHTML = pages.join("");
}

// ── View Modal ─────────────────────────────────────────────────────────
async function showViewModal(predictionId) {
  try {
    const response = await fetch(`/api/predictions/${predictionId}`);
    if (!response.ok) {
      throw new Error("Failed to load prediction details");
    }
    const data = await response.json();
    const entry = data.prediction;
    if (!entry) return;

    const flagCode = getCountryCode(entry.country);
    const flagEmoji = flagCode ? getFlagEmoji(flagCode) : "🌐";

    // Parse confidence
    let confidenceObj = {};
    try {
      confidenceObj = JSON.parse(entry.confidence);
    } catch {
      confidenceObj = {};
    }

    const modalBody = document.getElementById("viewModalBody");
    modalBody.innerHTML = `
      <div class="view-modal-grid">
        <div class="view-modal-item">
          <span class="view-modal-label">Country</span>
          <span class="view-modal-value">${flagEmoji} ${entry.country || "-"}</span>
        </div>
        <div class="view-modal-item">
          <span class="view-modal-label">HDI Category</span>
          <span class="view-modal-value">
            <span class="badge bg-${getCategoryBadgeColor(entry.prediction)}">${entry.prediction}</span>
          </span>
        </div>
        <div class="view-modal-item">
          <span class="view-modal-label">Prediction Score</span>
          <span class="view-modal-value">${entry.score ? entry.score.toFixed(3) : "-"}</span>
        </div>
        <div class="view-modal-item">
          <span class="view-modal-label">Confidence</span>
          <span class="view-modal-value">${entry.prediction ? confidenceObj[entry.prediction] || 0 : 0}%</span>
        </div>
        <div class="view-modal-item">
          <span class="view-modal-label">Life Expectancy</span>
          <span class="view-modal-value">${entry.life_expectancy ?? "-"} years</span>
        </div>
        <div class="view-modal-item">
          <span class="view-modal-label">Mean Years of Schooling</span>
          <span class="view-modal-value">${entry.mean_schooling ?? "-"} years</span>
        </div>
        <div class="view-modal-item">
          <span class="view-modal-label">Expected Years of Schooling</span>
          <span class="view-modal-value">${entry.expected_schooling ?? "-"} years</span>
        </div>
        <div class="view-modal-item">
          <span class="view-modal-label">GNI Per Capita</span>
          <span class="view-modal-value">${entry.gni ? formatMoney(entry.gni) : "-"}</span>
        </div>
        <div class="view-modal-item">
          <span class="view-modal-label">Prediction Date</span>
          <span class="view-modal-value">${formatDate(entry.created_at)}</span>
        </div>
        <div class="view-modal-item">
          <span class="view-modal-label">Prediction Time</span>
          <span class="view-modal-value">${formatTime(entry.created_at)}</span>
        </div>
        <div class="view-modal-item">
          <span class="view-modal-label">Model Used</span>
          <span class="view-modal-value">Random Forest</span>
        </div>
      </div>
    `;

    const viewModal = new bootstrap.Modal(document.getElementById("viewModal"));
    viewModal.show();
  } catch (error) {
    console.error("Error loading prediction:", error);
    createToast("Failed to load prediction details.", "danger");
  }
}

// ── Delete Entry ───────────────────────────────────────────────────────
function deleteEntry(predictionId) {
  historyState.deleteId = predictionId;
  const deleteModal = new bootstrap.Modal(document.getElementById("deleteModal"));
  deleteModal.show();
}

// ── Clear All History ───────────────────────────────────────────────────
function clearAllHistory() {
  const clearAllModal = new bootstrap.Modal(document.getElementById("clearAllModal"));
  clearAllModal.show();
}

// ── Export All to PDF ───────────────────────────────────────────────────
function exportAllPdf() {
  const filtered = getFilteredHistory();
  if (filtered.length === 0) {
    createToast("No history to export.", "danger");
    return;
  }

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    createToast("Unable to open print window.", "danger");
    return;
  }

  let rows = filtered.map(entry => {
    return `
      <tr>
        <td>${formatDate(entry.created_at)}</td>
        <td>${entry.country || "-"}</td>
        <td>${entry.prediction}</td>
        <td>${entry.score ? entry.score.toFixed(3) : "-"}</td>
        <td>${entry.prediction ? JSON.parse(entry.confidence || '{}')[entry.prediction] || 0 : 0}%</td>
        <td>Random Forest</td>
      </tr>
    `;
  }).join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>HDI Prediction History</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
        h1 { margin-bottom: 18px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f4f4f4; }
      </style>
    </head>
    <body>
      <h1>HDI Prediction History</h1>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Country</th>
            <th>Category</th>
            <th>Score</th>
            <th>Confidence</th>
            <th>Model</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

// ── Export All to Excel ───────────────────────────────────────────────────
function exportAllExcel() {
  const filtered = getFilteredHistory();
  if (filtered.length === 0) {
    createToast("No history to export.", "danger");
    return;
  }

  const wsData = [
    ["HDI Prediction History"],
    [],
    ["Date", "Country", "Category", "Score", "Confidence", "Model"],
    ...filtered.map(entry => {
      return [
        formatDate(entry.created_at),
        entry.country || "-",
        entry.prediction,
        entry.score ? entry.score.toFixed(3) : "-",
        entry.prediction ? JSON.parse(entry.confidence || '{}')[entry.prediction] || 0 : 0,
        "Random Forest",
      ];
    }),
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "History");
  XLSX.writeFile(wb, "HDI-prediction-history.xlsx");
  createToast("Excel exported successfully.");
}

// ── Print History ───────────────────────────────────────────────────────
function printHistory() {
  const filtered = getFilteredHistory();
  if (filtered.length === 0) {
    createToast("No history to print.", "danger");
    return;
  }

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    createToast("Unable to open print window.", "danger");
    return;
  }

  let rows = filtered.map(entry => {
    return `
      <tr>
        <td>${formatDate(entry.created_at)}</td>
        <td>${entry.country || "-"}</td>
        <td>${entry.prediction}</td>
        <td>${entry.score ? entry.score.toFixed(3) : "-"}</td>
        <td>${entry.prediction ? JSON.parse(entry.confidence || '{}')[entry.prediction] || 0 : 0}%</td>
        <td>Random Forest</td>
      </tr>
    `;
  }).join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Print HDI History</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
        h1 { margin-bottom: 18px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f4f4f4; }
      </style>
    </head>
    <body>
      <h1>HDI Prediction History</h1>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Country</th>
            <th>Category</th>
            <th>Score</th>
            <th>Confidence</th>
            <th>Model</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

// ── Scroll Progress & Back to Top ───────────────────────────────────────
function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  document.documentElement.style.setProperty("--scroll-progress", `${progress}%`);
  if (backToTopBtn) {
    backToTopBtn.classList.toggle("show", scrollTop > 440);
  }
}

// ── Event Listeners ─────────────────────────────────────────────────────
function initHistoryPage() {
  loadHistory();

  // Search input
  if (historySearch) {
    historySearch.addEventListener("input", (e) => {
      historyState.searchQuery = e.target.value;
      historyState.currentPage = 1;
      renderHistory();
    });
  }

  // Category filter
  if (categoryFilter) {
    categoryFilter.addEventListener("change", (e) => {
      historyState.categoryFilter = e.target.value;
      historyState.currentPage = 1;
      renderHistory();
    });
  }

  // Sort by
  if (sortBy) {
    sortBy.addEventListener("change", (e) => {
      historyState.sortBy = e.target.value;
      historyState.currentPage = 1;
      renderHistory();
    });
  }

  // Table actions
  if (historyBody) {
    historyBody.addEventListener("click", (e) => {
      const viewBtn = e.target.closest(".view-btn");
      const deleteBtn = e.target.closest(".delete-btn");

      if (viewBtn) {
        showViewModal(Number(viewBtn.dataset.id));
        return;
      }
      if (deleteBtn) {
        deleteEntry(Number(deleteBtn.dataset.id));
        return;
      }
    });
  }

  // Pagination
  if (paginationList) {
    paginationList.addEventListener("click", (e) => {
      const pageBtn = e.target.closest(".page-link");
      if (!pageBtn) return;

      const page = pageBtn.dataset.page;
      if (page) {
        historyState.currentPage = Number(page);
        renderHistory();
      } else if (pageBtn.parentElement.id === "prevPage" && historyState.currentPage > 1) {
        historyState.currentPage--;
        renderHistory();
      } else if (pageBtn.parentElement.id === "nextPage" && historyState.currentPage < historyState.totalPages) {
        historyState.currentPage++;
        renderHistory();
      }
    });
  }

  // Export buttons
  if (exportPdfBtn) {
    exportPdfBtn.addEventListener("click", exportAllPdf);
  }
  if (exportExcelBtn) {
    exportExcelBtn.addEventListener("click", exportAllExcel);
  }
  if (printHistoryBtn) {
    printHistoryBtn.addEventListener("click", printHistory);
  }
  if (clearAllHistoryBtn) {
    clearAllHistoryBtn.addEventListener("click", clearAllHistory);
  }

  // Confirm delete
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", async () => {
      if (historyState.deleteId !== null) {
        try {
          const response = await fetch(`/api/predictions/${historyState.deleteId}`, {
            method: "DELETE"
          });
          if (response.ok) {
            const deleteModal = bootstrap.Modal.getInstance(document.getElementById("deleteModal"));
            deleteModal.hide();
            historyState.deleteId = null;
            loadHistory();
            createToast("Prediction deleted successfully.");
          } else {
            createToast("Failed to delete prediction.", "danger");
          }
        } catch (error) {
          createToast("Network error. Please try again.", "danger");
        }
      }
    });
  }

  // Confirm clear all
  if (confirmClearAllBtn) {
    confirmClearAllBtn.addEventListener("click", async () => {
      try {
        // Delete all predictions
        for (const item of historyState.history) {
          await fetch(`/api/predictions/${item.id}`, { method: "DELETE" });
        }
        const clearAllModal = bootstrap.Modal.getInstance(document.getElementById("clearAllModal"));
        clearAllModal.hide();
        loadHistory();
        createToast("All history cleared successfully.");
      } catch (error) {
        createToast("Failed to clear history.", "danger");
      }
    });
  }

  // Back to top
  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Scroll progress
  window.addEventListener("scroll", updateScrollProgress, { passive: true });
}

// ── Initialize ─────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", initHistoryPage);