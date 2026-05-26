/**
 * Level3Support — soiling-loss-estimator.js
 * Soiling Loss Estimator Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Set default datetime to now
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('measurement-datetime').value = `${year}-${month}-${day}T${hours}:${minutes}`;

  // Hook up event listeners
  document.getElementById('calculate-btn').addEventListener('click', calculateLoss);
  document.getElementById('reset-btn').addEventListener('click', resetCalculator);
  document.getElementById('copy-btn').addEventListener('click', copySummary);
  document.getElementById('export-btn').addEventListener('click', exportJSON);

  // Initialize units list
  updateUnits();
});

// Update units list based on measurement basis
function updateUnits() {
  const basis = document.getElementById('basis-select').value;
  const unitSelect = document.getElementById('unit-select');
  unitSelect.innerHTML = '';

  if (basis === 'power') {
    unitSelect.innerHTML = `
      <option value="kW">kW</option>
      <option value="MW">MW</option>
    `;
    document.getElementById('capacity-unit-label').textContent = 'MW';
  } else if (basis === 'current') {
    unitSelect.innerHTML = `
      <option value="A">A</option>
    `;
    document.getElementById('capacity-unit-label').textContent = 'A';
  } else if (basis === 'irradiance') {
    unitSelect.innerHTML = `
      <option value="W/m²">W/m²</option>
    `;
    document.getElementById('capacity-unit-label').textContent = 'W/m²';
  }
}

// Global calculation result storage for exports
let lastResult = null;

function calculateLoss() {
  const errorDiv = document.getElementById('validation-error');
  const warnDiv = document.getElementById('validation-warning');
  const resultPanel = document.getElementById('result-panel');

  errorDiv.style.display = 'none';
  warnDiv.style.display = 'none';
  resultPanel.style.display = 'none';

  // Read Inputs
  const projectName = document.getElementById('project-name').value.trim();
  const dateTime = document.getElementById('measurement-datetime').value;
  const basis = document.getElementById('basis-select').value;
  const unit = document.getElementById('unit-select').value;
  const cleanVal = parseFloat(document.getElementById('clean-value').value);
  const soiledVal = parseFloat(document.getElementById('soiled-value').value);
  const refLocation = document.getElementById('ref-location').value.trim();
  const soiledLocation = document.getElementById('soiled-location').value.trim();
  const irradiance = document.getElementById('ambient-irradiance').value ? parseFloat(document.getElementById('ambient-irradiance').value) : null;
  const temperature = document.getElementById('module-temp').value ? parseFloat(document.getElementById('module-temp').value) : null;
  const affectedCap = document.getElementById('affected-capacity').value ? parseFloat(document.getElementById('affected-capacity').value) : null;
  const notes = document.getElementById('tool-notes').value.trim();

  // Thresholds
  const thLow = parseFloat(document.getElementById('threshold-low').value) || 2.0;
  const thMod = parseFloat(document.getElementById('threshold-mod').value) || 5.0;
  const thHigh = parseFloat(document.getElementById('threshold-high').value) || 10.0;

  // Validation
  if (isNaN(cleanVal) || cleanVal <= 0) {
    showError('Clean / Reference Value must be greater than 0.');
    return;
  }
  if (isNaN(soiledVal) || soiledVal < 0) {
    showError('Soiled / Measured Value must be 0 or greater.');
    return;
  }
  if (thLow < 0 || thMod < thLow || thHigh < thMod) {
    showError('Invalid custom thresholds configured. Ensure: 0 <= Low <= Moderate <= High.');
    return;
  }

  // Warning check: soiled > clean reference
  if (soiledVal > cleanVal) {
    warnDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Measured soiled value is higher than reference. Verify measurement timing, irradiance, temperature, sensor cleanliness, or equipment mismatch.`;
    warnDiv.style.display = 'block';
  }

  // Formulas
  const soilingRatio = soiledVal / cleanVal;
  const soilingLossPercent = (1 - soilingRatio) * 100;

  // Status mapping
  let statusText = 'Low';
  let badgeClass = 'status-low';

  if (soilingLossPercent <= thLow) {
    statusText = 'Low';
    badgeClass = 'status-low';
  } else if (soilingLossPercent <= thMod) {
    statusText = 'Moderate';
    badgeClass = 'status-mod';
  } else if (soilingLossPercent <= thHigh) {
    statusText = 'High';
    badgeClass = 'status-high';
  } else {
    statusText = 'Severe';
    badgeClass = 'status-severe';
  }

  // Display Results
  document.getElementById('res-ratio').textContent = soilingRatio.toFixed(4);
  document.getElementById('res-loss').textContent = `${soilingLossPercent.toFixed(2)}%`;

  const badge = document.getElementById('soiling-status-badge');
  badge.textContent = statusText;
  badge.className = `status-badge-inline ${badgeClass}`;

  const capImpactRow = document.getElementById('res-affected-cap-row');
  if (affectedCap !== null && affectedCap > 0) {
    const impactVal = affectedCap * (soilingLossPercent / 100);
    document.getElementById('res-capacity-impact').textContent = `${impactVal.toFixed(3)} ${unit}`;
    capImpactRow.style.display = 'flex';
  } else {
    capImpactRow.style.display = 'none';
  }

  resultPanel.style.display = 'block';

  // Store result for copy/export
  lastResult = {
    projectName,
    dateTime,
    basis,
    unit,
    cleanVal,
    soiledVal,
    refLocation,
    soiledLocation,
    irradiance,
    temperature,
    affectedCap,
    notes,
    soilingRatio,
    soilingLossPercent,
    statusText
  };
}

function showError(msg) {
  const errorDiv = document.getElementById('validation-error');
  errorDiv.textContent = msg;
  errorDiv.style.display = 'block';
}

function resetCalculator() {
  document.getElementById('project-name').value = '';
  document.getElementById('clean-value').value = '';
  document.getElementById('soiled-value').value = '';
  document.getElementById('ref-location').value = '';
  document.getElementById('soiled-location').value = '';
  document.getElementById('ambient-irradiance').value = '';
  document.getElementById('module-temp').value = '';
  document.getElementById('affected-capacity').value = '';
  document.getElementById('tool-notes').value = '';

  document.getElementById('threshold-low').value = '2.0';
  document.getElementById('threshold-mod').value = '5.0';
  document.getElementById('threshold-high').value = '10.0';

  document.getElementById('validation-error').style.display = 'none';
  document.getElementById('validation-warning').style.display = 'none';
  document.getElementById('result-panel').style.display = 'none';
  lastResult = null;
}

function copySummary() {
  if (!lastResult) return;

  const summaryText = `[Level3Support Soiling Loss Estimator Summary]
Site / Project: ${lastResult.projectName || 'N/A'}
Date & Time: ${lastResult.dateTime}
Basis: ${lastResult.basis}
Clean Reference Value: ${lastResult.cleanVal} ${lastResult.unit} ${lastResult.refLocation ? '(' + lastResult.refLocation + ')' : ''}
Soiled Measured Value: ${lastResult.soiledVal} ${lastResult.unit} ${lastResult.soiledLocation ? '(' + lastResult.soiledLocation + ')' : ''}
----------------------------------------
Calculated Soiling Ratio: ${lastResult.soilingRatio.toFixed(4)}
Estimated Soiling Loss: ${lastResult.soilingLossPercent.toFixed(2)}%
Severity Status: ${lastResult.statusText.toUpperCase()}
${lastResult.affectedCap ? 'Affected Capacity Impact: ' + (lastResult.affectedCap * (lastResult.soilingLossPercent / 100)).toFixed(3) + ' ' + lastResult.unit : ''}
Notes: ${lastResult.notes || 'None'}`;

  navigator.clipboard.writeText(summaryText)
    .then(() => alert('Summary copied to clipboard!'))
    .catch(err => console.error('Failed to copy text', err));
}

function exportJSON() {
  if (!lastResult) return;

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(lastResult, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `soiling_loss_estimator_${lastResult.projectName || 'export'}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
