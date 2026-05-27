/**
 * Level3Support — bess-cell-imbalance.js
 * © 2026 Level3Support
 */

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const addRowBtn = document.getElementById("add-row-btn");
  const importBtn = document.getElementById("import-btn");
  const sampleBtn = document.getElementById("sample-btn");
  const resetBtn = document.getElementById("reset-btn");
  const copyBtn = document.getElementById("copy-btn");
  const exportBtn = document.getElementById("export-btn");

  // Event Listeners
  addRowBtn.addEventListener("click", () => addCellRow());
  importBtn.addEventListener("click", importBulkVoltages);
  sampleBtn.addEventListener("click", loadSampleValues);
  resetBtn.addEventListener("click", resetCalculator);
  copyBtn.addEventListener("click", copyDiagnosticSummary);
  exportBtn.addEventListener("click", exportDiagnosticJSON);

  // Set default timestamp
  const todayTime = new Date().toISOString().substring(0, 16);
  document.getElementById("test-date").value = todayTime;

  // Add default cells
  addCellRow("Cell 1", "3.315", "25.4", "92.1", "No");
  addCellRow("Cell 2", "3.328", "25.6", "92.5", "No");
  addCellRow("Cell 3", "3.285", "25.2", "91.8", "No"); // outlier cell
  addCellRow("Cell 4", "3.322", "25.5", "92.3", "No");

  runLiveEvaluation();
});

