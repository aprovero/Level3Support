/**
 * Battery Temperature Spread Analyzer JS
 * Level3Support
 */

document.addEventListener('DOMContentLoaded', () => {
  const containerIdInput = document.getElementById('container-id');
  const ambientTempInput = document.getElementById('ambient-temp');
  const hvacStatusSelect = document.getElementById('hvac-status');
  const warnThresholdInput = document.getElementById('warn-threshold');

  const rackIdInput = document.getElementById('rack-id');
  const tempAvgInput = document.getElementById('temp-avg');
  const tempMaxInput = document.getElementById('temp-max');
  const tempMinInput = document.getElementById('temp-min');

  const addBtn = document.getElementById('add-btn');
  const copyBtn = document.getElementById('copy-btn');
  const exportCsvBtn = document.getElementById('export-csv-btn');
  const tempTbody = document.getElementById('temp-tbody');
  const resultPanel = document.getElementById('result-panel');
  const statusBadge = document.getElementById('diagnostic-status');
  const resOverallMax = document.getElementById('res-overall-max');
  const resOverallMin = document.getElementById('res-overall-min');
  const resOverallSpread = document.getElementById('res-overall-spread');
  const resSuggestedAction = document.getElementById('res-suggested-action');
  const validationError = document.getElementById('validation-error');

  let loggedTemps = [];

  // Load saved temps
  function loadTemps() {
    const saved = localStorage.getItem('l3s_bess_temps');
    if (saved) {
      loggedTemps = JSON.parse(saved);
    } else {
      // Sample data
      loggedTemps = [
        { id: "RACK-01", avg: 31.2, max: 33.4, min: 29.8 },
        { id: "RACK-02", avg: 32.5, max: 34.8, min: 30.1 },
        { id: "RACK-03", avg: 36.8, max: 39.5, min: 34.2 },
        { id: "RACK-04", avg: 30.5, max: 32.1, min: 28.9 }
      ];
      saveTemps();
    }
    renderTemps();
    recalculateSpread();
  }

  function saveTemps() {
    localStorage.setItem('l3s_bess_temps', JSON.stringify(loggedTemps));
  }

  addBtn.addEventListener('click', () => {
    validationError.style.display = 'none';

    const id = rackIdInput.value.trim();
    const avg = parseFloat(tempAvgInput.value);
    const maxVal = parseFloat(tempMaxInput.value || avg);
    const minVal = parseFloat(tempMinInput.value || avg);

    if (!id) {
      showError('Please enter a Rack ID.');
      return;
    }
    if (isNaN(avg) || avg < -10 || avg > 85) {
      showError('Average temperature must be within realistic BESS limits (-10 to 85°C).');
      return;
    }
    if (maxVal < minVal) {
      showError('Maximum temperature cannot be less than Minimum temperature.');
      return;
    }

    const newTemp = { id, avg, max: maxVal, min: minVal };
    loggedTemps.push(newTemp);
    saveTemps();
    renderTemps();
    recalculateSpread();

    // Reset inputs
    rackIdInput.value = `RACK-${(loggedTemps.length + 1).toString().padStart(2, '0')}`;
    tempAvgInput.value = "";
    tempMaxInput.value = "";
    tempMinInput.value = "";
  });

  function renderTemps() {
    tempTbody.innerHTML = '';

    loggedTemps.forEach((t, idx) => {
      const spread = t.max - t.min;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 600;">${t.id}</td>
        <td>${t.avg.toFixed(1)}°C</td>
        <td>${t.max.toFixed(1)}°C</td>
        <td>${t.min.toFixed(1)}°C</td>
        <td>${spread.toFixed(1)}°C</td>
        <td>
          <button onclick="deleteTemp(${idx})" class="btn-danger" style="margin-top: 0; min-height: auto; width: 28px; height: 28px; padding: 0;"><i class="fas fa-trash" style="font-size: 0.8rem;"></i></button>
        </td>
      `;

      tempTbody.appendChild(tr);
    });
  }

  window.deleteTemp = (idx) => {
    if (confirm("Delete this temperature log entry?")) {
      loggedTemps.splice(idx, 1);
      saveTemps();
      renderTemps();
      recalculateSpread();
    }
  };

  warnThresholdInput.addEventListener('input', recalculateSpread);

  function recalculateSpread() {
    if (loggedTemps.length === 0) {
      resultPanel.style.display = 'none';
      return;
    }

    const warnThreshold = parseFloat(warnThresholdInput.value || 5.0);

    let overallMax = -100;
    let overallMin = 100;
    let maxId = "";
    let minId = "";

    loggedTemps.forEach(t => {
      if (t.max > overallMax) { overallMax = t.max; maxId = t.id; }
      if (t.min < overallMin) { overallMin = t.min; minId = t.id; }
    });

    const spread = overallMax - overallMin;

    resOverallMax.textContent = `${overallMax.toFixed(1)}°C (${maxId})`;
    resOverallMin.textContent = `${overallMin.toFixed(1)}°C (${minId})`;
    resOverallSpread.textContent = `${spread.toFixed(1)}°C`;

    let suggestedAction = "Thermal spread normal. Check HVAC status routinely.";
    let condition = "Normal";
    let badgeClass = "status-normal";

    if (spread >= warnThreshold + 3) {
      suggestedAction = `IMMEDIATE INSPECTION REQUIRED: Spread is critical at ${spread.toFixed(1)}°C. Check HVAC airflow, rack fans, blocked vents, and review BMS alarms.`;
      condition = "Investigate / Critical";
      badgeClass = "status-critical";
    } else if (spread >= warnThreshold) {
      suggestedAction = `ELEVATED THERMAL SPREAD: Check HVAC air filters, fan speed settings, and verify temp sensors are not out of calibration.`;
      condition = "Watch / Elevated";
      badgeClass = "status-warning";
    } else if (hvacStatusSelect.value === 'Alarm') {
      suggestedAction = `HVAC FAULT STATE: Repair HVAC immediately to prevent cell high-temp degradation.`;
      condition = "HVAC Fault";
      badgeClass = "status-warning";
    }

    resSuggestedAction.textContent = suggestedAction;
    statusBadge.textContent = condition.toUpperCase();
    statusBadge.className = `status-badge-inline ${badgeClass}`;

    resultPanel.style.display = 'block';
  }

  copyBtn.addEventListener('click', () => {
    if (loggedTemps.length === 0) return;
    const text = `Level3Support BESS Temperature Spread Analysis Report
------------------------------------------------------------
Container ID: ${containerIdInput.value || 'N/A'}
Ambient Temp: ${ambientTempInput.value || 'N/A'}°C
HVAC Status: ${hvacStatusSelect.value}
Overall Max Temp: ${resOverallMax.textContent}
Overall Min Temp: ${resOverallMin.textContent}
Overall Spread: ${resOverallSpread.textContent}
Suggested Action: ${resSuggestedAction.textContent}
Evaluation Status: ${statusBadge.textContent}
------------------------------------------------------------
Disclaimer: Field thermal screening tool. Review specific BMS logs.`;
    
    navigator.clipboard.writeText(text).then(() => {
      const origText = copyBtn.innerHTML;
      copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      setTimeout(() => copyBtn.innerHTML = origText, 2000);
    });
  });

  exportCsvBtn.addEventListener('click', () => {
    if (loggedTemps.length === 0) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Rack ID,Avg Temp °C,Max Temp °C,Min Temp °C\r\n";

    loggedTemps.forEach(t => {
      csvContent += `${t.id},${t.avg},${t.max},${t.min}\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bess_temp_spread_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  });

  function showError(msg) {
    validationError.textContent = msg;
    validationError.style.display = 'block';
  }

  loadTemps();
});
