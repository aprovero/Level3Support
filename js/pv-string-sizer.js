/**
 * Level3Support — pv-string-sizer.js
 * © 2026 Level3Support
 */

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const sampleBtn = document.getElementById("sample-btn");
  const calculateBtn = document.getElementById("calculate-btn");
  const resetBtn = document.getElementById("reset-btn");
  const copyBtn = document.getElementById("copy-btn");
  const exportBtn = document.getElementById("export-btn");

  const validationError = document.getElementById("validation-error");
  const resultPanel = document.getElementById("result-panel");

  // Event Listeners
  sampleBtn.addEventListener("click", loadSampleValues);
  calculateBtn.addEventListener("click", calculateSizing);
  resetBtn.addEventListener("click", resetSizer);
  copyBtn.addEventListener("click", copySizerSummary);
  exportBtn.addEventListener("click", exportSizerJSON);
});

// Prepopulated sample values representing generic 550W high-power commercial modules
function loadSampleValues() {
  document.getElementById("project-name").value = "Red Mesa Solar Pad 4";
  document.getElementById("module-model").value = "Apex 550W Bifacial";
  document.getElementById("module-voc").value = "49.6";
  document.getElementById("module-vmp").value = "41.8";
  document.getElementById("module-isc").value = "13.9";
  document.getElementById("module-imp").value = "13.15";
  document.getElementById("voc-coeff").value = "-0.26";
  document.getElementById("vmp-coeff").value = "-0.34";
  document.getElementById("temp-min").value = "-10";
  document.getElementById("temp-max").value = "70";
  document.getElementById("inv-vmax").value = "1500";
  document.getElementById("inv-mppt-min").value = "600";
  document.getElementById("inv-mppt-max").value = "1420";
  document.getElementById("series-modules").value = "26";

  hideResultsAndErrors();
}

function hideResultsAndErrors() {
  document.getElementById("validation-error").style.display = "none";
  document.getElementById("result-panel").style.display = "none";
}

function resetSizer() {
  document.getElementById("project-name").value = "";
  document.getElementById("module-model").value = "";
  document.getElementById("module-voc").value = "";
  document.getElementById("module-vmp").value = "";
  document.getElementById("module-isc").value = "";
  document.getElementById("module-imp").value = "";
  document.getElementById("voc-coeff").value = "";
  document.getElementById("vmp-coeff").value = "";
  document.getElementById("temp-min").value = "";
  document.getElementById("temp-max").value = "";
  document.getElementById("inv-vmax").value = "";
  document.getElementById("inv-mppt-min").value = "";
  document.getElementById("inv-mppt-max").value = "";
  document.getElementById("series-modules").value = "";
  document.getElementById("sizing-notes").value = "";

  hideResultsAndErrors();
}

