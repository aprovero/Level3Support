/**
 * Level3Support — clean-vs-soiled-strings.js
 * Clean vs. Soiled String Comparison Tool Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Set default datetime to now
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('measurement-datetime').value = `${year}-${month}-${day}T${hours}:${minutes}`;

  // Event Listeners
  document.getElementById('add-row-btn').addEventListener('click', () => addSoiledRow());
  document.getElementById('calculate-btn').addEventListener('click', compareStrings);
  document.getElementById('reset-btn').addEventListener('click', resetCalculator);
  document.getElementById('copy-btn').addEventListener('click', copySummary);
  document.getElementById('export-btn').addEventListener('click', exportCSV);

  // Load sample data on start
  loadSampleData();
  updateUnits();
});

function updateUnits() {
  const mType = document.getElementById('measurement-type').value;
  let unit = 'A';
  if (mType === 'current') unit = 'A';
  else if (mType === 'power') unit = 'kW';
  else if (mType === 'pmax') unit = 'W';

  document.getElementById('ref-unit-label').textContent = unit;
}

let rowCounter = 0;

function addSoiledRow(id = '', value = '', modules = 28, location = '', notes = '') {
  const tbody = document.getElementById('soiled-strings-tbody');
  const rowId = `soiled-row-${rowCounter++}`;
  
  const tr = document.createElement('tr');
  tr.id = rowId;
  tr.innerHTML = `
    <td><input type="text" class="row-str-id" value="${id}" placeholder="e.g. STR-02" style="height:36px; padding:6px; margin:0;"></td>
    <td><input type="number" class="row-value" value="${value}" step="any" placeholder="Value" style="height:36px; padding:6px; margin:0;"></td>
    <td><input type="number" class="row-modules" value="${modules}" placeholder="28" style="height:36px; padding:6px; margin:0; text-align:center;"></td>
    <td><input type="text" class="row-location" value="${location}" placeholder="e.g. Row 2 Tracker A" style="height:36px; padding:6px; margin:0;"></td>
    <td><input type="text" class="row-notes" value="${notes}" placeholder="e.g. Mild dust" style="height:36px; padding:6px; margin:0;"></td>
    <td style="text-align:center;">
      <button type="button" class="btn-danger" onclick="removeSoiledRow('${rowId}')" style="margin:0; width:32px; height:32px; min-height:auto; padding:0; display:inline-flex; align-items:center; justify-content:center;"><i class="fas fa-trash-alt"></i></button>
    </td>
  `;
  tbody.appendChild(tr);
}

window.removeSoiledRow = function(rowId) {
  const row = document.getElementById(rowId);
  if (row) row.remove();
};

function loadSampleData() {
  addSoiledRow('STR-02 (Soiled) [Sample]', '8.45', 28, 'Row 1 Tracker B', 'Sample only - moderate dust');
  addSoiledRow('STR-03 (Soiled) [Sample]', '8.21', 28, 'Row 1 Tracker C', 'Sample only - edge buildup observed');
}

// Result references
let lastResults = null;

function compareStrings() {
  const errorDiv = document.getElementById('validation-error');
  const warnDiv = document.getElementById('validation-warning');
  const resultPanel = document.getElementById('result-panel');

  errorDiv.style.display = 'none';
  warnDiv.style.display = 'none';
  resultPanel.style.display = 'none';

  // Read header params
  const projectName = document.getElementById('project-name').value.trim();
  const dateTime = document.getElementById('measurement-datetime').value;
  const inverterId = document.getElementById('inverter-id').value.trim();
  const mpptId = document.getElementById('mppt-id').value.trim();
  const irradiance = document.getElementById('ambient-irradiance').value ? parseFloat(document.getElementById('ambient-irradiance').value) : null;
  const temp = document.getElementById('module-temp').value ? parseFloat(document.getElementById('module-temp').value) : null;
  const mType = document.getElementById('measurement-type').value;
  const devLimit = parseFloat(document.getElementById('dev-threshold').value) || 5.0;
  const minIrr = parseFloat(document.getElementById('min-irr-threshold').value) || 400;

  // Clean Reference details
  const refStrId = document.getElementById('ref-string-id').value.trim();
  const refCleanVal = parseFloat(document.getElementById('ref-clean-val').value);
  const refModules = parseInt(document.getElementById('ref-module-count').value);
  const refNotes = document.getElementById('ref-notes').value.trim();

  // Basic Reference validation
  if (!refStrId) {
    showError('Reference String ID is required.');
    return;
  }
  if (isNaN(refCleanVal) || refCleanVal <= 0) {
    showError('Reference Value after cleaning must be greater than 0.');
    return;
  }
  if (isNaN(refModules) || refModules <= 0) {
    showError('Reference Module Count must be greater than 0.');
    return;
  }

  // Irradiance warning check
  if (irradiance !== null && irradiance < minIrr) {
    warnDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Low irradiance (${irradiance} W/m²) is below configured minimum (${minIrr} W/m²). This may reduce comparison reliability.`;
    warnDiv.style.display = 'block';
  }

  // Parse table rows
  const tbody = document.getElementById('soiled-strings-tbody');
  const rows = tbody.querySelectorAll('tr');
  if (rows.length === 0) {
    showError('At least one uncleaned soiled string row must be added.');
    return;
  }

  let totalLoss = 0;
  let validStringsCount = 0;
  const stringMetrics = [];
  let moduleCountMismatch = false;

  let unit = 'A';
  if (mType === 'current') unit = 'A';
  else if (mType === 'power') unit = 'kW';
  else if (mType === 'pmax') unit = 'W';

  for (let row of rows) {
    const sId = row.querySelector('.row-str-id').value.trim();
    const sVal = parseFloat(row.querySelector('.row-value').value);
    const sModules = parseInt(row.querySelector('.row-modules').value);
    const sLoc = row.querySelector('.row-location').value.trim();
    const sNotes = row.querySelector('.row-notes').value.trim();

    if (!sId) {
      showError('All string rows must have a String ID.');
      return;
    }
    if (isNaN(sVal) || sVal < 0) {
      showError(`String ${sId} has an invalid measured value.`);
      return;
    }
    if (isNaN(sModules) || sModules <= 0) {
      showError(`String ${sId} has an invalid module count.`);
      return;
    }

    if (sModules !== refModules) {
      moduleCountMismatch = true;
    }

    // Normalization formula
    const normalizedSoiled = sVal * (refModules / sModules);
    const soilingLossPercent = (1 - (normalizedSoiled / refCleanVal)) * 100;

    const isFlagged = soilingLossPercent > devLimit;

    stringMetrics.push({
      stringId: sId,
      measuredValue: sVal,
      modulesCount: sModules,
      normalizedValue: normalizedSoiled,
      soilingLossPercent: soilingLossPercent,
      location: sLoc,
      notes: sNotes,
      isFlagged: isFlagged
    });

    totalLoss += soilingLossPercent;
    validStringsCount++;
  }

  if (moduleCountMismatch) {
    const existingHTML = warnDiv.style.display === 'block' ? warnDiv.innerHTML + '<br>' : '';
    warnDiv.innerHTML = existingHTML + `<i class="fas fa-exclamation-triangle"></i> Module count mismatch detected. Values have been normalized relative to reference module count (${refModules}) before comparing.`;
    warnDiv.style.display = 'block';
  }

  // Calculate overall average
  const avgLoss = totalLoss / validStringsCount;

  // Display results
  document.getElementById('res-ref-val').textContent = `${refCleanVal.toFixed(2)} ${unit}`;
  
  // Calculate average soiled (unnormalized simply for reference representation)
  const totalMeasuredSoiled = stringMetrics.reduce((sum, s) => sum + s.measuredValue, 0);
  const avgMeasuredSoiled = totalMeasuredSoiled / validStringsCount;
  document.getElementById('res-avg-soiled').textContent = `${avgMeasuredSoiled.toFixed(2)} ${unit}`;

  const resAvgLossText = document.getElementById('res-avg-loss');
  resAvgLossText.textContent = `${avgLoss.toFixed(2)}%`;

  // Render detail rows
  const detailsTbody = document.getElementById('results-details-tbody');
  detailsTbody.innerHTML = '';

  stringMetrics.forEach(str => {
    const tr = document.createElement('tr');
    if (str.isFlagged) {
      tr.className = 'row-flagged';
    }
    tr.innerHTML = `
      <td>${str.stringId}</td>
      <td>${str.measuredValue.toFixed(2)} ${unit}</td>
      <td>${str.normalizedValue.toFixed(2)} ${unit}</td>
      <td>${str.soilingLossPercent.toFixed(2)}%</td>
      <td>
        ${str.isFlagged ? 
          `<span style="background:#ef4444; color:white; padding:2px 6px; border-radius:4px; font-size:0.75rem;">FLAGGED</span>` : 
          `<span style="background:#10b981; color:white; padding:2px 6px; border-radius:4px; font-size:0.75rem;">PASS</span>`}
      </td>
    `;
    detailsTbody.appendChild(tr);
  });

  resultPanel.style.display = 'block';

  // Save state for actions
  lastResults = {
    projectName,
    dateTime,
    inverterId,
    mpptId,
    irradiance,
    temp,
    measurementType: mType,
    unit,
    devLimit,
    minIrr,
    refString: {
      stringId: refStrId,
      cleanValue: refCleanVal,
      modulesCount: refModules,
      notes: refNotes
    },
    strings: stringMetrics,
    averageLoss: avgLoss
  };
}

function showError(msg) {
  const errorDiv = document.getElementById('validation-error');
  errorDiv.textContent = msg;
  errorDiv.style.display = 'block';
}

function resetCalculator() {
  document.getElementById('project-name').value = '';
  document.getElementById('inverter-id').value = '';
  document.getElementById('mppt-id').value = '';
  document.getElementById('ambient-irradiance').value = '';
  document.getElementById('module-temp').value = '';
  document.getElementById('ref-string-id').value = '';
  document.getElementById('ref-clean-val').value = '';
  document.getElementById('ref-module-count').value = '28';
  document.getElementById('ref-notes').value = '';
  document.getElementById('dev-threshold').value = '5.0';
  document.getElementById('min-irr-threshold').value = '400';

  document.getElementById('soiled-strings-tbody').innerHTML = '';
  loadSampleData();

  document.getElementById('validation-error').style.display = 'none';
  document.getElementById('validation-warning').style.display = 'none';
  document.getElementById('result-panel').style.display = 'none';
  lastResults = null;
}

function copySummary() {
  if (!lastResults) return;

  let summaryText = `[Level3Support Clean vs Soiled String Comparison]
Site / Project: ${lastResults.projectName || 'N/A'}
Inverter: ${lastResults.inverterId || 'N/A'} | MPPT: ${lastResults.mpptId || 'N/A'}
Date & Time: ${lastResults.dateTime}
----------------------------------------
Ref String Clean Value: ${lastResults.refString.cleanValue} ${lastResults.unit} (ID: ${lastResults.refString.stringId}, Modules: ${lastResults.refString.modulesCount})
Average Soiled Value: ${document.getElementById('res-avg-soiled').textContent}
AVERAGE SOILING LOSS PERCENTAGE: ${lastResults.averageLoss.toFixed(2)}%
----------------------------------------
Flagged Strings (Exceeding ${lastResults.devLimit}% threshold):
`;

  const flagged = lastResults.strings.filter(s => s.isFlagged);
  if (flagged.length > 0) {
    flagged.forEach(f => {
      summaryText += `- ${f.stringId}: Loss = ${f.soilingLossPercent.toFixed(2)}% (Measured: ${f.measuredValue} ${lastResults.unit})\n`;
    });
  } else {
    summaryText += 'None. All soiled strings within acceptable tolerance limits.\n';
  }

  navigator.clipboard.writeText(summaryText)
    .then(() => alert('Summary copied to clipboard!'))
    .catch(err => console.error('Failed to copy text', err));
}

function exportCSV() {
  if (!lastResults) return;

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Category,String ID,Measured Value,Modules Count,Normalized Value,Soiling Loss %,Flagged,Location,Notes\n";

  // Reference string row
  csvContent += `Reference,${lastResults.refString.stringId},${lastResults.refString.cleanValue},${lastResults.refString.modulesCount},${lastResults.refString.cleanValue},0.0,No,,${lastResults.refString.notes}\n`;

  // Soiled string rows
  lastResults.strings.forEach(s => {
    csvContent += `Soiled,${s.stringId},${s.measuredValue},${s.modulesCount},${s.normalizedValue.toFixed(4)},${s.soilingLossPercent.toFixed(2)},${s.isFlagged ? 'Yes' : 'No'},"${s.location}","${s.notes}"\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", encodedUri);
  downloadAnchor.setAttribute("download", `clean_vs_soiled_comparison_${lastResults.projectName || 'export'}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
