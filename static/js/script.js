/**
 * script.js — HDI Prediction System
 * Handles form validation, country selection, analytics, charts, history, and report generation.
 */

"use strict";

// ── Country Data ─────────────────────────────────────────────────────────────────
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

const FIELDS = [
  { id: "life_expectancy",          label: "Life Expectancy",           min: 20,  max: 90,     unit: "years" },
  { id: "mean_years_schooling",     label: "Mean Years of Schooling",   min: 0,   max: 20,     unit: "years" },
  { id: "expected_years_schooling", label: "Expected Years of Schooling", min: 0, max: 25,     unit: "years" },
  { id: "gni_per_capita",           label: "GNI Per Capita",            min: 100, max: 150000, unit: "PPP $" },
];

const CATEGORY_COLORS = {
  "Very High": { bar: "#10b981", ring: "rgba(16,185,129,0.15)", border: "#10b981" },
  "High":      { bar: "#3b82f6", ring: "rgba(59,130,246,0.15)",  border: "#3b82f6" },
  "Medium":    { bar: "#f59e0b", ring: "rgba(245,158,11,0.15)",  border: "#f59e0b" },
  "Low":       { bar: "#ef4444", ring: "rgba(239,68,68,0.15)",   border: "#ef4444" },
};

// Country HDI comparison data (realistic demo values)
const COUNTRY_HDI_COMPARISON = {
  "United States": 0.921,
  "Germany": 0.902,
  "Japan": 0.890,
  "China": 0.768,
  "India": 0.786,
  "Brazil": 0.765,
  "Norway": 0.957,
  "Switzerland": 0.946,
  "Singapore": 0.942,
  "South Korea": 0.925,
  "United Kingdom": 0.926,
  "France": 0.891,
  "Canada": 0.924,
  "Australia": 0.945,
  "Netherlands": 0.945,
  "Sweden": 0.945,
  "Denmark": 0.945,
  "Finland": 0.938,
  "Austria": 0.925,
  "Belgium": 0.923,
  "Malaysia": 0.803,
  "Thailand": 0.777,
  "Indonesia": 0.720,
  "Mexico": 0.767,
  "Philippines": 0.721,
  "Vietnam": 0.703,
  "Egypt": 0.696,
  "Russia": 0.798,
  "Ireland": 0.944,
  "Italy": 0.891,
  "Spain": 0.891,
  "Portugal": 0.873,
  "Poland": 0.873,
  "New Zealand": 0.931,
  "Israel": 0.928,
  "Qatar": 0.845,
  "Saudi Arabia": 0.844,
  "United Arab Emirates": 0.843,
  "South Africa": 0.639,
  "Nigeria": 0.541,
  "Kenya": 0.544,
  "Ghana": 0.592,
};

const state = {
  chartInstances: {
    result: [],
    dashboard: [],
  },
  history: [],
  historySortAsc: false,
  loadingTimer: null,
  loadingProgress: 0,
};

// ── DOM Refs ───────────────────────────────────────────────────────────────────
const form             = document.getElementById("hdiForm");
const predictBtn       = document.getElementById("predictBtn");
const btnText          = predictBtn ? predictBtn.querySelector(".btn-text") : null;
const btnLoading       = predictBtn ? predictBtn.querySelector(".btn-loading") : null;
const formError        = document.getElementById("formError");
const formErrorMsg     = document.getElementById("formErrorMsg");
const resultPlaceholder = document.getElementById("resultPlaceholder");
const resultCard       = document.getElementById("resultCard");
const countrySearch    = document.getElementById("countrySearch");
const countryInput     = document.getElementById("countryInput");
const countryDropdown  = document.getElementById("countryDropdown");
const loadingState     = document.getElementById("loadingState");
const loadingStepText  = document.getElementById("loadingStepText");
const loadingProgress  = document.getElementById("loadingProgress");
const loadingPercent   = document.getElementById("loadingPercent");
const recommendationList = document.getElementById("recommendationList");
const resultCountryDisplay = document.getElementById("resultCountryDisplay");
const resultCountryName = resultCountryDisplay ? resultCountryDisplay.querySelector(".country-name") : null;
const toastContainer   = document.getElementById("toastContainer");
const backToTopBtn     = document.getElementById("backToTopBtn");
const statsCounters    = document.querySelectorAll(".stat-number[data-target]");
const copyResultBtn        = document.getElementById("copyResultBtn");
const downloadPDFBtn       = document.getElementById("downloadPDFBtn");
const downloadExcelBtn     = document.getElementById("downloadExcelBtn");
const downloadCSVBtn       = document.getElementById("downloadCSVBtn");
const printBtn             = document.getElementById("printBtn");
const copyLinkBtn          = document.getElementById("copyLinkBtn");
const shareWhatsAppBtn     = document.getElementById("shareWhatsAppBtn");
const shareLinkedInBtn     = document.getElementById("shareLinkedInBtn");
const shareEmailBtn        = document.getElementById("shareEmailBtn");
const dashboardBarCanvas    = document.getElementById("dashboardBarChart");
const dashboardDoughnutCanvas = document.getElementById("dashboardDoughnutChart");
const dashboardProgressBars = document.getElementById("dashboardProgressBars");
const contributionBars     = document.getElementById("contributionBars");
const strengthList         = document.getElementById("strengthList");
const weaknessList         = document.getElementById("weaknessList");
const reportSummary        = document.getElementById("reportSummary");
const hdiScoreValue        = document.getElementById("hdiScoreValue");
const resultDate           = document.getElementById("resultDate");
const resultTime           = document.getElementById("resultTime");
const resultCategoryBadge  = document.getElementById("resultCategoryBadge");
const predictionStatusBadge = document.getElementById("predictionStatusBadge");
const resultIconRing       = document.getElementById("resultIconRing");
const confidenceBars       = document.getElementById("confidenceBars");
const inputSummary         = document.getElementById("inputSummary");

// ── Helpers ────────────────────────────────────────────────────────────────────
function getFlagEmoji(code) {
  return code
    .toUpperCase()
    .replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt()));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatMoney(value) {
  return `$${Number(value).toLocaleString()}`;
}

function estimateHdiScore(inputs) {
  const health = clamp((inputs.life_expectancy - 20) / 70, 0, 1);
  const meanEdu = clamp(inputs.mean_years_schooling / 20, 0, 1);
  const expectedEdu = clamp(inputs.expected_years_schooling / 25, 0, 1);
  const education = (meanEdu + expectedEdu) / 2;
  const income = clamp(Math.log(inputs.gni_per_capita) / Math.log(150000), 0, 1);
  const score = 0.32 * health + 0.33 * education + 0.35 * income;
  return Number(score.toFixed(3));
}

function formatHdiScore(score) {
  return score.toFixed(3);
}

function buildContributionLabel(fieldId, value) {
  const status = getIndicatorStatus(fieldId, value);
  if (status.color === "success") return "Strong Positive Contribution";
  if (status.color === "warning") return "Moderate Contribution";
  return "Needs Improvement";
}

function renderExplanation(inputs) {
  const items = [
    { id: "life_expectancy", label: "Life Expectancy" },
    { id: "mean_years_schooling", label: "Mean Years of Schooling" },
    { id: "expected_years_schooling", label: "Expected Years of Schooling" },
    { id: "gni_per_capita", label: "GNI Per Capita" },
  ];

  const explanationItems = document.getElementById("explanationItems");
  if (explanationItems) {
    explanationItems.innerHTML = items.map(item => {
      const status = getIndicatorStatus(item.id, inputs[item.id]);
      const contribution = buildContributionLabel(item.id, inputs[item.id]);
      return `
        <div class="explanation-item">
          <strong>${item.label}</strong>
          <span>${status.label} — ${contribution}</span>
        </div>`;
    }).join("");
  }

  const overallExplanation = document.getElementById("overallExplanation");
  if (overallExplanation) {
    const healthValue = inputs.life_expectancy >= 75 ? "excellent health" : inputs.life_expectancy >= 60 ? "stable health" : "health that needs stronger support";
    const educationValue = (inputs.mean_years_schooling + inputs.expected_years_schooling) / 2 >= 12 ? "solid educational attainment" : "education that needs further investment";
    const incomeValue = inputs.gni_per_capita >= 20000 ? "strong income capacity" : "income that requires uplift";

    overallExplanation.textContent = `This prediction reflects ${healthValue}, ${educationValue}, and ${incomeValue}. The selected category is driven by the combined contribution of health, schooling, and income performance.`;
  }
}