function calculateSizing() {
  hideResultsAndErrors();
  const errorDiv = document.getElementById("validation-error");

  // Read Inputs
  const voc = parseFloat(document.getElementById("module-voc").value);
  const vmp = parseFloat(document.getElementById("module-vmp").value);
  const isc = parseFloat(document.getElementById("module-isc").value) || null;
  const imp = parseFloat(document.getElementById("module-imp").value) || null;
  
  let vocCoeff = parseFloat(document.getElementById("voc-coeff").value);
  let vmpCoeff = parseFloat(document.getElementById("vmp-coeff").value);
  
  const tempMin = parseFloat(document.getElementById("temp-min").value);
  const tempMax = parseFloat(document.getElementById("temp-max").value);
  
  const invVmax = parseFloat(document.getElementById("inv-vmax").value);
  const invMpptMin = parseFloat(document.getElementById("inv-mppt-min").value);
  const invMpptMax = parseFloat(document.getElementById("inv-mppt-max").value);
  
  const proposedModules = parseInt(document.getElementById("series-modules").value, 10);

  // Validations
  let warnings = [];

  if (isNaN(voc) || isNaN(vmp) || isNaN(vocCoeff) || isNaN(vmpCoeff) || isNaN(tempMin) || isNaN(tempMax) || isNaN(invVmax) || isNaN(invMpptMin) || isNaN(invMpptMax) || isNaN(proposedModules)) {
    showError("Please fill out all required fields with numeric values.");
    return;
  }

  if (voc <= 0 || vmp <= 0 || invVmax <= 0 || invMpptMin <= 0 || invMpptMax <= 0 || proposedModules <= 0) {
    showError("Voltages, proposed module count, and limits must be positive non-zero values.");
    return;
  }

  // Suspicious decimal temperature coefficient check
  if (Math.abs(vocCoeff) < 0.01 && vocCoeff !== 0) {
    warnings.push("Voc temperature coefficient is very small. Ensure it is entered as a percentage (e.g. -0.27) rather than a decimal (e.g. -0.0027).");
  }
  if (Math.abs(vmpCoeff) < 0.01 && vmpCoeff !== 0) {
    warnings.push("Vmp temperature coefficient is very small. Ensure it is entered as a percentage (e.g. -0.35) rather than a decimal (e.g. -0.0035).");
  }

  if (vmp > voc) {
    showError("Validation warning: Module Vmp cannot be greater than module Voc.");
    return;
  }

  if (tempMin > tempMax) {
    showError("Minimum temperature cannot be higher than maximum temperature.");
    return;
  }

  // Calculations
  // Temp coefficients are treated as %/°C, convert to decimals
  const vocCoeffDec = vocCoeff / 100.0;
  const vmpCoeffDec = vmpCoeff / 100.0;

  // Voc Cold (Minimum Temperature extreme)
  const adjustedVoc = voc * (1 + vocCoeffDec * (tempMin - 25));
  // Vmp Hot (Maximum Temperature extreme)
  const adjustedVmp = vmp * (1 + vmpCoeffDec * (tempMax - 25));

  const stringVoc = adjustedVoc * proposedModules;
  const stringVmp = adjustedVmp * proposedModules;

  // Maximum modules by cold Voc
  const maxModulesByVoc = Math.floor(invVmax / adjustedVoc);
  // Minimum modules by hot Vmp
  const minModulesByMppt = Math.ceil(invMpptMin / adjustedVmp);
  // Maximum modules by hot Vmp (reaching MPPT Max)
  const maxModulesByMppt = Math.floor(invMpptMax / adjustedVmp);

  // Status Evaluations
  let vmaxPass = stringVoc <= invVmax;
  let mpptPass = stringVmp >= invMpptMin && stringVmp <= invMpptMax;

  let overallStatus = "Acceptable";
  let badgeClass = "status-pass";

  if (!vmaxPass) {
    overallStatus = "Not acceptable";
    badgeClass = "status-fail";
  } else if (!mpptPass) {
    overallStatus = "Review";
    badgeClass = "status-warn";
  }

  // Render Outputs
  document.getElementById("res-module-voc-cold").textContent = `${adjustedVoc.toFixed(2)} V`;
  document.getElementById("res-module-vmp-hot").textContent = `${adjustedVmp.toFixed(2)} V`;
  document.getElementById("res-string-voc-cold").textContent = `${stringVoc.toFixed(2)} V`;
  document.getElementById("res-string-vmp-hot").textContent = `${stringVmp.toFixed(2)} V`;

  const limitVmaxCheck = document.getElementById("res-limit-vmax-check");
  if (vmaxPass) {
    limitVmaxCheck.textContent = `PASS (String Voc ${stringVoc.toFixed(1)}V <= Inverter Max ${invVmax}V)`;
    limitVmaxCheck.style.color = "var(--success-color)";
  } else {
    limitVmaxCheck.textContent = `FAIL (String Voc ${stringVoc.toFixed(1)}V exceeds Inverter Max ${invVmax}V by ${(stringVoc - invVmax).toFixed(1)}V!)`;
    limitVmaxCheck.style.color = "var(--error-color)";
  }

  const limitMpptCheck = document.getElementById("res-limit-mppt-check");
  if (stringVmp < invMpptMin) {
    limitMpptCheck.textContent = `UNDER MPPT (String Vmp ${stringVmp.toFixed(1)}V < Min MPPT ${invMpptMin}V)`;
    limitMpptCheck.style.color = "var(--error-color)";
  } else if (stringVmp > invMpptMax) {
    limitMpptCheck.textContent = `OVER MPPT (String Vmp ${stringVmp.toFixed(1)}V > Max MPPT ${invMpptMax}V)`;
    limitMpptCheck.style.color = "var(--error-color)";
  } else {
    limitMpptCheck.textContent = `PASS (String Vmp ${stringVmp.toFixed(1)}V is inside MPPT ${invMpptMin}V - ${invMpptMax}V)`;
    limitMpptCheck.style.color = "var(--success-color)";
  }

  document.getElementById("res-est-max-voc").textContent = `${maxModulesByVoc} modules`;
  document.getElementById("res-est-min-vmp").textContent = `${minModulesByMppt} modules`;
  document.getElementById("res-est-max-mppt").textContent = `${maxModulesByMppt} modules`;

  const statusBadge = document.getElementById("overall-status-badge");
  statusBadge.textContent = overallStatus;
  statusBadge.className = `status-badge-inline ${badgeClass}`;

  // If there are warnings, display them nicely inside the validation box
  if (warnings.length > 0) {
    errorDiv.innerHTML = warnings.map(w => `<div style="margin-bottom:4px;"><i class="fas fa-exclamation-triangle"></i> ${w}</div>`).join("");
    errorDiv.style.color = "var(--warning-color)";
    errorDiv.style.display = "block";
  }

  // Show panel
  resultPanel.style.display = "block";
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
    moduleModel: document.getElementById("module-model").value,
    stcVoc: parseFloat(document.getElementById("module-voc").value),
    stcVmp: parseFloat(document.getElementById("module-vmp").value),
    coeffVoc: parseFloat(document.getElementById("voc-coeff").value),
    coeffVmp: parseFloat(document.getElementById("vmp-coeff").value),
    tempMin: parseFloat(document.getElementById("temp-min").value),
    tempMax: parseFloat(document.getElementById("temp-max").value),
    inverterMaxDC: parseFloat(document.getElementById("inv-vmax").value),
    inverterMinMppt: parseFloat(document.getElementById("inv-mppt-min").value),
    inverterMaxMppt: parseFloat(document.getElementById("inv-mppt-max").value),
    proposedModules: parseInt(document.getElementById("series-modules").value, 10),
    adjustedVoc: parseFloat(document.getElementById("res-module-voc-cold").textContent),
    adjustedVmp: parseFloat(document.getElementById("res-module-vmp-hot").textContent),
    stringVoc: parseFloat(document.getElementById("res-string-voc-cold").textContent),
    stringVmp: parseFloat(document.getElementById("res-string-vmp-hot").textContent),
    maxModulesByColdVoc: parseInt(document.getElementById("res-est-max-voc").textContent, 10),
    minModulesByHotVmp: parseInt(document.getElementById("res-est-min-vmp").textContent, 10),
    assessment: document.getElementById("overall-status-badge").textContent,
    notes: document.getElementById("sizing-notes").value
  };
}

