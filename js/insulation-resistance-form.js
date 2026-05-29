/**
 * insulation-resistance-form.js
 * Full form builder for the Insulation Resistance Test Form
 * Part of the Level3Support Electrical Test Forms SPA
 * © 2026 Level3Support
 */

(function () {
  'use strict';

  // ─── Unit conversion helpers ─────────────────────────────────────────────────
  const UNIT_TO_MOHM = { 'kΩ': 0.001, 'MΩ': 1, 'GΩ': 1000, 'TΩ': 1000000 };

  function toMOhm(value, unit) {
    const v = parseFloat(value);
    if (isNaN(v)) return null;
    return v * (UNIT_TO_MOHM[unit] || 1);
  }

  // ─── ID counter for unique IDs ────────────────────────────────────────────────
  let irRowCount = 0;

  // ─── Main Builder ─────────────────────────────────────────────────────────────
  function insulationResistanceFormBuilder() {
    const root = document.getElementById('form-root');
    if (!root) return;
    root.innerHTML = '';

    // Inject warning box BEFORE form (template guide §3: .warning-box)
    root.insertAdjacentHTML('beforeend', buildSafetyWarning());

    const form = document.createElement('form');
    form.id = 'ir-form';
    form.noValidate = true;

    form.innerHTML =
      buildSection1() +
      buildSection2() +
      buildSection3() +
      buildSection4() +
      buildSection5() +
      buildSection6AcceptanceCriteria() +
      buildSummaryPanel() +
      buildSection8Notes() +
      buildSection9Signoff();

    root.appendChild(form);

    // Inject calculations & assumptions box AFTER form (template guide §4: .assumptions-box)
    const assumptionsBox = document.createElement('div');
    assumptionsBox.className = 'assumptions-box';
    assumptionsBox.innerHTML = `
      <div class="assumptions-title"><i class="fas fa-calculator"></i> Insulation Resistance Standards & Reference Guidelines</div>
      <ul class="assumptions-list">
        <li><strong>IEEE Std 43:</strong> Recommended Practice for Testing Insulation Resistance of Rotating Machinery. Outlines test voltages and minimum insulation resistance thresholds.</li>
        <li><strong>ANSI/NETA MTS-2023:</strong> Table 100.1 specifies nominal test voltage (e.g. 1000V DC for 480V systems, 2500V DC or 5000V DC for medium voltage up to 15kV) and minimum insulation thresholds.</li>
        <li><strong>Temperature Correction:</strong> Readings should be corrected to a standard reference of 20°C using standard temperature correction coefficients.</li>
      </ul>
    `;
    root.appendChild(assumptionsBox);

    // Wire up dynamic table
    document.getElementById('ir-add-row').addEventListener('click', addTestRow);
    document.getElementById('ir-tbody').addEventListener('input', reEvaluateAll);
    document.getElementById('ir-tbody').addEventListener('change', reEvaluateAll);
    document.getElementById('ir-min-value').addEventListener('input', reEvaluateAll);
    document.getElementById('ir-min-unit').addEventListener('change', reEvaluateAll);

    // Add default rows
    const defaultRows = [
      'Positive to Ground',
      'Negative to Ground',
      'Positive to Negative',
      'String to Ground',
      'Feeder to Ground'
    ];
    defaultRows.forEach(label => addTestRow(null, label));
  }

  // ─── Section builders ─────────────────────────────────────────────────────────

  function buildSafetyWarning() {
    return `
    <div class="warning-box print-hide">
      <i class="fas fa-exclamation-triangle"></i>
      <div>
        <div class="warning-title">⚠ Safety Warning — High Voltage Testing</div>
        <p style="margin:0; font-size:0.85rem; line-height:1.55;">Insulation resistance testing applies high DC voltage. Confirm the equipment is de-energized, isolated, discharged, and safe to test before connecting the instrument. Sensitive electronics, surge protection devices, meters, communication equipment, inverters, optimizers, and BMS components may be damaged if tested incorrectly. Always follow the OEM manual, approved test procedure, LOTO requirements, and site safety rules.</p>
      </div>
    </div>`;
  }

  function buildSection1() {
    return `
    <div class="form-section" style="background:var(--background-dark);">
      <h3 class="section-h3"><i class="fas fa-file-alt" style="color:var(--primary-color)"></i> 1. Header / Report Information</h3>
      <div class="input-row">
        <div class="input-group"><label for="ir-report-id">Report ID</label><input type="text" id="ir-report-id" placeholder="e.g. IR-2026-001"></div>
        <div class="input-group"><label for="ir-project-name">Project Name</label><input type="text" id="ir-project-name" placeholder="e.g. Red Mesa Solar"></div>
        <div class="input-group"><label for="ir-site-name">Site Name</label><input type="text" id="ir-site-name" placeholder="e.g. Substation A"></div>
        <div class="input-group"><label for="ir-customer">Customer</label><input type="text" id="ir-customer" placeholder="Customer / Owner"></div>
      </div>
      <div class="input-row">
        <div class="input-group"><label for="ir-location">Location</label><input type="text" id="ir-location" placeholder="GPS or description"></div>
        <div class="input-group"><label for="ir-date">Date</label><input type="date" id="ir-date"></div>
        <div class="input-group"><label for="ir-start-time">Test Start Time</label><input type="time" id="ir-start-time"></div>
        <div class="input-group"><label for="ir-end-time">Test End Time</label><input type="time" id="ir-end-time"></div>
      </div>
      <div class="input-row">
        <div class="input-group"><label for="ir-tested-by">Tested By</label><input type="text" id="ir-tested-by" placeholder="Technician name"></div>
        <div class="input-group"><label for="ir-company">Company</label><input type="text" id="ir-company" placeholder="Company / contractor"></div>
        <div class="input-group"><label for="ir-witness">Witness / Client Rep.</label><input type="text" id="ir-witness" placeholder="Name"></div>
        <div class="input-group"><label for="ir-work-order">Work Order / Ticket #</label><input type="text" id="ir-work-order" placeholder="WO or ticket number"></div>
      </div>
      <div class="input-row">
        <div class="input-group"><label for="ir-drawing-ref">Drawing Reference</label><input type="text" id="ir-drawing-ref" placeholder="Drawing number"></div>
        <div class="input-group"><label for="ir-eq-tag">Equipment Tag</label><input type="text" id="ir-eq-tag" placeholder="Tag / label"></div>
        <div class="input-group"><label for="ir-area">Area / Block / Feeder</label><input type="text" id="ir-area" placeholder="e.g. Block 3, Inverter 7"></div>
      </div>
    </div>`;
  }

  function buildSection2() {
    return `
    <div class="form-section" style="margin-top:20px;background:var(--background-dark);">
      <h3 class="section-h3"><i class="fas fa-plug" style="color:var(--primary-color)"></i> 2. Equipment Under Test</h3>
      <div class="input-row">
        <div class="input-group">
          <label for="ir-eq-type">Equipment Type</label>
          <select id="ir-eq-type">
            <option value="">— Select —</option>
            <option>PV string</option>
            <option>PV combiner box</option>
            <option>DC feeder</option>
            <option>AC feeder</option>
            <option>Inverter</option>
            <option>Transformer</option>
            <option>Motor</option>
            <option>Switchgear</option>
            <option>Cable</option>
            <option>Battery rack / BESS auxiliary circuit</option>
            <option>Other</option>
          </select>
        </div>
        <div class="input-group"><label for="ir-eq-id">Equipment ID / Tag</label><input type="text" id="ir-eq-id" placeholder="e.g. CB-03, STR-12"></div>
        <div class="input-group"><label for="ir-manufacturer">Manufacturer</label><input type="text" id="ir-manufacturer" placeholder="e.g. Southwire"></div>
        <div class="input-group"><label for="ir-model">Model</label><input type="text" id="ir-model" placeholder="Model number"></div>
      </div>
      <div class="input-row">
        <div class="input-group"><label for="ir-serial">Serial Number</label><input type="text" id="ir-serial" placeholder="S/N"></div>
        <div class="input-group"><label for="ir-rated-voltage">Rated Voltage</label><input type="text" id="ir-rated-voltage" placeholder="e.g. 1500 VDC"></div>
        <div class="input-group">
          <label for="ir-circuit-voltage">Circuit Voltage</label>
          <select id="ir-circuit-voltage">
            <option value="">— Select —</option>
            <option>250 V</option><option>600 V</option><option>1000 V</option><option>1500 V</option>
            <option>5 kV</option><option>15 kV</option><option>Other</option>
          </select>
        </div>
        <div class="input-group">
          <label for="ir-circuit-type">Circuit Type</label>
          <select id="ir-circuit-type">
            <option value="">— Select —</option>
            <option>DC</option><option>Single-phase AC</option><option>Three-phase AC</option>
            <option>Control circuit</option><option>Communication / low voltage</option><option>Other</option>
          </select>
        </div>
      </div>
      <div class="input-row">
        <div class="input-group">
          <label for="ir-system-status">System Status</label>
          <select id="ir-system-status">
            <option value="">— Select —</option>
            <option>De-energized</option><option>Isolated</option><option>Grounded</option>
            <option>Disconnected from sensitive electronics</option><option>Other</option>
          </select>
        </div>
      </div>
      <div style="margin-top:10px">
        <div style="font-size:0.82rem;font-weight:700;color:var(--text-secondary);margin-bottom:8px;text-transform:uppercase;">Pre-test Safety Checkboxes</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:4px;">
          ${[
            ['ir-cb-loto', 'LOTO applied'],
            ['ir-cb-zero-energy', 'Zero energy verified'],
            ['ir-cb-spd', 'SPD disconnected or protected if required'],
            ['ir-cb-inverter-iso', 'Inverter / electronics isolated if required'],
            ['ir-cb-barricade', 'Test area barricaded'],
            ['ir-cb-ppe', 'PPE verified'],
            ['ir-cb-leads', 'Test leads inspected']
          ].map(([id, label]) => `<div class="cb-row"><input type="checkbox" id="${id}"><label for="${id}">${label}</label></div>`).join('')}
        </div>
      </div>
    </div>`;
  }

  function buildSection3() {
    return `
    <div class="form-section" style="margin-top:20px;background:var(--background-dark);">
      <h3 class="section-h3"><i class="fas fa-microchip" style="color:var(--primary-color)"></i> 3. Test Instrument Information</h3>
      <div class="input-row">
        <div class="input-group"><label for="ir-inst-mfg">Instrument Manufacturer</label><input type="text" id="ir-inst-mfg" placeholder="e.g. Fluke, Megger, Hioki"></div>
        <div class="input-group"><label for="ir-inst-model">Instrument Model</label><input type="text" id="ir-inst-model" placeholder="e.g. Fluke 1587 FC"></div>
        <div class="input-group"><label for="ir-inst-serial">Serial Number</label><input type="text" id="ir-inst-serial" placeholder="S/N"></div>
      </div>
      <div class="input-row">
        <div class="input-group"><label for="ir-cal-date">Calibration Date</label><input type="date" id="ir-cal-date"></div>
        <div class="input-group"><label for="ir-cal-due">Calibration Due Date</label><input type="date" id="ir-cal-due"></div>
        <div class="input-group">
          <label for="ir-test-voltage-sel">Test Voltage Selected</label>
          <select id="ir-test-voltage-sel">
            <option value="">— Select —</option>
            <option>250 VDC</option><option>500 VDC</option><option>1000 VDC</option>
            <option>2500 VDC</option><option>5000 VDC</option><option>Other</option>
          </select>
        </div>
        <div class="input-group">
          <label for="ir-test-duration-sel">Test Duration</label>
          <select id="ir-test-duration-sel">
            <option value="">— Select —</option>
            <option>30 seconds</option><option>60 seconds</option><option>1 minute</option>
            <option>10 minutes</option><option>Other</option>
          </select>
        </div>
      </div>
      <div class="input-row">
        <div class="input-group">
          <label for="ir-guard-terminal">Guard Terminal Used?</label>
          <select id="ir-guard-terminal">
            <option value="">— Select —</option>
            <option>Yes</option><option>No</option><option>N/A</option>
          </select>
        </div>
      </div>
    </div>`;
  }

  function buildSection4() {
    return `
    <div class="form-section" style="margin-top:20px;background:var(--background-dark);">
      <h3 class="section-h3"><i class="fas fa-cloud-sun" style="color:var(--primary-color)"></i> 4. Environmental Conditions</h3>
      <div class="input-row">
        <div class="input-group"><label for="ir-amb-temp">Ambient Temperature (°C)</label><input type="number" id="ir-amb-temp" placeholder="e.g. 28" step="any"></div>
        <div class="input-group"><label for="ir-humidity">Relative Humidity (%)</label><input type="number" id="ir-humidity" placeholder="e.g. 65" step="any" min="0" max="100"></div>
        <div class="input-group">
          <label for="ir-weather">Weather</label>
          <select id="ir-weather">
            <option value="">— Select —</option>
            <option>Clear</option><option>Cloudy</option><option>Rain</option>
            <option>High humidity</option><option>Dusty</option><option>Other</option>
          </select>
        </div>
        <div class="input-group"><label for="ir-eq-temp">Equipment Temperature (°C)</label><input type="number" id="ir-eq-temp" placeholder="e.g. 35" step="any"></div>
      </div>
      <div class="input-row">
        <div class="input-group">
          <label for="ir-surface-cond">Surface Condition</label>
          <select id="ir-surface-cond">
            <option value="">— Select —</option>
            <option>Dry</option><option>Damp</option><option>Wet</option>
            <option>Contaminated</option><option>Clean</option><option>Other</option>
          </select>
        </div>
        <div class="input-group" style="grid-column:span 3">
          <label for="ir-env-notes">Notes on Environmental Conditions</label>
          <input type="text" id="ir-env-notes" placeholder="Additional environmental notes">
        </div>
      </div>
    </div>`;
  }

  function buildSection6AcceptanceCriteria() {
    return `
    <div class="form-section" style="margin-top:20px;background:var(--background-dark);">
      <h3 class="section-h3"><i class="fas fa-sliders-h" style="color:var(--primary-color)"></i> 5. Acceptance Criteria Configuration
        <span class="section-optional-badge">Configurable — Verify against project procedure</span>
      </h3>
      <div class="input-row">
        <div class="input-group">
          <label for="ir-min-value">Minimum Acceptable Resistance <span style="font-weight:400;font-size:0.78rem;color:var(--text-secondary)">(editable default — not universal)</span></label>
          <input type="number" id="ir-min-value" value="5" step="any" min="0" placeholder="e.g. 5">
        </div>
        <div class="input-group">
          <label for="ir-min-unit">Unit</label>
          <select id="ir-min-unit">
            <option value="MΩ">MΩ</option>
            <option value="GΩ">GΩ</option>
            <option value="kΩ">kΩ</option>
            <option value="TΩ">TΩ</option>
          </select>
        </div>
        <div class="input-group" style="grid-column:span 2">
          <label for="ir-accept-criteria">Project-Specific Acceptance Criteria (Optional)</label>
          <input type="text" id="ir-accept-criteria" placeholder="e.g. Per IEC 62446-1 §6.1: 1 MΩ min for 1000V systems">
        </div>
      </div>
      <div class="assumptions-box" style="margin-top:10px">
        <div class="assumptions-title"><i class="fas fa-info-circle"></i> Evaluation Logic</div>
        <ul class="assumptions-list">
          <li>Measured resistance is converted internally to MΩ for comparison. If measured ≥ minimum required → <strong>Pass</strong>. If measured &lt; minimum required → <strong>Fail</strong>. If data is incomplete → <strong>Review</strong>.</li>
          <li>The default of <strong>5 MΩ</strong> is a common field starting point only. IEC 62446-1, NETA, project specifications, and OEM manuals may require different values.</li>
          <li>The "Result" column auto-updates when you enter measured resistance values.</li>
        </ul>
      </div>
    </div>`;
  }

  function buildSection5() {
    return `
    <div class="form-section" style="margin-top:20px;background:var(--background-dark);">
      <h3 class="section-h3"><i class="fas fa-table" style="color:var(--primary-color)"></i> 6. Test Result Table</h3>
      <div class="dynamic-table-wrapper">
        <table class="dynamic-table">
          <thead>
            <tr>
              <th>Test Point / Circuit</th>
              <th>From</th>
              <th>To</th>
              <th>Test V (VDC)</th>
              <th>Duration</th>
              <th>Meas. Resistance</th>
              <th>Unit</th>
              <th>Temp (°C)</th>
              <th>Corr. R (opt.)</th>
              <th>Min Required</th>
              <th>Result</th>
              <th>Comments</th>
              <th class="print-hide" style="width:36px"></th>
            </tr>
          </thead>
          <tbody id="ir-tbody"></tbody>
        </table>
      </div>
      <button type="button" id="ir-add-row" class="button-secondary btn-add-row" style="margin-top:0;width:auto;padding:6px 14px;font-size:0.82rem;">
        <i class="fas fa-plus"></i> Add Row
      </button>
    </div>`;
  }

  function buildSummaryPanel() {
    return `
    <div id="ir-summary" class="summary-card" style="margin-top:20px;display:none">
      <div class="result-header">
        <span><i class="fas fa-chart-bar"></i> Test Summary</span>
        <span id="ir-overall-badge" class="status-badge-inline status-pass">—</span>
      </div>
      <div class="summary-grid">
        <div class="summary-item"><div class="summary-item-label">Total Tests</div><div class="summary-item-value" id="ir-s-total">0</div></div>
        <div class="summary-item"><div class="summary-item-label">Passed</div><div class="summary-item-value" id="ir-s-pass" style="color:#15803d">0</div></div>
        <div class="summary-item"><div class="summary-item-label">Failed</div><div class="summary-item-value" id="ir-s-fail" style="color:#b91c1c">0</div></div>
        <div class="summary-item"><div class="summary-item-label">Review</div><div class="summary-item-value" id="ir-s-review" style="color:#6d28d9">0</div></div>
        <div class="summary-item"><div class="summary-item-label">Lowest Measured (MΩ)</div><div class="summary-item-value" id="ir-s-lowest">—</div></div>
        <div class="summary-item"><div class="summary-item-label">Highest Measured (MΩ)</div><div class="summary-item-value" id="ir-s-highest">—</div></div>
      </div>
    </div>`;
  }

  function buildSection8Notes() {
    return `
    <div class="form-section" style="margin-top:20px;background:var(--background-dark);">
      <h3 class="section-h3"><i class="fas fa-clipboard" style="color:var(--primary-color)"></i> 7. Notes and Observations</h3>
      <div class="input-row">
        <div class="input-group" style="grid-column:span 2">
          <label for="ir-observations">Observations</label>
          <textarea id="ir-observations" rows="3" placeholder="General test observations..."></textarea>
        </div>
        <div class="input-group" style="grid-column:span 2">
          <label for="ir-abnormal">Abnormal Findings</label>
          <textarea id="ir-abnormal" rows="3" placeholder="Describe any abnormal results or findings..."></textarea>
        </div>
      </div>
      <div class="input-row">
        <div class="input-group" style="grid-column:span 2">
          <label for="ir-corrective">Corrective Actions Required</label>
          <textarea id="ir-corrective" rows="2" placeholder="Required corrective actions..."></textarea>
        </div>
        <div class="input-group">
          <label for="ir-retest">Retest Required?</label>
          <select id="ir-retest">
            <option value="">— Select —</option>
            <option>Yes</option><option>No</option><option>N/A</option>
          </select>
        </div>
        <div class="input-group">
          <label for="ir-retest-notes">Retest Notes</label>
          <input type="text" id="ir-retest-notes" placeholder="Notes on required retest">
        </div>
      </div>
    </div>`;
  }

  function buildSection9Signoff() {
    return `
    <div class="form-section" style="margin-top:20px;background:var(--background-dark);">
      <h3 class="section-h3"><i class="fas fa-pen-fancy" style="color:var(--primary-color)"></i> 8. Sign-off</h3>
      <div class="input-row">
        <div class="input-group"><label for="ir-tech-name">Technician Name</label><input type="text" id="ir-tech-name" placeholder="Full name"></div>
        <div class="input-group"><label>Technician Signature</label><div class="sig-placeholder">Signature field</div></div>
        <div class="input-group"><label for="ir-tech-date">Date</label><input type="date" id="ir-tech-date"></div>
      </div>
      <div class="input-row">
        <div class="input-group"><label for="ir-sup-name">Supervisor / Reviewer Name</label><input type="text" id="ir-sup-name" placeholder="Full name"></div>
        <div class="input-group"><label>Supervisor Signature</label><div class="sig-placeholder">Signature field</div></div>
        <div class="input-group"><label for="ir-sup-date">Date</label><input type="date" id="ir-sup-date"></div>
      </div>
      <div class="input-row">
        <div class="input-group"><label for="ir-witness-name">Customer / Witness Name</label><input type="text" id="ir-witness-name" placeholder="Full name"></div>
        <div class="input-group"><label>Witness Signature</label><div class="sig-placeholder">Signature field</div></div>
        <div class="input-group"><label for="ir-witness-date">Date</label><input type="date" id="ir-witness-date"></div>
        <div class="input-group">
          <label for="ir-final-status">Final Status</label>
          <select id="ir-final-status">
            <option value="">— Select —</option>
            <option>Accepted</option>
            <option>Accepted with comments</option>
            <option>Rejected</option>
            <option>Pending retest</option>
          </select>
        </div>
      </div>
    </div>`;
  }

  // ─── Dynamic table row ────────────────────────────────────────────────────────
  function addTestRow(e, defaultLabel) {
    irRowCount++;
    const id = irRowCount;
    const tbody = document.getElementById('ir-tbody');
    const tr = document.createElement('tr');
    tr.id = 'ir-row-' + id;
    tr.innerHTML = `
      <td><input type="text" id="ir-tp-${id}" placeholder="e.g. Pos to Ground" value="${defaultLabel || ''}"></td>
      <td><input type="text" id="ir-from-${id}" placeholder="From"></td>
      <td><input type="text" id="ir-to-${id}" placeholder="To"></td>
      <td><input type="number" id="ir-vdc-${id}" placeholder="e.g. 1000" step="any"></td>
      <td><input type="text" id="ir-dur-${id}" placeholder="e.g. 60s"></td>
      <td><input type="number" id="ir-val-${id}" placeholder="e.g. 500" step="any"></td>
      <td>
        <select id="ir-unit-${id}">
          <option value="MΩ">MΩ</option>
          <option value="GΩ">GΩ</option>
          <option value="kΩ">kΩ</option>
          <option value="TΩ">TΩ</option>
        </select>
      </td>
      <td><input type="number" id="ir-temp-${id}" placeholder="°C" step="any"></td>
      <td><input type="number" id="ir-corr-${id}" placeholder="Optional" step="any"></td>
      <td><input type="text" id="ir-minreq-${id}" placeholder="e.g. 5 MΩ"></td>
      <td id="ir-result-cell-${id}"><span class="status-badge-inline status-review" id="ir-result-badge-${id}">Review</span></td>
      <td><textarea id="ir-comments-${id}" rows="1" placeholder="Comments" style="min-width:100px;height:36px;resize:vertical;"></textarea></td>
      <td class="print-hide"><button type="button" onclick="irRemoveRow(${id})" style="background:none;border:none;color:#b91c1c;cursor:pointer;font-size:1rem;" title="Remove row"><i class="fas fa-trash-alt"></i></button></td>
    `;
    tbody.appendChild(tr);
    // Re-evaluate when this row changes
    tr.addEventListener('input', reEvaluateAll);
    tr.addEventListener('change', reEvaluateAll);
  }

  window.irRemoveRow = function (id) {
    const row = document.getElementById('ir-row-' + id);
    if (row) row.remove();
    reEvaluateAll();
  };

  // ─── Auto-evaluation ──────────────────────────────────────────────────────────
  function reEvaluateAll() {
    const minVal = parseFloat(document.getElementById('ir-min-value').value);
    const minUnit = document.getElementById('ir-min-unit').value;
    const minMOhm = !isNaN(minVal) ? toMOhm(minVal, minUnit) : null;

    const tbody = document.getElementById('ir-tbody');
    const rows = tbody.querySelectorAll('tr');
    let passCount = 0, failCount = 0, reviewCount = 0;
    const measuredMOhms = [];

    rows.forEach(tr => {
      const idSuffix = tr.id.replace('ir-row-', '');
      const valInput = document.getElementById('ir-val-' + idSuffix);
      const unitSel = document.getElementById('ir-unit-' + idSuffix);
      const badge = document.getElementById('ir-result-badge-' + idSuffix);
      if (!valInput || !badge) return;

      const rawVal = valInput.value;
      const unit = unitSel ? unitSel.value : 'MΩ';
      const measuredMOhm = toMOhm(rawVal, unit);

      let result = 'Review';
      let cls = 'status-review';

      if (measuredMOhm !== null && minMOhm !== null) {
        if (measuredMOhm >= minMOhm) { result = 'Pass'; cls = 'status-pass'; }
        else { result = 'Fail'; cls = 'status-fail'; }
      }

      badge.textContent = result;
      badge.className = 'status-badge-inline ' + cls;

      if (result === 'Pass') { passCount++; measuredMOhms.push(measuredMOhm); }
      else if (result === 'Fail') { failCount++; if (measuredMOhm !== null) measuredMOhms.push(measuredMOhm); }
      else reviewCount++;
    });

    // Update summary
    const total = passCount + failCount + reviewCount;
    if (total > 0) {
      document.getElementById('ir-summary').style.display = 'block';
      document.getElementById('ir-s-total').textContent = total;
      document.getElementById('ir-s-pass').textContent = passCount;
      document.getElementById('ir-s-fail').textContent = failCount;
      document.getElementById('ir-s-review').textContent = reviewCount;

      let lowest = '—', highest = '—';
      if (measuredMOhms.length > 0) {
        lowest = Math.min(...measuredMOhms).toFixed(3) + ' MΩ';
        highest = Math.max(...measuredMOhms).toFixed(3) + ' MΩ';
      }
      document.getElementById('ir-s-lowest').textContent = lowest;
      document.getElementById('ir-s-highest').textContent = highest;

      let overallResult, overallCls;
      if (failCount > 0) { overallResult = 'FAIL / Action Required'; overallCls = 'status-fail'; }
      else if (reviewCount > 0) { overallResult = 'REVIEW'; overallCls = 'status-review'; }
      else { overallResult = 'PASS'; overallCls = 'status-pass'; }

      const badge = document.getElementById('ir-overall-badge');
      badge.textContent = overallResult;
      badge.className = 'status-badge-inline ' + overallCls;
    }
  }

  // ─── Export helpers ───────────────────────────────────────────────────────────
  window.exportFormToCSV = function (toolName) {
    const rows = [['Field', 'Value']];
    document.querySelectorAll('#form-root input, #form-root select, #form-root textarea').forEach(el => {
      if (!el.id) return;
      const lbl = document.querySelector(`label[for="${el.id}"]`);
      const label = lbl ? lbl.textContent.replace(/\*/g, '').trim() : el.id;
      let val = el.type === 'checkbox' ? (el.checked ? 'Yes' : 'No') : el.value;
      rows.push([label, val]);
    });
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    _downloadBlob(csv, 'text/csv;charset=utf-8;', (toolName || 'form') + '_export.csv');
  };

  window.exportFormToJSON = function (toolName) {
    const data = { tool: toolName, exported: new Date().toISOString(), fields: {} };
    document.querySelectorAll('#form-root input, #form-root select, #form-root textarea').forEach(el => {
      if (!el.id) return;
      data.fields[el.id] = el.type === 'checkbox' ? el.checked : el.value;
    });
    _downloadBlob(JSON.stringify(data, null, 2), 'application/json', (toolName || 'form') + '_export.json');
  };

  function _downloadBlob(content, mimeType, filename) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.style.display = 'none';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ─── Expose builder ───────────────────────────────────────────────────────────
  window.insulationResistanceFormBuilder = insulationResistanceFormBuilder;
  // Alias for form-components.js compatibility
  window['insulation-resistanceFormBuilder'] = insulationResistanceFormBuilder;

})();
