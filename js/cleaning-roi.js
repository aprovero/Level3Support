/**
 * Level3Support — cleaning-roi.js
 * Cleaning ROI Calculator Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Hook up buttons
  document.getElementById('calculate-btn').addEventListener('click', calculateROI);
  document.getElementById('reset-btn').addEventListener('click', resetCalculator);
  document.getElementById('copy-btn').addEventListener('click', copySummary);
  document.getElementById('export-btn').addEventListener('click', exportJSON);
});

let lastResult = null;

function calculateROI() {
  const errorDiv = document.getElementById('validation-error');
  const resultPanel = document.getElementById('result-panel');

  errorDiv.style.display = 'none';
  resultPanel.style.display = 'none';

  // Read Inputs
  const projectName = document.getElementById('project-name').value.trim();
  const plantCap = parseFloat(document.getElementById('plant-capacity').value);
  const capUnit = document.getElementById('capacity-unit').value;
  const affectedCapPct = parseFloat(document.getElementById('affected-capacity-pct').value);
  const soilingLossPct = parseFloat(document.getElementById('soiling-loss-pct').value);
  const dailyGen = parseFloat(document.getElementById('expected-daily-gen').value);
  const genUnit = document.getElementById('gen-unit').value;
  const energyPrice = parseFloat(document.getElementById('energy-price').value);
  const currencySymbol = getCurrencySymbol(document.getElementById('currency').value);
  const cleaningCost = parseFloat(document.getElementById('cleaning-cost').value);
  const expectedRecoveryPct = parseFloat(document.getElementById('expected-recovery-pct').value);
  const periodDays = parseFloat(document.getElementById('analysis-period-days').value);
  const rainReset = document.getElementById('rain-reset').value;
  const notes = document.getElementById('tool-notes').value.trim();

  // Validation
  if (isNaN(plantCap) || plantCap <= 0) {
    showError('Plant capacity must be greater than 0.');
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
  if (isNaN(dailyGen) || dailyGen < 0) {
    showError('Expected daily generation cannot be negative.');
    return;
  }
  if (isNaN(energyPrice) || energyPrice < 0) {
    showError('Energy price cannot be negative.');
    return;
  }
  if (isNaN(cleaningCost) || cleaningCost < 0) {
    showError('Cleaning campaign cost cannot be negative.');
    return;
  }
  if (isNaN(expectedRecoveryPct) || expectedRecoveryPct < 0 || expectedRecoveryPct > 100) {
    showError('Expected recovery must be between 0% and 100%.');
    return;
  }
  if (isNaN(periodDays) || periodDays <= 0) {
    showError('Evaluation period must be greater than 0 days.');
    return;
  }

  // Energy Loss units matching
  const targetGenUnit = genUnit.split('/')[0]; // e.g. MWh or kWh

  // Calculations
  const affectedDailyGen = dailyGen * (affectedCapPct / 100);
  const dailyLostEnergy = affectedDailyGen * (soilingLossPct / 100);
  const recoverableDailyEnergy = dailyLostEnergy * (expectedRecoveryPct / 100);
  const recoveredRevenue = recoverableDailyEnergy * energyPrice * periodDays;
  const netBenefit = recoveredRevenue - cleaningCost;

  let paybackDays = null;
  if (recoverableDailyEnergy > 0 && energyPrice > 0) {
    paybackDays = cleaningCost / (recoverableDailyEnergy * energyPrice);
  }

  // Recommendations Logic
  let recText = 'Review Assumptions';
  let badgeClass = 'rec-review';

  if (paybackDays === null) {
    recText = 'Review Assumptions';
    badgeClass = 'rec-review';
  } else if (netBenefit < 0) {
    recText = 'Wait / Not Justified';
    badgeClass = 'rec-wait';
  } else if (netBenefit > 0 && paybackDays < periodDays) {
    // Near zero O&M monitor threshold: net benefit is positive but less than 10% of campaign cost
    if (netBenefit < (cleaningCost * 0.10)) {
      recText = 'Monitor';
      badgeClass = 'rec-monitor';
    } else {
      recText = 'Clean Now';
      badgeClass = 'rec-clean';
    }
  } else {
    recText = 'Monitor';
    badgeClass = 'rec-monitor';
  }

  // Display results
  document.getElementById('res-affected-gen').textContent = `${affectedDailyGen.toFixed(2)} ${genUnit}`;
  document.getElementById('res-daily-lost-energy').textContent = `${dailyLostEnergy.toFixed(2)} ${targetGenUnit}/day`;
  document.getElementById('res-recoverable-energy').textContent = `${recoverableDailyEnergy.toFixed(2)} ${targetGenUnit}/day`;
  document.getElementById('res-cleaning-cost').textContent = `${currencySymbol}${cleaningCost.toFixed(2)}`;
  document.getElementById('res-recovered-revenue').textContent = `${currencySymbol}${recoveredRevenue.toFixed(2)}`;
  
  const netBenefitText = document.getElementById('res-net-benefit');
  netBenefitText.textContent = `${netBenefit >= 0 ? '+' : ''}${currencySymbol}${netBenefit.toFixed(2)}`;
  if (netBenefit >= 0) {
    netBenefitText.style.color = 'var(--success-color)';
  } else {
    netBenefitText.style.color = 'var(--error-color)';
  }

  document.getElementById('res-payback-days').textContent = paybackDays !== null ? `${paybackDays.toFixed(1)} Days` : 'Infinite';

  const badge = document.getElementById('roi-recommendation-badge');
  badge.textContent = recText;
  badge.className = `status-badge-inline ${badgeClass}`;

  resultPanel.style.display = 'block';

  // Store result
  lastResult = {
    projectName,
    plantCap,
    capUnit,
    affectedCapPct,
    soilingLossPct,
    dailyGen,
    genUnit,
    energyPrice,
    currencySymbol,
    cleaningCost,
    expectedRecoveryPct,
    periodDays,
    rainReset,
    notes,
    affectedDailyGen,
    dailyLostEnergy,
    recoverableDailyEnergy,
    recoveredRevenue,
    netBenefit,
    paybackDays,
    recommendation: recText
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
  document.getElementById('plant-capacity').value = '';
  document.getElementById('affected-capacity-pct').value = '100';
  document.getElementById('soiling-loss-pct').value = '';
  document.getElementById('expected-daily-gen').value = '';
  document.getElementById('energy-price').value = '';
  document.getElementById('cleaning-cost').value = '';
  document.getElementById('expected-recovery-pct').value = '95';
  document.getElementById('analysis-period-days').value = '30';
  document.getElementById('tool-notes').value = '';

  document.getElementById('validation-error').style.display = 'none';
  document.getElementById('result-panel').style.display = 'none';
  lastResult = null;
}

function copySummary() {
  if (!lastResult) return;

  const targetGenUnit = lastResult.genUnit.split('/')[0];
  const summaryText = `[Level3Support Cleaning ROI Calculator Summary]
Site / Project: ${lastResult.projectName || 'N/A'}
Plant Size: ${lastResult.plantCap} ${lastResult.capUnit} | Affected Area: ${lastResult.affectedCapPct}%
Soiling Loss: ${lastResult.soilingLossPct}% | Daily Gen Baseline: ${lastResult.dailyGen} ${lastResult.genUnit}
----------------------------------------
O&M Campaign Cost: ${lastResult.currencySymbol}${lastResult.cleaningCost.toFixed(2)}
Estimated Daily Lost Energy: ${lastResult.dailyLostEnergy.toFixed(2)} ${targetGenUnit}
Estimated Recoverable Energy: ${lastResult.recoverableDailyEnergy.toFixed(2)} ${targetGenUnit}
Estimated Recovered Revenue (${lastResult.periodDays} Days): ${lastResult.currencySymbol}${lastResult.recoveredRevenue.toFixed(2)}
----------------------------------------
Net Benefit: ${lastResult.netBenefit >= 0 ? '+' : ''}${lastResult.currencySymbol}${lastResult.netBenefit.toFixed(2)}
Investment Payback: ${lastResult.paybackDays !== null ? lastResult.paybackDays.toFixed(1) + ' Days' : 'Infinite'}
RECOMMENDED ACTION: ${lastResult.recommendation.toUpperCase()}
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
  downloadAnchor.setAttribute("download", `cleaning_roi_${lastResult.projectName || 'export'}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
