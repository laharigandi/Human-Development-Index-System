/**
 * script.js — HDI Prediction System
 * Handles form validation, country selection, analytics, charts, history, and report reporting.
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
const btnText          = predictBtn.querySelector(".btn-text");
const btnLoading       = predictBtn.querySelector(".btn-loading");
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
const historySearch    = document.getElementById("historySearch");
const historyBody      = document.getElementById("historyBody");
const historySortBtn   = document.getElementById("historySortBtn");
const clearHistoryBtn  = document.getElementById("clearHistoryBtn");
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
const dashboardRadarCanvas  = document.getElementById("dashboardRadarChart");
const dashboardDoughnutCanvas = document.getElementById("dashboardDoughnutChart");
const dashboardGaugeCanvas  = document.getElementById("dashboardGaugeChart");
const dashboardProgressBars = document.getElementById("dashboardProgressBars");
const contributionBars     = document.getElementById("contributionBars");
const explanationItems     = document.getElementById("explanationItems");
const overallExplanation   = document.getElementById("overallExplanation");
const strengthList         = document.getElementById("strengthList");
const weaknessList         = document.getElementById("weaknessList");
const scenarioTitle        = document.getElementById("scenarioTitle");
const scenarioDescription  = document.getElementById("scenarioDescription");
const scenarioReason       = document.getElementById("scenarioReason");
const reportSummary        = document.getElementById("reportSummary");
const hdiScoreValue        = document.getElementById("hdiScoreValue");
const resultDate           = document.getElementById("resultDate");
const resultTime           = document.getElementById("resultTime");
const resultCategoryBadge  = document.getElementById("resultCategoryBadge");
const predictionStatusBadge = document.getElementById("predictionStatusBadge");
const resultIconRing       = document.getElementById("resultIconRing");

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

  explanationItems.innerHTML = items.map(item => {
    const status = getIndicatorStatus(item.id, inputs[item.id]);
    const contribution = buildContributionLabel(item.id, inputs[item.id]);
    return `
      <div class="explanation-item">
        <strong>${item.label}</strong>
        <span>${status.label} — ${contribution}</span>
      </div>`;
  }).join("");

  const healthValue = inputs.life_expectancy >= 75 ? "excellent health" : inputs.life_expectancy >= 60 ? "stable health" : "health that needs stronger support";
  const educationValue = (inputs.mean_years_schooling + inputs.expected_years_schooling) / 2 >= 12 ? "solid educational attainment" : "education that needs further investment";
  const incomeValue = inputs.gni_per_capita >= 20000 ? "strong income capacity" : "income that requires uplift";

  overallExplanation.textContent = `This prediction reflects ${healthValue}, ${educationValue}, and ${incomeValue}. The selected category is driven by the combined contribution of health, schooling, and income performance.`;
}

function renderFeatureContributions(inputs) {
  const contributions = [
    { label: "Life Expectancy", value: clamp((inputs.life_expectancy - 20) / 70 * 100, 0, 100), color: "#10b981" },
    { label: "Education", value: clamp(((inputs.mean_years_schooling + inputs.expected_years_schooling) / 45) * 100, 0, 100), color: "#3b82f6" },
    { label: "Expected Schooling", value: clamp(inputs.expected_years_schooling / 25 * 100, 0, 100), color: "#f59e0b" },
    { label: "Income", value: clamp((Math.log(inputs.gni_per_capita) - Math.log(100)) / (Math.log(150000) - Math.log(100)) * 100, 0, 100), color: "#8b5cf6" },
  ];

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

function renderProgressMetrics(inputs) {
  const progress = [
    { label: "Life Expectancy", value: clamp((inputs.life_expectancy - 20) / 70 * 100, 0, 100), color: "#10b981" },
    { label: "Education", value: clamp(((inputs.mean_years_schooling + inputs.expected_years_schooling) / 45) * 100, 0, 100), color: "#3b82f6" },
    { label: "Expected Schooling", value: clamp(inputs.expected_years_schooling / 25 * 100, 0, 100), color: "#f59e0b" },
    { label: "Income", value: clamp((Math.log(inputs.gni_per_capita) - Math.log(100)) / (Math.log(150000) - Math.log(100)) * 100, 0, 100), color: "#8b5cf6" },
  ];

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

  strengthList.innerHTML = strengths.length ? strengths.map(item => `<li>${item}</li>`).join("") : `<li>No significant strengths identified.</li>`;
  weaknessList.innerHTML = weaknesses.length ? weaknesses.map(item => `<li>${item}</li>`).join("") : `<li>No immediate weaknesses identified.</li>`;
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
  scenarioTitle.textContent = scenario.title;
  scenarioDescription.textContent = scenario.description;
  scenarioReason.textContent = scenario.reason;
}

function renderAiSummary(category, inputs, country) {
  const score = estimateHdiScore(inputs);
  reportSummary.textContent = `The predicted HDI score is ${formatHdiScore(score)}, placing ${country} in the ${category} category. Life expectancy is ${inputs.life_expectancy >= 75 ? "strong" : inputs.life_expectancy >= 60 ? "stable" : "challenged"}, education shows ${inputs.mean_years_schooling >= 12 ? "good" : "room for improvement"}, and income remains ${inputs.gni_per_capita >= 20000 ? "healthy" : "developing"}. Further investment in healthcare, education, employment, and infrastructure can improve future HDI performance.`;
}

const gaugeNeedlePlugin = {
  id: "gaugeNeedle",
  afterDraw(chart) {
    const { ctx, chartArea: { left, right, top, bottom } } = chart;
    const dataset = chart.data.datasets[0];
    const value = dataset.data[0];
    const centerX = (left + right) / 2;
    const centerY = (top + bottom) / 2 + 20;
    const radius = Math.min((right - left), (bottom - top)) / 2.2;
    const angle = -Math.PI + Math.PI * (value / 100);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(0, -radius + 10);
    ctx.lineWidth = 4;
    ctx.strokeStyle = dataset.backgroundColor[0] || "#fff";
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 10, 8, 0, Math.PI * 2);
    ctx.fillStyle = dataset.backgroundColor[0] || "#fff";
    ctx.fill();
    ctx.restore();
  },
};

function renderGaugeChart(score, category) {
  if (!dashboardGaugeCanvas) return;
  const gaugeScore = Math.round(score * 100);
  const color = CATEGORY_COLORS[category] ? CATEGORY_COLORS[category].border : "#3b82f6";
  state.chartInstances.dashboard.push(new Chart(dashboardGaugeCanvas, {
    type: "doughnut",
    data: {
      labels: ["Score", "Remaining"],
      datasets: [{
        data: [gaugeScore, 100 - gaugeScore],
        backgroundColor: [color, "rgba(255,255,255,0.08)"],
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      rotation: -Math.PI,
      circumference: Math.PI,
      cutout: "78%",
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
    },
    plugins: [gaugeNeedlePlugin],
  }));

  const gaugeText = document.getElementById("gaugeScoreText");
  if (gaugeText) gaugeText.textContent = score.toFixed(3);
}

function renderHistory(filter = "") {
  const normalizedFilter = filter.trim().toLowerCase();
  const sortedHistory = [...state.history].sort((a, b) => {
    const aTime = a.timestamp || 0;
    const bTime = b.timestamp || 0;
    return state.historySortAsc ? aTime - bTime : bTime - aTime;
  });
  const rows = sortedHistory
    .filter(item => item.country.toLowerCase().includes(normalizedFilter) || item.category.toLowerCase().includes(normalizedFilter) || item.score.toFixed(3).includes(normalizedFilter))
    .map((item, idx) => `
      <tr>
        <td>${item.country}</td>
        <td>${item.score.toFixed(3)}</td>
        <td>${item.category}</td>
        <td>${item.date}</td>
        <td>${item.time}</td>
        <td><button type="button" class="btn btn-sm btn-outline-primary history-download" data-index="${idx}"><i class="bi bi-download"></i></button></td>
        <td><button type="button" class="btn btn-sm btn-outline-danger history-delete" data-index="${idx}"><i class="bi bi-trash"></i></button></td>
      </tr>`)
    .join("");
  historyBody.innerHTML = rows || `<tr><td colspan="7" class="text-center text-muted">No history available.</td></tr>`;
}

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

function toggleHistorySort() {
  state.historySortAsc = !state.historySortAsc;
  historySortBtn.innerHTML = `<i class="bi bi-arrow-down-up me-1"></i>${state.historySortAsc ? "Oldest First" : "Newest First"}`;
  renderHistory(historySearch.value || "");
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
  const options = {
    margin: 0.3,
    filename: `HDI-report-${report.country.replace(/\s+/g, "-")}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
  };
  html2pdf().set(options).from(exportArea).save();
}

function makeReportData() {
  const category = document.getElementById("resultCategory").textContent;
  const countryLabel = resultCountryDisplay ? resultCountryDisplay.textContent.replace("Country:", "").trim() : "Unknown";
  const inputs = Array.from(document.querySelectorAll("#inputSummary .summary-item")).map(item => `${item.querySelector(".summary-key").textContent}: ${item.querySelector(".summary-value").textContent}`);
  const recommendations = Array.from(recommendationList.children).map(item => item.textContent);
  const scenario = buildScenario(category, {
    life_expectancy: Number(document.getElementById("life_expectancy").value),
    mean_years_schooling: Number(document.getElementById("mean_years_schooling").value),
    expected_years_schooling: Number(document.getElementById("expected_years_schooling").value),
    gni_per_capita: Number(document.getElementById("gni_per_capita").value),
  });
  const score = Number(hdiScoreValue.textContent) || estimateHdiScore({
    life_expectancy: Number(document.getElementById("life_expectancy").value),
    mean_years_schooling: Number(document.getElementById("mean_years_schooling").value),
    expected_years_schooling: Number(document.getElementById("expected_years_schooling").value),
    gni_per_capita: Number(document.getElementById("gni_per_capita").value),
  });
  return {
    country: countryLabel,
    category,
    score,
    inputs,
    recommendations,
    scenario,
    aiSummary: reportSummary ? reportSummary.textContent : "",
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
  link.download = `HDI-report-${report.country.replace(/\s+/g, "-")}.csv`;
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
  formErrorMsg.textContent = msg;
  formError.classList.remove("d-none");
}

function hideFormError() {
  formError.classList.add("d-none");
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
  errEl.classList.remove("show");
  errEl.textContent = "";
  countrySearch.classList.remove("is-invalid");

  if (!value) {
    countrySearch.classList.add("is-invalid");
    errEl.textContent = "❌ Country is required.";
    errEl.classList.add("show");
    return false;
  }

  const match = COUNTRIES.find(country => country.name.toLowerCase() === value.toLowerCase());
  if (!match) {
    countrySearch.classList.add("is-invalid");
    errEl.textContent = "❌ Please select a valid country from the list.";
    errEl.classList.add("show");
    return false;
  }

  countryInput.value = match.name;
  countrySearch.classList.remove("is-invalid");
  return true;
}

function setSelectedCountry(name, code) {
  countrySearch.value = name;
  countryInput.value = name;
  countryDropdown.classList.add("d-none");
}

function updateCountryDropdown(items) {
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
  predictBtn.disabled = loading;
  btnText.classList.toggle("d-none", loading);
  btnLoading.classList.toggle("d-none", !loading);
  loadingState.classList.toggle("d-none", !loading);

  if (loading) {
    state.loadingProgress = 0;
    loadingProgress.style.width = "0%";
    loadingPercent.textContent = "0%";
    loadingStepText.textContent = "Analyzing Health...";

    state.loadingTimer = setInterval(() => {
      state.loadingProgress = clamp(state.loadingProgress + Math.random() * 8 + 2, 0, 97);
      loadingProgress.style.width = `${state.loadingProgress}%`;
      loadingPercent.textContent = `${Math.round(state.loadingProgress)}%`;

      if (state.loadingProgress < 22) loadingStepText.textContent = "Analyzing Health...";
      else if (state.loadingProgress < 44) loadingStepText.textContent = "Analyzing Education...";
      else if (state.loadingProgress < 66) loadingStepText.textContent = "Analyzing Income...";
      else if (state.loadingProgress < 84) loadingStepText.textContent = "Running Machine Learning Model...";
      else loadingStepText.textContent = "Generating Result...";
    }, 120);
  } else {
    clearInterval(state.loadingTimer);
    loadingProgress.style.width = "100%";
    loadingPercent.textContent = "100%";
    loadingStepText.textContent = "Completed.";
    setTimeout(() => loadingState.classList.add("d-none"), 320);
  }
}

function renderConfidenceBars(confidence) {
  const container = document.getElementById("confidenceBars");
  const categories = ["Very High", "High", "Medium", "Low"];
  const colors = { "Very High": "#10b981", "High": "#3b82f6", "Medium": "#f59e0b", "Low": "#ef4444" };
  container.innerHTML = categories.map(category => {
    const value = confidence[category] ?? 0;
    return `
      <div class="conf-item">
        <div class="conf-label"><span class="conf-name">${category}</span><span class="conf-value">${value.toFixed(1)}%</span></div>
        <div class="conf-bar-bg"><div class="conf-bar-fill" style="width:0; background:${colors[category]}" data-value="${value}"></div></div>
      </div>`;
  }).join("");
  requestAnimationFrame(() => requestAnimationFrame(() => {
    container.querySelectorAll(".conf-bar-fill").forEach(bar => bar.style.width = `${bar.dataset.value}%`);
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
  const container = document.getElementById("inputSummary");
  container.innerHTML = Object.entries(inputs).map(([key, value]) => {
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
  recommendationList.innerHTML = recommendations.map(item => `<li>${item}</li>`).join("");
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

  animateNumber(document.getElementById("healthScoreVal"), Math.round(healthScore));
  animateNumber(document.getElementById("educationScoreVal"), Math.round(educationScore));
  animateNumber(document.getElementById("incomeScoreVal"), Math.round(incomeScore));
  document.getElementById("developmentStatusVal").textContent = statusText;
}

function generateInsights(inputs, category) {
  const insights = [];
  const healthInsight = inputs.life_expectancy >= 75 ? "Health is above average." : "Health requires attention.";
  const educationInsight = (inputs.mean_years_schooling + inputs.expected_years_schooling) / 2 >= 12 ? "Education is strong for this cohort." : "Education requires improvement.";
  const incomeInsight = inputs.gni_per_capita >= 20000 ? "Income level is strong." : "Income level is developing.";
  const categoryInsight = `Country belongs to ${category} HDI category.`;
  insights.push(healthInsight, educationInsight, incomeInsight, categoryInsight);
  const list = document.getElementById("dashboardInsightsList");
  list.innerHTML = insights.map(item => `<li>${item}</li>`).join("");
}

function updateDashboardSummary(inputs, category, country) {
  document.getElementById("summaryCountry").textContent = country;
  document.getElementById("summaryCategory").textContent = category;
  document.getElementById("predictionTime").textContent = new Date().toLocaleTimeString();
  document.getElementById("summaryHealth").textContent = `${inputs.life_expectancy} yrs`;
  document.getElementById("summaryEducation").textContent = `${inputs.mean_years_schooling} / ${inputs.expected_years_schooling} yrs`;
  document.getElementById("summaryIncome").textContent = formatMoney(inputs.gni_per_capita);
  document.getElementById("summaryStatus").textContent = category;
}

function ensureDashboardVisible() {
  const dashboard = document.getElementById("dashboardPanel");
  if (!dashboard) return;
  dashboard.classList.remove("d-none");
  fadeInElement(dashboard);
}

function renderDashboardCharts(inputs, category) {
  destroyDashboardCharts();
  const estimatedScore = estimateHdiScore(inputs);
  const health = clamp((inputs.life_expectancy - 20) / 70 * 100, 0, 100);
  const meanSchooling = clamp(inputs.mean_years_schooling / 20 * 100, 0, 100);
  const expectedSchooling = clamp(inputs.expected_years_schooling / 25 * 100, 0, 100);
  const income = clamp((inputs.gni_per_capita - 100) / 149900 * 100, 0, 100);
  const education = clamp(((inputs.mean_years_schooling + inputs.expected_years_schooling) / 45) * 100, 0, 100);
  const categoryValue = { "Very High": 92, "High": 76, "Medium": 58, "Low": 34 }[category] || 60;

  renderGaugeChart(estimatedScore, category);

  state.chartInstances.dashboard.push(new Chart(document.getElementById("dashboardBarChart"), {
    type: "bar",
    data: {
      labels: ["Life Expectancy", "Mean Schooling", "Expected Schooling", "Income"],
      datasets: [{
        label: "Indicator Score",
        data: [health, meanSchooling, expectedSchooling, income],
        backgroundColor: ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6"],
        borderRadius: 18,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      animation: { duration: 900, easing: "easeOutQuart" },
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: "#94a3b8" } },
        y: { beginAtZero: true, max: 100, ticks: { color: "#94a3b8", callback: value => `${value}%` }, grid: { color: "rgba(148,163,184,0.15)" } },
      },
    },
  }));

  state.chartInstances.dashboard.push(new Chart(document.getElementById("dashboardRadarChart"), {
    type: "radar",
    data: {
      labels: ["Health", "Education", "Income", "Prediction Strength"],
      datasets: [{
        label: "Development Profile",
        data: [health, education, income, categoryValue],
        backgroundColor: "rgba(59,130,246,0.2)",
        borderColor: "#3b82f6",
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: "#fff",
        fill: true,
      }],
    },
    options: {
      responsive: true,
      animation: { duration: 900, easing: "easeOutQuart" },
      scales: {
        r: {
          angleLines: { color: "rgba(148,163,184,0.2)" },
          grid: { color: "rgba(148,163,184,0.2)" },
          suggestedMin: 0,
          suggestedMax: 100,
          pointLabels: { color: "#cbd5e1" },
          ticks: { display: false },
        },
      },
      plugins: { legend: { display: false } },
    },
  }));

  const total = health + education + income;
  const healthPart = total ? Math.round((health / total) * 100) : 0;
  const educationPart = total ? Math.round((education / total) * 100) : 0;
  const incomePart = total ? 100 - healthPart - educationPart : 0;

  state.chartInstances.dashboard.push(new Chart(document.getElementById("dashboardDoughnutChart"), {
    type: "doughnut",
    data: {
      labels: ["Health", "Education", "Income"],
      datasets: [{
        data: [healthPart, educationPart, incomePart],
        backgroundColor: ["#10b981", "#3b82f6", "#f59e0b"],
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      animation: { duration: 900, easing: "easeOutQuart" },
      plugins: { legend: { position: "bottom", labels: { color: "#cbd5e1", boxWidth: 12 } } },
      cutout: "60%",
    },
  }));
}

function finalizeDashboard(inputs, category, country) {
  updateDashboardSummary(inputs, category, country);
  updateDashboardStats(inputs, category);
  renderProgressMetrics(inputs);
  generateInsights(inputs, category);
  renderDashboardCharts(inputs, category);
  ensureDashboardVisible();
}

function loadHistory() {
  try {
    const stored = JSON.parse(localStorage.getItem("hdiPredictionHistory") || "[]");
    if (Array.isArray(stored)) state.history = stored;
  } catch {
    state.history = [];
  }
  renderHistory();
}

function clearHistory() {
  state.history = [];
  localStorage.removeItem("hdiPredictionHistory");
  renderHistory();
  createToast("History cleared successfully.");
}

function addHistoryEntry(entry) {
  entry.timestamp = Date.now();
  state.history.unshift(entry);
  localStorage.setItem("hdiPredictionHistory", JSON.stringify(state.history));
  renderHistory(historySearch.value || "");
}

function removeHistoryEntry(index) {
  state.history.splice(index, 1);
  localStorage.setItem("hdiPredictionHistory", JSON.stringify(state.history));
  renderHistory();
  createToast("History entry removed.");
}

function printReport() {
  const report = makeReportData();
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    createToast("Unable to open print window.", "danger");
    return;
  }
  printWindow.document.write(`
    <html><head><title>HDI Report</title><style>
      body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
      h1 { margin-bottom: 18px; }
      h2 { margin-top: 24px; }
      ul { margin-top: 0; }
    </style></head><body>
      <h1>HDI Prediction Report</h1>
      <p><strong>Country:</strong> ${report.country}</p>
      <p><strong>Prediction:</strong> ${report.category}</p>
      <p><strong>Date:</strong> ${report.date.toLocaleDateString()} ${report.date.toLocaleTimeString()}</p>
      <h2>Indicators</h2>
      <ul>${report.inputs.map(line => `<li>${line}</li>`).join("")}</ul>
      <h2>Recommendations</h2>
      <ul>${report.recommendations.map(line => `<li>${line}</li>`).join("")}</ul>
    </body></html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

function copyResult() {
  const report = makeReportData();
  const text = `HDI Prediction Result\nCountry: ${report.country}\nPrediction: ${report.category}\n${report.inputs.join("\n")}\nRecommendations:\n${report.recommendations.map(line => `- ${line}`).join("\n")}`;
  navigator.clipboard.writeText(text).then(() => createToast("Result copied to clipboard.")).catch(() => createToast("Unable to copy result.", "danger"));
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(() => createToast("Link copied successfully.")).catch(() => createToast("Unable to copy link.", "danger"));
}

function shareWhatsApp() {
  const text = encodeURIComponent(`${document.getElementById("resultCategory").textContent} HDI prediction for ${countryInput.value || countrySearch.value}. ${window.location.href}`);
  window.open(`https://wa.me/?text=${text}`, "_blank");
}

function shareLinkedIn() {
  const url = encodeURIComponent(window.location.href);
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
}

function shareEmail() {
  const subject = encodeURIComponent("HDI Prediction Result");
  const body = encodeURIComponent(`Prediction: ${document.getElementById("resultCategory").textContent}\nCountry: ${countryInput.value || countrySearch.value}\n${makeReportData().inputs.join("\n")}`);
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

function renderResult(data) {
  const colors = CATEGORY_COLORS[data.category] || CATEGORY_COLORS["Medium"];
  document.getElementById("resultIcon").className = `bi ${data.icon}`;
  document.getElementById("resultCategory").textContent = data.category;
  if (resultCountryName) {
    resultCountryName.textContent = data.country || "Unknown";
  } else {
    document.getElementById("resultCountryDisplay").textContent = data.country || "Unknown";
  }
  document.getElementById("resultDescription").textContent = data.description;

  resultCategoryBadge.textContent = data.category;
  resultCategoryBadge.className = `score-badge badge badge-${data.badge || "secondary"}`;
  predictionStatusBadge.className = `status-badge badge badge-${data.badge || "success"}`;
  predictionStatusBadge.textContent = "Prediction Successful";

  const ring = document.getElementById("resultIconRing");
  ring.style.background = colors.ring;
  ring.style.borderColor = colors.border;
  ring.style.color = colors.border;
  ring.style.boxShadow = `0 0 28px ${colors.border}33`;

  const header = resultCard.querySelector(".result-header");
  header.style.background = `linear-gradient(135deg, ${colors.border}33, ${colors.border}22)`;
  header.style.borderBottom = `1px solid ${colors.border}44`;

  const estimatedScore = estimateHdiScore(data.inputs);
  animateScore(estimatedScore);

  renderConfidenceBars(data.confidence);
  renderInputSummary(data.inputs);
  renderExplanation(data.inputs);
  renderFeatureContributions(data.inputs);
  renderStrengthWeakness(data.inputs, data.category);
  renderRecommendations(data.category, data.inputs);
  renderScenario(data.category, data.inputs);
  renderAiSummary(data.category, data.inputs, data.country);

  updateTimelineProgress();

  resultDate.textContent = new Date().toLocaleDateString();
  resultTime.textContent = new Date().toLocaleTimeString();

  resultPlaceholder.classList.add("d-none");
  resultCard.classList.remove("d-none");
  if (window.innerWidth < 992) resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function handleFormSubmit(e) {
  e.preventDefault();
  hideFormError();

  if (!validateAll()) return;
  if (predictBtn.disabled) return;

  setLoading(true);

  try {
    const formData = new FormData(form);
    const response = await fetch("/predict", { method: "POST", body: formData });
    const data = await response.json();
    if (!response.ok) {
      showFormError(data.error || "Prediction failed. Please try again.");
      return;
    }
    const selectedCountry = countryInput.value || countrySearch.value || "Unknown";
    const payload = { ...data, country: selectedCountry, inputs: { country: selectedCountry, ...data.inputs } };
    renderResult(payload);
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
    showFormError("Network error. Please check your connection and try again.");
  } finally {
    setLoading(false);
  }
}

FIELDS.forEach(field => {
  const input = document.getElementById(field.id);
  input.addEventListener("blur", () => validateField(field));
  input.addEventListener("input", () => {
    if (input.classList.contains("is-invalid")) validateField(field);
    updateFieldStatus(field);
  });
});

countrySearch.addEventListener("input", () => {
  const query = countrySearch.value.trim();
  if (!query) return countryDropdown.classList.add("d-none");
  updateCountryDropdown(filterCountries(query));
});

countrySearch.addEventListener("focus", () => updateCountryDropdown(filterCountries(countrySearch.value.trim())));
countrySearch.addEventListener("blur", () => setTimeout(() => countryDropdown.classList.add("d-none"), 130));

countryDropdown.addEventListener("click", event => {
  const item = event.target.closest(".country-item");
  if (!item) return;
  setSelectedCountry(item.dataset.name, item.dataset.code);
});

historySearch.addEventListener("input", () => renderHistory(historySearch.value || ""));
historySortBtn.addEventListener("click", toggleHistorySort);

downloadExcelBtn.addEventListener("click", downloadExcel);
copyResultBtn.addEventListener("click", copyResult);
downloadPDFBtn.addEventListener("click", downloadPDF);
downloadCSVBtn.addEventListener("click", downloadCSV);
printBtn.addEventListener("click", printReport);
copyLinkBtn.addEventListener("click", copyLink);
shareWhatsAppBtn.addEventListener("click", shareWhatsApp);
shareLinkedInBtn.addEventListener("click", shareLinkedIn);
shareEmailBtn.addEventListener("click", shareEmail);
clearHistoryBtn.addEventListener("click", clearHistory);
historyBody.addEventListener("click", event => {
  const downloadBtn = event.target.closest(".history-download");
  const deleteBtn = event.target.closest(".history-delete");
  if (downloadBtn) {
    downloadHistoryEntry(Number(downloadBtn.dataset.index));
    return;
  }
  if (deleteBtn) removeHistoryEntry(Number(deleteBtn.dataset.index));
});
backToTopBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

function initApp() {
  loadHistory();
  updateScrollProgress();
  animateCounters();
  window.addEventListener("scroll", updateScrollProgress, { passive: true });

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      event.stopPropagation();
      handleFormSubmit(event);
    });
  }

  if (predictBtn) {
    predictBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      handleFormSubmit(event);
    });
  }
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
