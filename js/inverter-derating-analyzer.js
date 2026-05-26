/**
 * Inverter Derating Cause Analyzer
 * Level3Support
 */

document.addEventListener('DOMContentLoaded', () => {
  const siteNameInput = document.getElementById('site-name');
  const timestampInput = document.getElementById('timestamp');
  const inverterIdInput = document.getElementById('inverter-id');
  const ratedAcInput = document.getElementById('rated-ac');
  const currentAcInput = document.getElementById('current-ac');
  const availableDcInput = document.getElementById('available-dc');
  const dcVoltageInput = document.getElementById('dc-voltage');
  const dcCurrentInput = document.getElementById('dc-current');
  const acVoltageInput = document.getElementById('ac-voltage');
  const acFrequencyInput = document.getElementById('ac-frequency');
  const powerFactorInput = document.getElementById('power-factor');
  const reactivePowerInput = document.getElementById('reactive-power');
  const ambientTempInput = document.getElementById('ambient-temp');
  const internalTempInput = document.getElementById('internal-temp');
  const ppcLimitActiveSelect = document.getElementById('ppc-limit-active');
  const ppcLimitValInput = document.getElementById('ppc-limit-val');
  const activeAlarmsInput = document.getElementById('active-alarms');
  const notesInput = document.getElementById('notes');

  const calculateBtn = document.getElementById('calculate-btn');
  const resetBtn = document.getElementById('reset-btn');
  const copyBtn = document.getElementById('copy-btn');

  const resultPanel = document.getElementById('result-panel');
  const statusBadge = document.getElementById('diagnostic-status');
  const resOutputPct = document.getElementById('res-output-pct');
  const resDcAvail = document.getElementById('res-dc-avail');
  const resGridCheck = document.getElementById('res-grid-check');
  const resPfCheck = document.getElementById('res-pf-check');
  const resCategory = document.getElementById('res-category');
  const resExplanation = document.getElementById('res-explanation');
  const validationError = document.getElementById('validation-error');

  let resultsSummary = null;

  // Set default timestamp
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  timestampInput.value = now.toISOString().slice(0, 16);

  // Load sample values
  function loadSampleValues() {
    currentAcInput.value = "2050";
    availableDcInput.value = "3350";
    dcVoltageInput.value = "940";
    dcCurrentInput.value = "2250";
    ppcLimitActiveSelect.value = "no";
  }

  loadSampleValues();

  resetBtn.addEventListener('click', () => {
    siteNameInput.value = "";
    inverterIdInput.value = "INV-02";
    ratedAcInput.value = "3200";
    currentAcInput.value = "";
    availableDcInput.value = "";
    dcVoltageInput.value = "";
    dcCurrentInput.value = "";
    acVoltageInput.value = "630";
    acFrequencyInput.value = "60.00";
    powerFactorInput.value = "1.0";
    reactivePowerInput.value = "0";
    ambientTempInput.value = "";
    internalTempInput.value = "";
    ppcLimitActiveSelect.value = "no";
    ppcLimitValInput.value = "";
    activeAlarmsInput.value = "";
    notesInput.value = "";
    validationError.style.display = 'none';
    resultPanel.style.display = 'none';
    resultsSummary = null;
  });

  calculateBtn.addEventListener('click', () => {
    validationError.style.display = 'none';

    const ratedAc = parseFloat(ratedAcInput.value);
    const currentAc = parseFloat(currentAcInput.value);
    const availableDc = parseFloat(availableDcInput.value || 0);
    const dcVoltage = parseFloat(dcVoltageInput.value || 0);
    const dcCurrent = parseFloat(dcCurrentInput.value || 0);
    const acVoltage = parseFloat(acVoltageInput.value);
    const acFrequency = parseFloat(acFrequencyInput.value);
    const powerFactor = parseFloat(powerFactorInput.value || 1.0);
    const reactivePower = parseFloat(reactivePowerInput.value || 0);
    const ambientTemp = parseFloat(ambientTempInput.value || 0);
    const internalTemp = parseFloat(internalTempInput.value || 0);
    const ppcLimitActive = ppcLimitActiveSelect.value;
    const ppcLimitVal = parseFloat(ppcLimitValInput.value || 0);
    const activeAlarms = activeAlarmsInput.value;

    if (isNaN(ratedAc) || ratedAc <= 0) {
      showError('Please enter a positive rated AC power.');
      return;
    }
    if (isNaN(currentAc) || currentAc < 0) {
      showError('Please enter a valid non-negative current AC power output.');
      return;
    }
    if (isNaN(acVoltage) || acVoltage <= 0) {
      showError('Please enter a valid positive AC grid voltage.');
      return;
    }
    if (isNaN(acFrequency) || acFrequency <= 0) {
      showError('Please enter a valid positive grid frequency.');
      return;
    }

    const outputPct = (currentAc / ratedAc) * 100;
    resOutputPct.textContent = `${outputPct.toFixed(1)}% of rated (${currentAc} kW vs ${ratedAc} kW)`;

    // DC Availability
    let calculatedDc = availableDc;
    if (dcVoltage > 0 && dcCurrent > 0) {
      calculatedDc = (dcVoltage * dcCurrent) / 1000;
    }
    resDcAvail.textContent = calculatedDc > 0 ? `${calculatedDc.toFixed(1)} kW dc available` : "N/A (no DC inputs entered)";

    // Grid status check
    let gridFreqStatus = "Normal";
    if (acFrequency >= 60.05) {
      gridFreqStatus = "Overfrequency (High)";
    } else if (acFrequency <= 59.90) {
      gridFreqStatus = "Underfrequency (Low)";
    }
    resGridCheck.textContent = `AC Voltage: ${acVoltage}V, Freq: ${acFrequency}Hz (${gridFreqStatus})`;

    // Reactive / PF priority
    const apparentS = Math.sqrt(Math.pow(currentAc, 2) + Math.pow(reactivePower, 2));
    resPfCheck.textContent = `PF: ${powerFactor}, Apparent Power: ${apparentS.toFixed(1)} kVA`;

    // Derating category decision tree
    let category = "Unknown / Review Required";
    let explanation = "No clear derating criteria met. Output appears consistent with resource or internal control constraints. Please review active alarms.";
    let badgeClass = "status-normal";

    if (activeAlarms.toLowerCase().includes('overtemp') || internalTemp >= 85 || (ambientTemp >= 42 && outputPct < 90)) {
      category = "Thermal Derating";
      explanation = `Highly consistent with temperature-based power curtailment. Internal IGBT temp is elevated (${internalTemp}°C) or ambient is high (${ambientTemp}°C). Check clean filters and cabinet cooling fans.`;
      badgeClass = "status-critical";
    } else if (acFrequency >= 60.05) {
      category = "Grid Frequency Overfrequency Derating (FMOD)";
      explanation = `The grid frequency is elevated at ${acFrequency} Hz. Active frequency-watt curtailment is likely active to stabilize the grid. Verify with regional operator setpoints.`;
      badgeClass = "status-warning";
    } else if (ppcLimitActive === 'yes' || (ppcLimitVal > 0 && Math.abs(currentAc - ppcLimitVal) < ratedAc * 0.02)) {
      category = "PPC / SCADA Curtailment Limit";
      explanation = `Inverter output tracks closely with active Power Plant Controller active power limit or SCADA setpoint command of ${ppcLimitVal} kW.`;
      badgeClass = "status-normal";
    } else if (powerFactor < 0.96 && apparentS >= ratedAc * 0.98) {
      category = "Reactive Power Limitation / Apparent Power Limit";
      explanation = `Inverter is outputting significant reactive power (${reactivePower} kvar) at a low Power factor (${powerFactor}). The apparent power has reached the limit, causing active power capacity reduction.`;
      badgeClass = "status-warning";
    } else if (calculatedDc > currentAc * 1.15 && outputPct < 85) {
      category = "DC Input / Voltage Limitation";
      explanation = `DC power is available (${calculatedDc.toFixed(1)} kW) but AC output is limited to ${currentAc} kW. High DC voltage or inverter internal controller limiting MPPT range could be active.`;
      badgeClass = "status-critical";
    }

    resCategory.textContent = category;
    resExplanation.textContent = explanation;
    statusBadge.textContent = badgeClass === "status-normal" ? "PASS / NORMAL" : "INVESTIGATE / ALARM";
    statusBadge.className = `status-badge-inline ${badgeClass}`;

    resultsSummary = {
      site: siteNameInput.value || 'N/A',
      inverterId: inverterIdInput.value,
      timestamp: timestampInput.value,
      ratedAc: `${ratedAc} kW`,
      currentAc: `${currentAc} kW (${outputPct.toFixed(1)}%)`,
      category: category,
      explanation: explanation,
      status: statusBadge.textContent
    };

    resultPanel.style.display = 'block';
    resultPanel.scrollIntoView({ behavior: 'smooth' });
  });

  copyBtn.addEventListener('click', () => {
    if (!resultsSummary) return;
    const text = `Level3Support Inverter Derating Cause Analysis
------------------------------------------------------------
Site: ${resultsSummary.site}
Inverter ID: ${resultsSummary.inverterId}
Timestamp: ${resultsSummary.timestamp}
Inverter Rated: ${resultsSummary.ratedAc}
Current Power: ${resultsSummary.currentAc}
Suspected Derate: ${resultsSummary.category}
Diagnostic Explanation: ${resultsSummary.explanation}
Status: ${resultsSummary.status}
------------------------------------------------------------
Disclaimer: Assisted field screening tool. Review specific inverter firmware parameters.`;
    
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
