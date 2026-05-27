/**
 * Level3Support — pv-megger-tester.js
 * © 2026 Level3Support
 */

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const addRowBtn = document.getElementById("add-row-btn");
  const sampleBtn = document.getElementById("sample-btn");
  const resetBtn = document.getElementById("reset-btn");
  const copyBtn = document.getElementById("copy-btn");
  const exportCsvBtn = document.getElementById("export-csv-btn");
  const exportJsonBtn = document.getElementById("export-json-btn");

  // Event Listeners
  addRowBtn.addEventListener("click", () => addMeasurementRow());
  sampleBtn.addEventListener("click", loadSampleValues);
  resetBtn.addEventListener("click", resetForm);
  copyBtn.addEventListener("click", copySummary);
  exportCsvBtn.addEventListener("click", exportCSV);
  exportJsonBtn.addEventListener("click", exportJSON);

  // Set default date/time
  const todayTime = new Date().toISOString().substring(0, 16);
  document.getElementById("test-date").value = todayTime;
  const yearFromNow = new Date();
  yearFromNow.setFullYear(yearFromNow.getFullYear() + 1);
  document.getElementById("inst-cal").value = yearFromNow.toISOString().split('T')[0];

  // Set default rows
  addMeasurementRow("STR-01", "50", "45", "90");
  addMeasurementRow("STR-02", "80", "75", "150");
  addMeasurementRow("STR-03", "0.4", "0.6", "1.0"); // will fail 1.0 M limit
});