function renderFeatureContributions(inputs) {
  const contributions = [
    { label: "Life Expectancy", value: clamp((inputs.life_expectancy - 20) / 70 * 100, 0, 100), color: "#10b981" },
    { label: "Education", value: clamp(((inputs.mean_years_schooling + inputs.expected_years_schooling) / 45) * 100, 0, 100), color: "#3b82f6" },
    { label: "Expected Schooling", value: clamp(inputs.expected_years_schooling / 25 * 100, 0, 100), color: "#f59e0b" },
    { label: "Income", value: clamp((Math.log(inputs.gni_per_capita) - Math.log(100)) / (Math.log(150000) - Math.log(100)) * 100, 0, 100), color: "#8b5cf6" },
  ];

  if (contributionBars) {
    contributionBars.innerHTML = contributions.map(item => `
      <div class="contribution-bar">
        <div class="contribution-label"><span>${item.label}</span><span>${Math.round(item.value)}%</span></div>
        <div class="feature-bar-bg"><div class="feature-bar-fill" style="width:0; background:${item.color}" data-value="${item.value}"></div></div>
      </div>`).join("");

    requestAnimationFrame(() => {
      contributionBars.querySelectorAll(".feature-bar-fill").forEach(bar => {
        bar.style.width = `${bar.dataset.value}%`;
      });
    });
  }
}

function renderProgressMetrics(inputs) {
  const progress = [
    { label: "Life Expectancy", value: clamp((inputs.life_expectancy - 20) / 70 * 100, 0, 100), color: "#10b981" },
    { label: "Education", value: clamp(((inputs.mean_years_schooling + inputs.expected_years_schooling) / 45) * 100, 0, 100), color: "#3b82f6" },
    { label: "Expected Schooling", value: clamp(inputs.expected_years_schooling / 25 * 100, 0, 100), color: "#f59e0b" },
    { label: "Income", value: clamp((Math.log(inputs.gni_per_capita) - Math.log(100)) / (Math.log(150000) - Math.log(100)) * 100, 0, 100), color: "#8b5cf6" },
  ];

  if (dashboardProgressBars) {
    dashboardProgressBars.innerHTML = progress.map(item => `
      <div class="progress-metric">
        <div class="progress-metric-label"><span>${item.label}</span><span>${Math.round(item.value)}%</span></div>
        <div class="progress-meter"><div class="progress-meter-fill" style="width:0; background:${item.color}" data-value="${item.value}"></div></div>
      </div>`).join("");

    requestAnimationFrame(() => {
      dashboardProgressBars.querySelectorAll(".progress-meter-fill").forEach(bar => {
        bar.style.width = `${bar.dataset.value}%`;
      });
    });
  }
}

function renderStrengthWeakness(inputs, category) {
  const strengths = [];
  const weaknesses = [];

  if (inputs.life_expectancy >= 70) strengths.push("High Life Expectancy");
  else weaknesses.push("Healthcare needs improvement");

  if (inputs.mean_years_schooling >= 12) strengths.push("Strong education foundation");
  else weaknesses.push("Education needs improvement");

  if (inputs.expected_years_schooling >= 14) strengths.push("Good school enrollment outlook");
  else weaknesses.push("Increase school enrollment");

  if (inputs.gni_per_capita >= 20000) strengths.push("High income potential");
  else weaknesses.push("Income growth required");

  if (category === "Very High") strengths.push("Stable governance and policy environment");
  if (category === "Low") weaknesses.push("Development intervention required");

  if (strengthList) {
    strengthList.innerHTML = strengths.length ? strengths.map(item => `<li>${item}</li>`).join("") : `<li>No significant strengths identified.</li>`;
  }
  if (weaknessList) {
    weaknessList.innerHTML = weaknesses.length ? weaknesses.map(item => `<li>${item}</li>`).join("") : `<li>No immediate weaknesses identified.</li>`;
  }
}

function buildScenario(category, inputs) {
  const score = estimateHdiScore(inputs);
  switch (category) {
    case "Very High":
      return {
        title: "Very High Human Development",
        description: "The country is performing strongly in health, education, and income indicators.",
        reason: "Excellent indicator performance across all dimensions supports a very high development ranking.",
      };
    case "High":
      return {
        title: "High Human Development",
        description: "The country shows sound development with room to strengthen education and income levels.",
        reason: "Good progress in health and schooling, while income growth can deepen development.",
      };
    case "Medium":
      return {
        title: "Emerging Economy",
        description: "The country is on an improving development path but needs focused investment.",
        reason: "Moderate health and education scores, with income still developing.",
      };
    default:
      return {
        title: "Development Intervention Required",
        description: "The country needs targeted support in health, education, and income opportunities.",
        reason: "Low performance across core indicators suggests urgent development action.",
      };
  }
}

function renderScenario(category, inputs) {
  const scenario = buildScenario(category, inputs);
  const scenarioTitle = document.getElementById("scenarioTitle");
  const scenarioDescription = document.getElementById("scenarioDescription");
  const scenarioReason = document.getElementById("scenarioReason");
  
  if (scenarioTitle) scenarioTitle.textContent = scenario.title;
  if (scenarioDescription) scenarioDescription.textContent = scenario.description;
  if (scenarioReason) scenarioReason.textContent = scenario.reason;
}

function renderAiSummary(category, inputs, country) {
  const score = estimateHdiScore(inputs);
  if (reportSummary) {
    reportSummary.textContent = `The predicted HDI score is ${formatHdiScore(score)}, placing ${country} in the ${category} category. Life expectancy is ${inputs.life_expectancy >= 75 ? "strong" : inputs.life_expectancy >= 60 ? "stable" : "challenged"}, education shows ${inputs.mean_years_schooling >= 12 ? "good" : "room for improvement"}, and income remains ${inputs.gni_per_capita >= 20000 ? "healthy" : "developing"}. Further investment in healthcare, education, employment, and infrastructure can improve future HDI performance.`;
  }
}

// Gauge chart removed - no longer used in the redesigned dashboard

function downloadHistoryEntry(index) {
  const entry = state.history[index];
  if (!entry) return;
  const wsData = [
    ["HDI Prediction Report"],
    ["Country", entry.country],
    ["Score", entry.score.toFixed(3)],
    ["Category", entry.category],
    ["Date", entry.date],
    ["Time", entry.time],
    [],
    ["Recommendations"],
    ...entry.recommendations.map(row => [row]),
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "HDI Report");
  XLSX.writeFile(wb, `HDI-history-${entry.country.replace(/\s+/g, "-")}.xlsx`);
}

function downloadExcel() {
  if (!window.XLSX) {
    createToast("Excel export is unavailable.", "danger");
    return;
  }
  const report = makeReportData();
  const rows = [
    ["HDI Prediction Report"],
    ["Country", report.country],
    ["Category", report.category],
    ["Score", report.score ? report.score.toFixed(3) : "-"],
    ["Date", report.date.toLocaleDateString()],
    ["Time", report.date.toLocaleTimeString()],
    [],
    ["Indicators"],
    ...report.inputs.map(line => [line]),
    [],
    ["Recommendations"],
    ...report.recommendations.map(line => [line]),
  ];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "HDI Report");
  XLSX.writeFile(wb, `HDI-report-${report.country.replace(/\s+/g, "-")}.xlsx`);
  createToast("Excel downloaded successfully.");
}

function downloadPDF() {
  const exportArea = document.getElementById("reportExportArea");
  if (!exportArea || !window.html2pdf) {
    createToast("PDF download unavailable.", "danger");
    return;
  }
  const report = makeReportData();

  // Apply PDF-mode class so @media print CSS overrides activate
  exportArea.classList.add("pdf-export-mode");

  const options = {
    margin:   [10, 10, 10, 10],
    filename: `HDI-report-${report.country.replace(/\s+/g, "-")}.pdf`,
    image:    { type: "jpeg", quality: 1.0 },
    html2canvas: {
      scale:           2,
      useCORS:         true,
      logging:         false,
      backgroundColor: "#ffffff",
      windowWidth:     900,
      scrollX:         0,
      scrollY:         0,
    },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] },
  };

  html2pdf()
    .set(options)
    .from(exportArea)
    .save()
    .then(() => {
      exportArea.classList.remove("pdf-export-mode");
      createToast("PDF downloaded successfully.");
    })
    .catch(() => {
      exportArea.classList.remove("pdf-export-mode");
      createToast("PDF generation failed.", "danger");
    });
}

