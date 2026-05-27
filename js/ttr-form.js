/**
 * Level3Support — ttr-form.js
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

  const vPrimary = document.getElementById("v-primary");
  const vSecondary = document.getElementById("v-secondary");

  // Event Listeners
  addRowBtn.addEventListener("click", () => addTTRRow());
  sampleBtn.addEventListener("click", loadSampleValues);
  resetBtn.addEventListener("click", resetTTRForm);
  copyBtn.addEventListener("click", copyTTRSummary);
  exportCsvBtn.addEventListener("click", exportCSV);
  exportJsonBtn.addEventListener("click", exportTTRJSON);

  vPrimary.addEventListener("input", updateNominalRatio);
  vSecondary.addEventListener("input", updateNominalRatio);

  // Set default timestamp
  const todayTime = new Date().toISOString().substring(0, 16);
  document.getElementById("test-date").value = todayTime;
  const yearFromNow = new Date();
  yearFromNow.setFullYear(yearFromNow.getFullYear() + 1);
  document.getElementById("inst-cal").value = yearFromNow.toISOString().split('T')[0];

  // Set default rows
  addTTRRow("1 (Nominal)", "AB", "71.875", "71.910");
  addTTRRow("1 (Nominal)", "BC", "71.875", "71.890");
  addTTRRow("1 (Nominal)", "CA", "71.875", "71.850");
});

function updateNominalRatio() {
  const pVal = parseFloat(document.getElementById("v-primary").value);
  const sVal = parseFloat(document.getElementById("v-secondary").value);

  if (!isNaN(pVal) && !isNaN(sVal) && sVal > 0) {
    const nominal = pVal / sVal;
    document.getElementById("nominal-ratio").value = nominal.toFixed(3);
    
    // Auto populate row expected ratio if empty
    document.querySelectorAll("#ttr-tbody tr").forEach(tr => {
      const expInput = tr.querySelector(".expected-ratio-input");
      if (expInput.value === "") {
        expInput.value = nominal.toFixed(3);
      }
    });

    runLiveEvaluation();
  } else {
    document.getElementById("nominal-ratio").value = "";
  }
}

function addTTRRow(tap = "1", phase = "AB", expected = "", measured = "", notes = "") {
  const tbody = document.getElementById("ttr-tbody");
  const tr = document.createElement("tr");

  // If expected is empty, try to populate from nominal ratio
  let finalExpected = expected;
  if (!expected) {
    const nom = document.getElementById("nominal-ratio").value;
    if (nom) finalExpected = nom;
  }

  tr.innerHTML = `
    <td><input type="text" class="tap-input" value="${tap}" placeholder="e.g. 1" style="font-family:monospace; font-weight:600;"></td>
    <td>
      <select class="phase-select">
        <option value="A" ${phase === 'A' ? 'selected' : ''}>Phase A</option>
        <option value="B" ${phase === 'B' ? 'selected' : ''}>Phase B</option>
        <option value="C" ${phase === 'C' ? 'selected' : ''}>Phase C</option>
        <option value="AB" ${phase === 'AB' ? 'selected' : ''}>Phase AB</option>
        <option value="BC" ${phase === 'BC' ? 'selected' : ''}>Phase BC</option>
        <option value="CA" ${phase === 'CA' ? 'selected' : ''}>Phase CA</option>
        <option value="Other" ${phase === 'Other' ? 'selected' : ''}>Other</option>
      </select>
    </td>
    <td><input type="number" class="expected-ratio-input" value="${finalExpected}" placeholder="Expected" step="any"></td>
    <td><input type="number" class="measured-ratio-input" value="${measured}" placeholder="Measured" step="any"></td>
    <td><span class="row-error" style="font-weight:700;">—</span></td>
    <td><span class="row-status status-badge-inline status-pass">—</span></td>
    <td><input type="text" class="row-note-input" value="${notes}" placeholder="Notes..."></td>
    <td class="print-hide" style="text-align: center;"><button type="button" class="btn-remove" style="padding: 4px 8px; width:auto; min-height:unset; margin:0;" onclick="removeTTRRow(this)"><i class="fas fa-trash-alt"></i></button></td>
  `;

  tbody.appendChild(tr);

  // Wire live evaluation
  tr.querySelectorAll("input, select").forEach(el => {
    el.addEventListener("input", runLiveEvaluation);
  });

  runLiveEvaluation();
}

function removeTTRRow(btn) {
  btn.closest("tr").remove();
  runLiveEvaluation();
}

function loadSampleValues() {
  document.getElementById("site-name").value = "Solaria Main MV Station";
  document.getElementById("tx-id").value = "TX-01 (Step-Up)";
  document.getElementById("tx-mfg").value = "General Electric";
  document.getElementById("tx-model").value = "GE-Pro-35M";
  document.getElementById("tx-serial").value = "GE-948271A";
  document.getElementById("tx-power").value = "35";
  document.getElementById("v-primary").value = "34500";
  document.getElementById("v-secondary").value = "480";
  document.getElementById("vector-group").value = "Dyn11";
  document.getElementById("allowed-error").value = "0.50";

  document.getElementById("inst-model").value = "Megger TTR330";
  document.getElementById("inst-serial").value = "TTR-9082A";
  document.getElementById("inst-cal").value = "2027-04-10";
  document.getElementById("tech-name").value = "Andres Provero";

  updateNominalRatio();

  const tbody = document.getElementById("ttr-tbody");
  tbody.innerHTML = "";

  // Tap 1
  addTTRRow("1 (Nominal)", "AB", "71.875", "71.910");
  addTTRRow("1 (Nominal)", "BC", "71.875", "71.880");
  addTTRRow("1 (Nominal)", "CA", "71.875", "71.840");

  // Tap 2 (+2.5%)
  addTTRRow("2 (+2.5%)", "AB", "73.672", "73.710");
  addTTRRow("2 (+2.5%)", "BC", "73.672", "73.690");
  addTTRRow("2 (+2.5%)", "CA", "73.672", "73.640");

  // Tap 3 (-2.5%)
  addTTRRow("3 (-2.5%)", "AB", "70.078", "70.120");
  addTTRRow("3 (-2.5%)", "BC", "70.078", "70.090");
  addTTRRow("3 (-2.5%)", "CA", "70.078", "69.580"); // will fail 0.5% limit (approx -0.7%)

  runLiveEvaluation();
}

function resetTTRForm() {
  if (confirm("Reset Turns Ratio forms and delete current data logs?")) {
    document.getElementById("site-name").value = "";
    document.getElementById("tx-id").value = "";
    document.getElementById("tx-mfg").value = "";
    document.getElementById("tx-model").value = "";
    document.getElementById("tx-serial").value = "";
    document.getElementById("tx-power").value = "";
    document.getElementById("v-primary").value = "";
    document.getElementById("v-secondary").value = "";
    document.getElementById("vector-group").value = "";
    document.getElementById("nominal-ratio").value = "";
    document.getElementById("allowed-error").value = "0.50";
    document.getElementById("inst-model").value = "";
    document.getElementById("inst-serial").value = "";
    document.getElementById("tech-name").value = "";
    document.getElementById("ttr-tbody").innerHTML = "";

    document.getElementById("result-panel").style.display = "none";
    document.getElementById("validation-error").style.display = "none";
  }
}

function runLiveEvaluation() {
  const errorDiv = document.getElementById("validation-error");
  errorDiv.style.display = "none";

  const allowedErr = parseFloat(document.getElementById("allowed-error").value);
  if (isNaN(allowedErr) || allowedErr < 0) {
    return;
  }

  const calDate = document.getElementById("inst-cal").value;
  let warnings = [];
  if (!calDate) {
    warnings.push("Instrument Calibration Due Date is missing on test log record.");
  }

  const rows = document.querySelectorAll("#ttr-tbody tr");
  let maxDeviation = 0;
  let failedCount = 0;
  let countMeasurements = 0;

  rows.forEach(tr => {
    const exp = parseFloat(tr.querySelector(".expected-ratio-input").value);
    const meas = parseFloat(tr.querySelector(".measured-ratio-input").value);
    const errSpan = tr.querySelector(".row-error");
    const statusSpan = tr.querySelector(".row-status");

    if (isNaN(exp) || isNaN(meas) || exp <= 0 || meas <= 0) {
      errSpan.textContent = "—";
      statusSpan.textContent = "—";
      statusSpan.className = "row-status status-badge-inline";
      return;
    }

    const errPct = ((meas - exp) / exp) * 100.0;
    const absErrPct = Math.abs(errPct);

    errSpan.textContent = `${errPct >= 0 ? '+' : ''}${errPct.toFixed(3)}%`;

    if (absErrPct <= allowedErr) {
      statusSpan.textContent = "PASS";
      statusSpan.className = "row-status status-badge-inline status-pass";
      errSpan.style.color = "var(--success-color)";
    } else {
      statusSpan.textContent = "FAIL";
      statusSpan.className = "row-status status-badge-inline status-fail";
      errSpan.style.color = "var(--error-color)";
      failedCount++;
    }

    maxDeviation = Math.max(maxDeviation, absErrPct);
    countMeasurements++;
  });

  if (countMeasurements > 0) {
    document.getElementById("res-max-error").textContent = `${maxDeviation.toFixed(3)}%`;
    document.getElementById("res-limit").textContent = `±${allowedErr.toFixed(2)}%`;
    document.getElementById("res-failed-count").textContent = `${failedCount} items`;

    const overallBadge = document.getElementById("overall-status-badge");
    if (failedCount > 0) {
      overallBadge.textContent = "FAIL";
      overallBadge.className = "status-badge-inline status-fail";
    } else {
      overallBadge.textContent = "PASS";
      overallBadge.className = "status-badge-inline status-pass";
    }

    if (warnings.length > 0) {
      errorDiv.innerHTML = warnings.map(w => `<div style="margin-bottom:4px;"><i class="fas fa-exclamation-triangle"></i> ${w}</div>`).join("");
      errorDiv.style.color = "var(--warning-color)";
      errorDiv.style.display = "block";
    }

    document.getElementById("result-panel").style.display = "block";
  } else {
    document.getElementById("result-panel").style.display = "none";
  }
}

function collectData() {
  const d = {
    siteName: document.getElementById("site-name").value,
    txId: document.getElementById("tx-id").value,
    txMfg: document.getElementById("tx-mfg").value,
    txModel: document.getElementById("tx-model").value,
    txSerial: document.getElementById("tx-serial").value,
    txPower: document.getElementById("tx-power").value,
    vPrimary: parseFloat(document.getElementById("v-primary").value),
    vSecondary: parseFloat(document.getElementById("v-secondary").value),
    vectorGroup: document.getElementById("vector-group").value,
    nominalRatio: document.getElementById("nominal-ratio").value,
    allowedErrorLimit: parseFloat(document.getElementById("allowed-error").value),
    instModel: document.getElementById("inst-model").value,
    instSerial: document.getElementById("inst-serial").value,
    instCal: document.getElementById("inst-cal").value,
    techName: document.getElementById("tech-name").value,
    testDate: document.getElementById("test-date").value,
    overallAssessment: document.getElementById("overall-status-badge").textContent,
    maxDeviation: document.getElementById("res-max-error").textContent,
    failedCircuitsCount: parseInt(document.getElementById("res-failed-count").textContent, 10),
    measurements: []
  };

  document.querySelectorAll("#ttr-tbody tr").forEach(tr => {
    d.measurements.push({
      tap: tr.querySelector(".tap-input").value,
      phase: tr.querySelector(".phase-select").value,
      expected: parseFloat(tr.querySelector(".expected-ratio-input").value),
      measured: parseFloat(tr.querySelector(".measured-ratio-input").value),
      deviation: tr.querySelector(".row-error").textContent,
      status: tr.querySelector(".row-status").textContent,
      notes: tr.querySelector(".row-note-input").value
    });
  });

  return d;
}

function copyTTRSummary() {
  const c = collectData();
  let txt = `TRANSFORMER TURNS RATIO (TTR) FIELD ASSESSMENT REPORT\n`;
  txt += `=====================================\n`;
  txt += `Site: ${c.siteName} | Transformer ID: ${c.txId}\n`;
  txt += `Vector Group: ${c.vectorGroup} | Nominal Calculated Ratio: ${c.nominalRatio}\n`;
  txt += `Technician: ${c.techName} | Date: ${c.testDate}\n`;
  txt += `Allowed Deviation Limit: ±${c.allowedErrorLimit}%\n`;
  txt += `Turns Ratio Evaluation Status: ${c.overallAssessment}\n`;
  txt += `=====================================\n\n`;

  txt += `Testing Integrity Metrics:\n`;
  txt += `- Maximum Measured Winding Deviation: ${c.maxDeviation}\n`;
  txt += `- Total Out-of-Tolerance Phases: ${c.failedCircuitsCount} items\n\n`;

  txt += `turns Ratio phase Details:\n`;
  c.measurements.forEach(m => {
    txt += `- [${m.status}] Tap: ${m.tap} | Phase: ${m.phase} | Expected: ${m.expected} | Measured: ${m.measured} (Dev: ${m.deviation})`;
    if (m.notes) txt += ` [Obs: ${m.notes}]`;
    txt += `\n`;
  });

  navigator.clipboard.writeText(txt).then(() => {
    alert("Transformer turns ratio diagnostic summary copied to clipboard!");
  }).catch(() => {
    alert("Failed to copy summary.");
  });
}

function exportCSV() {
  const c = collectData();
  const rows = [];
  rows.push(["TRANSFORMER TURNS RATIO TEST RECORD"]);
  rows.push(["Site Name", c.siteName]);
  rows.push(["Transformer ID", c.txId]);
  rows.push(["Vector Group", c.vectorGroup]);
  rows.push(["Nominal Ratio", c.nominalRatio]);
  rows.push(["Allowed Error Limit (%)", c.allowedErrorLimit]);
  rows.push(["Technician", c.techName]);
  rows.push(["Date", c.testDate]);
  rows.push([]);
  rows.push(["Tap Position", "Phase", "Expected Ratio", "Measured Ratio", "Ratio Error (%)", "Evaluation", "Notes"]);

  c.measurements.forEach(m => {
    rows.push([
      m.tap,
      m.phase,
      m.expected,
      m.measured,
      m.deviation,
      m.status,
      m.notes
    ]);
  });

  const csvContent = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')) .join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ttr_testing_${c.txId.replace(/\s+/g, '_')}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function exportTTRJSON() {
  const data = collectData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ttr_testing_${(data.txId || 'export').replace(/\s+/g, '_')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
