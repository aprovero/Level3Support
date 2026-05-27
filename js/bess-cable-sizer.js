/**
 * Level3Support — bess-cable-sizer.js
 * © 2026 Level3Support
 */

document.addEventListener("DOMContentLoaded", () => {
  const systemType = document.getElementById("system-type");
  const pfWrapper = document.getElementById("pf-wrapper");

  // Dynamic PF field display
  systemType.addEventListener("change", () => {
    if (systemType.value.includes("AC")) {
      pfWrapper.style.display = "block";
    } else {
      pfWrapper.style.display = "none";
    }
  });

  const sampleBtn = document.getElementById("sample-btn");
  const calculateBtn = document.getElementById("calculate-btn");
  const resetBtn = document.getElementById("reset-btn");
  const copyBtn = document.getElementById("copy-btn");
  const exportBtn = document.getElementById("export-btn");

  sampleBtn.addEventListener("click", loadSampleValues);
  calculateBtn.addEventListener("click", calculateCableSizing);
  resetBtn.addEventListener("click", resetSizer);
  copyBtn.addEventListener("click", copySizerSummary);
  exportBtn.addEventListener("click", exportSizerJSON);
});

function loadSampleValues() {
  document.getElementById("project-name").value = "Red Mesa BESS Phase 2";
  document.getElementById("circuit-name").value = "Rack A-1 Power DC Feeders";
  document.getElementById("circuit-type").value = "BESS DC battery circuit";
  document.getElementById("system-type").value = "DC";
  document.getElementById("pf-wrapper").style.display = "none";
  document.getElementById("system-voltage").value = "1500";
  document.getElementById("load-current").value = "360";
  document.getElementById("continuous-load").value = "Yes";
  document.getElementById("continuous-factor").value = "1.25";
  document.getElementById("cable-size").value = "2x 4/0 AWG Cu";
  document.getElementById("cable-material").value = "Copper";
  document.getElementById("base-ampacity").value = "520";
  document.getElementById("derating-temp").value = "0.91";
  document.getElementById("derating-group").value = "0.80";
  document.getElementById("derating-add").value = "1.00";
  document.getElementById("cable-length").value = "85";
  document.getElementById("length-unit").value = "m";
  document.getElementById("cable-resistance").value = "0.162";
  document.getElementById("resistance-unit").value = "ohm/km";
  document.getElementById("allowed-vd").value = "1.50";
  document.getElementById("sizing-notes").value = "Routed in outdoor cable tray, ambient 40C adjustment factor applied.";

  hideResultsAndErrors();
}

function hideResultsAndErrors() {
  document.getElementById("validation-error").style.display = "none";
  document.getElementById("result-panel").style.display = "none";
}

function resetSizer() {
  document.getElementById("project-name").value = "";
  document.getElementById("circuit-name").value = "";
  document.getElementById("circuit-type").value = "BESS DC battery circuit";
  document.getElementById("system-type").value = "DC";
  document.getElementById("pf-wrapper").style.display = "none";
  document.getElementById("system-voltage").value = "";
  document.getElementById("load-current").value = "";
  document.getElementById("power-factor").value = "0.90";
  document.getElementById("continuous-load").value = "Yes";
  document.getElementById("continuous-factor").value = "1.25";
  document.getElementById("cable-size").value = "";
  document.getElementById("cable-material").value = "Copper";
  document.getElementById("base-ampacity").value = "";
  document.getElementById("derating-temp").value = "1.00";
  document.getElementById("derating-group").value = "1.00";
  document.getElementById("derating-add").value = "1.00";
  document.getElementById("cable-length").value = "";
  document.getElementById("length-unit").value = "m";
  document.getElementById("cable-resistance").value = "";
  document.getElementById("resistance-unit").value = "ohm/km";
  document.getElementById("allowed-vd").value = "1.50";
  document.getElementById("sizing-notes").value = "";

  hideResultsAndErrors();
}

