/**
 * HVAC Delta-T Calculator
 * Level3Support
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const returnTempInput = document.getElementById('return-temp');
  const supplyTempInput = document.getElementById('supply-temp');
  const ambientTempInput = document.getElementById('ambient-temp');
  const internalTempInput = document.getElementById('internal-temp');
  const hvacModeInput = document.getElementById('hvac-mode');
  const hvacUnitIdInput = document.getElementById('hvac-unit-id');
  const hvacAlarmToggle = document.getElementById('hvac-alarm-toggle');
  const validationError = document.getElementById('validation-error');
  
  const degCBtn = document.getElementById('deg-c-btn');
  const degFBtn = document.getElementById('deg-f-btn');
  const tempUnitLabels = document.querySelectorAll('.temp-unit-label');
  
  const calculateBtn = document.getElementById('calculate-btn');
  const resetBtn = document.getElementById('reset-btn');
  const logReadingBtn = document.getElementById('log-reading-btn');
  const copyBtn = document.getElementById('copy-btn');
  const exportBtn = document.getElementById('export-btn');
  
  const resultPanel = document.getElementById('result-panel');
  const hvacStatusBadge = document.getElementById('hvac-status-badge');
  const resUnitId = document.getElementById('res-unit-id');
  const resModeAlarm = document.getElementById('res-mode-alarm');
  const resDeltaT = document.getElementById('res-delta-t');
  const resAssessment = document.getElementById('res-assessment');
  
  const tableLogBody = document.getElementById('table-log-body');
  const emptyTableRow = document.getElementById('empty-table-row');

  let currentUnit = 'C'; // 'C' or 'F'
  let calculationResults = null;
  const loggedReadings = [];

  // Toggle Degree units C to F and back
  degCBtn.addEventListener('click', () => setUnit('C'));
  degFBtn.addEventListener('click', () => setUnit('F'));

  function setUnit(unit) {
    if (currentUnit === unit) return;
    
    currentUnit = unit;
    if (unit === 'C') {
      degCBtn.classList.add('active');
      degFBtn.classList.remove('active');
      tempUnitLabels.forEach(lbl => lbl.textContent = '°C');
      convertInputsToC();
    } else {
      degFBtn.classList.add('active');
      degCBtn.classList.remove('active');
      tempUnitLabels.forEach(lbl => lbl.textContent = '°F');
      convertInputsToF();
    }
  }

  function convertInputsToF() {
    if (returnTempInput.value) returnTempInput.value = (parseFloat(returnTempInput.value) * 9/5 + 32).toFixed(1);
    if (supplyTempInput.value) supplyTempInput.value = (parseFloat(supplyTempInput.value) * 9/5 + 32).toFixed(1);
    if (ambientTempInput.value) ambientTempInput.value = (parseFloat(ambientTempInput.value) * 9/5 + 32).toFixed(1);
    if (internalTempInput.value) internalTempInput.value = (parseFloat(internalTempInput.value) * 9/5 + 32).toFixed(1);
  }

  function convertInputsToC() {
    if (returnTempInput.value) returnTempInput.value = ((parseFloat(returnTempInput.value) - 32) * 5/9).toFixed(1);
    if (supplyTempInput.value) supplyTempInput.value = ((parseFloat(supplyTempInput.value) - 32) * 5/9).toFixed(1);
    if (ambientTempInput.value) ambientTempInput.value = ((parseFloat(ambientTempInput.value) - 32) * 5/9).toFixed(1);
    if (internalTempInput.value) internalTempInput.value = ((parseFloat(internalTempInput.value) - 32) * 5/9).toFixed(1);
  }

  // Load sample values
  function loadSampleValues() {
    returnTempInput.value = '25.6';
    supplyTempInput.value = '14.8';
    ambientTempInput.value = '35.0';
    internalTempInput.value = '24.2';
    hvacUnitIdInput.value = 'HVAC-A01';
    hvacAlarmToggle.checked = false;
  }

  loadSampleValues();

  // Reset
  resetBtn.addEventListener('click', () => {
    returnTempInput.value = '';
    supplyTempInput.value = '';
    ambientTempInput.value = '';
    internalTempInput.value = '';
    hvacUnitIdInput.value = 'HVAC-01';
    hvacAlarmToggle.checked = false;
    validationError.style.display = 'none';
    resultPanel.style.display = 'none';
    calculationResults = null;
  });

  // Calculate Delta-T
  function runCalculation() {
    validationError.style.display = 'none';

    const rTemp = parseFloat(returnTempInput.value);
    const sTemp = parseFloat(supplyTempInput.value);
    const ambient = parseFloat(ambientTempInput.value);
    const internal = parseFloat(internalTempInput.value);
    const mode = hvacModeInput.value;
    const unitId = hvacUnitIdInput.value.trim() || 'HVAC-01';
    const hasAlarm = hvacAlarmToggle.checked;

    if (isNaN(rTemp) || isNaN(sTemp)) {
      showError('Please enter valid Supply and Return temperatures.');
      return null;
    }

    const deltaT = rTemp - sTemp;
    
    // Performance Assessment
    let assessment = '';
    let statusText = 'Normal';
    let badgeClass = 'status-normal';

    if (hasAlarm) {
      statusText = 'Critical';
      badgeClass = 'status-critical';
      assessment = 'System Alarm Active! Immediate technician dispatch required.';
    } else if (mode === 'cooling') {
      if (deltaT < 0) {
        statusText = 'Critical';
        badgeClass = 'status-critical';
        assessment = 'CRITICAL: Supply air is hotter than Return air in cooling mode!';
      } else if (deltaT === 0) {
        statusText = 'Critical';
        badgeClass = 'status-critical';
        assessment = 'CRITICAL: Zero heat exchange. Compressor bypass or fan failure.';
      } else {
        const standardMin = (currentUnit === 'C') ? 8.0 : 15.0;
        const standardMax = (currentUnit === 'C') ? 12.0 : 22.0;

        if (deltaT >= standardMin && deltaT <= standardMax) {
          statusText = 'Normal';
          badgeClass = 'status-normal';
          assessment = 'Optimal cooling performance. Heat exchange within standard range.';
        } else if (deltaT < standardMin) {
          statusText = 'Watch';
          badgeClass = 'status-warning';
          assessment = 'Low cooling capacity. Check refrigerant charges, airflow filters, or condenser soilage.';
        } else {
          statusText = 'Watch';
          badgeClass = 'status-warning';
          assessment = 'High Delta-T. Check for low air volume rates or blocked air duct dampers.';
        }
      }
    } else if (mode === 'heating') {
      // In heating, supply is hotter than return, making delta-T negative in our formula
      if (deltaT >= 0) {
        statusText = 'Critical';
        badgeClass = 'status-critical';
        assessment = 'CRITICAL: Supply air is colder than Return air in heating mode!';
      } else {
        const absDelta = Math.abs(deltaT);
        const heatMin = (currentUnit === 'C') ? 10.0 : 18.0;
        const heatMax = (currentUnit === 'C') ? 20.0 : 36.0;

        if (absDelta >= heatMin && absDelta <= heatMax) {
          statusText = 'Normal';
          badgeClass = 'status-normal';
          assessment = 'Optimal heating performance.';
        } else {
          statusText = 'Watch';
          badgeClass = 'status-warning';
          assessment = 'Heating exchange is outside standard parameters.';
        }
      }
    } else {
      // Vent mode
      const absDelta = Math.abs(deltaT);
      const ventMax = (currentUnit === 'C') ? 1.5 : 3.0;
      if (absDelta > ventMax) {
        statusText = 'Watch';
        badgeClass = 'status-warning';
        assessment = 'Temperature delta detected in Vent Mode (compressor should be OFF). Possible valve leakage.';
      } else {
        statusText = 'Normal';
        badgeClass = 'status-normal';
        assessment = 'Ventilation mode functioning properly.';
      }
    }

    const results = {
      unitId: unitId,
      mode: mode.toUpperCase(),
      alarm: hasAlarm ? 'ACTIVE ALARM' : 'NO ALARM',
      rTemp: `${rTemp} °${currentUnit}`,
      sTemp: `${sTemp} °${currentUnit}`,
      ambient: isNaN(ambient) ? 'N/A' : `${ambient} °${currentUnit}`,
      internal: isNaN(internal) ? 'N/A' : `${internal} °${currentUnit}`,
      deltaT: `${deltaT.toFixed(1)} °${currentUnit}`,
      assessment: assessment,
      status: statusText,
      badgeClass: badgeClass
    };

    return results;
  }

  // Calculate Button click
  calculateBtn.addEventListener('click', () => {
    const res = runCalculation();
    if (!res) return;

    calculationResults = res;

    // Render results
    resUnitId.textContent = res.unitId;
    resModeAlarm.textContent = `${res.mode} / ${res.alarm}`;
    resDeltaT.textContent = res.deltaT;
    resAssessment.textContent = res.assessment;
    
    hvacStatusBadge.textContent = res.status;
    hvacStatusBadge.className = `status-badge-inline ${res.badgeClass}`;

    resultPanel.style.display = 'block';
    resultPanel.scrollIntoView({ behavior: 'smooth' });
  });

  // Log reading to table
  logReadingBtn.addEventListener('click', () => {
    const res = runCalculation();
    if (!res) return;

    // Add to logs array
    loggedReadings.push(res);
    
    // Hide empty placeholder row
    if (emptyTableRow) {
      emptyTableRow.style.display = 'none';
    }

    // Create table row
    const tr = document.createElement('tr');
    tr.id = `hvac-row-${loggedReadings.length - 1}`;
    
    tr.innerHTML = `
      <td style="font-weight:600;">${res.unitId}</td>
      <td>${res.mode}</td>
      <td>${res.rTemp}</td>
      <td>${res.sTemp}</td>
      <td style="font-weight:700;">${res.deltaT}</td>
      <td><span class="status-badge-inline ${res.badgeClass}">${res.status}</span></td>
      <td>${res.alarm}</td>
      <td>
        <button onclick="document.getElementById('hvac-row-${loggedReadings.length - 1}').remove();" class="btn-danger" style="margin-top:0;" title="Delete Reading"><i class="fas fa-trash"></i></button>
      </td>
    `;

    tableLogBody.appendChild(tr);
  });

  // Copy Results
  copyBtn.addEventListener('click', () => {
    if (!calculationResults) return;
    const text = `Level3Support HVAC Delta-T Results
-------------------------------------------
Unit ID: ${calculationResults.unitId}
Operating Mode: ${calculationResults.mode}
Alarm State: ${calculationResults.alarm}
Return Air Temp: ${calculationResults.rTemp}
Supply Air Temp: ${calculationResults.sTemp}
Ambient Temperature: ${calculationResults.ambient}
Container Internal Temp: ${calculationResults.internal}
Delta-T (Return-Supply): ${calculationResults.deltaT}
Assessment: ${calculationResults.assessment}
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
    const dataToExport = {
      activeReading: calculationResults,
      allLoggedUnits: loggedReadings
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `hvac_deltat_results_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });

  function showError(msg) {
    validationError.textContent = msg;
    validationError.style.display = 'block';
  }
});
