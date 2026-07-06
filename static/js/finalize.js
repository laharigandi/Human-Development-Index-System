// ── Update Classification Section ─────────────────────────────────────────────
function updateClassification(category) {
  const categoryMap = {
    "Very High": "very-high",
    "High": "high",
    "Medium": "medium",
    "Low": "low"
  };
  
  const classificationItems = document.querySelectorAll(".classification-item");
  classificationItems.forEach(item => {
    item.classList.remove("active");
    if (item.dataset.category === categoryMap[category]) {
      item.classList.add("active");
    }
  });
}

// ── Print Report Function ───────────────────────────────────────────────────────
function printReport() {
  const exportArea = document.getElementById("reportExportArea");
  if (!exportArea) return;
  
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <html>
      <head>
        <title>HDI Prediction Report</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />
        <style>
          body { font-family: 'Inter', sans-serif; padding: 20px; }
          .prediction-result-card { border: 2px solid #000; }
        </style>
      </head>
      <body>
        ${exportArea.innerHTML}
        <script>window.onload = function() { window.print(); }<\/script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

// ── Copy Result Function ───────────────────────────────────────────────────────
function copyResult() {
  const category = document.getElementById("resultCategory")?.textContent || "Unknown";
  const country = document.querySelector(".country-name")?.textContent || "Unknown";
  const score = document.getElementById("hdiScoreValue")?.textContent || "0.000";
  
  const text = `HDI Prediction Result\nCountry: ${country}\nCategory: ${category}\nScore: ${score}`;
  
  navigator.clipboard.writeText(text).then(() => {
    createToast("Result copied to clipboard!");
  }).catch(() => {
    createToast("Failed to copy result.", "danger");
  });
}

// ── Finalize Dashboard ─────────────────────────────────────────────────────
function finalizeDashboard(inputs, category, country) {
  // Animate all dashboard cards on show
  const dashboard = document.getElementById("predictionDashboard");
  if (dashboard) {
    dashboard.classList.add("dashboard-fade-in");
  }
  
  // Animate analytics cards
  document.querySelectorAll(".analytics-card").forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
    card.classList.add("fade-in");
  });
  
  // Animate chart cards
  document.querySelectorAll(".chart-card").forEach((card, index) => {
    card.style.animationDelay = `${(index + 4) * 0.1}s`;
    card.classList.add("fade-in");
  });
  
  // Update analytics progress bars
  updateAnalyticsProgress(inputs);
}
