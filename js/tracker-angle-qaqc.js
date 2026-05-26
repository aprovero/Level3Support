/**
 * Tracker Angle / Backtracking QA Checklist
 * Level3Support
 */

document.addEventListener('DOMContentLoaded', () => {
  const siteNameInput = document.getElementById('site-name');
  const trackerRowInput = document.getElementById('tracker-row');
  const timestampInput = document.getElementById('timestamp');
  const toleranceInput = document.getElementById('tolerance');
  const expectedAngleInput = document.getElementById('expected-angle');
  const observedAngleInput = document.getElementById('observed-angle');
  const backtrackingSelect = document.getElementById('backtracking-enabled');
  const windStowSelect = document.getElementById('wind-stow');
  const commStatusSelect = document.getElementById('comm-status');
  const shadingSelect = document.getElementById('shading-observed');
  const controllerInput = document.getElementById('controller-status');
  const notesInput = document.getElementById('notes');

  const calculateBtn = document.getElementById('calculate-btn');
  const resetBtn = document.getElementById('reset-btn');
  const copyBtn = document.getElementById('copy-btn');
  const exportBtn = document.getElementById('export-json-btn');

  const resultPanel = document.getElementById('result-panel');
  const diagnosticStatusBadge = document.getElementById('diagnostic-status');
  const resDeviation = document.getElementById('res-deviation');
  const resStatus = document.getElementById('res-status');
  const resChkCompletion = document.getElementById('res-chk-completion');
  const resChkIncomplete = document.getElementById('res-chk-incomplete');
  const validationError = document.getElementById('validation-error');

  let resultsSummary = null;

  // Set default timestamp
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  timestampInput.value = now.toISOString().slice(0, 16);

  // Load sample values
  function loadSampleValues() {
    expectedAngleInput.value = "38.5";
    observedAngleInput.value = "36.2";
  }

  loadSampleValues();

  resetBtn.addEventListener('click', () => {
    siteNameInput.value = "Solar Field Alpha";
    trackerRowInput.value = "";
    expectedAngleInput.value = "";
    observedAngleInput.value = "";
    toleranceInput.value = "1.5";
    backtrackingSelect.value = "yes";
    windStowSelect.value = "no";
    commStatusSelect.value = "normal";
    shadingSelect.value = "no";
    controllerInput.value = "Auto-Tracking";
    notesInput.value = "";
    
    // Clear check boxes
    document.querySelectorAll('.tracker-chk').forEach(chk => chk.checked = false);

    validationError.style.display = 'none';
    resultPanel.style.display = 'none';
    resultsSummary = null;
  });

  calculateBtn.addEventListener('click', () => {
    validationError.style.display = 'none';

    const expected = parseFloat(expectedAngleInput.value);
    const observed = parseFloat(observedAngleInput.value);
    const tolerance = parseFloat(toleranceInput.value || 1.5);

    if (isNaN(expected) || Math.abs(expected) > 90) {
      showError('Please enter a valid expected angle between -90 and 90 degrees.');
      return;
    }
    if (isNaN(observed) || Math.abs(observed) > 90) {
      showError('Please enter a valid observed angle between -90 and 90 degrees.');
      return;
    }
    if (tolerance < 0) {
      showError('Tolerance cannot be negative.');
      return;
    }

    const deviation = Math.abs(expected - observed);
    resDeviation.textContent = `${deviation.toFixed(2)}°`;

    const isPass = deviation <= tolerance;
    resStatus.textContent = isPass ? `PASS (Within ${tolerance}° tolerance)` : `FAIL (Exceeds ${tolerance}° tolerance)`;
    resStatus.style.color = isPass ? "var(--success-color)" : "var(--error-color)";

    // Checklist completion
    const checkboxes = document.querySelectorAll('.tracker-chk');
    const checkedBoxes = document.querySelectorAll('.tracker-chk:checked');
    const completionPct = (checkedBoxes.length / checkboxes.length) * 100;
    resChkCompletion.textContent = `${completionPct.toFixed(0)}% (${checkedBoxes.length}/${checkboxes.length})`;

    const failedCount = checkboxes.length - checkedBoxes.length;
    resChkIncomplete.textContent = failedCount > 0 ? `${failedCount} items remaining` : "All items completed";

    let badgeClass = "status-normal";
    let statusText = "PASSED";

    if (!isPass) {
      badgeClass = "status-critical";
      statusText = "FAIL / REVIEW";
    } else if (completionPct < 100) {
      badgeClass = "status-warning";
      statusText = "INCOMPLETE";
    }

    diagnosticStatusBadge.textContent = statusText;
    diagnosticStatusBadge.className = `status-badge-inline ${badgeClass}`;

    resultsSummary = {
      site: siteNameInput.value || 'N/A',
      trackerRow: trackerRowInput.value || 'N/A',
      timestamp: timestampInput.value,
      expected: `${expected}°`,
      observed: `${observed}°`,
      deviation: `${deviation.toFixed(2)}°`,
      status: statusText,
      checklistCompletion: `${completionPct.toFixed(0)}%`
    };

    resultPanel.style.display = 'block';
    resultPanel.scrollIntoView({ behavior: 'smooth' });
  });

  copyBtn.addEventListener('click', () => {
    if (!resultsSummary) return;
    const text = `Level3Support Tracker Angle QA Evaluation
------------------------------------------------------------
Site: ${resultsSummary.site}
Tracker/Row: ${resultsSummary.trackerRow}
Timestamp: ${resultsSummary.timestamp}
Expected Angle: ${resultsSummary.expected}
Observed Angle: ${resultsSummary.observed}
Deviation: ${resultsSummary.deviation}
Checklist Completion: ${resultsSummary.checklistCompletion}
QA Status: ${resultsSummary.status}
------------------------------------------------------------
Disclaimer: Field engineering checklist aid. Verify against OEM tracker specifications.`;
    
    navigator.clipboard.writeText(text).then(() => {
      const origText = copyBtn.innerHTML;
      copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      setTimeout(() => copyBtn.innerHTML = origText, 2000);
    });
  });

  exportBtn.addEventListener('click', () => {
    if (!resultsSummary) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resultsSummary, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `tracker_angle_qa_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });

  function showError(msg) {
    validationError.textContent = msg;
    validationError.style.display = 'block';
  }
});
