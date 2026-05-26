/**
 * Cable Ampacity & Max Current Calculator
 * Level3Support
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const cableMaterialInput = document.getElementById('cable-material');
  const insulationRatingInput = document.getElementById('insulation-rating');
  const baseAmpacityInput = document.getElementById('base-ampacity');
  const loadCurrentInput = document.getElementById('load-current');
  const ambientTempInput = document.getElementById('ambient-temp');
  const tempFactorOverrideInput = document.getElementById('temp-factor-override');
  const conductorCountInput = document.getElementById('conductor-count');
  const bundlingFactorOverrideInput = document.getElementById('bundling-factor-override');
  
  const calculateBtn = document.getElementById('calculate-btn');
  const resetBtn = document.getElementById('reset-btn');
  const copyBtn = document.getElementById('copy-btn');
  const exportBtn = document.getElementById('export-btn');
  
  const resultPanel = document.getElementById('result-panel');
  const ampStatusBadge = document.getElementById('amp-status-badge');
  const resBaseAmp = document.getElementById('res-base-amp');
  const resTempFactor = document.getElementById('res-temp-factor');
  const resBundlingFactor = document.getElementById('res-bundling-factor');
  const resCorrectedAmp = document.getElementById('res-corrected-amp');
  const resLoadPct = document.getElementById('res-load-pct');
  const resMargin = document.getElementById('res-margin');
  const validationError = document.getElementById('validation-error');

  let calculationResults = null;

  // Standard NEC Temperature Correction lookup (30 °C reference)
  function getNECTempCorrection(temp, rating) {
    const t = parseFloat(temp);
    const r = parseInt(rating);
    
    if (t <= 25) {
      if (r === 90) return 1.04;
      if (r === 75) return 1.05;
      return 1.08;
    }
    if (t <= 30) return 1.00;
    if (t <= 35) {
      if (r === 90) return 0.96;
      if (r === 75) return 0.94;
      return 0.91;
    }
    if (t <= 40) {
      if (r === 90) return 0.91;
      if (r === 75) return 0.88;
      return 0.82;
    }
    if (t <= 45) {
      if (r === 90) return 0.87;
      if (r === 75) return 0.82;
      return 0.71;
    }
    if (t <= 50) {
      if (r === 90) return 0.82;
      if (r === 75) return 0.75;
      return 0.58;
    }
    if (t <= 55) {
      if (r === 90) return 0.76;
      if (r === 75) return 0.67;
      return 0.41;
    }
    if (t <= 60) {
      if (r === 90) return 0.71;
      if (r === 75) return 0.58;
      return 0.00; // not allowed
    }
    if (t <= 70) {
      if (r === 90) return 0.58;
      if (r === 75) return 0.33;
      return 0.00; // not allowed
    }
    if (t <= 80) {
      if (r === 90) return 0.41;
      return 0.00; // not allowed
    }
    return 0.00;
  }

  // Standard Conductor adjustment bundling factor
  function getConductorAdjustmentFactor(count) {
    const c = parseInt(count);
    if (c <= 3) return 1.00;
    if (c <= 6) return 0.80;
    if (c <= 9) return 0.70;
    if (c <= 20) return 0.50;
    if (c <= 30) return 0.45;
    if (c <= 40) return 0.40;
    return 0.35;
  }

  // Load sample values
  function loadSampleValues() {
    cableMaterialInput.value = 'copper';
    insulationRatingInput.value = '90';
    baseAmpacityInput.value = '310'; // e.g. 350 kcmil Copper at 90C
    loadCurrentInput.value = '210';
    ambientTempInput.value = '42';
    conductorCountInput.value = '4';
  }

  loadSampleValues();

  // Reset Button
  resetBtn.addEventListener('click', () => {
    cableMaterialInput.value = 'copper';
    insulationRatingInput.value = '90';
    baseAmpacityInput.value = '';
    loadCurrentInput.value = '';
    ambientTempInput.value = '40';
    tempFactorOverrideInput.value = '';
    conductorCountInput.value = '3';
    bundlingFactorOverrideInput.value = '';
    validationError.style.display = 'none';
    resultPanel.style.display = 'none';
    calculationResults = null;
  });

  // Calculate
  calculateBtn.addEventListener('click', () => {
    validationError.style.display = 'none';

    const baseAmp = parseFloat(baseAmpacityInput.value);
    const loadCurr = parseFloat(loadCurrentInput.value);
    const ambientTemp = parseFloat(ambientTempInput.value);
    const conductorCount = parseInt(conductorCountInput.value);
    
    if (isNaN(baseAmp) || baseAmp <= 0) {
      showError('Please enter a positive Base Ampacity.');
      return;
    }
    if (isNaN(loadCurr) || loadCurr < 0) {
      showError('Please enter a valid Design Load Current.');
      return;
    }
    if (isNaN(ambientTemp)) {
      showError('Please enter an Ambient Temperature.');
      return;
    }
    if (isNaN(conductorCount) || conductorCount < 1) {
      showError('Please enter at least 1 current-carrying conductor.');
      return;
    }

    // Determine temperature factor
    let tempFactor = parseFloat(tempFactorOverrideInput.value);
    if (isNaN(tempFactor)) {
      tempFactor = getNECTempCorrection(ambientTemp, insulationRatingInput.value);
    }

    // Determine bundling factor
    let bundlingFactor = parseFloat(bundlingFactorOverrideInput.value);
    if (isNaN(bundlingFactor)) {
      bundlingFactor = getConductorAdjustmentFactor(conductorCount);
    }

    // Math
    const correctedAmpacity = baseAmp * tempFactor * bundlingFactor;
    const utilizationPct = (loadCurr / correctedAmpacity) * 100;
    const margin = correctedAmpacity - loadCurr;

    const pass = loadCurr <= correctedAmpacity;
    let statusText = pass ? 'PASS' : 'FAIL';
    let badgeClass = pass ? 'status-pass' : 'status-fail';

    if (correctedAmpacity === 0) {
      statusText = 'FAIL';
      badgeClass = 'status-fail';
      showError('Thermal limits exceeded for insulation temperature rating!');
    }

    calculationResults = {
      material: cableMaterialInput.value,
      insulation: `${insulationRatingInput.value} °C`,
      baseAmpacity: `${baseAmp} A`,
      loadCurrent: `${loadCurr} A`,
      ambientTemp: `${ambientTemp} °C`,
      tempFactor: tempFactor.toFixed(2),
      bundlingFactor: bundlingFactor.toFixed(2),
      correctedAmpacity: `${correctedAmpacity.toFixed(1)} A`,
      utilization: `${utilizationPct.toFixed(1)}%`,
      margin: `${margin.toFixed(1)} A`,
      status: statusText
    };

    // Render outputs
    resBaseAmp.textContent = `${baseAmp} A`;
    resTempFactor.textContent = tempFactor.toFixed(2);
    resBundlingFactor.textContent = bundlingFactor.toFixed(2);
    resCorrectedAmp.textContent = `${correctedAmpacity.toFixed(1)} A`;
    resLoadPct.textContent = `${utilizationPct.toFixed(1)}%`;
    resMargin.textContent = `${margin.toFixed(1)} A`;
    
    if (pass) {
      resMargin.style.color = '#166534';
      resLoadPct.style.color = '#166534';
    } else {
      resMargin.style.color = '#991b1b';
      resLoadPct.style.color = '#991b1b';
    }

    ampStatusBadge.textContent = statusText;
    ampStatusBadge.className = `status-badge-inline ${badgeClass}`;

    resultPanel.style.display = 'block';
    resultPanel.scrollIntoView({ behavior: 'smooth' });
  });

  // Copy Results
  copyBtn.addEventListener('click', () => {
    if (!calculationResults) return;
    const text = `Level3Support Cable Ampacity Results
-------------------------------------------
Material: ${calculationResults.material}
Insulation Temp: ${calculationResults.insulation}
Base Ampacity: ${calculationResults.baseAmpacity}
Design Load Current: ${calculationResults.loadCurrent}
Ambient Temp: ${calculationResults.ambientTemp}
Temp Correction Factor: ${calculationResults.tempFactor}
Bundling Factor: ${calculationResults.bundlingFactor}
Corrected Ampacity: ${calculationResults.correctedAmpacity}
Utilization: ${calculationResults.utilization}
Margin: ${calculationResults.margin}
Status: ${calculationResults.status}
-------------------------------------------
Warning: Sizing must be checked against standard electrical code and project files.`;
    
    navigator.clipboard.writeText(text).then(() => {
      const origText = copyBtn.innerHTML;
      copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      setTimeout(() => copyBtn.innerHTML = origText, 2000);
    });
  });

  // Export JSON
  exportBtn.addEventListener('click', () => {
    if (!calculationResults) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(calculationResults, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `cable_ampacity_results_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });

  function showError(msg) {
    validationError.textContent = msg;
    validationError.style.display = 'block';
  }
});