function calculateCableSizing() {
  hideResultsAndErrors();
  const errorDiv = document.getElementById("validation-error");

  const vNom = parseFloat(document.getElementById("system-voltage").value);
  const iLoad = parseFloat(document.getElementById("load-current").value);
  const sysType = document.getElementById("system-type").value;
  const pf = parseFloat(document.getElementById("power-factor").value);
  const contFactor = parseFloat(document.getElementById("continuous-factor").value);
  const cSize = document.getElementById("cable-size").value.trim();
  const baseAmp = parseFloat(document.getElementById("base-ampacity").value);

  const kTemp = parseFloat(document.getElementById("derating-temp").value);
  const kGroup = parseFloat(document.getElementById("derating-group").value);
  const kAdd = parseFloat(document.getElementById("derating-add").value);

  const len = parseFloat(document.getElementById("cable-length").value);
  const lenUnit = document.getElementById("length-unit").value;
  const res = parseFloat(document.getElementById("cable-resistance").value);
  const resUnit = document.getElementById("resistance-unit").value;
  const allowedVdPct = parseFloat(document.getElementById("allowed-vd").value);

  // Validations
  if (isNaN(vNom) || isNaN(iLoad) || isNaN(contFactor) || isNaN(baseAmp) || isNaN(kTemp) || isNaN(kGroup) || isNaN(kAdd) || isNaN(len) || isNaN(res) || isNaN(allowedVdPct) || !cSize) {
    showError("Please fill out all required fields with valid values.");
    return;
  }

  if (vNom <= 0 || iLoad <= 0 || contFactor <= 0 || baseAmp <= 0 || len <= 0 || res <= 0 || allowedVdPct <= 0) {
    showError("Voltages, current, resistance, length, and limits must be positive values.");
    return;
  }

  if (kTemp <= 0 || kGroup <= 0 || kAdd <= 0) {
    showError("Derating factors must be positive values greater than zero.");
    return;
  }

  let warnings = [];
  if (kTemp === 1.0 && kGroup === 1.0 && kAdd === 1.0) {
    warnings.push("All derating factors are set to 1.00. Ensure ambient operating conditions and cable grouping layouts do not require derating.");
  }

  // Sizing Calculations
  const isContinuous = document.getElementById("continuous-load").value === "Yes";
  const requiredCurrent = isContinuous ? (iLoad * contFactor) : iLoad;
  const correctedAmpacity = baseAmp * kTemp * kGroup * kAdd;
  const ampacityMargin = correctedAmpacity - requiredCurrent;

  // Resistance normalization to Ohm / meter
  // Options: ohm/km, ohm/m, ohm/1000ft, ohm/ft
  let rNormal = res; // baseline in ohm/m
  if (resUnit === "ohm/km") {
    rNormal = res / 1000.0;
  } else if (resUnit === "ohm/1000ft") {
    rNormal = (res / 1000.0) / 0.3048; // convert ft to meter
  } else if (resUnit === "ohm/ft") {
    rNormal = res / 0.3048;
  }

  // Length normalization to meters
  let lenMeters = len;
  if (lenUnit === "ft") {
    lenMeters = len * 0.3048;
  }

  const rTotalOneWay = rNormal * lenMeters;

  // Voltage drop calculations
  let vdVolts = 0;
  let powerLossW = 0;

  if (sysType === "DC" || sysType === "Single-phase AC") {
    // 2-wire return path
    vdVolts = 2 * iLoad * rTotalOneWay;
    powerLossW = 2 * (iLoad * iLoad) * rTotalOneWay;
  } else if (sysType === "Three-phase AC") {
    // 3-phase line drop
    const activePf = isNaN(pf) ? 1.0 : pf;
    vdVolts = Math.sqrt(3) * iLoad * rTotalOneWay * activePf;
    // P_loss = 3 * I^2 * R
    powerLossW = 3 * (iLoad * iLoad) * rTotalOneWay;
  }

  const vdPct = (vdVolts / vNom) * 100;

  // Status checks
  const ampacityPass = correctedAmpacity >= requiredCurrent;
  const vdPass = vdPct <= allowedVdPct;

  let overallStatus = "Acceptable based on provided inputs";
  let badgeClass = "status-pass";

  if (!ampacityPass || !vdPass) {
    overallStatus = "Not acceptable";
    badgeClass = "status-fail";
  } else if (ampacityMargin < 20 || vdPct > (allowedVdPct * 0.85)) {
    overallStatus = "Review";
    badgeClass = "status-warn";
  }

  // Render outputs
  document.getElementById("res-required-current").textContent = `${requiredCurrent.toFixed(1)} A`;
  document.getElementById("res-corrected-ampacity").textContent = `${correctedAmpacity.toFixed(1)} A`;
  document.getElementById("res-ampacity-margin").textContent = `${ampacityMargin.toFixed(1)} A`;
  
  const ampCheck = document.getElementById("res-ampacity-check");
  if (ampacityPass) {
    ampCheck.textContent = "PASS";
    ampCheck.style.color = "var(--success-color)";
  } else {
    ampCheck.textContent = `FAIL (Under-capacity by ${Math.abs(ampacityMargin).toFixed(1)} A)`;
    ampCheck.style.color = "var(--error-color)";
  }

  document.getElementById("res-voltage-drop-v").textContent = `${vdVolts.toFixed(2)} V`;
  document.getElementById("res-voltage-drop-pct").textContent = `${vdPct.toFixed(2)}%`;

  const vdCheck = document.getElementById("res-vd-check");
  if (vdPass) {
    vdCheck.textContent = `PASS (Allowed: ${allowedVdPct.toFixed(2)}%)`;
    vdCheck.style.color = "var(--success-color)";
  } else {
    vdCheck.textContent = `FAIL (Exceeds limit by ${(vdPct - allowedVdPct).toFixed(2)}%)`;
    vdCheck.style.color = "var(--error-color)";
  }

  document.getElementById("res-power-loss").textContent = powerLossW >= 1000 ? `${(powerLossW / 1000.0).toFixed(2)} kW` : `${powerLossW.toFixed(0)} W`;

  const statusBadge = document.getElementById("overall-status-badge");
  statusBadge.textContent = overallStatus;
  statusBadge.className = `status-badge-inline ${badgeClass}`;

  if (warnings.length > 0) {
    errorDiv.innerHTML = warnings.map(w => `<div style="margin-bottom:4px;"><i class="fas fa-exclamation-triangle"></i> ${w}</div>`).join("");
    errorDiv.style.color = "var(--warning-color)";
    errorDiv.style.display = "block";
  }

  document.getElementById("result-panel").style.display = "block";
}

