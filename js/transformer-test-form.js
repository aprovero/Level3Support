/**
 * transformer-test-form.js
 * Full form builder for the Transformer Test Results Form
 * Part of the Level3Support Electrical Test Forms SPA
 * © 2026 Level3Support
 */

(function () {
  'use strict';

  // ─── Unit conversions ─────────────────────────────────────────────────────────
  const UNIT_TO_MOHM = { 'kΩ': 0.001, 'MΩ': 1, 'GΩ': 1000, 'TΩ': 1000000 };
  function toMOhm(val, unit) {
    const v = parseFloat(val);
    if (isNaN(v)) return null;
    return v * (UNIT_TO_MOHM[unit] || 1);
  }

  // ─── Row counters ─────────────────────────────────────────────────────────────
  let ttrRowCount = 0;
  let wrRowCount = 0;
  let irRowCount = 0;
  let instRowCount = 0;

  // ─── Main Builder ─────────────────────────────────────────────────────────────
  function transformerTestFormBuilder() {
    const root = document.getElementById('form-root');
    if (!root) return;
    root.innerHTML = '';

    const form = document.createElement('form');
    form.id = 'tx-form';
    form.noValidate = true;

    form.innerHTML =
      buildSafetyWarning() +
      buildSection1Header() +
      buildSection2Nameplate() +
      buildSection3VisualInspection() +
      buildSection4Instruments() +
      buildSection5TTR() +
      buildSection6WindingResistance() +
      buildSection7InsulationResistance() +
      buildSection8FunctionalChecks() +
      buildSection9OilTest() +
      buildSectionSummary() +
      buildSection11Notes() +
      buildSection12Signoff();

    root.appendChild(form);

    // Wire up TTR table
    document.getElementById('tx-add-ttr-row').addEventListener('click', addTTRRow);
    document.getElementById('tx-ttr-tbody').addEventListener('input', reEvaluateTTR);
    document.getElementById('tx-ttr-tbody').addEventListener('change', reEvaluateTTR);
    document.getElementById('tx-ttr-tolerance').addEventListener('input', reEvaluateTTR);

    // Wire up winding resistance table
    document.getElementById('tx-add-wr-row').addEventListener('click', addWRRow);
    document.getElementById('tx-wr-tbody').addEventListener('input', reEvaluateWR);
    document.getElementById('tx-wr-tbody').addEventListener('change', reEvaluateWR);
    document.getElementById('tx-wr-dev-threshold').addEventListener('input', reEvaluateWR);

    // Wire up IR table
    document.getElementById('tx-add-ir-row').addEventListener('click', addIRRow);
    document.getElementById('tx-ir-tbody').addEventListener('input', reEvaluateIR);
    document.getElementById('tx-ir-tbody').addEventListener('change', reEvaluateIR);
    document.getElementById('tx-ir-min-value').addEventListener('input', reEvaluateIR);
    document.getElementById('tx-ir-min-unit').addEventListener('change', reEvaluateIR);

    // Instrument table
    document.getElementById('tx-add-inst-row').addEventListener('click', addInstrumentRow);

    // Section status dropdowns → update summary
    document.querySelectorAll('.tx-section-status').forEach(sel => {
      sel.addEventListener('change', updateOverallSummary);
    });

    // Add default TTR rows
    const defaultTTRRows = [
      ['Nominal', 'A-B / a-b'], ['Nominal', 'B-C / b-c'], ['Nominal', 'C-A / c-a']
    ];
    defaultTTRRows.forEach(([tap, phase]) => addTTRRow(null, tap, phase));

    // Add default WR rows
    const defaultWRRows = [
      ['HV', 'A'], ['HV', 'B'], ['HV', 'C'],
      ['LV', 'A'], ['LV', 'B'], ['LV', 'C']
    ];
    defaultWRRows.forEach(([winding, phase]) => addWRRow(null, winding, phase));

    // Add default IR rows
    const defaultIRPoints = [
      'HV to Ground', 'LV to Ground', 'HV to LV',
      'Tertiary to Ground (if applicable)', 'Core to Ground (if applicable)'
    ];
    defaultIRPoints.forEach(label => addIRRow(null, label));

    // Add default instrument row
    addInstrumentRow();

    updateOverallSummary();
  }

  // ─── Safety Warning ───────────────────────────────────────────────────────────
  function buildSafetyWarning() {
    return `
    <div class="safety-warning print-hide">
      <i class="fas fa-exclamation-triangle"></i>
      <div>
        <div class="safety-warning-title">⚠ Safety Warning — Transformer Testing</div>
        <p>Transformer testing can involve stored energy, induced voltage, hazardous test voltages, grounding requirements, and equipment damage risk. Confirm the transformer is de-energized, isolated, discharged, grounded as required, and safe to test. Follow LOTO, NFPA 70E, OEM instructions, and the approved commissioning or maintenance procedure.</p>
      </div>
    </div>`;
  }

  // ─── Section 1: Header ───────────────────────────────────────────────────────
  function buildSection1Header() {
    return `
    <div class="form-section">
      <h3 class="section-h3"><i class="fas fa-file-alt" style="color:var(--primary-color)"></i> 1. Header / Report Information</h3>
      <div class="input-row">
        <div class="input-group"><label for="tx-report-id">Report ID</label><input type="text" id="tx-report-id" placeholder="e.g. TX-2026-001"></div>
        <div class="input-group"><label for="tx-project-name">Project Name</label><input type="text" id="tx-project-name" placeholder="e.g. Mesa Solar BESS"></div>
        <div class="input-group"><label for="tx-site-name">Site Name</label><input type="text" id="tx-site-name" placeholder="e.g. Substation B"></div>
        <div class="input-group"><label for="tx-customer">Customer</label><input type="text" id="tx-customer" placeholder="Customer / Owner"></div>
      </div>
      <div class="input-row">
        <div class="input-group"><label for="tx-location">Location</label><input type="text" id="tx-location" placeholder="GPS or address"></div>
        <div class="input-group"><label for="tx-date">Date</label><input type="date" id="tx-date"></div>
        <div class="input-group"><label for="tx-start-time">Test Start Time</label><input type="time" id="tx-start-time"></div>
        <div class="input-group"><label for="tx-end-time">Test End Time</label><input type="time" id="tx-end-time"></div>
      </div>
      <div class="input-row">
        <div class="input-group"><label for="tx-tested-by">Tested By</label><input type="text" id="tx-tested-by" placeholder="Technician name"></div>
        <div class="input-group"><label for="tx-company">Company</label><input type="text" id="tx-company" placeholder="Company / contractor"></div>
        <div class="input-group"><label for="tx-witness">Witness / Client Rep.</label><input type="text" id="tx-witness" placeholder="Name"></div>
        <div class="input-group"><label for="tx-work-order">Work Order / Ticket #</label><input type="text" id="tx-work-order" placeholder="WO or ticket"></div>
      </div>
      <div class="input-row">
        <div class="input-group"><label for="tx-drawing-ref">Drawing Reference</label><input type="text" id="tx-drawing-ref" placeholder="Drawing number"></div>
        <div class="input-group"><label for="tx-eq-tag">Equipment Tag</label><input type="text" id="tx-eq-tag" placeholder="Tag / label"></div>
        <div class="input-group"><label for="tx-area">Area / Block / Feeder</label><input type="text" id="tx-area" placeholder="e.g. Block 2, Inverter Station 3"></div>
      </div>
    </div>`;
  }

  // ─── Section 2: Nameplate Data ───────────────────────────────────────────────
  function buildSection2Nameplate() {
    return `
    <div class="form-section" style="margin-top:20px">
      <h3 class="section-h3"><i class="fas fa-id-card" style="color:var(--primary-color)"></i> 2. Transformer Nameplate Data</h3>
      <div class="input-row">
        <div class="input-group"><label for="tx-tag">Transformer Tag / Equipment ID</label><input type="text" id="tx-tag" placeholder="e.g. TX-01"></div>
        <div class="input-group"><label for="tx-mfg">Manufacturer</label><input type="text" id="tx-mfg" placeholder="e.g. ABB, GE, Eaton"></div>
        <div class="input-group"><label for="tx-model">Model</label><input type="text" id="tx-model" placeholder="Model number"></div>
        <div class="input-group"><label for="tx-serial">Serial Number</label><input type="text" id="tx-serial" placeholder="S/N"></div>
      </div>
      <div class="input-row">
        <div class="input-group">
          <label for="tx-type">Transformer Type</label>
          <select id="tx-type">
            <option value="">— Select —</option>
            <option>Pad-mounted</option><option>Oil-filled</option><option>Dry-type</option>
            <option>Cast resin</option><option>Auxiliary transformer</option>
            <option>Inverter station transformer</option><option>Substation power transformer</option>
            <option>Other</option>
          </select>
        </div>
        <div class="input-group">
          <label for="tx-cooling">Cooling Class</label>
          <select id="tx-cooling">
            <option value="">— Select —</option>
            <option>ONAN</option><option>ONAF</option><option>KNAN</option>
            <option>KNAF</option><option>AA</option><option>FA</option><option>Other</option>
          </select>
        </div>
        <div class="input-group"><label for="tx-rated-power">Rated Power (kVA / MVA)</label><input type="text" id="tx-rated-power" placeholder="e.g. 2500 kVA"></div>
        <div class="input-group"><label for="tx-freq">Frequency</label><select id="tx-freq"><option value="">— Select —</option><option>50 Hz</option><option>60 Hz</option></select></div>
      </div>
      <div class="input-row">
        <div class="input-group"><label for="tx-hv-voltage">HV Rated Voltage</label><input type="text" id="tx-hv-voltage" placeholder="e.g. 34.5 kV"></div>
        <div class="input-group"><label for="tx-lv-voltage">LV Rated Voltage</label><input type="text" id="tx-lv-voltage" placeholder="e.g. 690 V"></div>
        <div class="input-group"><label for="tx-tert-voltage">Tertiary Rated Voltage <span class="section-optional-badge">Optional</span></label><input type="text" id="tx-tert-voltage" placeholder="If applicable"></div>
        <div class="input-group"><label for="tx-hv-current">HV Rated Current</label><input type="text" id="tx-hv-current" placeholder="e.g. 41.8 A"></div>
      </div>
      <div class="input-row">
        <div class="input-group"><label for="tx-lv-current">LV Rated Current</label><input type="text" id="tx-lv-current" placeholder="e.g. 2090 A"></div>
        <div class="input-group">
          <label for="tx-vector-group">Vector Group</label>
          <select id="tx-vector-group">
            <option value="">— Select —</option>
            <option>Dyn1</option><option>Dyn5</option><option>Dyn11</option>
            <option>YNd1</option><option>YNd11</option><option>Yy0</option><option>Other</option>
          </select>
        </div>
        <div class="input-group"><label for="tx-impedance">Impedance (%)</label><input type="number" id="tx-impedance" placeholder="e.g. 6.0" step="any"></div>
        <div class="input-group">
          <label for="tx-phase">Phase</label>
          <select id="tx-phase"><option value="">— Select —</option><option>Single-phase</option><option>Three-phase</option></select>
        </div>
      </div>
      <div class="input-row">
        <div class="input-group">
          <label for="tx-tap-type">Tap Changer Type</label>
          <select id="tx-tap-type">
            <option value="">— Select —</option>
            <option>Off-circuit tap changer</option><option>On-load tap changer</option>
            <option>Fixed tap</option><option>Other</option>
          </select>
        </div>
        <div class="input-group"><label for="tx-tap-positions">Number of Tap Positions</label><input type="number" id="tx-tap-positions" placeholder="e.g. 5" step="1"></div>
        <div class="input-group"><label for="tx-nominal-tap">Nominal Tap Position</label><input type="text" id="tx-nominal-tap" placeholder="e.g. Tap 3"></div>
        <div class="input-group">
          <label for="tx-oil-type">Oil Type <span class="section-optional-badge">If applicable</span></label>
          <select id="tx-oil-type">
            <option value="">— Select —</option>
            <option>Mineral oil</option><option>Natural ester</option><option>Synthetic ester</option>
            <option>Silicone</option><option>N/A</option><option>Other</option>
          </select>
        </div>
      </div>
      <div class="input-row">
        <div class="input-group"><label for="tx-year-mfg">Year of Manufacture</label><input type="number" id="tx-year-mfg" placeholder="e.g. 2023" step="1"></div>
      </div>
    </div>`;
  }

  // ─── Section 3: Visual / Mechanical Inspection ───────────────────────────────
  function buildSection3VisualInspection() {
    const inspItems = [
      'Nameplate present and readable',
      'Equipment tag matches drawings',
      'Transformer exterior condition acceptable',
      'No visible oil leaks',
      'Oil level acceptable (if applicable)',
      'Oil temperature gauge condition acceptable (if applicable)',
      'Winding temperature gauge condition acceptable (if applicable)',
      'Pressure relief device acceptable (if applicable)',
      'Breather condition acceptable (if applicable)',
      'Silica gel condition acceptable (if applicable)',
      'Radiators / cooling fins clear and undamaged',
      'Fans operational (if applicable)',
      'Grounding connection installed',
      'Grounding connection torque marked',
      'HV terminations acceptable',
      'LV terminations acceptable',
      'Neutral connection acceptable (if applicable)',
      'Cable supports acceptable',
      'Bushings clean and undamaged',
      'Surge arresters installed and acceptable (if applicable)',
      'Tap changer position verified',
      'Cabinet doors / locks acceptable',
      'Warning labels installed',
      'Clearances acceptable',
      'No foreign objects inside cabinet',
      'No abnormal odor',
      'No abnormal noise',
      'Fire protection / spill containment acceptable (if applicable)'
    ];

    const rows = inspItems.map((item, i) => {
      const id = 'tx-vi-' + i;
      return `<div class="inspection-row">
        <span class="inspection-label">${item}</span>
        <select id="${id}-status">
          <option value="">— Select —</option>
          <option value="Pass">Pass</option>
          <option value="Fail">Fail</option>
          <option value="N/A">N/A</option>
          <option value="Review">Review</option>
        </select>
        <input type="text" id="${id}-comment" placeholder="Comment">
      </div>`;
    }).join('');

    return `
    <div class="form-section" style="margin-top:20px">
      <h3 class="section-h3">
        <i class="fas fa-search" style="color:var(--primary-color)"></i> 3. Visual / Mechanical Inspection
        <span style="margin-left:auto;display:flex;align-items:center;gap:8px;font-size:0.8rem;font-weight:400;">
          Section Status:
          <select class="tx-section-status" id="tx-vis-status" style="font-size:0.78rem;padding:2px 6px;height:28px;width:auto;">
            <option value="Required">Required</option><option value="Optional">Optional</option><option value="N/A">N/A</option>
          </select>
        </span>
      </h3>
      <div style="font-size:0.78rem;color:var(--text-secondary);margin-bottom:8px;">
        <strong>Column order:</strong> Inspection Item | Status | Comment
      </div>
      ${rows}
    </div>`;
  }

  // ─── Section 4: Instruments ───────────────────────────────────────────────────
  function buildSection4Instruments() {
    return `
    <div class="form-section" style="margin-top:20px">
      <h3 class="section-h3"><i class="fas fa-tools" style="color:var(--primary-color)"></i> 4. Test Instrument Information</h3>
      <div class="dynamic-table-wrapper">
        <table class="dynamic-table">
          <thead>
            <tr>
              <th>Instrument Type</th>
              <th>Manufacturer</th>
              <th>Model</th>
              <th>Serial Number</th>
              <th>Calibration Date</th>
              <th>Cal. Due Date</th>
              <th>Used For Test</th>
              <th class="print-hide" style="width:36px"></th>
            </tr>
          </thead>
          <tbody id="tx-inst-tbody"></tbody>
        </table>
      </div>
      <button type="button" id="tx-add-inst-row" class="button-secondary btn-add-row" style="margin-top:0;width:auto;padding:6px 14px;font-size:0.82rem;">
        <i class="fas fa-plus"></i> Add Instrument
      </button>
    </div>`;
  }

  function addInstrumentRow() {
    instRowCount++;
    const id = instRowCount;
    const tbody = document.getElementById('tx-inst-tbody');
    const tr = document.createElement('tr');
    tr.id = 'tx-inst-row-' + id;
    tr.innerHTML = `
      <td>
        <select id="tx-inst-type-${id}" style="min-width:150px">
          <option value="">— Select —</option>
          <option>TTR test set</option>
          <option>Winding resistance meter</option>
          <option>Insulation resistance tester</option>
          <option>Power factor / tan delta test set</option>
          <option>Multimeter</option>
          <option>Clamp meter</option>
          <option>Torque wrench</option>
          <option>Thermographic camera</option>
          <option>Other</option>
        </select>
      </td>
      <td><input type="text" id="tx-inst-mfg-${id}" placeholder="Manufacturer"></td>
      <td><input type="text" id="tx-inst-model-${id}" placeholder="Model"></td>
      <td><input type="text" id="tx-inst-serial-${id}" placeholder="S/N"></td>
      <td><input type="date" id="tx-inst-cal-${id}"></td>
      <td><input type="date" id="tx-inst-due-${id}"></td>
      <td><input type="text" id="tx-inst-used-${id}" placeholder="e.g. TTR, winding R"></td>
      <td class="print-hide"><button type="button" onclick="txRemoveInstRow(${id})" style="background:none;border:none;color:#b91c1c;cursor:pointer;font-size:1rem;" title="Remove"><i class="fas fa-trash-alt"></i></button></td>
    `;
    tbody.appendChild(tr);
  }
  window.txRemoveInstRow = function (id) {
    const row = document.getElementById('tx-inst-row-' + id);
    if (row) row.remove();
  };

  // ─── Section 5: TTR ───────────────────────────────────────────────────────────
  function buildSection5TTR() {
    return `
    <div class="form-section" style="margin-top:20px">
      <h3 class="section-h3">
        <i class="fas fa-random" style="color:var(--primary-color)"></i> 5. Transformer Turns Ratio (TTR) Test
        <span style="margin-left:auto;display:flex;align-items:center;gap:8px;font-size:0.8rem;font-weight:400;">
          Section Status:
          <select class="tx-section-status" id="tx-ttr-section-status" style="font-size:0.78rem;padding:2px 6px;height:28px;width:auto;">
            <option value="Required">Required</option><option value="Optional">Optional</option><option value="N/A">N/A</option>
          </select>
        </span>
      </h3>
      <div class="input-row">
        <div class="input-group"><label for="tx-ttr-method">Test Method</label><input type="text" id="tx-ttr-method" placeholder="e.g. Automatic 3-phase TTR"></div>
        <div class="input-group">
          <label for="tx-ttr-ref-source">Reference Ratio Source</label>
          <select id="tx-ttr-ref-source">
            <option value="">— Select —</option>
            <option>Nameplate</option><option>OEM test report</option>
            <option>Calculated from rated voltages</option>
            <option>Project test procedure</option><option>Other</option>
          </select>
        </div>
        <div class="input-group">
          <label for="tx-ttr-tolerance">Acceptance Tolerance (%) <span style="font-weight:400;font-size:0.78rem;color:var(--text-secondary)">— confirm against procedure</span></label>
          <input type="number" id="tx-ttr-tolerance" value="0.5" step="0.01" min="0" placeholder="e.g. 0.5">
        </div>
      </div>
      <div class="assumptions-box" style="margin-top:0;margin-bottom:14px">
        <div class="assumptions-title"><i class="fas fa-info-circle"></i> TTR Evaluation Logic</div>
        <ul class="assumptions-list">
          <li>Ratio Error (%) = ((Measured − Calculated) / Calculated) × 100</li>
          <li>If |Error %| ≤ Tolerance → <strong>Pass</strong>. If |Error %| > Tolerance → <strong>Fail</strong>. If data incomplete → <strong>Review</strong>.</li>
          <li>The 0.5% default is a common field reference only — not universal. Confirm against OEM report, nameplate, and the approved SAT procedure.</li>
        </ul>
      </div>
      <div class="dynamic-table-wrapper">
        <table class="dynamic-table">
          <thead>
            <tr>
              <th>Tap Position</th>
              <th>Phase</th>
              <th>HV Ref (V)</th>
              <th>LV Ref (V)</th>
              <th>Calc. Ratio</th>
              <th>Meas. Ratio</th>
              <th>Error (%)</th>
              <th>Exc. Current (opt.)</th>
              <th>Phase Disp. Check</th>
              <th>Result</th>
              <th>Comments</th>
              <th class="print-hide" style="width:36px"></th>
            </tr>
          </thead>
          <tbody id="tx-ttr-tbody"></tbody>
        </table>
      </div>
      <button type="button" id="tx-add-ttr-row" class="button-secondary btn-add-row" style="margin-top:0;width:auto;padding:6px 14px;font-size:0.82rem;">
        <i class="fas fa-plus"></i> Add TTR Row
      </button>
      <div id="tx-ttr-summary" class="summary-card" style="margin-top:14px;display:none">
        <div class="result-header">
          <span>TTR Section Summary</span>
          <span id="tx-ttr-overall-badge" class="status-badge-inline status-review">—</span>
        </div>
        <div class="summary-grid">
          <div class="summary-item"><div class="summary-item-label">Tests</div><div class="summary-item-value" id="tx-ttr-s-total">0</div></div>
          <div class="summary-item"><div class="summary-item-label">Passed</div><div class="summary-item-value" id="tx-ttr-s-pass" style="color:#15803d">0</div></div>
          <div class="summary-item"><div class="summary-item-label">Failed</div><div class="summary-item-value" id="tx-ttr-s-fail" style="color:#b91c1c">0</div></div>
          <div class="summary-item"><div class="summary-item-label">Max |Error|</div><div class="summary-item-value" id="tx-ttr-s-maxerr">—</div></div>
        </div>
      </div>
    </div>`;
  }

  function addTTRRow(e, defaultTap, defaultPhase) {
    ttrRowCount++;
    const id = ttrRowCount;
    const tbody = document.getElementById('tx-ttr-tbody');
    const tr = document.createElement('tr');
    tr.id = 'tx-ttr-row-' + id;
    tr.innerHTML = `
      <td><input type="text" id="tx-ttr-tap-${id}" placeholder="e.g. Nominal" value="${defaultTap || ''}"></td>
      <td>
        <select id="tx-ttr-phase-${id}">
          <option value="${defaultPhase || ''}">${defaultPhase || '— Select —'}</option>
          <option>A-B / a-b</option><option>B-C / b-c</option><option>C-A / c-a</option>
          <option>A-N / a-n</option><option>B-N / b-n</option><option>C-N / c-n</option>
          <option>Phase A</option><option>Phase B</option><option>Phase C</option><option>Other</option>
        </select>
      </td>
      <td><input type="number" id="tx-ttr-hvref-${id}" placeholder="e.g. 34500" step="any"></td>
      <td><input type="number" id="tx-ttr-lvref-${id}" placeholder="e.g. 690" step="any"></td>
      <td><input type="text" id="tx-ttr-calcratio-${id}" readonly placeholder="Auto-calc" style="background:#f8fafc;font-weight:600;"></td>
      <td><input type="number" id="tx-ttr-measratio-${id}" placeholder="Measured" step="any"></td>
      <td><input type="text" id="tx-ttr-error-${id}" readonly placeholder="Auto-calc" style="background:#f8fafc;font-weight:600;"></td>
      <td><input type="number" id="tx-ttr-exc-${id}" placeholder="mA (opt.)" step="any"></td>
      <td><input type="text" id="tx-ttr-phase-disp-${id}" placeholder="e.g. OK / 30°"></td>
      <td><span class="status-badge-inline status-review" id="tx-ttr-result-${id}">Review</span></td>
      <td><textarea id="tx-ttr-comment-${id}" rows="1" placeholder="Comments" style="min-width:90px;height:36px;resize:vertical;"></textarea></td>
      <td class="print-hide"><button type="button" onclick="txRemoveTTRRow(${id})" style="background:none;border:none;color:#b91c1c;cursor:pointer;font-size:1rem;" title="Remove"><i class="fas fa-trash-alt"></i></button></td>
    `;
    tbody.appendChild(tr);

    // Auto-calc on HV/LV ref change
    const hvRefInput = document.getElementById('tx-ttr-hvref-' + id);
    const lvRefInput = document.getElementById('tx-ttr-lvref-' + id);
    [hvRefInput, lvRefInput].forEach(inp => {
      inp.addEventListener('input', () => {
        const hv = parseFloat(hvRefInput.value);
        const lv = parseFloat(lvRefInput.value);
        const calcEl = document.getElementById('tx-ttr-calcratio-' + id);
        if (!isNaN(hv) && !isNaN(lv) && lv !== 0) {
          calcEl.value = (hv / lv).toFixed(4);
        } else {
          calcEl.value = '';
        }
        reEvaluateTTR();
      });
    });

    tr.addEventListener('input', reEvaluateTTR);
    tr.addEventListener('change', reEvaluateTTR);
  }

  window.txRemoveTTRRow = function (id) {
    const row = document.getElementById('tx-ttr-row-' + id);
    if (row) row.remove();
    reEvaluateTTR();
    updateOverallSummary();
  };

  function reEvaluateTTR() {
    const tolerance = parseFloat(document.getElementById('tx-ttr-tolerance').value);
    const tbody = document.getElementById('tx-ttr-tbody');
    const rows = tbody.querySelectorAll('tr');
    let passCount = 0, failCount = 0, reviewCount = 0;
    let maxAbsError = null;

    rows.forEach(tr => {
      const idSuffix = tr.id.replace('tx-ttr-row-', '');
      const calcEl = document.getElementById('tx-ttr-calcratio-' + idSuffix);
      const measEl = document.getElementById('tx-ttr-measratio-' + idSuffix);
      const errorEl = document.getElementById('tx-ttr-error-' + idSuffix);
      const badge = document.getElementById('tx-ttr-result-' + idSuffix);
      if (!calcEl || !measEl || !badge) return;

      const calcRatio = parseFloat(calcEl.value);
      const measRatio = parseFloat(measEl.value);

      let result = 'Review', cls = 'status-review';
      errorEl.value = '';

      if (!isNaN(calcRatio) && !isNaN(measRatio) && calcRatio !== 0) {
        const errPct = ((measRatio - calcRatio) / calcRatio) * 100;
        errorEl.value = errPct.toFixed(4) + '%';
        if (!isNaN(tolerance)) {
          if (Math.abs(errPct) <= Math.abs(tolerance)) { result = 'Pass'; cls = 'status-pass'; }
          else { result = 'Fail'; cls = 'status-fail'; }
          if (maxAbsError === null || Math.abs(errPct) > maxAbsError) maxAbsError = Math.abs(errPct);
        }
      }

      badge.textContent = result;
      badge.className = 'status-badge-inline ' + cls;
      if (result === 'Pass') passCount++;
      else if (result === 'Fail') failCount++;
      else reviewCount++;
    });

    const total = passCount + failCount + reviewCount;
    if (total > 0) {
      document.getElementById('tx-ttr-summary').style.display = 'block';
      document.getElementById('tx-ttr-s-total').textContent = total;
      document.getElementById('tx-ttr-s-pass').textContent = passCount;
      document.getElementById('tx-ttr-s-fail').textContent = failCount;
      document.getElementById('tx-ttr-s-maxerr').textContent = maxAbsError !== null ? maxAbsError.toFixed(4) + '%' : '—';
      let ovBadge = document.getElementById('tx-ttr-overall-badge');
      if (failCount > 0) { ovBadge.textContent = 'FAIL'; ovBadge.className = 'status-badge-inline status-fail'; }
      else if (reviewCount > 0) { ovBadge.textContent = 'REVIEW'; ovBadge.className = 'status-badge-inline status-review'; }
      else { ovBadge.textContent = 'PASS'; ovBadge.className = 'status-badge-inline status-pass'; }
    }
    updateOverallSummary();
  }

  // ─── Section 6: Winding Resistance ───────────────────────────────────────────
  function buildSection6WindingResistance() {
    return `
    <div class="form-section" style="margin-top:20px">
      <h3 class="section-h3">
        <i class="fas fa-wave-square" style="color:var(--primary-color)"></i> 6. Winding Resistance
        <span class="section-optional-badge">Optional</span>
        <span style="margin-left:auto;display:flex;align-items:center;gap:8px;font-size:0.8rem;font-weight:400;">
          Section Status:
          <select class="tx-section-status" id="tx-wr-section-status" style="font-size:0.78rem;padding:2px 6px;height:28px;width:auto;">
            <option value="Required">Required</option><option value="Optional" selected>Optional</option><option value="N/A">N/A</option>
          </select>
        </span>
      </h3>
      <div class="input-row" style="margin-bottom:10px">
        <div class="input-group">
          <label for="tx-wr-temp-corr">Temperature Correction Enabled?</label>
          <select id="tx-wr-temp-corr">
            <option value="">— Select —</option>
            <option>Yes</option><option>No</option>
          </select>
        </div>
        <div class="input-group">
          <label for="tx-wr-ref-temp">Reference Temperature (°C) <span style="font-weight:400;font-size:0.78rem;color:var(--text-secondary)">Default 75°C</span></label>
          <input type="number" id="tx-wr-ref-temp" value="75" step="any" placeholder="e.g. 75">
        </div>
        <div class="input-group">
          <label for="tx-wr-dev-threshold">Imbalance Threshold (%) <span style="font-weight:400;font-size:0.78rem;color:var(--text-secondary)">Default 2% — verify against procedure</span></label>
          <input type="number" id="tx-wr-dev-threshold" value="2" step="any" min="0" placeholder="e.g. 2">
        </div>
      </div>
      <div class="dynamic-table-wrapper">
        <table class="dynamic-table">
          <thead>
            <tr>
              <th>Winding</th>
              <th>Tap Position</th>
              <th>Phase</th>
              <th>Measured R</th>
              <th>Unit</th>
              <th>Wdg Temp (°C)</th>
              <th>Corrected R (opt.)</th>
              <th>Dev. from Avg (%)</th>
              <th>Result</th>
              <th>Comments</th>
              <th class="print-hide" style="width:36px"></th>
            </tr>
          </thead>
          <tbody id="tx-wr-tbody"></tbody>
        </table>
      </div>
      <button type="button" id="tx-add-wr-row" class="button-secondary btn-add-row" style="margin-top:0;width:auto;padding:6px 14px;font-size:0.82rem;">
        <i class="fas fa-plus"></i> Add Row
      </button>
      <div id="tx-wr-summary" class="summary-card" style="margin-top:14px;display:none">
        <div class="result-header">
          <span>Winding Resistance Section Summary</span>
          <span id="tx-wr-overall-badge" class="status-badge-inline status-review">—</span>
        </div>
        <div class="summary-grid">
          <div class="summary-item"><div class="summary-item-label">Rows</div><div class="summary-item-value" id="tx-wr-s-total">0</div></div>
          <div class="summary-item"><div class="summary-item-label">Passed</div><div class="summary-item-value" id="tx-wr-s-pass" style="color:#15803d">0</div></div>
          <div class="summary-item"><div class="summary-item-label">Failed</div><div class="summary-item-value" id="tx-wr-s-fail" style="color:#b91c1c">0</div></div>
          <div class="summary-item"><div class="summary-item-label">Max Dev.</div><div class="summary-item-value" id="tx-wr-s-maxdev">—</div></div>
        </div>
      </div>
    </div>`;
  }

  function addWRRow(e, defaultWinding, defaultPhase) {
    wrRowCount++;
    const id = wrRowCount;
    const tbody = document.getElementById('tx-wr-tbody');
    const tr = document.createElement('tr');
    tr.id = 'tx-wr-row-' + id;
    tr.innerHTML = `
      <td>
        <select id="tx-wr-winding-${id}">
          <option value="${defaultWinding || ''}">${defaultWinding || '— Select —'}</option>
          <option>HV</option><option>LV</option><option>Tertiary</option><option>Neutral</option><option>Other</option>
        </select>
      </td>
      <td><input type="text" id="tx-wr-tap-${id}" placeholder="e.g. Nominal"></td>
      <td>
        <select id="tx-wr-phase-${id}">
          <option value="${defaultPhase || ''}">${defaultPhase || '— Select —'}</option>
          <option>A</option><option>B</option><option>C</option>
          <option>A-B</option><option>B-C</option><option>C-A</option>
          <option>A-N</option><option>B-N</option><option>C-N</option>
        </select>
      </td>
      <td><input type="number" id="tx-wr-val-${id}" placeholder="Measured" step="any"></td>
      <td>
        <select id="tx-wr-unit-${id}">
          <option value="mΩ">mΩ</option><option value="µΩ">µΩ</option><option value="Ω">Ω</option>
        </select>
      </td>
      <td><input type="number" id="tx-wr-temp-${id}" placeholder="°C" step="any"></td>
      <td><input type="number" id="tx-wr-corr-${id}" placeholder="Optional" step="any"></td>
      <td><input type="text" id="tx-wr-dev-${id}" readonly placeholder="Auto-calc" style="background:#f8fafc;font-weight:600;"></td>
      <td><span class="status-badge-inline status-review" id="tx-wr-result-${id}">Review</span></td>
      <td><textarea id="tx-wr-comment-${id}" rows="1" placeholder="Comments" style="min-width:90px;height:36px;resize:vertical;"></textarea></td>
      <td class="print-hide"><button type="button" onclick="txRemoveWRRow(${id})" style="background:none;border:none;color:#b91c1c;cursor:pointer;font-size:1rem;" title="Remove"><i class="fas fa-trash-alt"></i></button></td>
    `;
    tbody.appendChild(tr);
    tr.addEventListener('input', reEvaluateWR);
    tr.addEventListener('change', reEvaluateWR);
  }

  window.txRemoveWRRow = function (id) {
    const row = document.getElementById('tx-wr-row-' + id);
    if (row) row.remove();
    reEvaluateWR();
    updateOverallSummary();
  };

  function reEvaluateWR() {
    const threshold = parseFloat(document.getElementById('tx-wr-dev-threshold').value);
    const tbody = document.getElementById('tx-wr-tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    // Group by winding + tap for average calculation
    const groups = {};
    rows.forEach(tr => {
      const idSuffix = tr.id.replace('tx-wr-row-', '');
      const winding = (document.getElementById('tx-wr-winding-' + idSuffix) || {}).value || '';
      const tap = (document.getElementById('tx-wr-tap-' + idSuffix) || {}).value || '';
      const key = winding + '|' + tap;
      if (!groups[key]) groups[key] = [];
      const val = parseFloat((document.getElementById('tx-wr-val-' + idSuffix) || {}).value);
      if (!isNaN(val)) groups[key].push({ idSuffix, val });
      else groups[key].push({ idSuffix, val: null });
    });

    let passCount = 0, failCount = 0, reviewCount = 0, maxDev = null;

    rows.forEach(tr => {
      const idSuffix = tr.id.replace('tx-wr-row-', '');
      const winding = (document.getElementById('tx-wr-winding-' + idSuffix) || {}).value || '';
      const tap = (document.getElementById('tx-wr-tap-' + idSuffix) || {}).value || '';
      const key = winding + '|' + tap;
      const devEl = document.getElementById('tx-wr-dev-' + idSuffix);
      const badge = document.getElementById('tx-wr-result-' + idSuffix);
      if (!badge) return;

      const groupVals = (groups[key] || []).map(g => g.val).filter(v => v !== null);
      const myVal = parseFloat((document.getElementById('tx-wr-val-' + idSuffix) || {}).value);

      let result = 'Review', cls = 'status-review';

      if (groupVals.length >= 2 && !isNaN(myVal)) {
        const avg = groupVals.reduce((a, b) => a + b, 0) / groupVals.length;
        const dev = avg !== 0 ? Math.abs((myVal - avg) / avg * 100) : 0;
        if (devEl) devEl.value = dev.toFixed(2) + '%';
        if (!isNaN(threshold)) {
          if (dev <= threshold) { result = 'Pass'; cls = 'status-pass'; }
          else { result = 'Fail'; cls = 'status-fail'; }
          if (maxDev === null || dev > maxDev) maxDev = dev;
        }
      } else if (!isNaN(myVal) && groupVals.length === 1) {
        if (devEl) devEl.value = '0.00%';
        result = 'Review'; cls = 'status-review'; // Can't evaluate single phase alone
      } else {
        if (devEl) devEl.value = '';
      }

      badge.textContent = result;
      badge.className = 'status-badge-inline ' + cls;
      if (result === 'Pass') passCount++;
      else if (result === 'Fail') failCount++;
      else reviewCount++;
    });

    const total = passCount + failCount + reviewCount;
    if (total > 0) {
      document.getElementById('tx-wr-summary').style.display = 'block';
      document.getElementById('tx-wr-s-total').textContent = total;
      document.getElementById('tx-wr-s-pass').textContent = passCount;
      document.getElementById('tx-wr-s-fail').textContent = failCount;
      document.getElementById('tx-wr-s-maxdev').textContent = maxDev !== null ? maxDev.toFixed(2) + '%' : '—';
      const ovBadge = document.getElementById('tx-wr-overall-badge');
      if (failCount > 0) { ovBadge.textContent = 'FAIL'; ovBadge.className = 'status-badge-inline status-fail'; }
      else if (reviewCount > 0) { ovBadge.textContent = 'REVIEW'; ovBadge.className = 'status-badge-inline status-review'; }
      else { ovBadge.textContent = 'PASS'; ovBadge.className = 'status-badge-inline status-pass'; }
    }
    updateOverallSummary();
  }

  // ─── Section 7: Insulation Resistance ────────────────────────────────────────
  function buildSection7InsulationResistance() {
    return `
    <div class="form-section" style="margin-top:20px">
      <h3 class="section-h3">
        <i class="fas fa-shield-alt" style="color:var(--primary-color)"></i> 7. Insulation Resistance
        <span class="section-optional-badge">Optional</span>
        <span style="margin-left:auto;display:flex;align-items:center;gap:8px;font-size:0.8rem;font-weight:400;">
          Section Status:
          <select class="tx-section-status" id="tx-ir-section-status" style="font-size:0.78rem;padding:2px 6px;height:28px;width:auto;">
            <option value="Required">Required</option><option value="Optional" selected>Optional</option><option value="N/A">N/A</option>
          </select>
        </span>
      </h3>
      <div class="input-row" style="margin-bottom:10px">
        <div class="input-group">
          <label for="tx-ir-min-value">Minimum Acceptable Resistance <span style="font-weight:400;font-size:0.78rem;color:var(--text-secondary)">— verify against project procedure</span></label>
          <input type="number" id="tx-ir-min-value" value="100" step="any" min="0" placeholder="e.g. 100">
        </div>
        <div class="input-group">
          <label for="tx-ir-min-unit">Unit</label>
          <select id="tx-ir-min-unit">
            <option value="MΩ">MΩ</option><option value="GΩ">GΩ</option>
            <option value="kΩ">kΩ</option><option value="TΩ">TΩ</option>
          </select>
        </div>
      </div>
      <div class="dynamic-table-wrapper">
        <table class="dynamic-table">
          <thead>
            <tr>
              <th>Test Point</th>
              <th>Test Voltage (VDC)</th>
              <th>Duration</th>
              <th>Measured R</th>
              <th>Unit</th>
              <th>Min Required</th>
              <th>Result</th>
              <th>Comments</th>
              <th class="print-hide" style="width:36px"></th>
            </tr>
          </thead>
          <tbody id="tx-ir-tbody"></tbody>
        </table>
      </div>
      <button type="button" id="tx-add-ir-row" class="button-secondary btn-add-row" style="margin-top:0;width:auto;padding:6px 14px;font-size:0.82rem;">
        <i class="fas fa-plus"></i> Add IR Row
      </button>
    </div>`;
  }

  function addIRRow(e, defaultLabel) {
    irRowCount++;
    const id = irRowCount;
    const tbody = document.getElementById('tx-ir-tbody');
    const tr = document.createElement('tr');
    tr.id = 'tx-ir-row-' + id;
    tr.innerHTML = `
      <td><input type="text" id="tx-ir-tp-${id}" placeholder="Test point" value="${defaultLabel || ''}"></td>
      <td><input type="number" id="tx-ir-vdc-${id}" placeholder="e.g. 5000" step="any"></td>
      <td><input type="text" id="tx-ir-dur-${id}" placeholder="e.g. 60s"></td>
      <td><input type="number" id="tx-ir-val-${id}" placeholder="Measured" step="any"></td>
      <td>
        <select id="tx-ir-unit-${id}">
          <option value="MΩ">MΩ</option><option value="GΩ">GΩ</option>
          <option value="kΩ">kΩ</option><option value="TΩ">TΩ</option>
        </select>
      </td>
      <td><input type="text" id="tx-ir-minreq-${id}" placeholder="e.g. 100 MΩ"></td>
      <td><span class="status-badge-inline status-review" id="tx-ir-result-${id}">Review</span></td>
      <td><textarea id="tx-ir-comment-${id}" rows="1" placeholder="Comments" style="min-width:90px;height:36px;resize:vertical;"></textarea></td>
      <td class="print-hide"><button type="button" onclick="txRemoveIRRow(${id})" style="background:none;border:none;color:#b91c1c;cursor:pointer;font-size:1rem;" title="Remove"><i class="fas fa-trash-alt"></i></button></td>
    `;
    tbody.appendChild(tr);
    tr.addEventListener('input', reEvaluateIR);
    tr.addEventListener('change', reEvaluateIR);
  }

  window.txRemoveIRRow = function (id) {
    const row = document.getElementById('tx-ir-row-' + id);
    if (row) row.remove();
    reEvaluateIR();
    updateOverallSummary();
  };

  function reEvaluateIR() {
    const minVal = parseFloat(document.getElementById('tx-ir-min-value').value);
    const minUnit = document.getElementById('tx-ir-min-unit').value;
    const minMOhm = !isNaN(minVal) ? toMOhm(minVal, minUnit) : null;
    const tbody = document.getElementById('tx-ir-tbody');

    tbody.querySelectorAll('tr').forEach(tr => {
      const idSuffix = tr.id.replace('tx-ir-row-', '');
      const valEl = document.getElementById('tx-ir-val-' + idSuffix);
      const unitEl = document.getElementById('tx-ir-unit-' + idSuffix);
      const badge = document.getElementById('tx-ir-result-' + idSuffix);
      if (!valEl || !badge) return;

      const measMOhm = toMOhm(valEl.value, unitEl ? unitEl.value : 'MΩ');
      let result = 'Review', cls = 'status-review';

      if (measMOhm !== null && minMOhm !== null) {
        if (measMOhm >= minMOhm) { result = 'Pass'; cls = 'status-pass'; }
        else { result = 'Fail'; cls = 'status-fail'; }
      }
      badge.textContent = result;
      badge.className = 'status-badge-inline ' + cls;
    });
    updateOverallSummary();
  }

  // ─── Section 8: Functional Checks ────────────────────────────────────────────
  function buildSection8FunctionalChecks() {
    const items = [
      'Tap changer mechanical operation verified',
      'Tap position indication matches physical position',
      'Fan operation verified (if applicable)',
      'Temperature alarms checked (if applicable)',
      'Pressure relay / sudden pressure relay checked (if applicable)',
      'Buchholz relay checked (if applicable)',
      'Oil level alarm checked (if applicable)',
      'Winding temperature alarm checked (if applicable)',
      'Ground fault / neutral CT wiring checked (if applicable)',
      'Protection relay signals verified (if applicable)',
      'SCADA points verified (if applicable)',
      'Heater operation checked',
      'Cabinet lights / outlets checked',
      'Door switches checked (if applicable)'
    ];

    const rows = items.map((item, i) => {
      const id = 'tx-fc-' + i;
      return `<div class="inspection-row">
        <span class="inspection-label">${item}</span>
        <select id="${id}-status">
          <option value="">— Select —</option>
          <option value="Pass">Pass</option>
          <option value="Fail">Fail</option>
          <option value="N/A">N/A</option>
          <option value="Review">Review</option>
        </select>
        <input type="text" id="${id}-comment" placeholder="Comment">
      </div>`;
    }).join('');

    return `
    <div class="form-section" style="margin-top:20px">
      <h3 class="section-h3">
        <i class="fas fa-check-double" style="color:var(--primary-color)"></i> 8. Functional Checks
        <span style="margin-left:auto;display:flex;align-items:center;gap:8px;font-size:0.8rem;font-weight:400;">
          Section Status:
          <select class="tx-section-status" id="tx-fc-section-status" style="font-size:0.78rem;padding:2px 6px;height:28px;width:auto;">
            <option value="Required">Required</option><option value="Optional">Optional</option><option value="N/A">N/A</option>
          </select>
        </span>
      </h3>
      ${rows}
    </div>`;
  }

  // ─── Section 9: Oil / Fluid Test ─────────────────────────────────────────────
  function buildSection9OilTest() {
    return `
    <div class="form-section" style="margin-top:20px">
      <h3 class="section-h3">
        <i class="fas fa-flask" style="color:var(--primary-color)"></i> 9. Oil / Fluid Test Summary
        <span class="section-optional-badge">Optional</span>
        <span style="margin-left:auto;display:flex;align-items:center;gap:8px;font-size:0.8rem;font-weight:400;">
          Section Status:
          <select class="tx-section-status" id="tx-oil-section-status" style="font-size:0.78rem;padding:2px 6px;height:28px;width:auto;">
            <option value="Required">Required</option><option value="Optional" selected>Optional</option><option value="N/A">N/A</option>
          </select>
        </span>
      </h3>
      <div class="input-row">
        <div class="input-group">
          <label for="tx-oil-sampled">Oil Sample Taken?</label>
          <select id="tx-oil-sampled">
            <option value="">— Select —</option>
            <option>Yes</option><option>No</option><option>N/A</option>
          </select>
        </div>
        <div class="input-group"><label for="tx-oil-sample-date">Sample Date</label><input type="date" id="tx-oil-sample-date"></div>
        <div class="input-group"><label for="tx-oil-lab-ref">Lab Reference</label><input type="text" id="tx-oil-lab-ref" placeholder="Lab job number"></div>
      </div>
      <div class="input-row">
        <div class="input-group"><label for="tx-oil-bv">Oil Dielectric BV (kV)</label><input type="number" id="tx-oil-bv" placeholder="e.g. 60" step="any"></div>
        <div class="input-group"><label for="tx-oil-water">Water Content (ppm)</label><input type="number" id="tx-oil-water" placeholder="e.g. 15" step="any"></div>
        <div class="input-group"><label for="tx-oil-acidity">Acidity (mg KOH/g)</label><input type="number" id="tx-oil-acidity" placeholder="e.g. 0.02" step="any"></div>
        <div class="input-group">
          <label for="tx-dga">DGA Performed?</label>
          <select id="tx-dga">
            <option value="">— Select —</option>
            <option>Yes</option><option>No</option><option>Pending</option><option>N/A</option>
          </select>
        </div>
      </div>
      <div class="input-row">
        <div class="input-group" style="grid-column:span 2">
          <label for="tx-dga-summary">DGA Result Summary <span class="section-optional-badge">Summary only — do not diagnose here</span></label>
          <textarea id="tx-dga-summary" rows="2" placeholder="e.g. No key gases detected / Key gases within OEM limits / Elevated CH4..."></textarea>
        </div>
        <div class="input-group" style="grid-column:span 2">
          <label for="tx-oil-comments">Oil Test Comments</label>
          <textarea id="tx-oil-comments" rows="2" placeholder="Additional comments on oil test results..."></textarea>
        </div>
      </div>
    </div>`;
  }

  // ─── Overall Summary Card ─────────────────────────────────────────────────────
  function buildSectionSummary() {
    return `
    <div class="form-section" style="margin-top:20px;background:var(--background-dark);">
      <h3 class="section-h3"><i class="fas fa-clipboard-check" style="color:var(--primary-color)"></i> 10. Test Summary / Evaluation</h3>
      <div class="summary-grid">
        <div class="summary-item">
          <div class="summary-item-label">Visual Inspection</div>
          <div id="tx-sum-vis" class="summary-item-value"><span class="status-badge-inline status-review">—</span></div>
        </div>
        <div class="summary-item">
          <div class="summary-item-label">TTR Test</div>
          <div id="tx-sum-ttr" class="summary-item-value"><span class="status-badge-inline status-review">—</span></div>
        </div>
        <div class="summary-item">
          <div class="summary-item-label">Winding Resistance</div>
          <div id="tx-sum-wr" class="summary-item-value"><span class="status-badge-inline status-review">—</span></div>
        </div>
        <div class="summary-item">
          <div class="summary-item-label">Insulation Resistance</div>
          <div id="tx-sum-ir" class="summary-item-value"><span class="status-badge-inline status-review">—</span></div>
        </div>
        <div class="summary-item">
          <div class="summary-item-label">Functional Checks</div>
          <div id="tx-sum-fc" class="summary-item-value"><span class="status-badge-inline status-review">—</span></div>
        </div>
        <div class="summary-item">
          <div class="summary-item-label">Oil / Fluid Test</div>
          <div id="tx-sum-oil" class="summary-item-value"><span class="status-badge-inline status-review">—</span></div>
        </div>
      </div>
      <div style="margin-top:16px;padding-top:14px;border-top:2px solid var(--border-color);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
        <div style="font-weight:700;font-size:1rem;">Overall Status:</div>
        <span id="tx-overall-badge" class="status-badge-inline status-review" style="font-size:1rem;padding:6px 16px;">—</span>
      </div>
      <div style="font-size:0.78rem;color:var(--text-secondary);margin-top:8px;">
        Sections marked <strong>N/A</strong> or <strong>Optional</strong> do not affect the overall status unless they contain a Fail result.
        Required sections with any Fail → Overall = Fail. Required sections incomplete → Review. All required sections Pass or N/A → Pass.
      </div>
    </div>`;
  }

  function updateOverallSummary() {
    // Get section statuses and compute summaries
    const sections = [
      { statusId: 'tx-vis-status', sumId: 'tx-sum-vis', failPattern: (statusEl) => _getSectionResult('vi', statusEl) },
      { statusId: 'tx-ttr-section-status', sumId: 'tx-sum-ttr', failPattern: null, badgeId: 'tx-ttr-overall-badge' },
      { statusId: 'tx-wr-section-status', sumId: 'tx-sum-wr', failPattern: null, badgeId: 'tx-wr-overall-badge' },
      { statusId: 'tx-ir-section-status', sumId: 'tx-sum-ir', failPattern: (statusEl) => _getSectionResult('ir', statusEl) },
      { statusId: 'tx-fc-section-status', sumId: 'tx-sum-fc', failPattern: (statusEl) => _getSectionResult('fc', statusEl) },
      { statusId: 'tx-oil-section-status', sumId: 'tx-sum-oil', failPattern: null }
    ];

    let anyFail = false, anyReview = false;

    sections.forEach(sec => {
      const statusSel = document.getElementById(sec.statusId);
      const sumEl = document.getElementById(sec.sumId);
      if (!statusSel || !sumEl) return;

      const sectionMode = statusSel.value; // Required / Optional / N/A
      let result = '—', cls = 'status-review';

      if (sectionMode === 'N/A') {
        result = 'N/A'; cls = 'status-na';
      } else if (sec.badgeId) {
        // Use table summary badge
        const badge = document.getElementById(sec.badgeId);
        if (badge) {
          result = badge.textContent;
          cls = badge.className.replace('status-badge-inline ', '');
        }
      } else if (sec.failPattern) {
        const r = sec.failPattern(statusSel);
        result = r.result; cls = r.cls;
      }

      sumEl.innerHTML = `<span class="status-badge-inline ${cls}">${result}</span>`;

      if (sectionMode === 'Required' || sectionMode === '') {
        if (result === 'FAIL' || result === 'Fail') anyFail = true;
        else if (result !== 'PASS' && result !== 'Pass' && result !== 'N/A') anyReview = true;
      }
    });

    const overall = document.getElementById('tx-overall-badge');
    if (!overall) return;
    if (anyFail) { overall.textContent = 'FAIL / Action Required'; overall.className = 'status-badge-inline status-fail'; }
    else if (anyReview) { overall.textContent = 'REVIEW'; overall.className = 'status-badge-inline status-review'; }
    else { overall.textContent = 'PASS'; overall.className = 'status-badge-inline status-pass'; }
  }

  function _getSectionResult(prefix, statusSel) {
    // Count Pass/Fail from inspection rows
    let fail = false, hasData = false;
    document.querySelectorAll(`select[id^="tx-${prefix}-"][id$="-status"]`).forEach(sel => {
      if (sel === statusSel) return; // skip section control
      if (sel.value === 'Fail') fail = true;
      if (sel.value) hasData = true;
    });
    if (!hasData) return { result: '—', cls: 'status-review' };
    if (fail) return { result: 'Fail', cls: 'status-fail' };
    return { result: 'Pass', cls: 'status-pass' };
  }

  // ─── Section 11: Notes ────────────────────────────────────────────────────────
  function buildSection11Notes() {
    return `
    <div class="form-section" style="margin-top:20px">
      <h3 class="section-h3"><i class="fas fa-clipboard" style="color:var(--primary-color)"></i> 11. Notes and Corrective Actions</h3>
      <div class="input-row">
        <div class="input-group" style="grid-column:span 2">
          <label for="tx-observations">General Observations</label>
          <textarea id="tx-observations" rows="3" placeholder="General test observations..."></textarea>
        </div>
        <div class="input-group" style="grid-column:span 2">
          <label for="tx-abnormal">Abnormal Findings</label>
          <textarea id="tx-abnormal" rows="3" placeholder="Describe any abnormal results or findings..."></textarea>
        </div>
      </div>
      <div class="input-row">
        <div class="input-group" style="grid-column:span 2">
          <label for="tx-corrective">Corrective Actions Required</label>
          <textarea id="tx-corrective" rows="2" placeholder="Required corrective actions..."></textarea>
        </div>
        <div class="input-group" style="grid-column:span 2">
          <label for="tx-open-items">Open Items</label>
          <textarea id="tx-open-items" rows="2" placeholder="Pending items..."></textarea>
        </div>
      </div>
      <div class="input-row">
        <div class="input-group">
          <label for="tx-retest">Retest Required?</label>
          <select id="tx-retest">
            <option value="">— Select —</option>
            <option>Yes</option><option>No</option><option>N/A</option>
          </select>
        </div>
        <div class="input-group" style="grid-column:span 3">
          <label for="tx-retest-notes">Retest Notes</label>
          <input type="text" id="tx-retest-notes" placeholder="Notes on required retest">
        </div>
      </div>
      <div class="input-row">
        <div class="input-group" style="grid-column:span 4">
          <label for="tx-attachments">Attachments / Photo Evidence <span class="section-optional-badge">Note placeholder</span></label>
          <input type="text" id="tx-attachments" placeholder="Reference file names or storage locations for photos / attachments">
        </div>
      </div>
    </div>`;
  }

  // ─── Section 12: Signoff ──────────────────────────────────────────────────────
  function buildSection12Signoff() {
    return `
    <div class="form-section" style="margin-top:20px">
      <h3 class="section-h3"><i class="fas fa-pen-fancy" style="color:var(--primary-color)"></i> 12. Sign-off</h3>
      <div class="input-row">
        <div class="input-group"><label for="tx-tech-name">Technician Name</label><input type="text" id="tx-tech-name" placeholder="Full name"></div>
        <div class="input-group"><label>Technician Signature</label><div class="sig-placeholder">Signature field</div></div>
        <div class="input-group"><label for="tx-tech-date">Date</label><input type="date" id="tx-tech-date"></div>
      </div>
      <div class="input-row">
        <div class="input-group"><label for="tx-sup-name">Supervisor / Reviewer Name</label><input type="text" id="tx-sup-name" placeholder="Full name"></div>
        <div class="input-group"><label>Supervisor Signature</label><div class="sig-placeholder">Signature field</div></div>
        <div class="input-group"><label for="tx-sup-date">Date</label><input type="date" id="tx-sup-date"></div>
      </div>
      <div class="input-row">
        <div class="input-group"><label for="tx-witness-name">Customer / Witness Name</label><input type="text" id="tx-witness-name" placeholder="Full name"></div>
        <div class="input-group"><label>Witness Signature</label><div class="sig-placeholder">Signature field</div></div>
        <div class="input-group"><label for="tx-witness-date">Date</label><input type="date" id="tx-witness-date"></div>
        <div class="input-group">
          <label for="tx-final-status">Final Status</label>
          <select id="tx-final-status">
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

  // ─── Expose builder ───────────────────────────────────────────────────────────
  window.transformerTestFormBuilder = transformerTestFormBuilder;
  window['transformer-testFormBuilder'] = transformerTestFormBuilder;

})();
