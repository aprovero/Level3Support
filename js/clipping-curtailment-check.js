/**
 * Inverter Clipping / Curtailment Check Tool
 * Level3Support
 */

document.addEventListener('DOMContentLoaded', () => {
  const ratedAcInput = document.getElementById('rated-ac');
  const currentAcInput = document.getElementById('current-ac');
  const availableDcInput = document.getElementById('available-dc');
  const dcVoltageInput = document.getElementById('dc-voltage');
  const dcCurrentInput = document.getElementById('dc-current');
  const irradianceInput = document.getElementById('irradiance');
  const moduleTempInput = document.getElementById('module-temp');
  const ppcLimitInput = document.getElementById('ppc-limit');
  const poiLimitInput = document.getElementById('poi-limit');
  const curtailmentSelect = document.getElementById('curtailment-active');
  const alarmSelect = document.getElementById('alarm-active');
  const siteNameInput = document.getElementById('site-name');
  const timestampInput = document.getElementById('timestamp');
  const inverterIdInput = document.getElementById('inverter-id');
  const notesInput = document.getElementById('notes');

  const calculateBtn = document.getElementById('calculate-btn');
  const resetBtn = document.getElementById('reset-btn');
  const copyBtn = document.getElementById('copy-btn');

  const resultPanel = document.getElementById('result-panel');
  const diagnosticStatusBadge = document.getElementById('diagnostic-status');
  const resAcVsRated = document.getElementById('res-ac-vs-rated');
  const resDcVsAc = document.getElementById('res-dc-vs-ac');
  const resPpcComp = document.getElementById('res-ppc-comp');
  const resCondition = document.getElementById('res-condition');
  const validationError = document.getElementById('validation-error');
  const dcAvailRow = document.getElementById('dc-avail-row');
  const ppcLimitRow = document.getElementById('ppc-limit-row');

  let diagnosticSummary = null;

  // Set default timestamp
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  timestampInput.value = now.toISOString().slice(0, 16);

  // Load sample values
  function loadSampleValues() {
    siteNameInput.value = "Solar Ranch One (Sample)";
    inverterIdInput.value = "INV-04";
    ratedAcInput.value = "3200";
    currentAcInput.value = "3195";
    availableDcInput.value = "3450";
    dcVoltageInput.value = "980";
    dcCurrentInput.value = "3520";
    irradianceInput.value = "980";
    moduleTempInput.value = "48";
    curtailmentSelect.value = "no";
    alarmSelect.value = "no";
  }

  loadSampleValues();

  resetBtn.addEventListener('click', () => {
    siteNameInput.value = "";
    inverterIdInput.value = "INV-01";
    ratedAcInput.value = "3000";
    currentAcInput.value = "";
    availableDcInput.value = "";
    dcVoltageInput.value = "";
    dcCurrentInput.value = "";
    irradianceInput.value = "";
    moduleTempInput.value = "";
    ppcLimitInput.value = "";
    poiLimitInput.value = "";
    curtailmentSelect.value = "no";
    alarmSelect.value = "no";
    notesInput.value = "";
    validationError.style.display = 'none';
    resultPanel.style.display = 'none';
    diagnosticSummary = null;
  });

  calculateBtn.addEventListener('click', () => {
    validationError.style.display = 'none';

    const ratedAc = parseFloat(ratedAcInput.value);
    const currentAc = parseFloat(currentAcInput.value);
    const availableDc = parseFloat(availableDcInput.value || 0);
    const dcVoltage = parseFloat(dcVoltageInput.value || 0);
    const dcCurrent = parseFloat(dcCurrentInput.value || 0);
    const irradiance = parseFloat(irradianceInput.value || 0);
    const ppcLimit = parseFloat(ppcLimitInput.value || 0);
    const curtailmentActive = curtailmentSelect.value;
    const alarmActive = alarmSelect.value;

    if (isNaN(ratedAc) || ratedAc <= 0) {
      showError('Please enter a positive Rated AC Power.');
      return;
    }
    if (isNaN(currentAc) || currentAc < 0) {
      showError('Please enter a valid non-negative Current AC Power.');
      return;
    }
    if (currentAc > ratedAc * 1.2) {
      showError('Current AC Power output cannot exceed 120% of Rated AC power.');
      return;
    }

    const acVsRatedPct = (currentAc / ratedAc) * 100;
    resAcVsRated.textContent = `${acVsRatedPct.toFixed(1)}%`;

    let condition = "Review Required";
    let badgeClass = "status-warning";

    // DC Available vs AC Output logic
    let dcPowerCalc = availableDc;
    if (dcVoltage > 0 && dcCurrent > 0) {
      dcPowerCalc = (dcVoltage * dcCurrent) / 1000; // kW
    }

    if (dcPowerCalc > 0) {
      dcAvailRow.style.display = 'flex';
      const dcVsAcDiff = dcPowerCalc - currentAc;
      resDcVsAc.textContent = `${dcPowerCalc.toFixed(1)} kW dc vs ${currentAc.toFixed(1)} kW ac (+${dcVsAcDiff.toFixed(1)} kW available)`;
    } else {
      dcAvailRow.style.display = 'none';
    }

    if (ppcLimit > 0) {
      ppcLimitRow.style.display = 'flex';
      resPpcComp.textContent = `${currentAc.toFixed(1)} kW ac vs Limit of ${ppcLimit.toFixed(1)} kW ac`;
    } else {
      ppcLimitRow.style.display = 'none';
    }

    // Logic Tree
    if (alarmActive === 'yes') {
      condition = "Alarm / Protection Derating (Review Required)";
      badgeClass = "status-critical";
    } else if (curtailmentActive === 'yes' || (ppcLimit > 0 && Math.abs(currentAc - ppcLimit) < ratedAc * 0.02)) {
      condition = "Consistent with PPC/POI Curtailment or Export Limit";
      badgeClass = "status-normal";
    } else if (acVsRatedPct > 97 && (dcPowerCalc > currentAc || availableDc > ratedAc)) {
      condition = "Consistent with Inverter Clipping";
      badgeClass = "status-normal";
    } else if (dcPowerCalc > currentAc * 1.15 && acVsRatedPct < 90) {
      condition = "Possible Underperformance (Requires Review)";
      badgeClass = "status-critical";
    } else if (irradiance > 600 && acVsRatedPct < 50) {
      condition = "Possible Underperformance / Outage (Requires Review)";
      badgeClass = "status-critical";
    } else {
      condition = "Appears Consistent with Observed Solar Resource";
      badgeClass = "status-normal";
    }

    resCondition.textContent = condition;
    diagnosticStatusBadge.textContent = badgeClass === "status-normal" ? "PASS / NORMAL" : "REVIEW REQUIRED";
    diagnosticStatusBadge.className = `status-badge-inline ${badgeClass}`;

    diagnosticSummary = {
      site: siteNameInput.value || 'N/A',
      timestamp: timestampInput.value,
      inverterId: inverterIdInput.value,
      ratedAc: `${ratedAc} kW`,
      currentAc: `${currentAc} kW (${acVsRatedPct.toFixed(1)}% of rated)`,
      condition: condition,
      status: diagnosticStatusBadge.textContent
    };

    resultPanel.style.display = 'block';
    resultPanel.scrollIntoView({ behavior: 'smooth' });
  });

  copyBtn.addEventListener('click', () => {
    if (!diagnosticSummary) return;
    const text = `Level3Support Inverter Clipping & Curtailment Diagnosis
------------------------------------------------------------
Site: ${diagnosticSummary.site}
Timestamp: ${diagnosticSummary.timestamp}
Inverter ID: ${diagnosticSummary.inverterId}
Rated AC Power: ${diagnosticSummary.ratedAc}
Current AC Power: ${diagnosticSummary.currentAc}
Diagnostic Condition: ${diagnosticSummary.condition}
Diagnostic Status: ${diagnosticSummary.status}
------------------------------------------------------------
Disclaimer: Assisted diagnostic field aid. Always verify actual values and alarm codes against active OEM manuals.`;
    
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