function showError(msg) {
  const errorDiv = document.getElementById("validation-error");
  errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${msg}`;
  errorDiv.style.color = "var(--error-color)";
  errorDiv.style.display = "block";
}

function collectData() {
  return {
    projectName: document.getElementById("project-name").value,
    circuitName: document.getElementById("circuit-name").value,
    circuitType: document.getElementById("circuit-type").value,
    systemType: document.getElementById("system-type").value,
    systemVoltage: parseFloat(document.getElementById("system-voltage").value),
    loadCurrent: parseFloat(document.getElementById("load-current").value),
    requiredCurrent: parseFloat(document.getElementById("res-required-current").textContent),
    cableSize: document.getElementById("cable-size").value,
    baseAmpacity: parseFloat(document.getElementById("base-ampacity").value),
    correctedAmpacity: parseFloat(document.getElementById("res-corrected-ampacity").textContent),
    vdPercentage: parseFloat(document.getElementById("res-voltage-drop-pct").textContent),
    vdVolts: parseFloat(document.getElementById("res-voltage-drop-v").textContent),
    powerLoss: document.getElementById("res-power-loss").textContent,
    assessment: document.getElementById("overall-status-badge").textContent,
    notes: document.getElementById("sizing-notes").value
  };
}

function copySizerSummary() {
  const d = collectData();
  let txt = `BESS CABLE SIZING FIELD ASSESSMENT SUMMARY\n`;
  txt += `=====================================\n`;
  if (d.projectName) txt += `Project Name: ${d.projectName}\n`;
  txt += `Circuit: ${d.circuitName} (${d.circuitType})\n`;
  txt += `Proposed Conductor: ${d.cableSize}\n`;
  txt += `Verification Assessment: ${d.assessment.toUpperCase()}\n`;
  txt += `=====================================\n\n`;

  txt += `Ampacity Verification:\n`;
  txt += `- Required Sizing Current: ${d.requiredCurrent} A\n`;
  txt += `- Temperature & Bundling Corrected Ampacity: ${d.correctedAmpacity} A (Base: ${d.baseAmpacity} A)\n`;
  txt += `- Ampacity Limit: ${d.correctedAmpacity >= d.requiredCurrent ? 'PASS' : 'FAIL'}\n\n`;

  txt += `Voltage Drop & Power Loss:\n`;
  txt += `- Operating Voltage Drop: ${d.vdVolts} V (${d.vdPercentage}% at nominal ${d.systemVoltage}V)\n`;
  txt += `- Cable Power Loss: ${d.powerLoss}\n`;
  
  if (d.notes) {
    txt += `\nNotes: ${d.notes}\n`;
  }

  navigator.clipboard.writeText(txt).then(() => {
    alert("Cable sizing assessment summary copied to clipboard!");
  }).catch(() => {
    alert("Failed to copy summary.");
  });
}

function exportSizerJSON() {
  const data = collectData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bess_cable_sizing_${(data.circuitName || 'export').replace(/\s+/g, '_')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
