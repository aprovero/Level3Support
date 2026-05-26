/**
 * PV Weather Correction Calculator
 * Level3Support
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const nameplatePowerInput = document.getElementById('nameplate-power');
  const powerUnitInput = document.getElementById('power-unit');
  const measuredPowerInput = document.getElementById('measured-power');
  const tempPowerUnit = document.querySelector('.temp-power-unit');
  
  const measuredIrradianceInput = document.getElementById('measured-irradiance');
  const refIrradianceInput = document.getElementById('ref-irradiance');
  const moduleTempInput = document.getElementById('module-temp');
  const stcTempInput = document.getElementById('stc-temp');
  const tempCoeffInput = document.getElementById('temp-coeff');
  
  const calculateBtn = document.getElementById('calculate-btn');
  const resetBtn = document.getElementById('reset-btn');
  const copyBtn = document.getElementById('copy-btn');
  const exportBtn = document.getElementById('export-btn');
  
  const resultPanel = document.getElementById('result-panel');
  const corrStatusBadge = document.getElementById('corr-status-badge');
  const resIrradExpected = document.getElementById('res-irrad-expected');
  const resTempDerate = document.getElementById('res-temp-derate');
  const resExpectedPower = document.getElementById('res-expected-power');
  const resRatioPct = document.getElementById('res-ratio-pct');
  const resDeviationPct = document.getElementById('res-deviation-pct');
  const validationError = document.getElementById('validation-error');

  let calculationResults = null;

  // Toggle Units labeling
  powerUnitInput.addEventListener('change', () => {
    tempPowerUnit.textContent = powerUnitInput.value;
  });

  // Load sample values
  function loadSampleValues() {
    nameplatePowerInput.value = '540';
    powerUnitInput.value = 'W';
    measuredPowerInput.value = '415';
    measuredIrradianceInput.value = '850';
    refIrradianceInput.value = '1000';
    moduleTempInput.value = '48.5';
    stcTempInput.value = '25';
    tempCoeffInput.value = '-0.38';
    
    tempPowerUnit.textContent = 'W';
  }

  loadSampleValues();

  // Reset
  resetBtn.addEventListener('click', () => {
    nameplatePowerInput.value = '';
    powerUnitInput.value = 'W';
    measuredPowerInput.value = '';
    measuredIrradianceInput.value = '';
    refIrradianceInput.value = '1000';
    moduleTempInput.value = '';
    stcTempInput.value = '25';
    tempCoeffInput.value = '-0.38';
    
    tempPowerUnit.textContent = 'W';
    validationError.style.display = 'none';
    resultPanel.style.display = 'none';
    calculationResults = null;
  });

  // Calculate
  calculateBtn.addEventListener('click', () => {
    validationError.style.display = 'none';

    const pStc = parseFloat(nameplatePowerInput.value);
    const pMeas = parseFloat(measuredPowerInput.value);
    const gMeas = parseFloat(measuredIrradianceInput.value);
    const gRef = parseFloat(refIrradianceInput.value);
    const tMod = parseFloat(moduleTempInput.value);
    const tRef = parseFloat(stcTempInput.value);
    const gamma = parseFloat(tempCoeffInput.value);
    const unit = powerUnitInput.value;

    if (isNaN(pStc) || pStc <= 0) {
      showError('Please enter a positive Nameplate DC Power.');
      return;
    }
    if (isNaN(pMeas) || pMeas < 0) {
      showError('Please enter a valid Measured DC Power.');
      return;
    }
    if (isNaN(gMeas) || gMeas <= 0) {
      showError('Please enter a positive Measured Irradiance.');
      return;
    }
    if (isNaN(gRef) || gRef <= 0) {
      showError('Please enter a positive Reference Irradiance.');
      return;
    }
    if (isNaN(tMod)) {
      showError('Please enter a valid Module Temperature.');
      return;
    }
    if (isNaN(tRef)) {
      showError('Please enter a valid STC Temperature.');
      return;
    }
    if (isNaN(gamma)) {
      showError('Please enter a valid Temperature Coefficient.');
      return;
    }

    // Formulas
    const irradExpected = pStc * (gMeas / gRef);
    const tempDeratingFactor = 1 + (gamma / 100) * (tMod - tRef);
    const correctedExpectedPower = irradExpected * tempDeratingFactor;

    const ratioPct = (pMeas / correctedExpectedPower) * 100;
    const deviationPct = ((pMeas - correctedExpectedPower) / correctedExpectedPower) * 100;

    // Status Boundaries
    let statusText = 'Normal';
    let badgeClass = 'status-normal';
    
    if (ratioPct < 85.0) {
      statusText = 'Investigate';
      badgeClass = 'status-investigate';
    } else if (ratioPct < 90.0) {
      statusText = 'Watch';
      badgeClass = 'status-watch';
    }

    calculationResults = {
      nameplatePower: `${pStc} ${unit}`,
      measuredPower: `${pMeas} ${unit}`,
      measuredIrradiance: `${gMeas} W/m²`,
      refIrradiance: `${gRef} W/m²`,
      moduleTemp: `${tMod} °C`,
      stcTemp: `${tRef} °C`,
      tempCoeff: `${gamma} %/°C`,
      irradExpected: `${irradExpected.toFixed(2)} ${unit}`,
      tempDerateFactor: tempDeratingFactor.toFixed(3),
      correctedExpected: `${correctedExpectedPower.toFixed(2)} ${unit}`,
      ratioPct: `${ratioPct.toFixed(2)}%`,
      deviationPct: `${deviationPct.toFixed(2)}%`,
      status: statusText
    };

    // Render results
    resIrradExpected.textContent = `${irradExpected.toFixed(2)} ${unit}`;
    resTempDerate.textContent = tempDeratingFactor.toFixed(3);
    resExpectedPower.textContent = `${correctedExpectedPower.toFixed(2)} ${unit}`;
    resRatioPct.textContent = `${ratioPct.toFixed(2)}%`;
    resDeviationPct.textContent = `${deviationPct.toFixed(2)}%`;
    
    resRatioPct.style.color = (ratioPct >= 90) ? '#166534' : '#991b1b';
    resDeviationPct.style.color = (deviationPct >= 0) ? '#166534' : '#991b1b';

    corrStatusBadge.textContent = statusText;
    corrStatusBadge.className = `status-badge-inline ${badgeClass}`;

    resultPanel.style.display = 'block';
    resultPanel.scrollIntoView({ behavior: 'smooth' });
  });

  // Copy Results
  copyBtn.addEventListener('click', () => {
    if (!calculationResults) return;
    const text = `Level3Support PV Weather Correction Results
-------------------------------------------
Nameplate Power: ${calculationResults.nameplatePower}
Measured Power: ${calculationResults.measuredPower}
Measured Irradiance: ${calculationResults.measuredIrradiance}
Reference Irradiance: ${calculationResults.refIrradiance}
Module Temperature: ${calculationResults.moduleTemp}
STC Temperature: ${calculationResults.stcTemp}
Temperature Coefficient: ${calculationResults.tempCoeff}
Irradiance Expected: ${calculationResults.irradExpected}
Temp Derating Factor: ${calculationResults.tempDerateFactor}
Corrected Expected Power: ${calculationResults.correctedExpected}
Measured vs Expected Ratio: ${calculationResults.ratioPct}
Deviation: ${calculationResults.deviationPct}
Status: ${calculationResults.status}
-------------------------------------------
Disclaimer: Assisted field tool. Always verify against specific project documents.`;
    
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
    downloadAnchor.setAttribute("download", `weather_correction_results_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });

  function showError(msg) {
    validationError.textContent = msg;
    validationError.style.display = 'block';
  }
});