function makeReportData() {
  const category = document.getElementById("resultCategory") ? document.getElementById("resultCategory").textContent : "Unknown";
  const countryLabel = resultCountryDisplay ? resultCountryDisplay.textContent.replace("Country:", "").trim() : "Unknown";
  const inputs = [];
  const inputSummaryEl = document.getElementById("inputSummary");
  if (inputSummaryEl) {
    inputs.push(...Array.from(inputSummaryEl.querySelectorAll(".summary-item")).map(item => {
      const keyEl = item.querySelector(".summary-key");
      const valueEl = item.querySelector(".summary-value");
      return keyEl && valueEl ? `${keyEl.textContent}: ${valueEl.textContent}` : "";
    }).filter(Boolean));
  }
  const recommendations = recommendationList ? Array.from(recommendationList.children).map(item => item.textContent) : [];
  const score = hdiScoreValue && hdiScoreValue.textContent ? Number(hdiScoreValue.textContent) : estimateHdiScore({
    life_expectancy: Number(document.getElementById("life_expectancy")?.value || 0),
    mean_years_schooling: Number(document.getElementById("mean_years_schooling")?.value || 0),
    expected_years_schooling: Number(document.getElementById("expected_years_schooling")?.value || 0),
    gni_per_capita: Number(document.getElementById("gni_per_capita")?.value || 0),
  });
  return {
    country: countryLabel,
    category,
    score,
    inputs,
    recommendations,
    date: new Date(),
  };
}

