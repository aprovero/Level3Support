/**
 * BESS Capacity / Energy Test Form — Logic
 * Level3Support
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Inputs
  const siteNameInput = document.getElementById('site-name');
  const projectNameInput = document.getElementById('project-name');
  const bessBlockInput = document.getElementById('bess-block');
  const equipIdInput = document.getElementById('equip-id');
  
  const ratedEnergyInput = document.getElementById('rated-energy');
  const ratedEnergyUnit = document.getElementById('rated-energy-unit');
  const ratedPowerInput = document.getElementById('rated-power');
  const ratedPowerUnit = document.getElementById('rated-power-unit');
  
  const testModeInput = document.getElementById('test-mode');
  const startSocInput = document.getElementById('start-soc');
  const endSocInput = document.getElementById('end-soc');
  const startTimeInput = document.getElementById('start-time');
  const endTimeInput = document.getElementById('end-time');
  
  const measuredChargedInput = document.getElementById('measured-charged');
  const measuredChargedUnit = document.getElementById('measured-charged-unit');
  const measuredDischargedInput = document.getElementById('measured-discharged');
  const measuredDischargedUnit = document.getElementById('measured-discharged-unit');
  
  const avgPowerInput = document.getElementById('avg-power');
  const avgPowerUnit = document.getElementById('avg-power-unit');
  const pcsLimitInput = document.getElementById('pcs-limit');
  const pcsLimitUnit = document.getElementById('pcs-limit-unit');
  const auxLoadInput = document.getElementById('aux-load');
  const auxLoadUnit = document.getElementById('aux-load-unit');
  
  const tempAmbientInput = document.getElementById('temp-ambient');
  const tempBatteryAvgInput = document.getElementById('temp-battery-avg');
  const tempBatteryMaxInput = document.getElementById('temp-battery-max');
  const interruptionsInput = document.getElementById('interruptions');
  const notesInput = document.getElementById('notes');
  
  // Actions
  const calculateBtn = document.getElementById('calculate-btn');
  const resetBtn = document.getElementById('reset-btn');
  const copyBtn = document.getElementById('copy-btn');
  const printBtn = document.getElementById('print-btn');
  const exportBtn = document.getElementById('export-btn');
  const manualVerdictSelect = document.getElementById('manual-verdict');
  
  // Results
  const resultPanel = document.getElementById('result-panel');
  const resStatusBadge = document.getElementById('res-status-badge');
  const resMetaSite = document.getElementById('res-meta-site');
  const resMetaEquip = document.getElementById('res-meta-equip');
  const resMetaDate = document.getElementById('res-meta-date');
  const resRatedEnergy = document.getElementById('res-rated-energy');
  const resDuration = document.getElementById('res-duration');
  const resDeliveredEnergy = document.getElementById('res-delivered-energy');
  const resCapacityPct = document.getElementById('res-capacity-pct');
  const resRteRow = document.getElementById('res-rte-row');
  const resRte = document.getElementById('res-rte');
  const resAvgPower = document.getElementById('res-avg-power');
  const validationError = document.getElementById('validation-error');

  let reportData = null;

  // Initialize dates with May 2026 values
  function loadSampleValues() {
    siteNameInput.value = 'Mojave Oasis Storage Facility';
    projectNameInput.value = 'Block 04 Commissioning';
    bessBlockInput.value = 'Container B-04';
    equipIdInput.value = 'PCS-INV-04B';
    
    ratedEnergyInput.value = '4000';
    ratedEnergyUnit.value = 'kWh';
    ratedPowerInput.value = '1000';
    ratedPowerUnit.value = 'kW';
    
    testModeInput.value = 'RoundTrip';
    startSocInput.value = '100';
    endSocInput.value = '0';
    
    // Set May 25, 2026 dates
    startTimeInput.value = '2026-05-25T08:00';
    endTimeInput.value = '2026-05-25T12:00';
    
    measuredChargedInput.value = '4150';
    measuredChargedUnit.value = 'kWh';
    measuredDischargedInput.value = '3820';
    measuredDischargedUnit.value = 'kWh';
    
    avgPowerInput.value = '980';
    avgPowerUnit.value = 'kW';
    pcsLimitInput.value = '1000';
    pcsLimitUnit.value = 'kW';
    auxLoadInput.value = '22';
    auxLoadUnit.value = 'kW';
    
    tempAmbientInput.value = '28.5';
    tempBatteryAvgInput.value = '31.2';
    tempBatteryMaxInput.value = '35.4';
    interruptionsInput.value = 'None. Continuous test run under full load control.';
    notesInput.value = 'Ambient temperature stable. Cooling systems functional and nominal.';
  }

  loadSampleValues();

  // Reset Form
  resetBtn.addEventListener('click', () => {
    // Clear elements
    const inputs = document.querySelectorAll('.form-section input, .form-section textarea, .form-section select');
    inputs.forEach(input => {
      if (input.id !== 'test-mode' && input.tagName !== 'SELECT') {
        input.value = '';
      }
    });
    
    startSocInput.value = '100';
    endSocInput.value = '0';
    
    validationError.style.display = 'none';
    resultPanel.style.display = 'none';
    reportData = null;
  });

  // Calculate Capacity
  calculateBtn.addEventListener('click', () => {
    validationError.style.display = 'none';

    // Validate Required Inputs
    const site = siteNameInput.value.trim();
    const project = projectNameInput.value.trim();
    const block = bessBlockInput.value.trim();
    const equip = equipIdInput.value.trim();
    
    const ratedEnergy = parseFloat(ratedEnergyInput.value);
    const ratedPower = parseFloat(ratedPowerInput.value);
    const testMode = testModeInput.value;
    const startSoc = parseFloat(startSocInput.value);
    const endSoc = parseFloat(endSocInput.value);
    const startTimeStr = startTimeInput.value;
    const endTimeStr = endTimeInput.value;
    const avgPower = parseFloat(avgPowerInput.value);

    if (!site || !project || !block || !equip) {
      showError('Please populate all Site and Project fields.');
      return;
    }
    if (isNaN(ratedEnergy) || ratedEnergy <= 0) {
      showError('Please enter a positive Rated Energy capacity.');
      return;
    }
    if (isNaN(ratedPower) || ratedPower <= 0) {
      showError('Please enter a positive Rated Power capacity.');
      return;
    }
    if (isNaN(startSoc) || startSoc < 0 || startSoc > 100 || isNaN(endSoc) || endSoc < 0 || endSoc > 100) {
      showError('SOC values must be between 0% and 100%.');
      return;
    }
    if (!startTimeStr || !endTimeStr) {
      showError('Please specify both Start and End Timestamps.');
      return;
    }
    if (isNaN(avgPower) || avgPower <= 0) {
      showError('Please enter a positive average power value.');
      return;
    }

    const start = new Date(startTimeStr);
    const end = new Date(endTimeStr);
    const diffMs = end - start;

    if (diffMs <= 0) {
      showError('End Time must be after Start Time.');
      return;
    }

    // Convert milliseconds to hours
    const durationHours = diffMs / (1000 * 60 * 60);
    const durH = Math.floor(durationHours);
    const durM = Math.round((durationHours - durH) * 60);

    // internal standardization to kWh
    const ratedEnergyKwh = (ratedEnergyUnit.value === 'MWh') ? ratedEnergy * 1000 : ratedEnergy;
    const ratedPowerKw = (ratedPowerUnit.value === 'MW') ? ratedPower * 1000 : ratedPower;
    const avgPowerKw = (avgPowerUnit.value === 'MW') ? avgPower * 1000 : avgPower;

    // Measured Charged Energy Conversion
    const measuredChargedVal = parseFloat(measuredChargedInput.value);
    let chargedEnergyKwh = null;
    if (!isNaN(measuredChargedVal)) {
      chargedEnergyKwh = (measuredChargedUnit.value === 'MWh') ? measuredChargedVal * 1000 : measuredChargedVal;
    }

    // Measured Discharged Energy Conversion
    const measuredDischargedVal = parseFloat(measuredDischargedInput.value);
    let dischargedEnergyKwh = null;
    if (!isNaN(measuredDischargedVal)) {
      dischargedEnergyKwh = (measuredDischargedUnit.value === 'MWh') ? measuredDischargedVal * 1000 : measuredDischargedVal;
    }

    // Determine Delivered Energy
    let deliveredEnergyKwh = 0;
    if (testMode === 'Charge') {
      deliveredEnergyKwh = (chargedEnergyKwh !== null) ? chargedEnergyKwh : (avgPowerKw * durationHours);
    } else if (testMode === 'Discharge' || testMode === 'RoundTrip') {
      deliveredEnergyKwh = (dischargedEnergyKwh !== null) ? dischargedEnergyKwh : (avgPowerKw * durationHours);
    }

    // Calculate Capacity Percentage
    const capacityPct = (deliveredEnergyKwh / ratedEnergyKwh) * 100;

    // Calculate RTE if applicable
    let rtePct = null;
    if (chargedEnergyKwh && dischargedEnergyKwh) {
      rtePct = (dischargedEnergyKwh / chargedEnergyKwh) * 100;
    }

    // Format output strings
    const energyUnitDisplay = ratedEnergyUnit.value;
    const powerUnitDisplay = ratedPowerUnit.value;
    
    const deliveredEnergyOut = (energyUnitDisplay === 'MWh') ? (deliveredEnergyKwh / 1000).toFixed(3) : deliveredEnergyKwh.toFixed(1);
    const ratedEnergyOut = (energyUnitDisplay === 'MWh') ? (ratedEnergyKwh / 1000).toFixed(3) : ratedEnergyKwh.toFixed(1);
    const avgPowerOut = (powerUnitDisplay === 'MW') ? (avgPowerKw / 1000).toFixed(3) : avgPowerKw.toFixed(1);

    // Save report data
    reportData = {
      site: site,
      project: project,
      block: block,
      equipId: equip,
      date: new Date().toLocaleDateString(),
      ratedEnergy: `${ratedEnergyOut} ${energyUnitDisplay}`,
      ratedPower: `${ratedPower.toFixed(1)} ${powerUnitDisplay}`,
      duration: `${durH}h ${durM}m (${durationHours.toFixed(2)} hrs)`,
      deliveredEnergy: `${deliveredEnergyOut} ${energyUnitDisplay}`,
      capacityPct: `${capacityPct.toFixed(2)}%`,
      avgPower: `${avgPowerOut} ${powerUnitDisplay}`,
      testMode: testMode,
      socSweep: `${startSoc}% to ${endSoc}%`,
      tempAmbient: tempAmbientInput.value ? `${tempAmbientInput.value} °C` : 'N/A',
      tempBatteryAvg: tempBatteryAvgInput.value ? `${tempBatteryAvgInput.value} °C` : 'N/A',
      tempBatteryMax: tempBatteryMaxInput.value ? `${tempBatteryMaxInput.value} °C` : 'N/A',
      interruptions: interruptionsInput.value || 'None',
      notes: notesInput.value || 'None',
      verdict: manualVerdictSelect.value
    };

    if (rtePct !== null) {
      reportData.rte = `${rtePct.toFixed(2)}%`;
      resRte.textContent = reportData.rte;
      resRteRow.style.display = 'flex';
    } else {
      resRteRow.style.display = 'none';
    }

    // Render results in UI
    resMetaSite.textContent = `${site} / ${block}`;
    resMetaEquip.textContent = `Equip ID: ${equip} (${project})`;
    resMetaDate.textContent = reportData.date;
    resRatedEnergy.textContent = reportData.ratedEnergy;
    resDuration.textContent = reportData.duration;
    resDeliveredEnergy.textContent = reportData.deliveredEnergy;
    resCapacityPct.textContent = reportData.capacityPct;
    resAvgPower.textContent = reportData.avgPower;

    // Trigger UI Badge updates
    updateVerdictBadge();

    resultPanel.style.display = 'block';
    resultPanel.scrollIntoView({ behavior: 'smooth' });
  });

  // Watch manual verdict selections
  manualVerdictSelect.addEventListener('change', () => {
    if (reportData) {
      reportData.verdict = manualVerdictSelect.value;
      updateVerdictBadge();
    }
  });

  function updateVerdictBadge() {
    const verdict = manualVerdictSelect.value;
    resStatusBadge.textContent = verdict;
    
    if (verdict === 'PASS') {
      resStatusBadge.className = 'status-badge-inline status-normal';
    } else if (verdict === 'FAIL') {
      resStatusBadge.className = 'status-badge-inline status-critical';
    } else {
      resStatusBadge.className = 'status-badge-inline status-warning';
    }
  }

  // Copy Results to Clipboard
  copyBtn.addEventListener('click', () => {
    if (!reportData) return;
    
    let rteLine = '';
    if (reportData.rte) {
      rteLine = `Round-Trip Efficiency (RTE): ${reportData.rte}\n`;
    }

    const text = `LEVEL3SUPPORT BESS ENERGY CAPACITY TEST REPORT
--------------------------------------------------
Site: ${reportData.site}
Block / Container: ${reportData.block}
Equipment ID: ${reportData.equipId}
Project: ${reportData.project}
Report Date: ${reportData.date}
--------------------------------------------------
BESS Rated Energy: ${reportData.ratedEnergy}
BESS Rated Power: ${reportData.ratedPower}
Test Mode: ${reportData.testMode} (${reportData.socSweep})
Test Duration: ${reportData.duration}
Delivered Energy: ${reportData.deliveredEnergy}
Energy Performance Ratio: ${reportData.capacityPct}
${rteLine}Average Power during Test: ${reportData.avgPower}
--------------------------------------------------
Ambient Average Temp: ${reportData.tempAmbient}
Battery Average Temp: ${reportData.tempBatteryAvg}
Battery Maximum Temp: ${reportData.tempBatteryMax}
Test Interruptions: ${reportData.interruptions}
Observations: ${reportData.notes}
--------------------------------------------------
FIELD COMMISSIONING VERDICT: ${reportData.verdict}
--------------------------------------------------
Assisted field tool. Verify against official plant standards.`;

    navigator.clipboard.writeText(text).then(() => {
      const origText = copyBtn.innerHTML;
      copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      setTimeout(() => copyBtn.innerHTML = origText, 2000);
    });
  });

  // Print Report
  printBtn.addEventListener('click', () => {
    window.print();
  });

  // Export JSON Report File
  exportBtn.addEventListener('click', () => {
    if (!reportData) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `bess_capacity_report_${reportData.block.replace(/\s+/g, '_')}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });

  function showError(msg) {
    validationError.textContent = msg;
    validationError.style.display = 'block';
  }
});
