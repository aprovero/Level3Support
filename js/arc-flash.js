/**
 * Level3Support — arc-flash.js
 * © 2026 Level3Support
 */

document.addEventListener("DOMContentLoaded", () => {
  const sampleBtn = document.getElementById("sample-btn");
  const calculateBtn = document.getElementById("calculate-btn");
  const resetBtn = document.getElementById("reset-btn");
  const copyBtn = document.getElementById("copy-btn");
  const exportBtn = document.getElementById("export-btn");

  sampleBtn.addEventListener("click", loadSampleValues);
  calculateBtn.addEventListener("click", buildReferenceCard);
  resetBtn.addEventListener("click", resetHelper);
  copyBtn.addEventListener("click", copySafetySummary);
  exportBtn.addEventListener("click", exportSafetyJSON);

  // Set default label date
  document.getElementById("label-date").value = new Date().toISOString().split('T')[0];
});

function loadSampleValues() {
  document.getElementById("site-name").value = "Desert Sunrise Substation";
  document.getElementById("eq-id").value = "SWG-B1 (MV Incomer Switchgear)";
  document.getElementById("eq-type").value = "Switchgear";
  document.getElementById("nominal-voltage").value = "4160";
  document.getElementById("fault-current").value = "18.5";
  document.getElementById("clearing-time").value = "0.15";
  document.getElementById("incident-energy").value = "12.4";
  document.getElementById("arc-boundary").value = "2.4";
  document.getElementById("boundary-unit").value = "m";
  document.getElementById("limited-boundary").value = "1.5";
  document.getElementById("restricted-boundary").value = "0.7";
  document.getElementById("ppe-category").value = "Category 3 (>= 8 and < 25 cal/cm²)";
  document.getElementById("permit-required").value = "Yes";
  document.getElementById("worker-task").value = "MV Protection Relay testing & racking in breaker";
  document.getElementById("study-rev").value = "Arc-Study-2026-R3";
  document.getElementById("label-date").value = "2026-03-12";
  document.getElementById("safety-notes").value = "Standby safety observer required. Flame-resistant hood and full arc flash clothing suit (min 25 cal/cm2) required.";

  hideResultsAndErrors();
}

function hideResultsAndErrors() {
  document.getElementById("validation-error").style.display = "none";
  document.getElementById("result-panel").style.display = "none";
}

function resetHelper() {
  document.getElementById("site-name").value = "";
  document.getElementById("eq-id").value = "";
  document.getElementById("eq-type").value = "Switchgear";
  document.getElementById("nominal-voltage").value = "";
  document.getElementById("fault-current").value = "";
  document.getElementById("clearing-time").value = "";
  document.getElementById("incident-energy").value = "";
  document.getElementById("arc-boundary").value = "";
  document.getElementById("boundary-unit").value = "m";
  document.getElementById("limited-boundary").value = "";
  document.getElementById("restricted-boundary").value = "";
  document.getElementById("ppe-category").value = "";
  document.getElementById("permit-required").value = "Yes";
  document.getElementById("worker-task").value = "";
  document.getElementById("study-rev").value = "";
  document.getElementById("label-date").value = "";
  document.getElementById("safety-notes").value = "";

  hideResultsAndErrors();
}