function addCellRow(id = "", voltage = "", temp = "", soc = "", alarm = "No", notes = "") {
  const tbody = document.getElementById("cell-tbody");
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td><input type="text" class="cell-id-input" value="${id}" placeholder="e.g. Cell 01" style="font-family:monospace; font-weight:600;"></td>
    <td><input type="number" class="cell-v-input" value="${voltage}" placeholder="Voltage" step="any"></td>
    <td><input type="number" class="cell-t-input" value="${temp}" placeholder="Temp °C" step="any"></td>
    <td><input type="number" class="cell-soc-input" value="${soc}" placeholder="SOC %" step="any"></td>
    <td>
      <select class="cell-alarm-select">
        <option value="No" ${alarm === 'No' ? 'selected' : ''}>No</option>
        <option value="Yes" ${alarm === 'Yes' ? 'selected' : ''}>Yes</option>
        <option value="Unknown" ${alarm === 'Unknown' ? 'selected' : ''}>Unknown</option>
      </select>
    </td>
    <td><span class="cell-dev">—</span></td>
    <td><input type="text" class="cell-notes-input" value="${notes}" placeholder="Notes..."></td>
    <td style="text-align: center;"><button type="button" class="btn-remove" style="padding: 4px 8px; width:auto; min-height:unset; margin:0;" onclick="removeCellRow(this)"><i class="fas fa-trash-alt"></i></button></td>
  `;

  tbody.appendChild(tr);

  // Wire up change listeners
  tr.querySelectorAll("input, select").forEach(el => {
    el.addEventListener("input", runLiveEvaluation);
  });

  runLiveEvaluation();
}

function removeCellRow(btn) {
  btn.closest("tr").remove();
  runLiveEvaluation();
}

function importBulkVoltages() {
  const bulkText = document.getElementById("bulk-voltages").value.trim();
  if (!bulkText) {
    alert("Please paste voltages first.");
    return;
  }

  // Regex split to extract any floats
  const matches = bulkText.match(/[-+]?[0-9]*\.?[0-9]+/g);
  if (!matches || matches.length === 0) {
    alert("No valid voltages found in bulk text.");
    return;
  }

  const tbody = document.getElementById("cell-tbody");
  tbody.innerHTML = "";

  const level = document.getElementById("measurement-level").value;

  matches.forEach((val, idx) => {
    addCellRow(`${level} ${idx + 1}`, val, "", "", "No");
  });

  runLiveEvaluation();
}

function loadSampleValues() {
  document.getElementById("site-name").value = "Red Mesa BESS Hub A";
  document.getElementById("container-id").value = "ESS-03";
  document.getElementById("rack-id").value = "RACK-08";
  document.getElementById("measurement-level").value = "Cell";
  document.getElementById("warn-threshold").value = "30";
  document.getElementById("crit-threshold").value = "50";

  const tbody = document.getElementById("cell-tbody");
  tbody.innerHTML = "";

  // 16 LFP cells sample series
  const voltages = [
    3.328, 3.325, 3.329, 3.322,
    3.275, 3.326, 3.329, 3.324, // cell 5 is an outlier (3.275V)
    3.328, 3.327, 3.332, 3.325,
    3.321, 3.326, 3.330, 3.324
  ];

  voltages.forEach((val, idx) => {
    addCellRow(`Cell ${idx + 1}`, val, "26.5", "92.3", "No");
  });

  runLiveEvaluation();
}

function resetCalculator() {
  if (confirm("Reset current BESS cell imbalance calculator and empty cell diagnostics list?")) {
    document.getElementById("site-name").value = "";
    document.getElementById("container-id").value = "";
    document.getElementById("rack-id").value = "";
    document.getElementById("measurement-level").value = "Cell";
    document.getElementById("warn-threshold").value = "30";
    document.getElementById("crit-threshold").value = "50";
    document.getElementById("bulk-voltages").value = "";
    document.getElementById("cell-tbody").innerHTML = "";

    document.getElementById("result-panel").style.display = "none";
    document.getElementById("validation-error").style.display = "none";
  }
}

function runLiveEvaluation() {
  const errorDiv = document.getElementById("validation-error");
  errorDiv.style.display = "none";

  const warnThreshMv = parseFloat(document.getElementById("warn-threshold").value);
  const critThreshMv = parseFloat(document.getElementById("crit-threshold").value);

  if (isNaN(warnThreshMv) || isNaN(critThreshMv) || warnThreshMv <= 0 || critThreshMv <= 0) {
    return;
  }

  const rows = document.querySelectorAll("#cell-tbody tr");
  let sumVoltages = 0;
  let validRows = [];

  rows.forEach(tr => {
    const vVal = parseFloat(tr.querySelector(".cell-v-input").value);
    if (!isNaN(vVal) && vVal > 0) {
      validRows.push({
        tr: tr,
        vVal: vVal
      });
      sumVoltages += vVal;
    } else {
      tr.querySelector(".cell-dev").textContent = "—";
      tr.querySelector(".cell-dev").style.color = "inherit";
    }
  });

  const count = validRows.length;
  if (count < 2) {
    // Need at least 2 entries to calculate imbalance
    document.getElementById("result-panel").style.display = "none";
    if (count === 1) {
      errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Add at least 2 measurement values to evaluate imbalance spread.`;
      errorDiv.style.color = "var(--warning-color)";
      errorDiv.style.display = "block";
    }
    return;
  }

  const avg = sumVoltages / count;
  let maxVal = -Infinity;
  let minVal = Infinity;
  let maxTr = null;
  let minTr = null;
  let flaggedCount = 0;

  validRows.forEach(item => {
    if (item.vVal > maxVal) {
      maxVal = item.vVal;
      maxTr = item.tr;
    }
    if (item.vVal < minVal) {
      minVal = item.vVal;
      minTr = item.tr;
    }
  });

  const spread = maxVal - minVal;
  const spreadMv = spread * 1000.0;

  let overallStatus = "Normal";
  let overallBadgeClass = "status-pass";

  if (spreadMv >= critThreshMv) {
    overallStatus = "Investigate";
    overallBadgeClass = "status-fail";
  } else if (spreadMv >= warnThreshMv) {
    overallStatus = "Watch";
    overallBadgeClass = "status-warn";
  }

  // Evaluate deviations per row and style them
  validRows.forEach(item => {
    const dev = item.vVal - avg;
    const devMv = dev * 1000.0;
    const devSpan = item.tr.querySelector(".cell-dev");

    // Display formatted deviation
    const sign = dev >= 0 ? "+" : "";
    devSpan.textContent = `${sign}${devMv.toFixed(1)} mV`;

    // Highlight row highlights if cell is maximum or minimum
    const isMax = item.tr === maxTr;
    const isMin = item.tr === minTr;

    if (isMax) {
      item.tr.style.background = "#f0fdf4"; // soft green for highest
    } else if (isMin) {
      item.tr.style.background = "#fff5f5"; // soft red for lowest
    } else {
      item.tr.style.background = "transparent";
    }

    // Flag cell if absolute deviation exceeds thresholds
    const absDevMv = Math.abs(devMv);
    if (absDevMv >= (critThreshMv / 2.0)) {
      devSpan.style.color = "var(--error-color)";
      devSpan.style.fontWeight = "700";
      flaggedCount++;
    } else if (absDevMv >= (warnThreshMv / 2.0)) {
      devSpan.style.color = "var(--warning-color)";
      devSpan.style.fontWeight = "600";
      flaggedCount++;
    } else {
      devSpan.style.color = "var(--success-color)";
      devSpan.style.fontWeight = "normal";
    }
  });

  // Render Stats
  const level = document.getElementById("measurement-level").value;
  document.getElementById("res-avg").textContent = `${avg.toFixed(3)} V`;
  document.getElementById("res-spread-mv").textContent = `${spreadMv.toFixed(1)} mV`;
  document.getElementById("res-max").textContent = `${maxVal.toFixed(3)} V`;
  document.getElementById("res-min").textContent = `${minVal.toFixed(3)} V`;

  const maxLabel = maxTr.querySelector(".cell-id-input").value || "Highest";
  const minLabel = minTr.querySelector(".cell-id-input").value || "Lowest";
  document.getElementById("res-max-label").textContent = `Max (${maxLabel})`;
  document.getElementById("res-min-label").textContent = `Min (${minLabel})`;

  document.getElementById("res-total-count").textContent = `${count} ${level}s`;
  document.getElementById("res-flagged-count").textContent = `${flaggedCount} outlier items`;

  const overallBadge = document.getElementById("overall-status-badge");
  overallBadge.textContent = overallStatus;
  overallBadge.className = `status-badge-inline ${overallBadgeClass}`;

  document.getElementById("result-panel").style.display = "block";
}