function copySizerSummary() {
  const d = collectData();
  let txt = `PV STRING SIZING & VOC ASSESSMENT REPORT\n`;
  txt += `=====================================\n`;
  if (d.projectName) txt += `Project Name: ${d.projectName}\n`;
  if (d.moduleModel) txt += `PV Module Model: ${d.moduleModel}\n`;
  txt += `Proposed Modules in Series: ${d.proposedModules} panels\n`;
  txt += `Sizing Evaluation: ${d.assessment.toUpperCase()}\n`;
  txt += `=====================================\n\n`;

  txt += `Extreme Sizing Voltages:\n`;
  txt += `- Adjusted Module Voc (Cold ${d.tempMin}°C): ${d.adjustedVoc} V\n`;
  txt += `- Adjusted Module Vmp (Hot ${d.tempMax}°C): ${d.adjustedVmp} V\n`;
  txt += `- String Voc at Min Temp: ${d.stringVoc} V (Inverter Limit: ${d.inverterMaxDC} V)\n`;
  txt += `- String Vmp at Max Temp: ${d.stringVmp} V (Inverter Window: ${d.inverterMinMppt}V - ${d.inverterMaxMppt}V)\n\n`;

  txt += `Engineering Configuration Thresholds:\n`;
  txt += `- Maximum Modules per String (by cold Voc): ${d.maxModulesByColdVoc} panels\n`;
  txt += `- Minimum Modules per String (by hot Vmp): ${d.minModulesByHotVmp} panels\n`;
  
  if (d.notes) {
    txt += `\nNotes: ${d.notes}\n`;
  }

  navigator.clipboard.writeText(txt).then(() => {
    alert("String sizing assessment summary copied to clipboard!");
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
  a.download = `pv_string_sizing_${(data.projectName || 'export').replace(/\s+/g, '_')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
