/**
 * Level3Support — soiling-lost-energy.js
 * Lost Energy from Soiling Calculator Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Set default dates: first day of current month to today
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  document.getElementById('period-start').value = `${year}-${month}-01`;
  document.getElementById('period-end').value = `${year}-${month}-${day}`;

  // Event Listeners
  document.getElementById('calculate-btn').addEventListener('click', calculateLoss);
  document.getElementById('reset-btn').addEventListener('click', resetCalculator);
  document.getElementById('copy-btn').addEventListener('click', copySummary);
  document.getElementById('export-btn').addEventListener('click', exportJSON);
});

let lastResult = null;

function calculateLoss() {
  const errorDiv = document.getElementById('validation-error');
  const resultPanel = document.getElementById('result-panel');

  errorDiv.style.display = 'none';
  resultPanel.style.display = 'none';

  // Read Inputs
  const projectName = document.getElementById('project-name').value.trim();
  const startStr = document.getElementById('period-start').value;
  const endStr = document.getElementById('period-end').value;
  const expectedGen = parseFloat(document.getElementById('expected-generation').value);
  const genUnit = document.getElementById('gen-unit').value;
  const affectedCapPct = parseFloat(document.getElementById('affected-capacity-pct').value);
  const soilingLossPct = parseFloat(document.getElementById('soiling-loss-pct').value);
  const energyPriceInput = document.getElementById('energy-price').value;
  const energyPrice = energyPriceInput ? parseFloat(energyPriceInput) : null;
  const currencySymbol = getCurrencySymbol(document.getElementById('currency').value);
  const estimateSource = document.getElementById('estimate-source').value;
  const notes = document.getElementById('tool-notes').value.trim();

  // Basic Validations
  if (!startStr || !endStr) {
    showError('Start and End dates are required.');
    return;
  }
  
  const startDate = new Date(startStr);
  const endDate = new Date(endStr);
  
  if (endDate < startDate) {
    showError('End date must be on or after the start date.');
    return;
  }

  if (isNaN(expectedGen) || expectedGen <= 0) {
    showError('Expected generation must be greater than 0.');
    return;
  }
  if (isNaN(affectedCapPct) || affectedCapPct < 0 || affectedCapPct > 100) {
    showError('Affected capacity must be between 0% and 100%.');
    return;
  }
  if (isNaN(soilingLossPct) || soilingLossPct < 0 || soilingLossPct > 100) {
    showError('Estimated soiling loss must be between 0% and 100%.');
    return;
  }
  if (energyPrice !== null && (isNaN(energyPrice) || energyPrice < 0)) {
    showError('Energy price cannot be negative.');
    return;
  }

  // Duration in days
  const durationMs = endDate - startDate;
  const durationDays = Math.round(durationMs / (1000 * 60 * 60 * 24)) + 1;

  // Formulas
  const affectedExpectedGen = expectedGen * (affectedCapPct / 100);
  const lostEnergy = affectedExpectedGen * (soilingLossPct / 100);
  const deliveredEnergy = expectedGen - lostEnergy; // Total remaining delivered from expected baseline

  let lostRevenue = null;
  if (energyPrice !== null) {
    lostRevenue = lostEnergy * energyPrice;
  }

  // Render Display
  document.getElementById('res-duration').textContent = `${durationDays} Days (${startStr} to ${endStr})`;
  document.getElementById('res-affected-gen').textContent = `${affectedExpectedGen.toFixed(2)} ${genUnit}`;
  document.getElementById('res-lost-energy').textContent = `${lostEnergy.toFixed(2)} ${genUnit}`;
  document.getElementById('res-delivered-energy').textContent = `${deliveredEnergy.toFixed(2)} ${genUnit}`;

  const revenueRow = document.getElementById('res-lost-revenue-row');
  if (lostRevenue !== null) {
    document.getElementById('res-lost-revenue').textContent = `${currencySymbol}${lostRevenue.toFixed(2)}`;
    revenueRow.style.display = 'flex';
  } else {
    revenueRow.style.display = 'none';
  }

  // Format professional summary
  const summaryText = `Based on the provided expected generation of ${expectedGen.toFixed(1)} ${genUnit} and estimated soiling loss of ${soilingLossPct.toFixed(2)}%, the affected area may have lost approximately ${lostEnergy.toFixed(2)} ${genUnit} during the selected period of ${durationDays} days. This estimate is based on observations/data from ${estimateSource} with a baseline affected capacity of ${affectedCapPct}%.`;
  document.getElementById('res-summary-text').textContent = summaryText;

  resultPanel.style.display = 'block';

  // Store data
  lastResult = {
    projectName,
    reportingPeriod: { start: startStr, end: endStr, durationDays },
    expectedGen,
    genUnit,
    affectedCapPct,
    soilingLossPct,
    energyPrice,
    currencySymbol,
    estimateSource,
    notes,
    affectedExpectedGen,
    lostEnergy,
    deliveredEnergy,
    lostRevenue,
    summaryText
  };
}

function getCurrencySymbol(curr) {
  switch (curr) {
    case 'USD': return '$';
    case 'MXN': return 'Mex$';
    case 'EUR': return '€';
    case 'BRL': return 'R$';
    case 'CLP': return 'CLP$';
    case 'COP': return 'COP$';
    default: return '';
  }
}

function showError(msg) {
  const errorDiv = document.getElementById('validation-error');
  errorDiv.textContent = msg;
  errorDiv.style.display = 'block';
}

function resetCalculator() {
  document.getElementById('project-name').value = '';
  document.getElementById('expected-generation').value = '';
  document.getElementById('affected-capacity-pct').value = '100';
  document.getElementById('soiling-loss-pct').value = '';
  document.getElementById('energy-price').value = '';
  document.getElementById('tool-notes').value = '';

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  document.getElementById('period-start').value = `${year}-${month}-01`;
  document.getElementById('period-end').value = `${year}-${month}-${day}`;

  document.getElementById('validation-error').style.display = 'none';
  document.getElementById('result-panel').style.display = 'none';
  lastResult = null;
}

function copySummary() {
  if (!lastResult) return;

  const summaryText = `[Level3Support Lost Energy from Soiling Summary]
Site / Project: ${lastResult.projectName || 'N/A'}
Reporting Period: ${lastResult.reportingPeriod.start} to ${lastResult.reportingPeriod.end} (${lastResult.reportingPeriod.durationDays} Days)
Estimate Source: ${lastResult.estimateSource}
----------------------------------------
Expected Gen Over Period: ${lastResult.expectedGen} ${lastResult.genUnit}
Affected Capacity Area: ${lastResult.affectedCapPct}%
Estimated Soiling Loss: ${lastResult.soilingLossPct}%
----------------------------------------
Estimated Lost Energy: ${lastResult.lostEnergy.toFixed(2)} ${lastResult.genUnit}
Remaining Delivered Energy: ${lastResult.deliveredEnergy.toFixed(2)} ${lastResult.genUnit}
${lastResult.lostRevenue !== null ? 'Estimated Revenue Loss: ' + lastResult.currencySymbol + lastResult.lostRevenue.toFixed(2) : ''}
----------------------------------------
Factual Statement:
${lastResult.summaryText}
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
  downloadAnchor.setAttribute("download", `soiling_lost_energy_${lastResult.projectName || 'export'}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
