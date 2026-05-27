/**
 * PV Performance Ratio Calculator
 * Level3Support
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const dcCapacityInput = document.getElementById('dc-capacity');
  const dcCapacityUnit = document.getElementById('dc-capacity-unit');
  const permitLimitInput = document.getElementById('permit-limit');
  const permitLimitUnit = document.getElementById('permit-limit-unit');
  const energyExportedInput = document.getElementById('energy-exported');
  const energyExportedUnit = document.getElementById('energy-exported-unit');
  const poaIrradianceInput = document.getElementById('poa-irradiance');
  const refIrradianceInput = document.getElementById('ref-irradiance');
  const periodLabelInput = document.getElementById('period-label');
  const tempCorrToggle = document.getElementById('temp-corr-toggle');
  const tempInputs = document.getElementById('temp-inputs');
  const moduleTempInput = document.getElementById('module-temp');
  const tempCoeffInput = document.getElementById('temp-coeff');
  const validationError = document.getElementById('validation-error');
  
  const calculateBtn = document.getElementById('calculate-btn');
  const resetBtn = document.getElementById('reset-btn');
  const copyBtn = document.getElementById('copy-btn');
  const exportBtn = document.getElementById('export-btn');
  
  const resultPanel = document.getElementById('result-panel');
  const prStatusBadge = document.getElementById('pr-status-badge');
  const resPeriod = document.getElementById('res-period');
  const resExpectedUncorr = document.getElementById('res-expected-uncorr');
  const resExpectedCorrRow = document.getElementById('res-expected-corr-row');
  const resExpectedCorr = document.getElementById('res-expected-corr');
  const resPr = document.getElementById('res-pr');
  const resDeviation = document.getElementById('res-deviation');

  // Permit adjusted elements
  const resPermitExpectedRow = document.getElementById('res-permit-expected-row');
  const resPermitExpected = document.getElementById('res-permit-expected');
  const resPermitPrRow = document.getElementById('res-permit-pr-row');
  const resPermitPr = document.getElementById('res-permit-pr');
  const resPermitDeviationRow = document.getElementById('res-permit-deviation-row');
  const resPermitDeviation = document.getElementById('res-permit-deviation');

  let calculationResults = null;

  // Toggle Temp Correction Inputs
  tempCorrToggle.addEventListener('change', () => {
    if (tempCorrToggle.checked) {
      tempInputs.style.display = 'grid';
      moduleTempInput.setAttribute('required', 'true');
    } else {
      tempInputs.style.display = 'none';
      moduleTempInput.removeAttribute('required');
      moduleTempInput.value = '';
    }
  });

  // Load Sample/Quick-test Data
  function loadSampleData() {
    dcCapacityInput.value = '5.0'; // 5 MWp
    dcCapacityUnit.value = 'MWp';
    permitLimitInput.value = '4.0'; // 4.0 MW permit limit
    permitLimitUnit.value = 'MW';
    energyExportedInput.value = '18.5'; // 18.5 MWh
    energyExportedUnit.value = 'MWh';
    poaIrradianceInput.value = '4.8'; // 4.8 kWh/m²
    refIrradianceInput.value = '1000';
    periodLabelInput.value = 'Daily Performance Run (Sample)';
    tempCorrToggle.checked = true;
    tempInputs.style.display = 'grid';
    moduleTempInput.value = '45'; // 45 °C
    tempCoeffInput.value = '-0.38'; // -0.38 %/°C
  }
  
  // Call to initialize with sample values
  loadSampleData();

  // Reset Button
  resetBtn.addEventListener('click', () => {
    dcCapacityInput.value = '';
    permitLimitInput.value = '';
    energyExportedInput.value = '';
    poaIrradianceInput.value = '';
    refIrradianceInput.value = '1000';
    periodLabelInput.value = 'Daily Performance Run';
    tempCorrToggle.checked = false;
    tempInputs.style.display = 'none';
    moduleTempInput.removeAttribute('required');
    moduleTempInput.value = '';
    tempCoeffInput.value = '-0.35';
    validationError.style.display = 'none';
    resultPanel.style.display = 'none';
    calculationResults = null;
  })  // Calculate Button
  calculateBtn.addEventListener('click', () => {
    validationError.style.display = 'none';
    
    // Read and Validate
    const capacityVal = parseFloat(dcCapacityInput.value);
    const energyVal = parseFloat(energyExportedInput.value);
    const poaIrradianceVal = parseFloat(poaIrradianceInput.value);
    const refIrradianceVal = parseFloat(refIrradianceInput.value);
    
    if (isNaN(capacityVal) || capacityVal <= 0) {
      showError('Please enter a positive Installed DC Capacity.');
      return;
    }
    if (isNaN(energyVal) || energyVal < 0) {
      showError('Please enter a valid Energy Exported.');
      return;
    }
    if (isNaN(poaIrradianceVal) || poaIrradianceVal <= 0) {
      showError('Please enter a positive Plane-of-Array Irradiance.');
      return;
    }
    if (isNaN(refIrradianceVal) || refIrradianceVal <= 0) {
      showError('Please enter a positive Reference Irradiance.');
      return;
    }

    let permitLimitVal = null;
    let hasPermitLimit = false;
    if (permitLimitInput.value.trim() !== '') {
      permitLimitVal = parseFloat(permitLimitInput.value);
      if (isNaN(permitLimitVal) || permitLimitVal <= 0) {
        showError('Please enter a valid positive Grid Permit Limit or leave it blank.');
        return;
      }
      hasPermitLimit = true;
    }

    let moduleTemp = null;
    let tempCoeff = null;
    
    if (tempCorrToggle.checked) {
      moduleTemp = parseFloat(moduleTempInput.value);
      tempCoeff = parseFloat(tempCoeffInput.value);
      if (isNaN(moduleTemp)) {
        showError('Please enter Module Temperature for correction.');
        return;
      }
      if (isNaN(tempCoeff)) {
        showError('Please enter a valid Temperature Coefficient.');
        return;
      }
    }

    // Convert capacity to kWp
    const capacitykWp = (dcCapacityUnit.value === 'MWp') ? capacityVal * 1000 : capacityVal;
    
    // Convert energy to kWh
    const energykWh = (energyExportedUnit.value === 'MWh') ? energyVal * 1000 : energyVal;

    // Convert permit limit to kW
    let permitLimitkW = null;
    if (hasPermitLimit) {
      permitLimitkW = (permitLimitUnit.value === 'MW') ? permitLimitVal * 1000 : permitLimitVal;
    }

    // Standard Expected Energy (kWh) = P_stc * POA_irradiance * (1000 / G_ref)
    const expectedEnergyUncorr = capacitykWp * poaIrradianceVal * (1000 / refIrradianceVal);

    let expectedEnergyCorr = expectedEnergyUncorr;
    let correctionFactor = 1;
    if (tempCorrToggle.checked) {
      correctionFactor = 1 + (tempCoeff / 100) * (moduleTemp - 25);
      expectedEnergyCorr = expectedEnergyUncorr * correctionFactor;
    }

    const finalExpectedEnergy = tempCorrToggle.checked ? expectedEnergyCorr : expectedEnergyUncorr;
    const prPercentage = (energykWh / finalExpectedEnergy) * 100;
    const deviationPercentage = ((energykWh - finalExpectedEnergy) / finalExpectedEnergy) * 100;

    // Permit-Adjusted Calculations
    let permitExpectedUncorr = null;
    let permitExpectedCorr = null;
    let finalPermitExpected = null;
    let permitPrPercentage = null;
    let permitDeviationPercentage = null;

    if (hasPermitLimit) {
      const adjustedCapacitykWp = Math.min(capacitykWp, permitLimitkW);
      permitExpectedUncorr = adjustedCapacitykWp * poaIrradianceVal * (1000 / refIrradianceVal);
      permitExpectedCorr = tempCorrToggle.checked ? permitExpectedUncorr * correctionFactor : permitExpectedUncorr;
      finalPermitExpected = tempCorrToggle.checked ? permitExpectedCorr : permitExpectedUncorr;
      permitPrPercentage = (energykWh / finalPermitExpected) * 100;
      permitDeviationPercentage = ((energykWh - finalPermitExpected) / finalPermitExpected) * 100;
    }

    // Determine PR Status (based on Standard PR, or Permit-Adjusted PR if provided)
    const primaryPR = hasPermitLimit ? permitPrPercentage : prPercentage;
    let statusText = 'Normal';
    let badgeClass = 'status-normal';
    if (primaryPR < 75) {
      statusText = 'Investigate';
      badgeClass = 'status-investigate';
    } else if (primaryPR < 80) {
      statusText = 'Watch';
      badgeClass = 'status-watch';
    }

    // Save outputs
    calculationResults = {
      period: periodLabelInput.value || 'Daily Performance Run',
      dcCapacity: `${capacityVal} ${dcCapacityUnit.value}`,
      permitLimit: hasPermitLimit ? `${permitLimitVal} ${permitLimitUnit.value}` : 'None',
      energyExported: `${energyVal} ${energyExportedUnit.value}`,
      poaIrradiance: `${poaIrradianceVal} kWh/m²`,
      refIrradiance: `${refIrradianceVal} W/m²`,
      tempCorrectionApplied: tempCorrToggle.checked,
      moduleTemp: tempCorrToggle.checked ? `${moduleTemp} °C` : 'N/A',
      tempCoeff: tempCorrToggle.checked ? `${tempCoeff} %/°C` : 'N/A',
      expectedEnergyUncorr: `${expectedEnergyUncorr.toFixed(2)} kWh`,
      expectedEnergyCorr: tempCorrToggle.checked ? `${expectedEnergyCorr.toFixed(2)} kWh` : 'N/A',
      pr: `${prPercentage.toFixed(2)}%`,
      deviation: `${deviationPercentage.toFixed(2)}%`,
      permitExpectedEnergy: hasPermitLimit ? `${finalPermitExpected.toFixed(2)} kWh` : 'N/A',
      permitPr: hasPermitLimit ? `${permitPrPercentage.toFixed(2)}%` : 'N/A',
      permitDeviation: hasPermitLimit ? `${permitDeviationPercentage.toFixed(2)}%` : 'N/A',
      status: statusText
    };

    // Render results
    resPeriod.textContent = calculationResults.period;
    resExpectedUncorr.textContent = `${(expectedEnergyUncorr / (energyExportedUnit.value === 'MWh' ? 1000 : 1)).toFixed(2)} ${energyExportedUnit.value}`;
    
    if (tempCorrToggle.checked) {
      resExpectedCorrRow.style.display = 'flex';
      resExpectedCorr.textContent = `${(expectedEnergyCorr / (energyExportedUnit.value === 'MWh' ? 1000 : 1)).toFixed(2)} ${energyExportedUnit.value}`;
    } else {
      resExpectedCorrRow.style.display = 'none';
    }

    resPr.textContent = `${prPercentage.toFixed(2)}%`;
    resDeviation.textContent = `${deviationPercentage.toFixed(2)}%`;
    resDeviation.style.color = (deviationPercentage >= 0) ? '#166534' : '#991b1b';

    // Show/hide permit rows
    if (hasPermitLimit) {
      resPermitExpectedRow.style.display = 'flex';
      resPermitPrRow.style.display = 'flex';
      resPermitDeviationRow.style.display = 'flex';

      resPermitExpected.textContent = `${(finalPermitExpected / (energyExportedUnit.value === 'MWh' ? 1000 : 1)).toFixed(2)} ${energyExportedUnit.value}`;
      resPermitPr.textContent = `${permitPrPercentage.toFixed(2)}%`;
      resPermitDeviation.textContent = `${permitDeviationPercentage.toFixed(2)}%`;
      resPermitDeviation.style.color = (permitDeviationPercentage >= 0) ? '#166534' : '#991b1b';
    } else {
      resPermitExpectedRow.style.display = 'none';
      resPermitPrRow.style.display = 'none';
      resPermitDeviationRow.style.display = 'none';
    }
    
    prStatusBadge.textContent = statusText;
    prStatusBadge.className = `status-badge-inline ${badgeClass}`;

    resultPanel.style.display = 'block';
    resultPanel.scrollIntoView({ behavior: 'smooth' });
  });

  // Copy results button
  copyBtn.addEventListener('click', () => {
    if (!calculationResults) return;
    let text = `Level3Support PV Performance Ratio Results
-------------------------------------------
Period: ${calculationResults.period}
DC Capacity: ${calculationResults.dcCapacity}
Grid Permit Limit: ${calculationResults.permitLimit}
Energy Exported: ${calculationResults.energyExported}
POA Irradiance: ${calculationResults.poaIrradiance}
Temp Correction: ${calculationResults.tempCorrectionApplied ? 'YES' : 'NO'}
Avg Module Temp: ${calculationResults.moduleTemp}
Temp Coeff: ${calculationResults.tempCoeff}
Expected Energy (Uncorrected): ${calculationResults.expectedEnergyUncorr}
Expected Energy (Corrected): ${calculationResults.expectedEnergyCorr}
Performance Ratio (PR): ${calculationResults.pr}
Deviation: ${calculationResults.deviation}`;

    if (calculationResults.permitLimit !== 'None') {
      text += `
Permit-Adjusted Expected Energy: ${calculationResults.permitExpectedEnergy}
Permit-Adjusted PR: ${calculationResults.permitPr}
Permit-Adjusted Deviation: ${calculationResults.permitDeviation}`;
    }

    text += `
Status: ${calculationResults.status}
-------------------------------------------
This assists field engineers but does not replace approved project documents.`;
    
    navigator.clipboard.writeText(text).then(() => {
      const origText = copyBtn.innerHTML;
      copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      setTimeout(() => copyBtn.innerHTML = origText, 2000);
    });
  });

  // Export JSON button
  exportBtn.addEventListener('click', () => {
    if (!calculationResults) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(calculationResults, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pv_pr_results_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });

  function showError(msg) {
    validationError.textContent = msg;
    validationError.style.display = 'block';
  }
});