function downloadCSV() {
  const report = makeReportData();
  const rows = [
    ["Country", report.country],
    ["Prediction", report.category],
    ["Date", report.date.toLocaleDateString()],
    ["Time", report.date.toLocaleTimeString()],
    [],
    ["Indicators"],
    ...report.inputs.map(line => [line]),
    [],
    ["Recommendations"],
    ...report.recommendations.map(line => [line]),
  ];
  const csv = rows.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = 
  `HDI-report-${report.country.replace(/\s+/g, "-")}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  createToast("CSV downloaded successfully.");
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

function showFormError(msg) {
  if (formErrorMsg) formErrorMsg.textContent = msg;
  if (formError) formError.classList.remove("d-none");
}

function hideFormError() {
  if (formError) formError.classList.add("d-none");
}

function getIndicatorStatus(fieldId, value) {
  const numeric = Number(value);
  if (fieldId === "life_expectancy") {
    if (numeric >= 75) return { label: "Excellent", icon: "🟢", color: "success" };
    if (numeric >= 60) return { label: "Average", icon: "🟡", color: "warning" };
    return { label: "Poor", icon: "🔴", color: "danger" };
  }
  if (fieldId === "mean_years_schooling") {
    if (numeric >= 12) return { label: "Excellent", icon: "🟢", color: "success" };
    if (numeric >= 6) return { label: "Moderate", icon: "🟡", color: "warning" };
    return { label: "Needs Improvement", icon: "🔴", color: "danger" };
  }
  if (fieldId === "expected_years_schooling") {
    if (numeric >= 15) return { label: "Excellent", icon: "🟢", color: "success" };
    if (numeric >= 10) return { label: "Moderate", icon: "🟡", color: "warning" };
    return { label: "Needs Improvement", icon: "🔴", color: "danger" };
  }
  if (fieldId === "gni_per_capita") {
    if (numeric >= 20000) return { label: "High", icon: "🟢", color: "success" };
    if (numeric >= 7000) return { label: "Medium", icon: "🟡", color: "warning" };
    return { label: "Low", icon: "🔴", color: "danger" };
  }
  return { label: "Pending", icon: "🟡", color: "warning" };
}

function updateFieldStatus(field) {
  const statusEl = document.getElementById(`status_${field.id}`);
  const input = document.getElementById(field.id);
  if (!statusEl || !input) return;
  const value = input.value.trim();

  if (!value) {
    statusEl.textContent = "";
    statusEl.className = "input-status";
    return;
  }

  const status = getIndicatorStatus(field.id, value);
  statusEl.textContent = `${status.icon} ${status.label}`;
  statusEl.className = `input-status status-${status.color}`;
}

function validateField(field) {
  const input = document.getElementById(field.id);
  const errEl = document.getElementById(`err_${field.id}`);
  if (!input || !errEl) return false;
  const val   = input.value.trim();

  input.classList.remove("is-invalid");
  errEl.classList.remove("show");
  errEl.textContent = "";

  if (!val) {
    input.classList.add("is-invalid");
    errEl.textContent = `❌ Please enter a valid ${field.label.toLowerCase()}.`;
    errEl.classList.add("show");
    return false;
  }

  const num = parseFloat(val);
  if (isNaN(num)) {
    input.classList.add("is-invalid");
    errEl.textContent = `❌ ${field.label} must be a number.`;
    errEl.classList.add("show");
    return false;
  }

  if (num < field.min || num > field.max) {
    input.classList.add("is-invalid");
    errEl.textContent = `❌ ${field.label} must be between ${field.min} and ${field.max}.`;
    errEl.classList.add("show");
    return false;
  }

  return true;
}

function validateAll() {
  return FIELDS.map(f => validateField(f)).every(Boolean) && validateCountry();
}

function validateCountry() {
  const value = countrySearch.value.trim();
  const errEl = document.getElementById("err_country");
  if (!errEl) return false;
  errEl.classList.remove("show");
  errEl.textContent = "";
  if (countrySearch) countrySearch.classList.remove("is-invalid");

  if (!value) {
    if (countrySearch) countrySearch.classList.add("is-invalid");
    errEl.textContent = "❌ Country is required.";
    errEl.classList.add("show");
    return false;
  }

  const match = COUNTRIES.find(country => country.name.toLowerCase() === value.toLowerCase());
  if (!match) {
    if (countrySearch) countrySearch.classList.add("is-invalid");
    errEl.textContent = "❌ Please select a valid country from the list.";
    errEl.classList.add("show");
    return false;
  }

  if (countryInput) countryInput.value = match.name;
  if (countrySearch) countrySearch.classList.remove("is-invalid");
  return true;
}

function setSelectedCountry(name, code) {
  if (countrySearch) countrySearch.value = name;
  if (countryInput) countryInput.value = name;
  if (countryDropdown) countryDropdown.classList.add("d-none");
}

function updateCountryDropdown(items) {
  if (!countryDropdown) return;
  if (!items.length) {
    countryDropdown.innerHTML = `<div class="country-empty">No matches found.</div>`;
    countryDropdown.classList.remove("d-none");
    return;
  }

  countryDropdown.innerHTML = items.map(country => `
    <button type="button" class="country-item" data-name="${country.name}" data-code="${country.code}">
      <span class="country-flag">${getFlagEmoji(country.code)}</span>
      <span>${country.name}</span>
    </button>
  `).join("");
  countryDropdown.classList.remove("d-none");
}

function filterCountries(query) {
  if (!query) return [];
  return COUNTRIES.filter(country => country.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8);
}

function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  document.documentElement.style.setProperty("--scroll-progress", `${progress}%`);
  if (backToTopBtn) {
    backToTopBtn.classList.toggle("show", scrollTop > 440);
  }
}

function animateCounters() {
  statsCounters.forEach(counter => {
    const target = Number(counter.dataset.target) || 0;
    if (!target) return;
    let current = 0;
    const duration = 1400;
    const stepTime = Math.max(Math.floor(duration / target), 20);
    const increment = target / (duration / stepTime);
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        counter.textContent = target;
        clearInterval(timer);
      } else {
        counter.textContent = Math.floor(current);
      }
    }, stepTime);
  });
}

function setLoading(loading) {
  if (predictBtn) predictBtn.disabled = loading;
  if (btnText) btnText.classList.toggle("d-none", loading);
  if (btnLoading) btnLoading.classList.toggle("d-none", !loading);
  if (loadingState) loadingState.classList.toggle("d-none", !loading);

  if (loading) {
    state.loadingProgress = 0;
    if (loadingProgress) loadingProgress.style.width = "0%";
    if (loadingPercent) loadingPercent.textContent = "0%";
    if (loadingStepText) loadingStepText.textContent = "Analyzing Health...";

    state.loadingTimer = setInterval(() => {
      state.loadingProgress = clamp(state.loadingProgress + Math.random() * 8 + 2, 0, 97);
      if (loadingProgress) loadingProgress.style.width = `${state.loadingProgress}%`;
      if (loadingPercent) loadingPercent.textContent = `${Math.round(state.loadingProgress)}%`;

      if (loadingStepText) {
        if (state.loadingProgress < 22) loadingStepText.textContent = "Analyzing Health...";
        else if (state.loadingProgress < 44) loadingStepText.textContent = "Analyzing Education...";
        else if (state.loadingProgress < 66) loadingStepText.textContent = "Analyzing Income...";
        else if (state.loadingProgress < 84) loadingStepText.textContent = "Running Machine Learning Model...";
        else loadingStepText.textContent = "Generating Result...";
      }
    }, 120);
  } else {
    clearInterval(state.loadingTimer);
    if (loadingProgress) loadingProgress.style.width = "100%";
    if (loadingPercent) loadingPercent.textContent = "100%";
    if (loadingStepText) loadingStepText.textContent = "Completed.";
    setTimeout(() => { if (loadingState) loadingState.classList.add("d-none"); }, 320);
  }
}

function renderConfidenceBars(confidence) {
  if (!confidenceBars) return;
  const categories = ["Very High", "High", "Medium", "Low"];
  const colors = { "Very High": "#10b981", "High": "#3b82f6", "Medium": "#f59e0b", "Low": "#ef4444" };
  confidenceBars.innerHTML = categories.map(category => {
    const value = confidence[category] ?? 0;
    return `
      <div class="conf-item">
        <div class="conf-label"><span class="conf-name">${category}</span><span class="conf-value">${value.toFixed(1)}%</span></div>
        <div class="conf-bar-bg"><div class="conf-bar-fill" style="width:0; background:${colors[category]}" data-value="${value}"></div></div>
      </div>`;
  }).join("");
  requestAnimationFrame(() => requestAnimationFrame(() => {
    confidenceBars.querySelectorAll(".conf-bar-fill").forEach(bar => bar.style.width = `${bar.dataset.value}%`);
  }));
}

function renderInputSummary(inputs) {
  const labels = {
    country:                  { label: "Country", unit: "" },
    life_expectancy:          { label: "Life Expectancy", unit: "yrs" },
    mean_years_schooling:     { label: "Mean Schooling", unit: "yrs" },
    expected_years_schooling: { label: "Expected Schooling", unit: "yrs" },
    gni_per_capita:           { label: "GNI Per Capita", unit: "$" },
  };
  if (!inputSummary) return;
  inputSummary.innerHTML = Object.entries(inputs).map(([key, value]) => {
    const meta = labels[key];
    if (!meta) return "";
    const display = key === "gni_per_capita" ? formatMoney(value) : `${value}${meta.unit ? ` ${meta.unit}` : ""}`;
    return `
      <div class="col-6">
        <div class="summary-item">
          <div class="summary-key">${meta.label}</div>
          <div class="summary-value">${display}</div>
        </div>
      </div>`;
  }).join("");
}

function createRecommendationList(category, inputs) {
  const suggestions = [];
  if (inputs.life_expectancy < 75) suggestions.push("Invest in healthcare access and preventive services.");
  if (inputs.mean_years_schooling < 12) suggestions.push("Expand quality education and reduce dropout rates.");
  if (inputs.expected_years_schooling < 14) suggestions.push("Support school enrollment and retention policies.");
  if (inputs.gni_per_capita < 20000) suggestions.push("Create employment and economic development programs.");

  switch (category) {
    case "Very High":
      suggestions.push("Maintain current policies and strengthen innovation.");
      suggestions.push("Expand digital education and green economy initiatives.");
      suggestions.push("Invest in research and future skills.");
      break;
    case "High":
      suggestions.push("Improve education quality and accessibility.");
      suggestions.push("Increase healthcare investment and preventive care.");
      suggestions.push("Diversify the economy to reduce vulnerability.");
      break;
    case "Medium":
      suggestions.push("Boost healthcare infrastructure and service delivery.");
      suggestions.push("Increase school enrollment and reduce dropout rates.");
      suggestions.push("Promote employment and skill development programs.");
      break;
    case "Low":
      suggestions.push("Build healthcare infrastructure and rural clinics.");
      suggestions.push("Launch literacy programs and expand schools.");
      suggestions.push("Create employment opportunities and economic support.");
      break;
  }

  return Array.from(new Set(suggestions)).slice(0, 5);
}

function renderRecommendations(category, inputs) {
  const recommendations = createRecommendationList(category, inputs);
  if (recommendationList) {
    recommendationList.innerHTML = recommendations.map(item => `<li>${item}</li>`).join("");
  }
}

function destroyDashboardCharts() {
  state.chartInstances.dashboard.forEach(chart => chart.destroy());
  state.chartInstances.dashboard = [];
}

function updateTimelineProgress() {
  document.querySelectorAll(".timeline-list li").forEach((item, index) => item.classList.add("timeline-complete"));
}

function fadeInElement(el) {
  if (!el) return;
  el.classList.add("dashboard-fade-in");
  setTimeout(() => el.classList.remove("dashboard-fade-in"), 800);
}

function animateNumber(element, value, suffix = "") {
  if (!element) return;
  const numericValue = Number(value) || 0;
  let current = 0;
  const duration = 900;
  const step = Math.max(Math.ceil(numericValue / (duration / 30)), 1);
  const interval = setInterval(() => {
    current += step;
    if (current >= numericValue) {
      element.textContent = `${numericValue}${suffix}`;
      clearInterval(interval);
      return;
    }
    element.textContent = `${current}${suffix}`;
  }, 30);
}

function animateScore(targetScore) {
  const scoreEl = document.getElementById("hdiScoreValue");
  if (!scoreEl) return;
  const duration = 1100;
  const startTime = performance.now();
  const startValue = 0;
  const targetValue = Number(targetScore) || 0;

  scoreEl.classList.add("is-animating");

  const tick = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentValue = startValue + (targetValue - startValue) * eased;
    scoreEl.textContent = currentValue.toFixed(3);

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      scoreEl.textContent = targetValue.toFixed(3);
      scoreEl.classList.remove("is-animating");
    }
  };

  requestAnimationFrame(tick);
}

function updateDashboardStats(inputs, category) {
  const healthScore = clamp((inputs.life_expectancy - 20) / 70 * 100, 0, 100);
  const educationScore = clamp(((inputs.mean_years_schooling + inputs.expected_years_schooling) / 45) * 100, 0, 100);
  const incomeScore = clamp((inputs.gni_per_capita - 100) / 149900 * 100, 0, 100);
  const statusText = category;

  const healthScoreEl = document.getElementById("healthScoreVal");
  const educationScoreEl = document.getElementById("educationScoreVal");
  const incomeScoreEl = document.getElementById("incomeScoreVal");
  const developmentStatusEl = document.getElementById("developmentStatusVal");

  if (healthScoreEl) animateNumber(healthScoreEl, Math.round(healthScore));
  if (educationScoreEl) animateNumber(educationScoreEl, Math.round(educationScore));
  if (incomeScoreEl) animateNumber(incomeScoreEl, Math.round(incomeScore));
  if (developmentStatusEl) developmentStatusEl.textContent = statusText;
}

function generateInsights(inputs, category) {
  const insights = [];
  const healthInsight = inputs.life_expectancy >= 75 ? "Health is above average." : "Health requires attention.";
  const educationInsight = (inputs.mean_years_schooling + inputs.expected_years_schooling) / 2 >= 12 ? "Education is strong for this cohort." : "Education requires improvement.";
  const incomeInsight = inputs.gni_per_capita >= 20000 ? "Income level is strong." : "Income level is developing.";
  const categoryInsight = `Country belongs to ${category} HDI category.`;
  insights.push(healthInsight, educationInsight, incomeInsight, categoryInsight);
  const list = document.getElementById("dashboardInsightsList");
  if (list) list.innerHTML = insights.map(item => `<li>${item}</li>`).join("");
}

function updateDashboardSummary(inputs, category, country) {
  const summaryCountry = document.getElementById("summaryCountry");
  const summaryCategory = document.getElementById("summaryCategory");
  const predictionTime = document.getElementById("predictionTime");
  const summaryHealth = document.getElementById("summaryHealth");
  const summaryEducation = document.getElementById("summaryEducation");
  const summaryIncome = document.getElementById("summaryIncome");
  const summaryStatus = document.getElementById("summaryStatus");

  if (summaryCountry) summaryCountry.textContent = country;
  if (summaryCategory) summaryCategory.textContent = category;
  if (predictionTime) predictionTime.textContent = new Date().toLocaleTimeString();
  if (summaryHealth) summaryHealth.textContent = `${inputs.life_expectancy} yrs`;
  if (summaryEducation) summaryEducation.textContent = `${inputs.mean_years_schooling} / ${inputs.expected_years_schooling} yrs`;
  if (summaryIncome) summaryIncome.textContent = formatMoney(inputs.gni_per_capita);
  if (summaryStatus) summaryStatus.textContent = category;
}

function ensureDashboardVisible() {
  const dashboard = document.getElementById("dashboardPanel");
  if (!dashboard) return;
  dashboard.classList.remove("d-none");
  fadeInElement(dashboard);
}

// ── SECTION 3: Country HDI Comparison ───────────────────────────────────────────
function renderCountryComparison(selectedCountry, predictedScore) {
  const comparisonCountryName = document.getElementById("comparisonCountryName");
  const comparisonChart = document.getElementById("comparisonChart");
  
  if (!comparisonChart) return;
  
  // Set the selected country name
  if (comparisonCountryName) {
    comparisonCountryName.textContent = selectedCountry;
  }
  
  // Get comparison countries (top HDI countries)
  const comparisonCountries = [
    { name: "United States", score: 0.921 },
    { name: "Germany", score: 0.902 },
    { name: "Japan", score: 0.890 },
    { name: "China", score: 0.768 },
    { name: "India", score: 0.786 },
  ];
  
  // Add the selected country to the comparison
  const allCountries = [...comparisonCountries];
  if (selectedCountry && !allCountries.find(c => c.name === selectedCountry)) {
    allCountries.push({ name: selectedCountry, score: predictedScore });
  }
  
  // Sort by score descending
  allCountries.sort((a, b) => b.score - a.score);
  
  comparisonChart.innerHTML = allCountries.map((country, index) => {
    const isHighlighted = country.name === selectedCountry;
    const barWidth = (country.score / 1) * 100;
    return `
      <div class="comparison-bar">
        <div class="comparison-bar-label">${country.name}</div>
        <div class="comparison-bar-container">
          <div class="comparison-bar-fill" style="width: 0%; background: ${isHighlighted ? 'var(--primary)' : 'rgba(99,102,241,0.3)'}" data-width="${barWidth}%">
            <span class="comparison-bar-value">${country.score.toFixed(3)}</span>
          </div>
        </div>
      </div>
    `;
  }).join("");
  
  // Animate bars
  requestAnimationFrame(() => {
    comparisonChart.querySelectorAll(".comparison-bar-fill").forEach(bar => {
      bar.style.width = bar.dataset.width;
    });
  });
}

// ── SECTION 5: Prediction Confidence ───────────────────────────────────────────
function renderPredictionConfidence(confidence) {
  const confidenceBarFill = document.getElementById("confidenceBarFill");
  const confidencePercentage = document.getElementById("confidencePercentage");
  
  if (!confidenceBarFill || !confidencePercentage) return;
  
  // Get the max confidence value
  const maxConfidence = Math.max(...Object.values(confidence));
  const percentage = Math.round(maxConfidence);
  
  // Animate the bar
  setTimeout(() => {
    confidenceBarFill.style.width = `${percentage}%`;
    confidencePercentage.textContent = `${percentage}%`;
  }, 100);
}

// ── SECTION 6: Feature Importance ─────────────────────────────────────────────
function renderFeatureImportance(inputs) {
  const featureImportanceBars = document.getElementById("featureImportanceBars");
  
  if (!featureImportanceBars) return;
  
  // Calculate feature importance based on input values
  const features = [
    { label: "Life Expectancy", value: clamp((inputs.life_expectancy - 20) / 70 * 100, 0, 100), color: "#10b981" },
    { label: "Education", value: clamp(((inputs.mean_years_schooling + inputs.expected_years_schooling) / 45) * 100, 0, 100), color: "#3b82f6" },
    { label: "Expected Schooling", value: clamp(inputs.expected_years_schooling / 25 * 100, 0, 100), color: "#f59e0b" },
    { label: "Income", value: clamp((Math.log(inputs.gni_per_capita) - Math.log(100)) / (Math.log(150000) - Math.log(100)) * 100, 0, 100), color: "#8b5cf6" },
  ];
  
  featureImportanceBars.innerHTML = features.map(feature => `
    <div class="feature-importance-bar">
      <div class="feature-importance-label">
        <span>${feature.label}</span>
        <span class="feature-importance-value">${Math.round(feature.value)}%</span>
      </div>
      <div class="feature-importance-bar-bg">
        <div class="feature-importance-bar-fill" style="width: 0%; background: ${feature.color}" data-value="${feature.value}"></div>
      </div>
    </div>
  `).join("");
  
  // Animate bars
  requestAnimationFrame(() => {
    featureImportanceBars.querySelectorAll(".feature-importance-bar-fill").forEach(bar => {
      bar.style.width = `${bar.dataset.value}%`;
    });
  });
}

// ── SECTION 7: Indicator Status ─────────────────────────────────────────────────
function renderIndicatorStatus(inputs) {
  const indicatorStatusGrid = document.getElementById("indicatorStatusGrid");
  
  if (!indicatorStatusGrid) return;
  
  const indicators = [
    { id: "life_expectancy", label: "Health", icon: "bi-heart-pulse-fill" },
    { id: "mean_years_schooling", label: "Education", icon: "bi-mortarboard-fill" },
    { id: "gni_per_capita", label: "Income", icon: "bi-cash-stack" },
  ];
  
  indicatorStatusGrid.innerHTML = indicators.map(indicator => {
    const status = getIndicatorStatus(indicator.id, inputs[indicator.id]);
    return `
      <div class="col-lg-4 col-md-4 col-12">
        <div class="indicator-status-item">
          <div class="indicator-status-icon"><i class="bi ${indicator.icon}"></i></div>
          <div class="indicator-status-label">${indicator.label}</div>
          <div class="indicator-status-value">${status.label}</div>
          <span class="indicator-status-badge ${status.color}">${status.icon}</span>
        </div>
      </div>
    `;
  }).join("");
}

// ── SECTION 8: AI Development Report ────────────────────────────────────────────
function renderAiDevelopmentReport(category, inputs) {
  const aiReportContent = document.getElementById("aiReportContent");
  
  if (!aiReportContent) return;
  
  const healthAnalysis = inputs.life_expectancy >= 75 ? "The country demonstrates excellent health outcomes with high life expectancy." : 
                         inputs.life_expectancy >= 60 ? "Health indicators are stable but have room for improvement." : 
                         "Healthcare system needs significant investment and improvement.";
  
  const educationAnalysis = (inputs.mean_years_schooling + inputs.expected_years_schooling) / 2 >= 12 ? 
                            "Education system is strong with good enrollment and literacy rates." : 
                            "Education sector requires focused investment in infrastructure and access.";
  
  const incomeAnalysis = inputs.gni_per_capita >= 20000 ? 
                         "Income levels are high, supporting strong human development." : 
                         "Income generation needs to be strengthened for better development outcomes.";
  
  const overallConclusion = `Based on the analysis, ${category} HDI category is appropriate. The country shows ${inputs.life_expectancy >= 60 ? "moderate" : "developing"} health, ${((inputs.mean_years_schooling + inputs.expected_years_schooling) / 2) >= 10 ? "adequate" : "limited"} education, and ${inputs.gni_per_capita >= 10000 ? "growing" : "emerging"} income levels.`;
  
  const futureOutlook = category === "Very High" ? "Continue maintaining current development trajectory with focus on innovation." :
                        category === "High" ? "Sustain growth while addressing remaining gaps in education and income." :
                        category === "Medium" ? "Accelerate development through targeted investments in key sectors." :
                        "Urgent intervention needed across all development dimensions.";
  
  aiReportContent.innerHTML = `
    <div class="ai-report-item">
      <div class="ai-report-label">Health Analysis</div>
      <div class="ai-report-value">${healthAnalysis}</div>
    </div>
    <div class="ai-report-item">
      <div class="ai-report-label">Education Analysis</div>
      <div class="ai-report-value">${educationAnalysis}</div>
    </div>
    <div class="ai-report-item">
      <div class="ai-report-label">Income Analysis</div>
      <div class="ai-report-value">${incomeAnalysis}</div>
    </div>
    <div class="ai-report-item">
      <div class="ai-report-label">Overall Conclusion</div>
      <div class="ai-report-value">${overallConclusion}</div>
    </div>
    <div class="ai-report-item">
      <div class="ai-report-label">Future Outlook</div>
      <div class="ai-report-value">${futureOutlook}</div>
    </div>
  `;
}

// ── SECTION 9: Risk Level ─────────────────────────────────────────────────────────
function renderRiskLevel(category) {
  const riskBadge = document.getElementById("riskBadge");
  
  if (!riskBadge) return;
  
  let riskText = "Low Risk";
  let riskClass = "low";
  
  if (category === "Low") {
    riskText = "High Risk";
    riskClass = "high";
  } else if (category === "Medium") {
    riskText = "Moderate Risk";
    riskClass = "moderate";
  }
  
  riskBadge.textContent = riskText;
  riskBadge.className = `risk-badge ${riskClass}`;
}

// ── SECTION 10: Development Score ─────────────────────────────────────────────────
function renderDevelopmentScore(inputs, category) {
  const scoreFill = document.getElementById("scoreFill");
  const scoreText = document.getElementById("scoreText");
  const scoreStars = document.getElementById("scoreStars");
  
  if (!scoreFill || !scoreText || !scoreStars) return;
  
  // Calculate overall development score
  const healthScore = clamp((inputs.life_expectancy - 20) / 70 * 100, 0, 100);
  const educationScore = clamp(((inputs.mean_years_schooling + inputs.expected_years_schooling) / 45) * 100, 0, 100);
  const incomeScore = clamp((inputs.gni_per_capita - 100) / 149900 * 100, 0, 100);
  const overallScore = Math.round((healthScore + educationScore + incomeScore) / 3);
  
  // Animate circular progress
  const circumference = 283;
  const offset = circumference - (overallScore / 100) * circumference;
  
  setTimeout(() => {
    scoreFill.style.strokeDashoffset = offset;
    scoreText.textContent = `${overallScore}/100`;
  }, 100);
  
  // Render stars
  const starCount = Math.min(5, Math.max(1, Math.floor(overallScore / 20)));
  scoreStars.innerHTML = Array(5).fill(0).map((_, i) => 
    `<i class="bi bi-star${i < starCount ? '-fill' : ''} star"></i>`
  ).join("");
}

// ── SECTION 11: Prediction Timeline ───────────────────────────────────────────────
function renderPredictionTimeline() {
  const timelineGrid = document.getElementById("timelineGrid");
  
  if (!timelineGrid) return;
  
  const now = new Date();
  
  timelineGrid.innerHTML = `
    <div class="col-lg-3 col-md-6 col-12">
      <div class="timeline-item">
        <div class="timeline-item-label">Prediction Date</div>
        <div class="timeline-item-value">${now.toLocaleDateString()}</div>
      </div>
    </div>
    <div class="col-lg-3 col-md-6 col-12">
      <div class="timeline-item">
        <div class="timeline-item-label">Prediction Time</div>
        <div class="timeline-item-value">${now.toLocaleTimeString()}</div>
      </div>
    </div>
    <div class="col-lg-3 col-md-6 col-12">
      <div class="timeline-item">
        <div class="timeline-item-label">Model Used</div>
        <div class="timeline-item-value">Random Forest</div>
      </div>
    </div>
    <div class="col-lg-3 col-md-6 col-12">
      <div class="timeline-item">
        <div class="timeline-item-label">Status</div>
        <div class="timeline-item-value">Success</div>
      </div>
    </div>
  `;
}

// ── SECTION 12: Estimated Development Level ───────────────────────────────────────
function renderEstimatedLevel(category) {
  const estimatedLevelDisplay = document.getElementById("estimatedLevelDisplay");
  
  if (!estimatedLevelDisplay) return;
  
  let levelText = "Top 25%";
  let levelClass = "top-25";
  let levelDesc = "Excellent Performance";
  
  if (category === "Medium") {
    levelText = "Top 50%";
    levelClass = "top-50";
    levelDesc = "Developing Nation";
  } else if (category === "Low") {
    levelText = "Needs Improvement";
    levelClass = "needs-improvement";
    levelDesc = "Significant development challenges";
  } else if (category === "High") {
    levelText = "Top 25%";
    levelClass = "top-25";
    levelDesc = "Strong Performance";
  }
  
  estimatedLevelDisplay.innerHTML = `
    <span class="estimated-level-badge ${levelClass}">${levelText}</span>
    <div class="estimated-level-desc">${levelDesc} (Estimated Level)</div>
  `;
}

// ── SECTION 13: Improvement Needed ───────────────────────────────────────────────
function renderImprovementNeeded(inputs) {
  const improvementBars = document.getElementById("improvementBars");
  
  if (!improvementBars) return;
  
  const improvements = [
    { label: "Healthcare", value: inputs.life_expectancy < 75 ? clamp(100 - (inputs.life_expectancy - 20) / 70 * 100, 0, 100) : 20, color: "#10b981" },
    { label: "Education", value: (inputs.mean_years_schooling + inputs.expected_years_schooling) / 2 < 12 ? clamp(100 - ((inputs.mean_years_schooling + inputs.expected_years_schooling) / 45) * 100, 0, 100) : 15, color: "#3b82f6" },
    { label: "Income", value: inputs.gni_per_capita < 20000 ? clamp(100 - (Math.log(inputs.gni_per_capita) - Math.log(100)) / (Math.log(150000) - Math.log(100)) * 100, 0, 100) : 10, color: "#f59e0b" },
  ];
  
  improvementBars.innerHTML = improvements.map(improvement => `
    <div class="improvement-bar">
      <div class="improvement-bar-label">
        <span>${improvement.label}</span>
        <span class="improvement-bar-value">${Math.round(improvement.value)}%</span>
      </div>
      <div class="improvement-bar-bg">
        <div class="improvement-bar-fill" style="width: 0%; background: ${improvement.color}" data-value="${improvement.value}"></div>
      </div>
    </div>
  `).join("");
  
  // Animate bars
  requestAnimationFrame(() => {
    improvementBars.querySelectorAll(".improvement-bar-fill").forEach(bar => {
      bar.style.width = `${bar.dataset.value}%`;
    });
  });
}

// ── SECTION 14: Goal Achievement ──────────────────────────────────────────────────
function renderGoalAchievement(category) {
  const goalContent = document.getElementById("goalContent");
  
  if (!goalContent) return;
  
  const targetCategory = "Very High";
  const currentCategory = category;
  
  // Calculate progress based on category
  const categoryProgress = {
    "Very High": 100,
    "High": 75,
    "Medium": 50,
    "Low": 25
  };
  
  const progress = categoryProgress[category] || 0;
  
  goalContent.innerHTML = `
    <div class="goal-row">
      <span class="goal-label">Target</span>
      <span class="goal-value">Very High HDI</span>
    </div>
    <div class="goal-row">
      <span class="goal-label">Current</span>
      <span class="goal-value">${currentCategory} HDI</span>
    </div>
    <div class="goal-progress-container">
      <div class="goal-progress-bg">
        <div class="goal-progress-fill" style="width: 0%" data-value="${progress}%"></div>
      </div>
    </div>
  `;
  
  // Animate progress bar
  requestAnimationFrame(() => {
    const progressBar = goalContent.querySelector(".goal-progress-fill");
    if (progressBar) {
      progressBar.style.width = progressBar.dataset.value;
    }
  });
}

// ── SECTION 16: Strengths and Weaknesses ──────────────────────────────────────────
function renderStrengthsWeaknesses(inputs, category) {
  const strengthsList = document.getElementById("strengthsList");
  const weaknessesList = document.getElementById("weaknessesList");
  
  if (!strengthsList || !weaknessesList) return;
  
  const strengths = [];
  const weaknesses = [];
  
  if (inputs.life_expectancy >= 70) strengths.push("Good Healthcare System");
  else weaknesses.push("Healthcare needs improvement");
  
  if (inputs.mean_years_schooling >= 10) strengths.push("High Literacy Rate");
  else weaknesses.push("Education access needs improvement");
  
  if (inputs.expected_years_schooling >= 12) strengths.push("Strong Education Outlook");
  else weaknesses.push("School enrollment needs attention");
  
  if (inputs.gni_per_capita >= 15000) strengths.push("Strong Economy");
  else weaknesses.push("Income growth needed");
  
  if (category === "Very High") strengths.push("Excellent Development Index");
  if (category === "Low") weaknesses.push("Overall development intervention required");
  
  strengthsList.innerHTML = strengths.length ? strengths.map(s => `<li>${s}</li>`).join("") : `<li>No significant strengths identified.</li>`;
  weaknessesList.innerHTML = weaknesses.length ? weaknesses.map(w => `<li>${w}</li>`).join("") : `<li>No immediate weaknesses identified.</li>`;
}

// ── SECTION 17: Recommendations ───────────────────────────────────────────────────
function renderRecommendationCards(recommendations) {
  const container = document.getElementById("recommendationCards");
  if (!container) return;
  
  const icons = ["bi-heart-pulse-fill", "bi-mortarboard-fill", "bi-cash-stack", "bi-building-fill", "bi-lightbulb-fill"];
  
  container.innerHTML = recommendations.map((rec, index) => `
    <div class="col-lg-4 col-md-6 col-12">
      <div class="recommendation-card h-100">
        <div class="d-flex gap-3">
          <div class="recommendation-card-icon">
            <i class="${icons[index % icons.length]}"></i>
          </div>
          <div class="recommendation-card-content">
            <div class="recommendation-card-title">Recommendation ${index + 1}</div>
            <div class="recommendation-card-text">${rec}</div>
          </div>
        </div>
      </div>
    </div>
  `).join("");
}

function updateAnalyticsProgress(inputs) {
  const healthScore = clamp((inputs.life_expectancy - 20) / 70 * 100, 0, 100);
  const educationScore = clamp(((inputs.mean_years_schooling + inputs.expected_years_schooling) / 45) * 100, 0, 100);
  const incomeScore = clamp((inputs.gni_per_capita - 100) / 149900 * 100, 0, 100);
  
  // Update progress bars in analytics cards
  document.querySelectorAll(".analytics-progress .progress-meter-fill").forEach((bar, index) => {
    const values = [healthScore, educationScore, incomeScore, 0];
    bar.style.width = `${values[index] || 0}%`;
  });
}

function renderResult(data) {
  const colors = CATEGORY_COLORS[data.category] || CATEGORY_COLORS["Medium"];
  const resultIcon = document.getElementById("resultIcon");
  const resultCategory = document.getElementById("resultCategory");
  const predictionResultCard = document.getElementById("predictionResultCard");
  
  // Format category as "High Human Development" instead of just "High"
  const categoryDisplay = {
    "Very High": "Very High Human Development",
    "High": "High Human Development",
    "Medium": "Medium Human Development",
    "Low": "Low Human Development"
  }[data.category] || data.category;
  
  if (resultIcon) resultIcon.className = `bi ${data.icon}`;
  if (resultCategory) resultCategory.textContent = categoryDisplay;
  if (resultCountryName) {
    resultCountryName.textContent = data.country || "Unknown";
  }
  
  // Update prediction result card border color
  if (predictionResultCard) {
    predictionResultCard.classList.remove("very-high", "high", "medium", "low");
    predictionResultCard.classList.add(data.category.toLowerCase().replace(" ", "-"));
  }
  
  // Update confidence display
  const resultConfidence = document.getElementById("resultConfidence");
  if (resultConfidence && data.confidence) {
    const maxConfidence = Math.max(...Object.values(data.confidence));
    resultConfidence.textContent = `${maxConfidence.toFixed(1)}%`;
  }

  // Update icon ring styling
  if (resultIconRing) {
    resultIconRing.style.background = colors.ring;
    resultIconRing.style.borderColor = colors.border;
    resultIconRing.style.color = colors.border;
    resultIconRing.style.boxShadow = `0 0 28px ${colors.border}33`;
  }

  const estimatedScore = estimateHdiScore(data.inputs);
  animateScore(estimatedScore);

  // Update AI Summary section
  const aiCategory = document.getElementById("aiCategory");
  const aiConfidence = document.getElementById("aiConfidence");
  const aiReason = document.getElementById("aiReason");
  const aiRecommendation = document.getElementById("aiRecommendation");
  
  if (aiCategory) aiCategory.textContent = data.category;
  if (aiConfidence && data.confidence) {
    const maxConf = Math.max(...Object.values(data.confidence));
    aiConfidence.textContent = `${maxConf.toFixed(1)}%`;
  }
  if (aiReason) {
    const health = data.inputs.life_expectancy >= 75 ? "high life expectancy" : data.inputs.life_expectancy >= 60 ? "stable health" : "health needs attention";
    const edu = (data.inputs.mean_years_schooling + data.inputs.expected_years_schooling) / 2 >= 12 ? "strong education" : "education needs improvement";
    const income = data.inputs.gni_per_capita >= 20000 ? "strong income" : "developing income";
    aiReason.textContent = `${health}, ${edu}, ${income}.`;
  }
  if (aiRecommendation) {
    const recs = createRecommendationList(data.category, data.inputs);
    aiRecommendation.textContent = recs[0] || "No specific recommendations.";
  }

  if (resultDate) resultDate.textContent = new Date().toLocaleDateString();
  if (resultTime) resultTime.textContent = new Date().toLocaleTimeString();
  
  // Update Country and Status in the summary section
  const resultCountry = document.getElementById("resultCountry");
  const predictionStatus = document.getElementById("predictionStatus");
  const resultCategoryBadge = document.getElementById("resultCategoryBadge");
  if (resultCountry) resultCountry.textContent = data.country || "Unknown";
  if (predictionStatus) predictionStatus.textContent = "Prediction Successful";
  if (resultCategoryBadge) resultCategoryBadge.textContent = data.category;

  // Update classification section
  updateClassification(data.category);
  
  // Update analytics progress bars
  updateAnalyticsProgress(data.inputs);
  
  // Render recommendation cards
  const recs = createRecommendationList(data.category, data.inputs);
  renderRecommendationCards(recs);
  
  // Show the prediction dashboard below the form
  const predictionDashboard = document.getElementById("predictionDashboard");
  if (predictionDashboard) {
    predictionDashboard.classList.remove("d-none");
    fadeInElement(predictionDashboard);
    // Smooth scroll to the dashboard
    predictionDashboard.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();
  e.stopPropagation();
  hideFormError();

  if (predictBtn && predictBtn.disabled) return;
  if (!validateAll()) return;

  setLoading(true);

  try {
    const formData = new FormData(form);
    const response = await fetch("/predict", { method: "POST", body: formData });
    const data = await response.json();
    if (!response.ok) {
      showFormError(data.error || "Prediction failed. Please try again.");
      return;
    }
    const selectedCountry = countryInput?.value || countrySearch?.value || "Unknown";
    const payload = { ...data, country: selectedCountry, inputs: { country: selectedCountry, ...data.inputs } };
    renderResult(payload);
    
    // Render dashboard sections
    renderAiDevelopmentReport(data.category, data.inputs);
    renderStrengthsWeaknesses(data.inputs, data.category);
    renderDashboardCharts(data.inputs, data.category);
    
    finalizeDashboard(data.inputs, data.category, selectedCountry);
    addHistoryEntry({
      country: selectedCountry,
      category: data.category,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      inputs: data.inputs,
      recommendations: createRecommendationList(data.category, data.inputs),
    });
    createToast("Prediction completed successfully.");
  } catch (err) {
    console.error("Prediction error:", err);
    showFormError(err.message || "Network error. Please check your connection and try again.");
  } finally {
    setLoading(false);
  }
}

FIELDS.forEach(field => {
  const input = document.getElementById(field.id);
  if (input) {
    input.addEventListener("blur", () => validateField(field));
    input.addEventListener("input", () => {
      if (input.classList.contains("is-invalid")) validateField(field);
      updateFieldStatus(field);
    });
  }
});

if (countrySearch) {
  countrySearch.addEventListener("input", () => {
    const query = countrySearch.value.trim();
    if (!query) return countryDropdown?.classList.add("d-none");
    updateCountryDropdown(filterCountries(query));
  });

  countrySearch.addEventListener("focus", () => updateCountryDropdown(filterCountries(countrySearch.value.trim())));
  countrySearch.addEventListener("blur", () => setTimeout(() => countryDropdown?.classList.add("d-none"), 130));
}

if (countryDropdown) {
  countryDropdown.addEventListener("click", event => {
    const item = event.target.closest(".country-item");
    if (!item) return;
    setSelectedCountry(item.dataset.name, item.dataset.code);
  });
}

if (backToTopBtn) backToTopBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// ── Contact Form Handling ───────────────────────────────────────────────
const contactForm = document.getElementById("contactForm");
const contactBtn = document.getElementById("contactBtn");
const contactError = document.getElementById("contactError");
const contactErrorMsg = document.getElementById("contactErrorMsg");

function handleContactSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("contactName")?.value.trim();
  const email = document.getElementById("contactEmail")?.value.trim();
  const message = document.getElementById("contactMessage")?.value.trim();

  if (!name || !email || !message) {
    if (contactErrorMsg) contactErrorMsg.textContent = "All fields are required.";
    if (contactError) contactError.classList.remove("d-none");
    return;
  }

  if (!email.includes("@")) {
    if (contactErrorMsg) contactErrorMsg.textContent = "Please enter a valid email address.";
    if (contactError) contactError.classList.remove("d-none");
    return;
  }

  if (contactError) contactError.classList.add("d-none");
  if (contactBtn) contactBtn.disabled = true;

  fetch("/contact", {
    method: "POST",
    body: new FormData(contactForm),
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        createToast(data.message);
        if (contactForm) contactForm.reset();
      } else {
        if (contactErrorMsg) contactErrorMsg.textContent = data.error || "Failed to send message.";
        if (contactError) contactError.classList.remove("d-none");
      }
    })
    .catch(() => {
      if (contactErrorMsg) contactErrorMsg.textContent = "Network error. Please try again.";
      if (contactError) contactError.classList.remove("d-none");
    })
    .finally(() => {
      if (contactBtn) contactBtn.disabled = false;
    });
}

function initApp() {
  updateScrollProgress();
  animateCounters();
  window.addEventListener("scroll", updateScrollProgress, { passive: true });

  if (form) {
    form.addEventListener("submit", handleFormSubmit);
  }

  if (contactForm) {
    contactForm.addEventListener("submit", handleContactSubmit);
  }

  if (downloadExcelBtn) downloadExcelBtn.addEventListener("click", downloadExcel);
  if (copyResultBtn) copyResultBtn.addEventListener("click", copyResult);
  if (downloadPDFBtn) downloadPDFBtn.addEventListener("click", downloadPDF);
  if (downloadCSVBtn) downloadCSVBtn.addEventListener("click", downloadCSV);
  if (printBtn) printBtn.addEventListener("click", printReport);
  if (copyLinkBtn) copyLinkBtn.addEventListener("click", copyLink);
  if (shareWhatsAppBtn) shareWhatsAppBtn.addEventListener("click", shareWhatsApp);
  if (shareLinkedInBtn) shareLinkedInBtn.addEventListener("click", shareLinkedIn);
  if (shareEmailBtn) shareEmailBtn.addEventListener("click", shareEmail);
}

window.addEventListener("DOMContentLoaded", initApp);

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", (e) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  });
});

const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-link");

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY + 100;
  sections.forEach(section => {
    if (scrollY >= section.offsetTop && scrollY < section.offsetTop + section.offsetHeight) {
      navLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${section.id}`));
    }
  });
}, { passive: true });