function addMeasurementRow(strId = "", posRes = "", negRes = "", posNegRes = "", note = "") {
  const tbody = document.getElementById("test-tbody");
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td><input type="text" class="str-id-input" value="${strId}" placeholder="e.g. STR-01" style="font-family:monospace; font-weight:600;"></td>
    <td><input type="number" class="pos-res-input" value="${posRes}" placeholder="Pos-Gnd" step="any"></td>
    <td><input type="number" class="neg-res-input" value="${negRes}" placeholder="Neg-Gnd" step="any"></td>
    <td><input type="number" class="pos-neg-input" value="${posNegRes}" placeholder="Pos-Neg" step="any"></td>
    <td>
      <select class="row-unit-select">
        <option value="Mohm">MΩ</option>
        <option value="Gohm">GΩ</option>
      </select>
    </td>
    <td><span class="row-status status-badge-inline status-pass">—</span></td>
    <td><input type="text" class="row-note-input" value="${note}" placeholder="Observations..."></td>
    <td class="print-hide" style="text-align: center;"><button type="button" class="btn-remove" style="padding: 4px 8px; width:auto; min-height:unset; margin:0;" onclick="removeMeasurementRow(this)"><i class="fas fa-trash-alt"></i></button></td>
  `;

  tbody.appendChild(tr);

  // Wire up change listener for live evaluation
  tr.querySelectorAll("input, select").forEach(el => {
    el.addEventListener("input", runLiveEvaluation);
  });

  runLiveEvaluation();
}

function removeMeasurementRow(btn) {
  btn.closest("tr").remove();
  runLiveEvaluation();
}

function loadSampleValues() {
  document.getElementById("site-name").value = "Solaria Peak Arrays";
  document.getElementById("eq-id").value = "INV-02 / COMB-04";
  document.getElementById("tech-name").value = "John Doe";
  document.getElementById("inst-model").value = "Megger MIT415";
  document.getElementById("inst-serial").value = "MIT-90812A";
  document.getElementById("inst-cal").value = "2027-02-15";
  document.getElementById("ambient-temp").value = "32";
  document.getElementById("humidity").value = "45";
  document.getElementById("test-conditions").value = "Hot, dry ambient soil";

  document.getElementById("test-voltage").value = "1000";
  document.getElementById("test-duration").value = "60";
  document.getElementById("min-resistance").value = "1.0";
  document.getElementById("resistance-unit").value = "Mohm";

  const tbody = document.getElementById("test-tbody");
  tbody.innerHTML = "";

  addMeasurementRow("STR-01", "120", "110", "220");
  addMeasurementRow("STR-02", "95", "90", "180");
  addMeasurementRow("STR-03", "150", "145", "290");
  addMeasurementRow("STR-04", "105", "100", "200");
  addMeasurementRow("STR-05", "85", "80", "165");
  addMeasurementRow("STR-06", "115", "110", "225");

  runLiveEvaluation();
}

function resetForm() {
  if (confirm("Reset current PV insulation testing sheets and empty list?")) {
    document.getElementById("site-name").value = "";
    document.getElementById("eq-id").value = "";
    document.getElementById("tech-name").value = "";
    document.getElementById("inst-model").value = "";
    document.getElementById("inst-serial").value = "";
    document.getElementById("ambient-temp").value = "";
    document.getElementById("humidity").value = "";
    document.getElementById("test-conditions").value = "";
    document.getElementById("test-voltage").value = "";
    document.getElementById("test-duration").value = "60";
    document.getElementById("min-resistance").value = "1.0";
    document.getElementById("resistance-unit").value = "Mohm";
    document.getElementById("test-tbody").innerHTML = "";

    document.getElementById("result-panel").style.display = "none";
    document.getElementById("validation-error").style.display = "none";
  }
}

function runLiveEvaluation() {
  const errorDiv = document.getElementById("validation-error");
  errorDiv.style.display = "none";

  const minRes = parseFloat(document.getElementById("min-resistance").value);
  const limitUnit = document.getElementById("resistance-unit").value;

  if (isNaN(minRes) || minRes <= 0) {
    return; // Wait for valid configuration
  }

  // Convert baseline threshold to MΩ for standard mathematical comparisons
  const thresholdMohm = limitUnit === "Gohm" ? (minRes * 1000.0) : minRes;

  let lowestMohm = Infinity;
  let sumMohm = 0;
  let countMeasurements = 0;
  let failedCount = 0;

  const rows = document.querySelectorAll("#test-tbody tr");

  rows.forEach(tr => {
    const strId = tr.querySelector(".str-id-input").value.trim();
    const posVal = parseFloat(tr.querySelector(".pos-res-input").value);
    const negVal = parseFloat(tr.querySelector(".neg-res-input").value);
    const posNegVal = parseFloat(tr.querySelector(".pos-neg-input").value);
    const rowUnit = tr.querySelector(".row-unit-select").value;

    const rowStatusSpan = tr.querySelector(".row-status");

    if (isNaN(posVal) || isNaN(negVal)) {
      rowStatusSpan.textContent = "—";
      rowStatusSpan.className = "row-status status-badge-inline";
      return;
    }

    // Convert row resistance values to MΩ
    const posMohm = rowUnit === "Gohm" ? (posVal * 1000.0) : posVal;
    const negMohm = rowUnit === "Gohm" ? (negVal * 1000.0) : negVal;
    const posNegMohm = !isNaN(posNegVal) ? (rowUnit === "Gohm" ? (posNegVal * 1000.0) : posNegVal) : null;

    let rowPass = posMohm >= thresholdMohm && negMohm >= thresholdMohm;
    if (posNegMohm !== null && posNegMohm < thresholdMohm) {
      rowPass = false;
    }

    if (rowPass) {
      rowStatusSpan.textContent = "PASS";
      rowStatusSpan.className = "row-status status-badge-inline status-pass";
    } else {
      rowStatusSpan.textContent = "FAIL";
      rowStatusSpan.className = "row-status status-badge-inline status-fail";
      failedCount++;
    }

    // Track statistics
    lowestMohm = Math.min(lowestMohm, posMohm, negMohm);
    if (posNegMohm !== null) lowestMohm = Math.min(lowestMohm, posNegMohm);

    sumMohm += posMohm + negMohm;
    let countsThisRow = 2;
    if (posNegMohm !== null) {
      sumMohm += posNegMohm;
      countsThisRow = 3;
    }
    countMeasurements += countsThisRow;
  });

  if (countMeasurements > 0) {
    const avgMohm = sumMohm / countMeasurements;

    // Formatting statistics back to GΩ if configuration unit is GΩ
    let lowestStr = "";
    let avgStr = "";
    if (limitUnit === "Gohm") {
      lowestStr = lowestMohm >= 1000 ? `${(lowestMohm / 1000.0).toFixed(2)} GΩ` : `${lowestMohm.toFixed(1)} MΩ`;
      avgStr = avgMohm >= 1000 ? `${(avgMohm / 1000.0).toFixed(2)} GΩ` : `${avgMohm.toFixed(1)} MΩ`;
    } else {
      lowestStr = `${lowestMohm.toFixed(2)} MΩ`;
      avgStr = `${avgMohm.toFixed(2)} MΩ`;
    }

    document.getElementById("res-threshold").textContent = `${minRes} ${limitUnit === 'Gohm' ? 'GΩ' : 'MΩ'}`;
    document.getElementById("res-lowest").textContent = lowestStr;
    document.getElementById("res-average").textContent = avgStr;
    document.getElementById("res-failed-count").textContent = `${failedCount} strings`;

    const overallBadge = document.getElementById("overall-status-badge");
    const hum = parseFloat(document.getElementById("humidity").value);
    
    if (failedCount > 0) {
      overallBadge.textContent = "FAIL";
      overallBadge.className = "status-badge-inline status-fail";
    } else if (hum > 75) {
      overallBadge.textContent = "REVIEW REQUIRED (High Humidity)";
      overallBadge.className = "status-badge-inline status-warn";
    } else {
      overallBadge.textContent = "PASS";
      overallBadge.className = "status-badge-inline status-pass";
    }

    document.getElementById("result-panel").style.display = "block";
  } else {
    document.getElementById("result-panel").style.display = "none";
  }
}

function collectData() {
  const d = {
    siteName: document.getElementById("site-name").value,
    eqId: document.getElementById("eq-id").value,
    techName: document.getElementById("tech-name").value,
    testDate: document.getElementById("test-date").value,
    instModel: document.getElementById("inst-model").value,
    instSerial: document.getElementById("inst-serial").value,
    instCal: document.getElementById("inst-cal").value,
    ambientTemp: document.getElementById("ambient-temp").value,
    humidity: document.getElementById("humidity").value,
    testConditions: document.getElementById("test-conditions").value,
    testVoltage: parseFloat(document.getElementById("test-voltage").value),
    testDuration: parseFloat(document.getElementById("test-duration").value),
    minResistance: parseFloat(document.getElementById("min-resistance").value),
    resistanceUnit: document.getElementById("resistance-unit").value,
    overallAssessment: document.getElementById("overall-status-badge").textContent,
    lowestMeasured: document.getElementById("res-lowest").textContent,
    averageMeasured: document.getElementById("res-average").textContent,
    failedCircuitsCount: parseInt(document.getElementById("res-failed-count").textContent, 10),
    measurements: []
  };

  document.querySelectorAll("#test-tbody tr").forEach(tr => {
    d.measurements.push({
      stringId: tr.querySelector(".str-id-input").value,
      posRes: parseFloat(tr.querySelector(".pos-res-input").value),
      negRes: parseFloat(tr.querySelector(".neg-res-input").value),
      posNegRes: parseFloat(tr.querySelector(".pos-neg-input").value) || null,
      unit: tr.querySelector(".row-unit-select").value,
      status: tr.querySelector(".row-status").textContent,
      notes: tr.querySelector(".row-note-input").value
    });
  });

  return d;
}

function copySummary() {
  const c = collectData();
  let txt = `PV INSULATION RESISTANCE (MEGGER) TEST REPORT\n`;
  txt += `=====================================\n`;
  txt += `Site: ${c.siteName} | Target Equipment: ${c.eqId}\n`;
  txt += `Technician: ${c.techName} | Date: ${c.testDate}\n`;
  txt += `Megger Applied Voltage: ${c.testVoltage} VDC\n`;
  txt += `Acceptance Threshold: >= ${c.minResistance} ${c.resistanceUnit === 'Gohm' ? 'GΩ' : 'MΩ'}\n`;
  txt += `Overall Status Evaluation: ${c.overallAssessment}\n`;
  txt += `=====================================\n\n`;

  txt += `Test Results Overview:\n`;
  txt += `- Total Failed Circuits: ${c.failedCircuitsCount} strings\n`;
  txt += `- Lowest insulation measured: ${c.lowestMeasured}\n`;
  txt += `- Average insulation measured: ${c.averageMeasured}\n\n`;

  txt += `Tested Circuits Log:\n`;
  c.measurements.forEach(m => {
    txt += `- [${m.status}] ${m.stringId} | R+: ${m.posRes}${m.unit === 'Gohm' ? 'GΩ' : 'MΩ'} | R-: ${m.negRes}${m.unit === 'Gohm' ? 'GΩ' : 'MΩ'}`;
    if (m.posNegRes !== null) {
      txt += ` | R+-: ${m.posNegRes}${m.unit === 'Gohm' ? 'GΩ' : 'MΩ'}`;
    }
    if (m.notes) txt += ` (Note: ${m.notes})`;
    txt += `\n`;
  });

  navigator.clipboard.writeText(txt).then(() => {
    alert("Megger test results summary copied to clipboard!");
  }).catch(() => {
    alert("Failed to copy summary.");
  });
}

function exportCSV() {
  const c = collectData();
  const rows = [];
  rows.push(["PV INSULATION RESISTANCE TEST RECORD"]);
  rows.push(["Site Name", c.siteName]);
  rows.push(["Equipment ID", c.eqId]);
  rows.push(["Technician", c.techName]);
  rows.push(["Date", c.testDate]);
  rows.push(["Test Voltage (VDC)", c.testVoltage]);
  rows.push(["Test Duration (s)", c.testDuration]);
  rows.push(["Min Limit", c.minResistance + " " + c.resistanceUnit]);
  rows.push([]);
  rows.push(["String ID", "Pos-Gnd Resistance", "Neg-Gnd Resistance", "Pos-Neg Resistance", "Unit", "Evaluation", "Notes"]);

  c.measurements.forEach(m => {
    rows.push([
      m.stringId,
      m.posRes || "",
      m.negRes || "",
      m.posNegRes || "",
      m.unit,
      m.status,
      m.notes
    ]);
  });

  const csvContent = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')) .join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pv_insulation_testing_${c.eqId.replace(/\s+/g, '_')}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function exportJSON() {
  const data = collectData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pv_megger_testing_${(data.eqId || 'export').replace(/\s+/g, '_')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
