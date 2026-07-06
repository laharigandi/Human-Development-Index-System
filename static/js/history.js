/**
 * history.js — HDI Prediction History Page
 * Handles history display, filtering, pagination, and export for the history page.
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
  deleteIndex: null,
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
const todayPredictionsEl = document.getElementById("todayPredictions");
const highestHdiEl = document.getElementById("highestHdi");
const lowestHdiEl = document.getElementById("lowestHdi");
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

function estimateHdiScore(inputs) {
  const health = Math.min(Math.max((inputs.life_expectancy - 20) / 70, 0), 1);
  const meanEdu = Math.min(Math.max(inputs.mean_years_schooling / 20, 0), 1);
  const expectedEdu = Math.min(Math.max(inputs.expected_years_schooling / 25, 0), 1);
  const education = (meanEdu + expectedEdu) / 2;
  const income = Math.min(Math.max(Math.log(inputs.gni_per_capita) / Math.log(150000), 0), 1);
  const score = 0.32 * health + 0.33 * education + 0.35 * income;
  return Number(score.toFixed(3));
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

// ── Load History from LocalStorage ───────────────────────────────────
function loadHistory() {
  try {
    const stored = JSON.parse(localStorage.getItem("hdiPredictionHistory") || "[]");
    if (Array.isArray(stored)) {
      historyState.history = stored;
    }
  } catch {
    historyState.history = [];
  }
  updateStats();
  renderHistory();
}

// ── Update Statistics Cards ───────────────────────────────────────────
function updateStats() {
  const total = historyState.history.length;
  totalPredictionsEl.textContent = total;

  // Today's predictions
  const today = new Date().toLocaleDateString();
  const todayCount = historyState.history.filter(h => h.date === today).length;
  todayPredictionsEl.textContent = todayCount;

  // Highest and Lowest HDI
  const latestPredictionEl = document.getElementById("latestPrediction");
  const averageHdiEl = document.getElementById("averageHdi");
  
  if (historyState.history.length > 0) {
    const scores = historyState.history.map(h => h.score || estimateHdiScore(h.inputs));
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    highestHdiEl.textContent = highest.toFixed(3);
    lowestHdiEl.textContent = lowest.toFixed(3);
    averageHdiEl.textContent = average.toFixed(3);
    
    // Latest prediction (most recent)
    const latest = historyState.history[0];
    if (latest) {
      latestPredictionEl.textContent = latest.category;
    }
  } else {
    highestHdiEl.textContent = "0.000";
    lowestHdiEl.textContent = "0.000";
    averageHdiEl.textContent = "0.000";
    latestPredictionEl.textContent = "-";
  }
}

// ── Filter and Sort History ───────────────────────────────────────────
function getFilteredHistory() {
  let filtered = [...historyState.history];

  // Apply category filter
  if (historyState.categoryFilter !== "all") {
    filtered = filtered.filter(h => h.category === historyState.categoryFilter);
  }

  // Apply search filter
  if (historyState.searchQuery) {
    const query = historyState.searchQuery.toLowerCase();
    filtered = filtered.filter(h =>
      h.country.toLowerCase().includes(query) ||
      h.category.toLowerCase().includes(query) ||
      h.date.toLowerCase().includes(query)
    );
  }

  // Apply sorting
  switch (historyState.sortBy) {
    case "newest":
      filtered.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      break;
    case "oldest":
      filtered.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      break;
    case "highest":
      filtered.sort((a, b) => (b.score || estimateHdiScore(b.inputs)) - (a.score || estimateHdiScore(a.inputs)));
      break;
    case "lowest":
      filtered.sort((a, b) => (a.score || estimateHdiScore(a.inputs)) - (b.score || estimateHdiScore(b.inputs)));
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
  historyBody.innerHTML = paginated.map((item, idx) => {
    const actualIndex = startIndex + idx;
    const score = item.score || estimateHdiScore(item.inputs);
    const flagCode = getCountryCode(item.country);
    const flagEmoji = flagCode ? getFlagEmoji(flagCode) : "🌐";

    return `
      <tr class="history-row">
        <td>${item.country}</td>
        <td>${flagEmoji}</td>
        <td>${item.inputs?.life_expectancy ?? "-"}</td>
        <td>${item.inputs?.mean_years_schooling ?? "-"}</td>
        <td>${item.inputs?.expected_years_schooling ?? "-"}</td>
        <td>${item.inputs?.gni_per_capita ? formatMoney(item.inputs.gni_per_capita) : "-"}</td>
        <td>${score.toFixed(3)}</td>
        <td><span class="category-badge ${item.category.toLowerCase().replace(" ", "-")}">${item.category}</span></td>
        <td>${item.date}</td>
        <td>${item.time}</td>
        <td>
          <div class="d-flex gap-1">
            <button type="button" class="action-btn view-btn" data-index="${actualIndex}" title="View">
              <i class="bi bi-eye"></i>
            </button>
            <button type="button" class="action-btn download-btn" data-index="${actualIndex}" title="Download PDF">
              <i class="bi bi-download"></i>
            </button>
            <button type="button" class="action-btn delete-btn" data-index="${actualIndex}" title="Delete">
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
function showViewModal(index) {
  const entry = historyState.history[index];
  if (!entry) return;

  const score = entry.score || estimateHdiScore(entry.inputs);
  const flagCode = getCountryCode(entry.country);
  const flagEmoji = flagCode ? getFlagEmoji(flagCode) : "🌐";

  const modalBody = document.getElementById("viewModalBody");
  modalBody.innerHTML = `
    <div class="view-modal-grid">
      <div class="view-modal-item">
        <span class="view-modal-label">Country</span>
        <span class="view-modal-value">${flagEmoji} ${entry.country}</span>
      </div>
      <div class="view-modal-item">
        <span class="view-modal-label">HDI Category</span>
        <span class="view-modal-value">
          <span class="category-badge ${entry.category.toLowerCase().replace(" ", "-")}">${entry.category}</span>
        </span>
      </div>
      <div class="view-modal-item">
        <span class="view-modal-label">HDI Score</span>
        <span class="view-modal-value">${score.toFixed(3)}</span>
      </div>
      <div class="view-modal-item">
        <span class="view-modal-label">Life Expectancy</span>
        <span class="view-modal-value">${entry.inputs?.life_expectancy ?? "-"} years</span>
      </div>
      <div class="view-modal-item">
        <span class="view-modal-label">Mean Years of Schooling</span>
        <span class="view-modal-value">${entry.inputs?.mean_years_schooling ?? "-"} years</span>
      </div>
      <div class="view-modal-item">
        <span class="view-modal-label">Expected Years of Schooling</span>
        <span class="view-modal-value">${entry.inputs?.expected_years_schooling ?? "-"} years</span>
      </div>
      <div class="view-modal-item">
        <span class="view-modal-label">GNI Per Capita</span>
        <span class="view-modal-value">${entry.inputs?.gni_per_capita ? formatMoney(entry.inputs.gni_per_capita) : "-"}</span>
      </div>
      <div class="view-modal-item">
        <span class="view-modal-label">Prediction Date</span>
        <span class="view-modal-value">${entry.date}</span>
      </div>
      <div class="view-modal-item">
        <span class="view-modal-label">Prediction Time</span>
        <span class="view-modal-value">${entry.time}</span>
      </div>
      ${entry.recommendations ? `
      <div class="view-modal-item">
        <span class="view-modal-label">Recommendations</span>
        <span class="view-modal-value" style="text-align: right; max-width: 300px;">
          <ul class="recommendation-list" style="margin: 0; padding-left: 1.2rem; text-align: left;">
            ${entry.recommendations.map(r => `<li>${r}</li>`).join("")}
          </ul>
        </span>
      </div>
      ` : ""}
    </div>
  `;

  const viewModal = new bootstrap.Modal(document.getElementById("viewModal"));
  viewModal.show();
}

// ── Download Single Entry as PDF ───────────────────────────────────────
function downloadEntryPdf(index) {
  const entry = historyState.history[index];
  if (!entry) return;

  const score = entry.score || estimateHdiScore(entry.inputs);
  const flagCode = getCountryCode(entry.country);
  const flagEmoji = flagCode ? getFlagEmoji(flagCode) : "🌐";

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    createToast("Unable to open print window.", "danger");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>HDI Report - ${entry.country}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
        h1 { margin-bottom: 18px; }
        h2 { margin-top: 24px; }
        .label { font-weight: 600; color: #555; }
        .value { font-weight: 700; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; }
        .very-high { background: #d1fae5; color: #065f46; }
        .high { background: #dbeafe; color: #1e40af; }
        .medium { background: #fef3c7; color: #92400e; }
        .low { background: #fee2e2; color: #991b1b; }
        ul { margin-top: 0; }
      </style>
    </head>
    <body>
      <h1>HDI Prediction Report</h1>
      <p><span class="label">Country:</span> <span class="value">${flagEmoji} ${entry.country}</span></p>
      <p><span class="label">Category:</span> <span class="badge ${entry.category.toLowerCase().replace(" ", "-")}">${entry.category}</span></p>
      <p><span class="label">HDI Score:</span> <span class="value">${score.toFixed(3)}</span></p>
      <p><span class="label">Date:</span> <span class="value">${entry.date}</span></p>
      <p><span class="label">Time:</span> <span class="value">${entry.time}</span></p>
      <h2>Indicators</h2>
      <ul>
        <li>Life Expectancy: ${entry.inputs?.life_expectancy ?? "-"} years</li>
        <li>Mean Years of Schooling: ${entry.inputs?.mean_years_schooling ?? "-"} years</li>
        <li>Expected Years of Schooling: ${entry.inputs?.expected_years_schooling ?? "-"} years</li>
        <li>GNI Per Capita: ${entry.inputs?.gni_per_capita ? formatMoney(entry.inputs.gni_per_capita) : "-"}</li>
      </ul>
      ${entry.recommendations ? `
      <h2>Recommendations</h2>
      <ul>${entry.recommendations.map(r => `<li>${r}</li>`).join("")}</ul>
      ` : ""}
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

// ── Delete Entry ───────────────────────────────────────────────────────
function deleteEntry(index) {
  historyState.deleteIndex = index;
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
    const score = entry.score || estimateHdiScore(entry.inputs);
    return `
      <tr>
        <td>${entry.country}</td>
        <td>${score.toFixed(3)}</td>
        <td>${entry.category}</td>
        <td>${entry.date}</td>
        <td>${entry.time}</td>
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
            <th>Country</th>
            <th>HDI Score</th>
            <th>Category</th>
            <th>Date</th>
            <th>Time</th>
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
    ["Country", "HDI Score", "Category", "Life Expectancy", "Mean Schooling", "Expected Schooling", "GNI", "Date", "Time"],
    ...filtered.map(entry => {
      const score = entry.score || estimateHdiScore(entry.inputs);
      return [
        entry.country,
        score.toFixed(3),
        entry.category,
        entry.inputs?.life_expectancy ?? "-",
        entry.inputs?.mean_years_schooling ?? "-",
        entry.inputs?.expected_years_schooling ?? "-",
        entry.inputs?.gni_per_capita ? formatMoney(entry.inputs.gni_per_capita) : "-",
        entry.date,
        entry.time,
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
    const score = entry.score || estimateHdiScore(entry.inputs);
    return `
      <tr>
        <td>${entry.country}</td>
        <td>${score.toFixed(3)}</td>
        <td>${entry.category}</td>
        <td>${entry.date}</td>
        <td>${entry.time}</td>
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
            <th>Country</th>
            <th>HDI Score</th>
            <th>Category</th>
            <th>Date</th>
            <th>Time</th>
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
      const downloadBtn = e.target.closest(".download-btn");
      const deleteBtn = e.target.closest(".delete-btn");

      if (viewBtn) {
        showViewModal(Number(viewBtn.dataset.index));
        return;
      }
      if (downloadBtn) {
        downloadEntryPdf(Number(downloadBtn.dataset.index));
        return;
      }
      if (deleteBtn) {
        deleteEntry(Number(deleteBtn.dataset.index));
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
    confirmDeleteBtn.addEventListener("click", () => {
      if (historyState.deleteIndex !== null) {
        historyState.history.splice(historyState.deleteIndex, 1);
        localStorage.setItem("hdiPredictionHistory", JSON.stringify(historyState.history));
        const deleteModal = bootstrap.Modal.getInstance(document.getElementById("deleteModal"));
        deleteModal.hide();
        historyState.deleteIndex = null;
        updateStats();
        renderHistory();
        createToast("Prediction deleted successfully.");
      }
    });
  }

  // Confirm clear all
  if (confirmClearAllBtn) {
    confirmClearAllBtn.addEventListener("click", () => {
      historyState.history = [];
      localStorage.removeItem("hdiPredictionHistory");
      const clearAllModal = bootstrap.Modal.getInstance(document.getElementById("clearAllModal"));
      clearAllModal.hide();
      updateStats();
      renderHistory();
      createToast("All history cleared successfully.");
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