// ── History Management (localStorage) ─────────────────────────────────────
function addHistoryEntry(entry) {
  state.history.unshift({ ...entry, timestamp: Date.now() });
  try {
    localStorage.setItem("hdiPredictionHistory", JSON.stringify(state.history));
  } catch (e) {
    console.warn("Could not save to localStorage:", e);
  }
}

function renderDashboardCharts(inputs, category) {
  destroyDashboardCharts();

  // Bar Chart — Indicators Comparison
  const barCanvas = document.getElementById("dashboardBarChart");
  if (barCanvas) {
    state.chartInstances.dashboard.push(new Chart(barCanvas, {
      type: "bar",
      data: {
        labels: ["Life Expectancy", "Mean Schooling", "Exp. Schooling", "GNI (k$)"],
        datasets: [{
          label: "Value",
          data: [
            inputs.life_expectancy,
            inputs.mean_years_schooling,
            inputs.expected_years_schooling,
            parseFloat((inputs.gni_per_capita / 1000).toFixed(1)),
          ],
          backgroundColor: ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6"],
          borderRadius: 8,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 900, easing: "easeOutQuart" },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ctx.dataIndex === 3
                ? `GNI: $${(ctx.parsed.y * 1000).toLocaleString()}`
                : `${ctx.label}: ${ctx.parsed.y}`,
            },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: "#94a3b8", font: { size: 10 } } },
          y: { beginAtZero: true, ticks: { color: "#94a3b8", font: { size: 10 } }, grid: { color: "rgba(148,163,184,0.12)" } },
        },
      },
    }));
  }

  // Doughnut Chart — Feature Contribution
  const healthVal   = clamp((inputs.life_expectancy - 20) / 70 * 100, 0, 100);
  const eduVal      = clamp(((inputs.mean_years_schooling + inputs.expected_years_schooling) / 45) * 100, 0, 100);
  const expSchoolVal = clamp(inputs.expected_years_schooling / 25 * 100, 0, 100);
  const incomeVal   = clamp((Math.log(inputs.gni_per_capita) - Math.log(100)) / (Math.log(150000) - Math.log(100)) * 100, 0, 100);
  const total = healthVal + eduVal + expSchoolVal + incomeVal || 1;
  const slices = [
    parseFloat((healthVal / total * 100).toFixed(1)),
    parseFloat((eduVal / total * 100).toFixed(1)),
    parseFloat((expSchoolVal / total * 100).toFixed(1)),
    parseFloat((incomeVal / total * 100).toFixed(1)),
  ];

  const doughnutCanvas = document.getElementById("dashboardDoughnutChart");
  if (doughnutCanvas) {
    state.chartInstances.dashboard.push(new Chart(doughnutCanvas, {
      type: "doughnut",
      data: {
        labels: ["Life Expectancy", "Education", "Expected Schooling", "Income"],
        datasets: [{
          data: slices,
          backgroundColor: ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6"],
          borderWidth: 2,
          borderColor: "transparent",
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        animation: { duration: 900, easing: "easeOutQuart" },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.parsed.toFixed(1)}%`,
            },
          },
        },
      },
    }));
  }

  renderChartLegend(slices);
}

function renderChartLegend(slices) {
  const chartLegend = document.getElementById("chartLegend");
  if (!chartLegend) return;

  const legendData = [
    { label: "Life Expectancy", color: "#10b981" },
    { label: "Education",       color: "#3b82f6" },
    { label: "Exp. Schooling",  color: "#f59e0b" },
    { label: "Income",          color: "#8b5cf6" },
  ];

  chartLegend.innerHTML = `<div class="chart-legend-items">${
    legendData.map((item, i) => `
      <div class="chart-legend-item">
        <span class="chart-legend-color" style="background:${item.color}"></span>
        <span class="chart-legend-label">${item.label}</span>
        ${slices ? `<span class="chart-legend-pct">${slices[i]}%</span>` : ""}
      </div>`).join("")
  }</div>`;
}