function buildReferenceCard() {
  hideResultsAndErrors();
  const errorDiv = document.getElementById("validation-error");

  const eqId = document.getElementById("eq-id").value.trim();
  const voltage = parseFloat(document.getElementById("nominal-voltage").value);
  const energy = parseFloat(document.getElementById("incident-energy").value);
  const boundary = parseFloat(document.getElementById("arc-boundary").value);
  const boundaryUnit = document.getElementById("boundary-unit").value;
  const ppe = document.getElementById("ppe-category").value;

  const limited = parseFloat(document.getElementById("limited-boundary").value) || null;
  const restricted = parseFloat(document.getElementById("restricted-boundary").value) || null;

  const labelDate = document.getElementById("label-date").value;
  const studyRev = document.getElementById("study-rev").value.trim();

  // Validations
  if (!eqId || isNaN(voltage) || isNaN(energy) || isNaN(boundary) || !ppe) {
    showError("Please fill out all required fields with valid values.");
    return;
  }

  if (voltage <= 0 || energy < 0 || boundary <= 0) {
    showError("Voltage, boundary and energy must be positive numbers.");
    return;
  }

  let warnings = [];

  if (!labelDate || !studyRev) {
    warnings.push("Label print date or study revision is missing. Ensure you are referencing an active, certified arc flash study log.");
  }

  if (energy >= 40.0) {
    warnings.push("DANGEROUS ENERGIZED WORK IS PROHIBITED. Incident energy is >= 40 cal/cm². Work must only be conducted on isolated, locked out (LOTO) equipment.");
  }

  // Construct Shock Boundaries summary
  let approachText = "Not defined";
  if (limited !== null && restricted !== null) {
    approachText = `Limited: ${limited}m | Restricted: ${restricted}m`;
  } else if (limited !== null) {
    approachText = `Limited: ${limited}m`;
  }

  // Determine placard styling based on energy level
  const placard = document.querySelector(".ppe-placard");
  const ppeHeader = document.getElementById("res-ppe-header");

  if (energy >= 40.0) {
    placard.style.borderColor = "#ef4444";
    ppeHeader.style.background = "#ef4444";
    ppeHeader.textContent = "DANGEROUS - NO ENERGIZED WORK";
  } else if (energy >= 25.0) {
    placard.style.borderColor = "#f97316";
    ppeHeader.style.background = "#f97316";
    ppeHeader.textContent = "Category 4 Minimum (Hood Req)";
  } else if (energy >= 8.0) {
    placard.style.borderColor = "#f59e0b";
    ppeHeader.style.background = "#f59e0b";
    ppeHeader.textContent = "Category 3 Minimum";
  } else if (energy >= 4.0) {
    placard.style.borderColor = "#3b82f6";
    ppeHeader.style.background = "#3b82f6";
    ppeHeader.textContent = "Category 2 Minimum";
  } else {
    placard.style.borderColor = "#10b981";
    ppeHeader.style.background = "#10b981";
    ppeHeader.textContent = "Category 1 Minimum";
  }

  // Render results
  document.getElementById("res-eq").textContent = eqId;
  document.getElementById("res-voltage").textContent = `${voltage} V AC/DC`;
  document.getElementById("res-boundary").textContent = `${boundary} ${boundaryUnit}`;
  document.getElementById("res-energy").textContent = `${energy.toFixed(1)} cal/cm²`;
  document.getElementById("res-approach").textContent = approachText;
  
  const permit = document.getElementById("permit-required").value;
  const resPermit = document.getElementById("res-permit");
  resPermit.textContent = permit;
  if (permit === "Yes") {
    resPermit.style.color = "var(--error-color)";
  } else {
    resPermit.style.color = "var(--success-color)";
  }

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
    siteName: document.getElementById("site-name").value,
    equipmentId: document.getElementById("eq-id").value,
    equipmentType: document.getElementById("eq-type").value,
    voltage: parseFloat(document.getElementById("nominal-voltage").value),
    faultCurrentKa: parseFloat(document.getElementById("fault-current").value) || null,
    clearingTimeSec: parseFloat(document.getElementById("clearing-time").value) || null,
    incidentEnergy: parseFloat(document.getElementById("incident-energy").value),
    arcBoundary: parseFloat(document.getElementById("arc-boundary").value),
    boundaryUnit: document.getElementById("boundary-unit").value,
    limitedApproach: parseFloat(document.getElementById("limited-boundary").value) || null,
    restrictedApproach: parseFloat(document.getElementById("restricted-boundary").value) || null,
    ppeCategory: document.getElementById("ppe-category").value,
    permitRequired: document.getElementById("permit-required").value,
    workerTask: document.getElementById("worker-task").value,
    studyRevision: document.getElementById("study-rev").value,
    labelDate: document.getElementById("label-date").value,
    notes: document.getElementById("safety-notes").value
  };
}

function copySafetySummary() {
  const c = collectData();
  let txt = `ARC FLASH PROTECTION SAFETY REFERENCE CARD\n`;
  txt += `=====================================\n`;
  txt += `Site: ${c.siteName} | Target Equipment: ${c.equipmentId} (${c.equipmentType})\n`;
  txt += `Nominal Voltage: ${c.voltage} V AC/DC | Task: ${c.workerTask}\n`;
  txt += `Reference Study: ${c.studyRevision} | Label Date: ${c.labelDate}\n`;
  txt += `=====================================\n\n`;

  txt += `Arc Flash & Safety Parameters:\n`;
  txt += `- Incident Energy: ${c.incidentEnergy} cal/cm²\n`;
  txt += `- ARC FLASH BOUNDARY (SAFETY LIMIT): ${c.arcBoundary} ${c.boundaryUnit}\n`;
  txt += `- Required PPE standard: ${c.ppeCategory}\n`;
  txt += `- Energized Work Permit Required: ${c.permitRequired}\n`;
  
  if (c.limitedApproach !== null) {
    txt += `- Shock Approach Boundaries: Limited: ${c.limitedApproach}m`;
    if (c.restrictedApproach !== null) txt += ` | Restricted: ${c.restrictedApproach}m`;
    txt += `\n`;
  }

  if (c.notes) {
    txt += `\nSafety Instructions: ${c.notes}\n`;
  }

  navigator.clipboard.writeText(txt).then(() => {
    alert("Safety documentation reference summary copied to clipboard!");
  }).catch(() => {
    alert("Failed to copy summary.");
  });
}

function exportSafetyJSON() {
  const data = collectData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `arc_flash_safety_${(data.equipmentId || 'export').replace(/\s+/g, '_')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
