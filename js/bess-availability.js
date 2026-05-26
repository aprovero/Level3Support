/**
 * BESS Availability Calculator
 * Level3Support
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const periodStartInput = document.getElementById('period-start');
  const periodEndInput = document.getElementById('period-end');
  const totalPeriodHoursInput = document.getElementById('total-period-hours');
  const periodLabelInput = document.getElementById('period-label');
  
  const forcedOutageInput = document.getElementById('forced-outage');
  const plannedOutageInput = document.getElementById('planned-outage');
  const excludedOutageInput = document.getElementById('excluded-outage');
  const deratedHoursInput = document.getElementById('derated-hours');
  const deratedCapacityPctInput = document.getElementById('derated-capacity-pct');
  
  const calculateBtn = document.getElementById('calculate-btn');
  const resetBtn = document.getElementById('reset-btn');
  const copyBtn = document.getElementById('copy-btn');
  const exportBtn = document.getElementById('export-btn');
  
  const resultPanel = document.getElementById('result-panel');
  const availStatusBadge = document.getElementById('avail-status-badge');
  const resPeriod = document.getElementById('res-period');
  const resTotalHours = document.getElementById('res-total-hours');
  const resCountedDowntime = document.getElementById('res-counted-downtime');
  const resEquivalentDerated = document.getElementById('res-equivalent-derated');
  const resSimpleAvail = document.getElementById('res-simple-avail');
  const resAdjustedAvail = document.getElementById('res-adjusted-avail');
  const resTotalEquivalent = document.getElementById('res-total-equivalent');
  const validationError = document.getElementById('validation-error');

  let calculationResults = null;

  // Dynamically calculate period hours from start/end dates
  function updateHoursFromDates() {
    const startStr = periodStartInput.value;
    const endStr = periodEndInput.value;
    
    if (startStr && endStr) {
      const start = new Date(startStr);
      const end = new Date(endStr);
      
      // Calculate inclusive days difference
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      const totalHours = diffDays * 24;
      totalPeriodHoursInput.value = totalHours;
    }
  }

  periodStartInput.addEventListener('change', updateHoursFromDates);
  periodEndInput.addEventListener('change', updateHoursFromDates);

  // Load sample values
  function loadSampleValues() {
    // Current month is May 2026
    periodStartInput.value = '2026-05-01';
    periodEndInput.value = '2026-05-31';
    totalPeriodHoursInput.value = '744'; // 31 days * 24 hours
    periodLabelInput.value = 'May 2026 Performance Run (Sample)';
    
    forcedOutageInput.value = '4.5';
    plannedOutageInput.value = '8.0';
    excludedOutageInput.value = '12.0';
    deratedHoursInput.value = '24.0';
    deratedCapacityPctInput.value = '50.0';
  }

  loadSampleValues();

  // Reset
  resetBtn.addEventListener('click', () => {
    periodStartInput.value = '';
    periodEndInput.value = '';
    totalPeriodHoursInput.value = '';
    periodLabelInput.value = 'Monthly Performance Run';
    
    forcedOutageInput.value = '0';
    plannedOutageInput.value = '0';
    excludedOutageInput.value = '0';
    deratedHoursInput.value = '0';
    deratedCapacityPctInput.value = '100';
    
    validationError.style.display = 'none';
    resultPanel.style.display = 'none';
    calculationResults = null;
  });

  // Calculate
  calculateBtn.addEventListener('click', () => {
    validationError.style.display = 'none';

    const totalHours = parseFloat(totalPeriodHoursInput.value);
    const forcedOutage = parseFloat(forcedOutageInput.value || 0);
    const plannedOutage = parseFloat(plannedOutageInput.value || 0);
    const excludedOutage = parseFloat(excludedOutageInput.value || 0);
    const deratedHours = parseFloat(deratedHoursInput.value || 0);
    const deratedCapacity = parseFloat(deratedCapacityPctInput.value || 100);

    if (isNaN(totalHours) || totalHours <= 0) {
      showError('Please enter a positive Total Period Hours value.');
      return;
    }
    if (forcedOutage < 0 || plannedOutage < 0 || excludedOutage < 0 || deratedHours < 0) {
      showError('Downtime/outage hours cannot be negative.');
      return;
    }
    if (deratedCapacity < 0 || deratedCapacity > 100) {
      showError('Derated System Capacity must be between 0% and 100%.');
      return;
    }

    const countedDowntime = forcedOutage + plannedOutage;
    
    if (countedDowntime > totalHours) {
      showError('Counted downtime exceeds total period hours!');
      return;
    }
    if (excludedOutage > totalHours) {
      showError('Excluded outage hours exceed total period hours!');
      return;
    }

    // Formulas
    // Simple Availability %
    const simpleAvailability = ((totalHours - countedDowntime) / totalHours) * 100;
    
    // Exclusion-Adjusted Availability %
    const adjustedTotalHours = totalHours - excludedOutage;
    let adjustedAvailability = 100;
    if (adjustedTotalHours > 0) {
      adjustedAvailability = ((adjustedTotalHours - countedDowntime) / adjustedTotalHours) * 100;
    }

    // Equivalent Derated Hours = EDH * (1 - capacity_pct/100)
    const equivalentDeratedOutage = deratedHours * (1 - (deratedCapacity / 100));
    const totalEquivalentOutage = countedDowntime + equivalentDeratedOutage;

    // Availability status classification
    let statusText = 'Normal';
    let badgeClass = 'status-normal';
    if (simpleAvailability < 95.0) {
      statusText = 'Critical';
      badgeClass = 'status-critical';
    } else if (simpleAvailability < 98.0) {
      statusText = 'Watch';
      badgeClass = 'status-warning';
    }

    calculationResults = {
      period: periodLabelInput.value || 'Availability Run',
      totalPeriodHours: `${totalHours} Hours`,
      forcedOutageHours: `${forcedOutage} Hours`,
      plannedOutageHours: `${plannedOutage} Hours`,
      excludedOutageHours: `${excludedOutage} Hours`,
      deratedHours: `${deratedHours} Hours`,
      deratedCapacity: `${deratedCapacity}%`,
      countedDowntime: `${countedDowntime} Hours`,
      equivalentDeratedOutage: `${equivalentDeratedOutage.toFixed(1)} Hours`,
      simpleAvailability: `${simpleAvailability.toFixed(3)}%`,
      adjustedAvailability: `${adjustedAvailability.toFixed(3)}%`,
      totalEquivalentOutage: `${totalEquivalentOutage.toFixed(1)} Hours`,
      status: statusText
    };

    // Render results
    resPeriod.textContent = calculationResults.period;
    resTotalHours.textContent = `${totalHours} Hours`;
    resCountedDowntime.textContent = `${countedDowntime} Hours`;
    resEquivalentDerated.textContent = `${equivalentDeratedOutage.toFixed(1)} Hours`;
    resSimpleAvail.textContent = `${simpleAvailability.toFixed(3)}%`;
    resAdjustedAvail.textContent = `${adjustedAvailability.toFixed(3)}%`;
    resTotalEquivalent.textContent = `${totalEquivalentOutage.toFixed(1)} Hours`;

    availStatusBadge.textContent = statusText;
    availStatusBadge.className = `status-badge-inline ${badgeClass}`;

    resultPanel.style.display = 'block';
    resultPanel.scrollIntoView({ behavior: 'smooth' });
  });

  // Copy Results
  copyBtn.addEventListener('click', () => {
    if (!calculationResults) return;
    const text = `Level3Support BESS Availability Results
-------------------------------------------
Period: ${calculationResults.period}
Total Period Hours: ${calculationResults.totalPeriodHours}
Forced Outage Hours: ${calculationResults.forcedOutageHours}
Planned Outage Hours: ${calculationResults.plannedOutageHours}
Excluded Outage Hours: ${calculationResults.excludedOutageHours}
Derated Hours: ${calculationResults.deratedHours}
Derated System Capacity: ${calculationResults.deratedCapacity}
Counted Downtime: ${calculationResults.countedDowntime}
Equivalent Derated Outage: ${calculationResults.equivalentDeratedOutage}
Simple Availability: ${calculationResults.simpleAvailability}
Exclusion-Adjusted Availability: ${calculationResults.adjustedAvailability}
Total Equivalent Outage: ${calculationResults.totalEquivalentOutage}
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
    downloadAnchor.setAttribute("download", `bess_availability_results_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });

  function showError(msg) {
    validationError.textContent = msg;
    validationError.style.display = 'block';
  }
});
