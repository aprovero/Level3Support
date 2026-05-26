/**
 * Irradiance Sensor Cross-Check Tool JS
 * Level3Support
 */

document.addEventListener('DOMContentLoaded', () => {
  const siteNameInput = document.getElementById('site-name');
  const timestampInput = document.getElementById('timestamp');
  const poa1Input = document.getElementById('poa-1');
  const poa2Input = document.getElementById('poa-2');
  const ghiInput = document.getElementById('ghi');
  const refCellInput = document.getElementById('ref-cell');
  const inverterPowerInput = document.getElementById('inverter-power');
  const inverterRatedInput = document.getElementById('inverter-rated');
  const cleaningStatusSelect = document.getElementById('cleaning-status');
  const lastCleanInput = document.getElementById('last-clean');
  const sensorNotesInput = document.getElementById('sensor-notes');
  const notesInput = document.getElementById('notes');

  const calculateBtn = document.getElementById('calculate-btn');
  const resetBtn = document.getElementById('reset-btn');
  const copyBtn = document.getElementById('copy-btn');

  const resultPanel = document.getElementById('result-panel');
  const diagnosticStatusBadge = document.getElementById('diagnostic-status');
  const resMismatch = document.getElementById('res-mismatch');
  const resHighLow = document.getElementById('res-high-low');
  const resSoiling = document.getElementById('res-soiling');
  const resAlignment = document.getElementById('res-alignment');
  const resAction = document.getElementById('res-action');
  const validationError = document.getElementById('validation-error');

  let resultsSummary = null;

  // Set default timestamp
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  timestampInput.value = now.toISOString().slice(0, 16);

  // Set default cleaning date
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  lastCleanInput.value = lastWeek.toISOString().slice(0, 10);

  // Load sample values
  function loadSampleValues() {
    siteNameInput.value = "Solar Field Bravo (Sample)";
    poa1Input.value = "920";
    poa2Input.value = "850";
    ghiInput.value = "710";
    refCellInput.value = "915";
    inverterPowerInput.value = "2350";
    inverterRatedInput.value = "3000";
    cleaningStatusSelect.value = "dirty";
    sensorNotesInput.value = "POA-2 is suspected of having bird droppings or heavy dust accumulation.";
  }

  loadSampleValues();

  resetBtn.addEventListener('click', () => {
    siteNameInput.value = "";
    poa1Input.value = "";
    poa2Input.value = "";
    ghiInput.value = "";
    refCellInput.value = "";
    inverterPowerInput.value = "";
    inverterRatedInput.value = "";
    cleaningStatusSelect.value = "unknown";
    lastCleanInput.value = "";
    sensorNotesInput.value = "";
    notesInput.value = "";
    validationError.style.display = 'none';
    resultPanel.style.display = 'none';
    resultsSummary = null;
  });

  calculateBtn.addEventListener('click', () => {
    validationError.style.display = 'none';

    const poa1 = parseFloat(poa1Input.value);
    const poa2 = parseFloat(poa2Input.value || 0);
    const ghi = parseFloat(ghiInput.value || 0);
    const refCell = parseFloat(refCellInput.value || 0);
    const inverterPower = parseFloat(inverterPowerInput.value || 0);
    const inverterRated = parseFloat(inverterRatedInput.value || 0);
    const cleaningStatus = cleaningStatusSelect.value;

    if (isNaN(poa1) || poa1 <= 0) {
      showError('Please enter a positive POA Sensor 1 value.');
      return;
    }
    if (poa1 > 1600 || poa2 > 1600 || ghi > 1600 || refCell > 1600) {
      showError('Measured irradiance exceeds realistic maximum value of 1600 W/m².');
      return;
    }
    if (poa2 < 0 || ghi < 0 || refCell < 0) {
      showError('Measured values cannot be negative.');
      return;
    }

    // Determine mismatch between POA 1 and POA 2 / Ref Cell
    let activePOA2 = poa2 > 0 ? poa2 : refCell;
    let mismatch = 0;
    let compareSource = poa2 > 0 ? "POA Sensor 2" : "Reference Cell";

    if (activePOA2 > 0) {
      const averagePOA = (poa1 + activePOA2) / 2;
      mismatch = (Math.abs(poa1 - activePOA2) / averagePOA) * 100;
    }

    let highestSensor = "POA Sensor 1";
    let lowestSensor = "POA Sensor 1";
    let highestVal = poa1;
    let lowestVal = poa1;

    if (poa2 > highestVal) { highestSensor = "POA Sensor 2"; highestVal = poa2; }
    if (poa2 > 0 && poa2 < lowestVal) { lowestSensor = "POA Sensor 2"; lowestVal = poa2; }
    if (refCell > highestVal) { highestSensor = "Reference Cell"; highestVal = refCell; }
    if (refCell > 0 && refCell < lowestVal) { lowestSensor = "Reference Cell"; lowestVal = refCell; }

    resMismatch.textContent = activePOA2 > 0 ? `${mismatch.toFixed(2)}% (vs ${compareSource})` : "N/A (requires a second sensor or reference cell)";
    resHighLow.textContent = activePOA2 > 0 ? `${highestSensor} (${highestVal} W/m²) / ${lowestSensor} (${lowestVal} W/m²)` : `POA Sensor 1 (${poa1} W/m²)`;

    // Suspected Soiling Logic
    let soilingSuspected = "No";
    if (cleaningStatus === 'dirty' && mismatch > 4) {
      soilingSuspected = "Yes (Elevated mismatch with dirty status)";
    } else if (mismatch > 6) {
      soilingSuspected = "Yes (Drastic mismatch suggests localized dirty cell)";
    }
    resSoiling.textContent = soilingSuspected;

    // Alignment Issue Logic
    let alignmentSuspected = "No";
    if (mismatch > 8 && sensorNotesInput.value.toLowerCase().includes('tilt')) {
      alignmentSuspected = "Yes (Indicated by sensor notes and mismatch)";
    } else if (mismatch > 10) {
      alignmentSuspected = "Yes (High mismatch indicates structural or tracking deviation)";
    }
    resAlignment.textContent = alignmentSuspected;

    // Recommended Action
    let recommendedAction = "Continue monitoring";
    let statusText = "PASS / NORMAL";
    let badgeClass = "status-normal";

    if (mismatch >= 10) {
      recommendedAction = "IMMEDIATE ACTION REQUIRED: Dispatch field tech to clean, verify tracker mounting alignment, and recalibrate sensors.";
      statusText = "REVIEW REQUIRED";
      badgeClass = "status-critical";
    } else if (mismatch >= 5) {
      recommendedAction = "ELEVATED DRIFT: Clean both sensors and check for localized shading or minor tilt issues.";
      statusText = "WATCH / ELEVATED";
      badgeClass = "status-warning";
    } else if (cleaningStatus === 'dirty') {
      recommendedAction = "CLEANING SCHEDULE: Mismatch is low, but cleaning is scheduled to prevent drift.";
    }

    resAction.textContent = recommendedAction;
    diagnosticStatusBadge.textContent = statusText;
    diagnosticStatusBadge.className = `status-badge-inline ${badgeClass}`;

    resultsSummary = {
      site: siteNameInput.value || 'N/A',
      timestamp: timestampInput.value,
      mismatch: mismatch > 0 ? `${mismatch.toFixed(2)}%` : 'N/A',
      highestSensor: `${highestSensor} (${highestVal} W/m²)`,
      lowestSensor: `${lowestSensor} (${lowestVal} W/m²)`,
      soiling: soilingSuspected,
      alignment: alignmentSuspected,
      action: recommendedAction,
      status: statusText
    };

    resultPanel.style.display = 'block';
    resultPanel.scrollIntoView({ behavior: 'smooth' });
  });

  copyBtn.addEventListener('click', () => {
    if (!resultsSummary) return;
    const text = `Level3Support Irradiance Sensor Cross-Check Result
------------------------------------------------------------
Site: ${resultsSummary.site}
Timestamp: ${resultsSummary.timestamp}
Sensor Mismatch: ${resultsSummary.mismatch}
Highest Reading: ${resultsSummary.highestSensor}
Lowest Reading: ${resultsSummary.lowestSensor}
Soiling Suspected: ${resultsSummary.soiling}
Alignment Suspected: ${resultsSummary.alignment}
Recommended Action: ${resultsSummary.action}
Diagnostic Status: ${resultsSummary.status}
------------------------------------------------------------
Disclaimer: Assisted calibration and screening check. Do not replace formal sensor testing or manufacturer directives.`;
    
    navigator.clipboard.writeText(text).then(() => {
      const origText = copyBtn.innerHTML;
      copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      setTimeout(() => copyBtn.innerHTML = origText, 2000);
    });
  });

  function showError(msg) {
    validationError.textContent = msg;
    validationError.style.display = 'block';
  }
});