function collectData() {
  const d = {
    siteName: document.getElementById("site-name").value,
    containerId: document.getElementById("container-id").value,
    rackId: document.getElementById("rack-id").value,
    testDate: document.getElementById("test-date").value,
    level: document.getElementById("measurement-level").value,
    warningLimitMv: parseFloat(document.getElementById("warn-threshold").value),
    criticalLimitMv: parseFloat(document.getElementById("crit-threshold").value),
    averageVoltage: parseFloat(document.getElementById("res-avg").textContent),
    voltageSpreadMv: parseFloat(document.getElementById("res-spread-mv").textContent),
    maxVoltage: parseFloat(document.getElementById("res-max").textContent),
    minVoltage: parseFloat(document.getElementById("res-min").textContent),
    assessment: document.getElementById("overall-status-badge").textContent,
    cells: []
  };

  document.querySelectorAll("#cell-tbody tr").forEach(tr => {
    d.cells.push({
      id: tr.querySelector(".cell-id-input").value,
      voltage: parseFloat(tr.querySelector(".cell-v-input").value),
      temperature: parseFloat(tr.querySelector(".cell-t-input").value) || null,
      soc: parseFloat(tr.querySelector(".cell-soc-input").value) || null,
      alarm: tr.querySelector(".cell-alarm-select").value,
      deviation: tr.querySelector(".cell-dev").textContent,
      notes: tr.querySelector(".cell-notes-input").value
    });
  });

  return d;
}

function copyDiagnosticSummary() {
  const c = collectData();
  let txt = `BESS CELL VOLTAGE BALANCE DIAGNOSTIC ASSESSMENT\n`;
  txt += `=====================================\n`;
  txt += `Site: ${c.siteName} | Component: ${c.containerId} / ${c.rackId}\n`;
  txt += `Level: ${c.level} | Timestamp: ${c.testDate}\n`;
  txt += `Diagnostic Assessment: ${c.assessment.toUpperCase()}\n`;
  txt += `=====================================\n\n`;

  txt += `Voltage Balancing Metrics:\n`;
  txt += `- Total items analyzed: ${c.cells.length} ${c.level}s\n`;
  txt += `- Average Voltage: ${c.averageVoltage} V\n`;
  txt += `- Maximum Voltage: ${c.maxVoltage} V\n`;
  txt += `- Minimum Voltage: ${c.minVoltage} V\n`;
  txt += `- Extreme Delta Spread: ${c.voltageSpreadMv} mV (Limits: Warn ${c.warningLimitMv}mV, Crit ${c.criticalLimitMv}mV)\n\n`;

  txt += `Diagnostic Log (Outliers & Flags):\n`;
  c.cells.forEach(cell => {
    const isOutlier = cell.deviation !== '—' && (Math.abs(parseFloat(cell.deviation)) >= (c.warningLimitMv / 2.0));
    if (isOutlier || cell.alarm === 'Yes') {
      txt += `- [ALERT] ${cell.id}: ${cell.voltage.toFixed(3)}V (Dev: ${cell.deviation}) [Alarm Present: ${cell.alarm}]\n`;
    }
  });

  navigator.clipboard.writeText(txt).then(() => {
    alert("Cell balancing diagnostics summary copied to clipboard!");
  }).catch(() => {
    alert("Failed to copy summary.");
  });
}

function exportDiagnosticJSON() {
  const data = collectData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bess_cell_imbalance_${(data.rackId || 'export').replace(/\s+/g, '_')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
