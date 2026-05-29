// form-components.js – builds electrical test forms dynamically
// Each builder injects a <form> into #form-root and registers export logic.

// Utility: create an element with optional classes and innerHTML
function el(tag, classes = [], html = '') {
  const e = document.createElement(tag);
  if (classes.length) e.className = classes.join(' ');
  if (html) e.innerHTML = html;
  return e;
}

// Common input group creator
function inputGroup(id, label, placeholder = '', type = 'text', unitOptions = null, defaultValue = '') {
  const div = el('div', ['input-group']);
  const lbl = el('label', [], `${label} <span class="required">*</span>`);
  lbl.htmlFor = id;
  div.appendChild(lbl);
  if (unitOptions) {
    const wrapper = el('div', ['input-with-unit']);
    const inp = el('input');
    inp.type = type;
    inp.id = id;
    inp.placeholder = placeholder;
    inp.value = defaultValue;
    wrapper.appendChild(inp);
    const sel = el('select', ['input-unit-select']);
    sel.id = id + '-unit';
    unitOptions.forEach(opt => {
      const o = el('option');
      o.value = opt.value;
      o.textContent = opt.label;
      sel.appendChild(o);
    });
    wrapper.appendChild(sel);
    div.appendChild(wrapper);
  } else {
    const inp = el('input');
    inp.type = type;
    inp.id = id;
    inp.placeholder = placeholder;
    inp.value = defaultValue;
    div.appendChild(inp);
  }
  return div;
}

// CSV export – gathers all inputs inside the current form
function exportFormToCSV(toolName) {
  const form = document.querySelector('#form-root form');
  if (!form) return;
  const rows = [];
  rows.push(['Field', 'Value']);
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(el => {
    if (!el.id) return;
    const label = (form.querySelector(`label[for="${el.id}"]`) || {}).textContent?.replace(/\*/g, '').trim() || el.id;
    let value = el.type === 'checkbox' ? (el.checked ? 'Yes' : 'No') : el.value;
    if (el.id.endsWith('-unit')) {
      const related = form.querySelector(`#${el.id.replace('-unit', '')}`);
      if (related) value = related.value + ' ' + value;
    }
    rows.push([label, value]);
  });
  const csvContent = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(toolName || 'form').replace(/\s+/g, '_')}_export.csv`;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// JSON export
function exportFormToJSON(toolName) {
  const form = document.querySelector('#form-root form');
  if (!form) return;
  const data = { tool: toolName, exported: new Date().toISOString(), fields: {} };
  form.querySelectorAll('input, select, textarea').forEach(el => {
    if (!el.id) return;
    data.fields[el.id] = el.type === 'checkbox' ? el.checked : el.value;
  });
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(toolName || 'form').replace(/\s+/g, '_')}_export.json`;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---------- Form Builders ----------

// 1. Insulation Resistance Test Form
// Full implementation lives in js/insulation-resistance-form.js
// The builder is exposed as window.insulationResistanceFormBuilder there.
function insulationResistanceFormBuilderStub() {
  if (typeof window.insulationResistanceFormBuilder === 'function') {
    window.insulationResistanceFormBuilder();
  } else {
    document.getElementById('form-root').innerHTML = '<p style="color:var(--text-secondary)">Insulation resistance form module not loaded. Please check js/insulation-resistance-form.js.</p>';
  }
}

// 2. Transformer Test Results Form
// Full implementation lives in js/transformer-test-form.js
function transformerTestFormBuilderStub() {
  if (typeof window.transformerTestFormBuilder === 'function') {
    window.transformerTestFormBuilder();
  } else {
    document.getElementById('form-root').innerHTML = '<p style="color:var(--text-secondary)">Transformer test form module not loaded. Please check js/transformer-test-form.js.</p>';
  }
}

// 3. Grounding Continuity Test Form
function groundingContinuityFormBuilder() {
  const root = document.getElementById('form-root');
  root.innerHTML = '';

  // --- Safety Disclaimer (template guide §3: .warning-box) ---
  const disclaimer = el('div', ['warning-box']);
  disclaimer.innerHTML = `
    <i class="fas fa-exclamation-triangle"></i>
    <div>
      <div class="warning-title">⚠ Safety & Equipment Disclaimer</div>
      <p style="margin:0; font-size:0.85rem; line-height:1.55;">
        Grounding continuity testing must be performed by qualified personnel using appropriate PPE and in strict compliance with NFPA 70E and site Lockout/Tagout (LOTO) protocols. Ensure the system under test is completely de-energized and isolated before connecting micro-ohmmeters or high-current test sets to prevent hazardous potential rise or equipment damage.
      </p>
    </div>
  `;
  root.appendChild(disclaimer);

  const f = el('form', [], 'onsubmit="event.preventDefault();"');

  // --- Section 1: Site Metadata ---
  const sec1 = el('div', ['form-section']);
  sec1.style.background = 'var(--background-dark)';
  sec1.innerHTML = `
    <h3 class="section-h3"><i class="fas fa-file-contract" style="color:var(--primary-color);"></i> 1. Site & Test Metadata</h3>
    <div class="input-row">
      <div class="input-group">
        <label for="site-name">Project / Site Name</label>
        <input type="text" id="site-name" placeholder="e.g. Red Mesa Solar Grid" required>
      </div>
      <div class="input-group">
        <label for="eq-id">Equipment / Substation ID</label>
        <input type="text" id="eq-id" placeholder="e.g. BESS-SUB-01" required>
      </div>
      <div class="input-group">
        <label for="tech-name">Technician Name</label>
        <input type="text" id="tech-name" placeholder="e.g. A. Provero" required>
      </div>
      <div class="input-group">
        <label for="test-date">Date & Time</label>
        <input type="datetime-local" id="test-date" required>
      </div>
    </div>
  `;
  f.appendChild(sec1);

  // --- Section 2: Instrument & Acceptance Limits ---
  const sec2 = el('div', ['form-section']);
  sec2.style.background = 'var(--background-dark)';
  sec2.innerHTML = `
    <h3 class="section-h3"><i class="fas fa-tools" style="color:var(--primary-color);"></i> 2. Instrument Details & Limit Configuration</h3>
    <div class="input-row">
      <div class="input-group">
        <label for="inst-model">Instrument Model</label>
        <input type="text" id="inst-model" placeholder="e.g. Megger DET2/3" required>
      </div>
      <div class="input-group">
        <label for="inst-serial">Instrument Serial Number</label>
        <input type="text" id="inst-serial" placeholder="Serial #" required>
      </div>
      <div class="input-group">
        <label for="max-resistance">Max Allowed Resistance (Threshold)</label>
        <div class="input-with-unit">
          <input type="number" id="max-resistance" value="0.5" step="0.01" required>
          <div class="input-unit">Ω</div>
        </div>
      </div>
      <div class="input-group">
        <label for="test-current">Test Current / Method</label>
        <input type="text" id="test-current" placeholder="e.g. 10A / 2-Wire" value="10A Ductor">
      </div>
    </div>
  `;
  f.appendChild(sec2);

  // --- Section 3: Grounding Continuity Readings ---
  const sec3 = el('div', ['form-section']);
  sec3.style.background = 'var(--background-dark)';
  sec3.innerHTML = `
    <h3 class="section-h3"><i class="fas fa-list-ul" style="color:var(--primary-color);"></i> 3. Grounding Continuity Readings</h3>
    <div class="dynamic-table-wrapper">
      <table class="dynamic-table">
        <thead>
          <tr>
            <th style="width: 80px;">Point #</th>
            <th>Equipment / Connection Point Name</th>
            <th style="width: 200px;">Reference Main Grid Ground Point</th>
            <th style="width: 150px;">Measured Resistance</th>
            <th style="width: 120px;">Evaluation</th>
            <th>Notes / Comments</th>
            <th style="width: 50px;"></th>
          </tr>
        </thead>
        <tbody id="ground-tbody"></tbody>
      </table>
    </div>
    <button type="button" class="button-secondary btn-add-row" id="add-ground-row-btn" style="margin-top:0; width:auto; padding: 6px 12px; font-size:0.8rem;">
      <i class="fas fa-plus"></i> Add Test Point
    </button>
  `;
  f.appendChild(sec3);

  // --- Section 4: Visual Checklist ---
  const sec4 = el('div', ['form-section']);
  sec4.style.background = 'var(--background-dark)';
  sec4.innerHTML = `
    <h3 class="section-h3"><i class="fas fa-eye" style="color:var(--primary-color);"></i> 4. Visual & Mechanical Checks</h3>
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
      <div class="cb-row">
        <input type="checkbox" id="check-tightness">
        <label for="check-tightness">Examine connection tightness and torque marks (Pass/Fail)</label>
      </div>
      <div class="cb-row">
        <input type="checkbox" id="check-corrosion">
        <label for="check-corrosion">Verify no significant corrosion at connection terminals</label>
      </div>
      <div class="cb-row">
        <input type="checkbox" id="check-bonding">
        <label for="check-bonding">Check that cadweld/crimp bonding is intact and uncracked</label>
      </div>
      <div class="cb-row">
        <input type="checkbox" id="check-conduit">
        <label for="check-conduit">Inspect conduit grounding and ground wire armor protection</label>
      </div>
    </div>
  `;
  f.appendChild(sec4);

  // --- Summary Card & Approvals ---
  const sec5 = el('div', ['form-section']);
  sec5.style.background = 'var(--background-dark)';
  sec5.innerHTML = `
    <h3 class="section-h3"><i class="fas fa-signature" style="color:var(--primary-color);"></i> 5. Verification Sign-Off</h3>
    <div class="summary-card">
      <div class="result-header">
        <span>SUMMARY OF EVALUATION RESULTS</span>
        <span id="ground-summary-badge" class="status-badge-inline status-na">N/A</span>
      </div>
      <div class="summary-grid">
        <div class="summary-item">
          <div class="summary-item-label">Total Points Tested</div>
          <div class="summary-item-value" id="stat-total-points">0</div>
        </div>
        <div class="summary-item">
          <div class="summary-item-label">Passed Points</div>
          <div class="summary-item-value" style="color:#16a34a;" id="stat-passed-points">0</div>
        </div>
        <div class="summary-item">
          <div class="summary-item-label">Failed Points</div>
          <div class="summary-item-value" style="color:#dc2626;" id="stat-failed-points">0</div>
        </div>
        <div class="summary-item">
          <div class="summary-item-label">Max Measured</div>
          <div class="summary-item-value" id="stat-max-measured">0.00 Ω</div>
        </div>
      </div>
    </div>
    <div class="input-row" style="margin-top:20px; margin-bottom:0;">
      <div class="input-group" style="margin-bottom:0;">
        <label>Technician Signature</label>
        <div class="sig-placeholder">[ Technician Field Signature ]</div>
      </div>
      <div class="input-group" style="margin-bottom:0;">
        <label>QC Inspector Signature</label>
        <div class="sig-placeholder">[ Quality Assurance Inspector ]</div>
      </div>
    </div>
  `;
  f.appendChild(sec5);

  root.appendChild(f);

  // --- Calculations & Assumptions Box (template guide §4: .assumptions-box) ---
  const assumptionsBox = el('div', ['assumptions-box']);
  assumptionsBox.innerHTML = `
    <div class="assumptions-title"><i class="fas fa-calculator"></i> Standards & Grounding Guidelines</div>
    <ul class="assumptions-list">
      <li><strong>IEEE Std 80 / Std 142:</strong> Recommends grounding path resistance of less than 0.5 ohms for utility-scale solar/industrial systems, and under 5.0 ohms for standard commercial facilities.</li>
      <li><strong>Test Method:</strong> High-current low-resistance ohmmeter (Ductor) injection (typically 10A DC) is preferred to overcome contact resistance and paint/corrosion layers.</li>
      <li><strong>Pass/Fail Criterion:</strong> Connections exceeding 0.50 Ω (or custom threshold) are automatically flagged as FAIL and require terminal disassembly, cleaning, and re-torqueing.</li>
    </ul>
  `;
  root.appendChild(assumptionsBox);

  // --- Dynamic Interactions & Logic ---
  let rowCount = 0;
  function addGroundRow(desc = '', ref = 'Main Grid Loop', val = '', note = '') {
    rowCount++;
    const tr = el('tr', [], `id="ground-row-${rowCount}"`);
    tr.innerHTML = `
      <td style="text-align:center; font-weight:bold; color:var(--text-secondary);">${rowCount}</td>
      <td><input type="text" id="g-desc-${rowCount}" value="${desc}" placeholder="e.g. Inverter Pad 1 Frame" required style="width:100%;"></td>
      <td><input type="text" id="g-ref-${rowCount}" value="${ref}" placeholder="Reference point" style="width:100%;"></td>
      <td>
        <div class="input-with-unit">
          <input type="number" id="g-val-${rowCount}" value="${val}" step="0.001" placeholder="0.12" required style="width:100%;" class="ground-meas-input">
          <div class="input-unit">Ω</div>
        </div>
      </td>
      <td style="text-align:center;"><span id="g-badge-${rowCount}" class="status-badge-inline status-na">N/A</span></td>
      <td><input type="text" id="g-note-${rowCount}" value="${note}" placeholder="Optional notes" style="width:100%;"></td>
      <td style="text-align:center;"><button type="button" style="background:transparent; border:none; color:var(--error-color); cursor:pointer;" onclick="this.closest('tr').remove(); groundingContinuityEvaluator();"><i class="fas fa-trash-alt"></i></button></td>
    `;
    document.getElementById('ground-tbody').appendChild(tr);

    // Event listener for evaluation
    tr.querySelector('.ground-meas-input').addEventListener('input', groundingContinuityEvaluator);
  }

  document.getElementById('add-ground-row-btn').addEventListener('click', () => {
    addGroundRow();
    groundingContinuityEvaluator();
  });

  // Evaluate function
  function groundingContinuityEvaluator() {
    const maxVal = parseFloat(document.getElementById('max-resistance').value) || 0.5;
    const rows = document.querySelectorAll('#ground-tbody tr');
    
    let total = 0;
    let passed = 0;
    let failed = 0;
    let maxMeasured = 0;

    rows.forEach(row => {
      total++;
      const id = row.id.split('-').pop();
      const valInput = document.getElementById(`g-val-${id}`);
      const badge = document.getElementById(`g-badge-${id}`);
      
      if (!valInput || !badge) return;
      
      const val = parseFloat(valInput.value);
      if (isNaN(val)) {
        badge.textContent = 'N/A';
        badge.className = 'status-badge-inline status-na';
      } else {
        maxMeasured = Math.max(maxMeasured, val);
        if (val <= maxVal) {
          badge.textContent = 'PASS';
          badge.className = 'status-badge-inline status-pass';
          passed++;
        } else {
          badge.textContent = 'FAIL';
          badge.className = 'status-badge-inline status-fail';
          failed++;
        }
      }
    });

    document.getElementById('stat-total-points').textContent = total;
    document.getElementById('stat-passed-points').textContent = passed;
    document.getElementById('stat-failed-points').textContent = failed;
    document.getElementById('stat-max-measured').textContent = maxMeasured.toFixed(3) + ' Ω';

    const summaryBadge = document.getElementById('ground-summary-badge');
    if (total === 0) {
      summaryBadge.textContent = 'N/A';
      summaryBadge.className = 'status-badge-inline status-na';
    } else if (failed > 0) {
      summaryBadge.textContent = 'FAIL';
      summaryBadge.className = 'status-badge-inline status-fail';
    } else if (passed === total) {
      summaryBadge.textContent = 'PASS';
      summaryBadge.className = 'status-badge-inline status-pass';
    } else {
      summaryBadge.textContent = 'UNDER REVIEW';
      summaryBadge.className = 'status-badge-inline status-warn';
    }
  }

  document.getElementById('max-resistance').addEventListener('input', groundingContinuityEvaluator);

  // Insert initial rows
  addGroundRow('Inverter Pad 1 Frame', 'Main Loop Rod 1', '0.11');
  addGroundRow('Inverter Pad 1 Transformer Enclosure', 'Main Loop Rod 1', '0.15');
  addGroundRow('MV Switchgear Earth Bar', 'Main Sub Earth Grid', '0.08');
  addGroundRow('BESS Container Ground Cable A', 'Main Grid Terminal', '0.42');
  addGroundRow('BESS Container Ground Cable B', 'Main Grid Terminal', '0.55'); // fails initially

  groundingContinuityEvaluator();
}

// 4. CT/PT Ratio Verification Tool
function ctPtRatioFormBuilder() {
  const root = document.getElementById('form-root');
  root.innerHTML = '';

  // --- Safety Disclaimer (template guide §3: .warning-box) ---
  const disclaimer = el('div', ['warning-box']);
  disclaimer.innerHTML = `
    <i class="fas fa-exclamation-triangle"></i>
    <div>
      <div class="warning-title">⚠ Field Use Disclaimer</div>
      <p style="margin:0; font-size:0.85rem; line-height:1.55;">
        This tool is a field reference aid only. All CT/PT ratio and polarity measurements must be performed by qualified electrical personnel in strict accordance with IEEE C57.13 and site-specific LOTO/safety procedures. Results do not supersede manufacturer specifications, protection relay settings sheets, or utility interconnection agreements. Always verify all recorded data against official commissioning records before energizing protection circuits.
      </p>
    </div>
  `;
  root.appendChild(disclaimer);

  const f = el('form', [], 'onsubmit="event.preventDefault();"');

  // --- Section 1: Site Metadata ---
  const sec1 = el('div', ['form-section']);
  sec1.style.background = 'var(--background-dark)';
  sec1.innerHTML = `
    <h3 class="section-h3"><i class="fas fa-file-contract" style="color:var(--primary-color);"></i> 1. Site & Nameplate Details</h3>
    <div class="input-row">
      <div class="input-group">
        <label for="site-name">Project / Site Name</label>
        <input type="text" id="site-name" placeholder="e.g. Red Mesa Solar Grid" required>
      </div>
      <div class="input-group">
        <label for="eq-id">Instrument Transformer ID</label>
        <input type="text" id="eq-id" placeholder="e.g. Bay 1 CT-A" required>
      </div>
      <div class="input-group">
        <label for="transformer-type">Transformer Class</label>
        <select id="transformer-type">
          <option value="CT">Current Transformer (CT)</option>
          <option value="PT">Potential Transformer (PT / VT)</option>
        </select>
      </div>
      <div class="input-group">
        <label for="tech-name">Technician Name</label>
        <input type="text" id="tech-name" placeholder="e.g. A. Provero" required>
      </div>
    </div>
  `;
  f.appendChild(sec1);

  // --- Section 2: Limit Settings ---
  const sec2 = el('div', ['form-section']);
  sec2.style.background = 'var(--background-dark)';
  sec2.innerHTML = `
    <h3 class="section-h3"><i class="fas fa-cog" style="color:var(--primary-color);"></i> 2. Configuration & Tolerance Limits</h3>
    <div class="input-row">
      <div class="input-group">
        <label for="nominal-ratio-pri">Nominal Primary Rating</label>
        <input type="number" id="nominal-ratio-pri" value="1200" step="any" required>
      </div>
      <div class="input-group">
        <label for="nominal-ratio-sec">Nominal Secondary Rating</label>
        <input type="number" id="nominal-ratio-sec" value="5" step="any" required>
      </div>
      <div class="input-group">
        <label for="allowable-error">Ratio Tolerance Limit (%)</label>
        <div class="input-with-unit">
          <input type="number" id="allowable-error" value="0.5" step="0.1" required>
          <div class="input-unit">%</div>
        </div>
      </div>
      <div class="input-group">
        <label for="inst-model">Instrument Used</label>
        <input type="text" id="inst-model" value="OMNICRON CT Analyzer" placeholder="e.g. CT Analyzer">
      </div>
    </div>
  `;
  f.appendChild(sec2);

  // --- Section 3: Ratio Readings ---
  const sec3 = el('div', ['form-section']);
  sec3.style.background = 'var(--background-dark)';
  sec3.innerHTML = `
    <h3 class="section-h3"><i class="fas fa-chart-bar" style="color:var(--primary-color);"></i> 3. Test Ratio Measurements</h3>
    <div class="dynamic-table-wrapper">
      <table class="dynamic-table">
        <thead>
          <tr>
            <th style="width: 100px;">Tap Position</th>
            <th style="width: 150px;">Applied Primary</th>
            <th style="width: 150px;">Measured Secondary</th>
            <th style="width: 120px;">Calculated Ratio</th>
            <th style="width: 100px;">Nominal Ratio</th>
            <th style="width: 100px;">Ratio Error %</th>
            <th style="width: 130px;">Polarity Check</th>
            <th style="width: 100px;">Evaluation</th>
            <th style="width: 50px;"></th>
          </tr>
        </thead>
        <tbody id="ratio-tbody"></tbody>
      </table>
    </div>
    <button type="button" class="button-secondary btn-add-row" id="add-ratio-row-btn" style="margin-top:0; width:auto; padding: 6px 12px; font-size:0.8rem;">
      <i class="fas fa-plus"></i> Add Measurement Row
    </button>
  `;
  f.appendChild(sec3);

  // --- Summary Card & Approvals ---
  const sec4 = el('div', ['form-section']);
  sec4.style.background = 'var(--background-dark)';
  sec4.innerHTML = `
    <h3 class="section-h3"><i class="fas fa-clipboard-check" style="color:var(--primary-color);"></i> 4. Evaluation Summary & Sign-Off</h3>
    <div class="summary-card">
      <div class="result-header">
        <span>RATIO & POLARITY EVALUATION RESULTS</span>
        <span id="ratio-summary-badge" class="status-badge-inline status-na">N/A</span>
      </div>
      <div class="summary-grid">
        <div class="summary-item">
          <div class="summary-item-label">Nominal Ratio Class</div>
          <div class="summary-item-value" id="stat-nominal-class">240.00 : 1</div>
        </div>
        <div class="summary-item">
          <div class="summary-item-label">Max Percentage Error</div>
          <div class="summary-item-value" id="stat-max-error">0.00%</div>
        </div>
        <div class="summary-item">
          <div class="summary-item-label">Polarity Conformance</div>
          <div class="summary-item-value" id="stat-polarity-ok" style="color:#16a34a;">PASS</div>
        </div>
        <div class="summary-item">
          <div class="summary-item-label">Acceptance Standard</div>
          <div class="summary-item-value" id="stat-standard">IEEE C57.13</div>
        </div>
      </div>
    </div>
    <div class="input-row" style="margin-top:20px; margin-bottom:0;">
      <div class="input-group" style="margin-bottom:0;">
        <label>Technician Signature</label>
        <div class="sig-placeholder">[ Technician Field Signature ]</div>
      </div>
      <div class="input-group" style="margin-bottom:0;">
        <label>Lead Commissioning Engineer</label>
        <div class="sig-placeholder">[ Lead Commissioning Engineer ]</div>
      </div>
    </div>
  `;
  f.appendChild(sec4);

  root.appendChild(f);

  // --- Assumptions & Math Basis Box (template guide §6: .assumptions-box) ---
  const assumptionsBox = el('div', ['assumptions-box']);
  assumptionsBox.innerHTML = `
    <div class="assumptions-title"><i class="fas fa-calculator"></i> Calculation Basis &amp; Standards</div>
    <ul class="assumptions-list">
      <li><strong>Ratio Error Formula:</strong> Error (%) = |Calculated Ratio &minus; Nominal Ratio| / Nominal Ratio &times; 100</li>
      <li><strong>Calculated Ratio:</strong> Applied Primary Value &divide; Measured Secondary Value (same units per transformer class)</li>
      <li><strong>Nominal Ratio:</strong> Nameplate Primary Rating &divide; Nameplate Secondary Rating</li>
      <li><strong>Polarity Rule:</strong> Subtractive polarity is the standard for power-system instrument transformers. Additive or Reversed polarity is always a FAIL regardless of ratio error.</li>
      <li><strong>Pass Criteria:</strong> Both conditions must hold &mdash; ratio error &le; tolerance limit AND polarity = Subtractive.</li>
      <li><strong>Default Tolerance:</strong> 0.5% per IEEE C57.13 accuracy class requirements. Adjust to match the relay settings sheet for the specific protection zone.</li>
      <li><strong>Acceptance Standard:</strong> IEEE C57.13 &mdash; Standard Requirements for Instrument Transformers (current & voltage classes).</li>
    </ul>
  `;
  root.appendChild(assumptionsBox);

  // --- Dynamic Interactions & Logic ---
  let rowCount = 0;
  function addRatioRow(tap = 'X1-X5', pri = '', sec = '', polarity = 'Subtractive') {
    rowCount++;
    const tr = el('tr', [], `id="ratio-row-${rowCount}"`);
    tr.innerHTML = `
      <td><input type="text" id="r-tap-${rowCount}" value="${tap}" placeholder="e.g. X1-X5" required style="width:100%;"></td>
      <td>
        <input type="number" id="r-pri-${rowCount}" value="${pri}" step="any" placeholder="1200" class="ratio-calc-input" required style="width:100%;">
      </td>
      <td>
        <input type="number" id="r-sec-${rowCount}" value="${sec}" step="any" placeholder="5.01" class="ratio-calc-input" required style="width:100%;">
      </td>
      <td style="text-align:center; font-weight:600;" id="r-calc-ratio-${rowCount}">-</td>
      <td style="text-align:center; font-weight:600;" id="r-nominal-ratio-${rowCount}">-</td>
      <td style="text-align:center; font-weight:600;" id="r-err-${rowCount}">-</td>
      <td>
        <select id="r-pol-${rowCount}" class="ratio-calc-input" style="width:100%;">
          <option value="Subtractive" ${polarity === 'Subtractive' ? 'selected' : ''}>Subtractive (Correct)</option>
          <option value="Additive" ${polarity === 'Additive' ? 'selected' : ''}>Additive</option>
          <option value="Reversed" ${polarity === 'Reversed' ? 'selected' : ''}>Reversed (Fail)</option>
        </select>
      </td>
      <td style="text-align:center;"><span id="r-badge-${rowCount}" class="status-badge-inline status-na">N/A</span></td>
      <td style="text-align:center;"><button type="button" style="background:transparent; border:none; color:var(--error-color); cursor:pointer;" onclick="this.closest('tr').remove(); ctPtRatioEvaluator();"><i class="fas fa-trash-alt"></i></button></td>
    `;
    document.getElementById('ratio-tbody').appendChild(tr);

    tr.querySelectorAll('.ratio-calc-input').forEach(inp => {
      inp.addEventListener('input', ctPtRatioEvaluator);
    });
  }

  document.getElementById('add-ratio-row-btn').addEventListener('click', () => {
    addRatioRow();
    ctPtRatioEvaluator();
  });

  function ctPtRatioEvaluator() {
    const priNom = parseFloat(document.getElementById('nominal-ratio-pri').value) || 1200;
    const secNom = parseFloat(document.getElementById('nominal-ratio-sec').value) || 5;
    const nominalRatio = priNom / secNom;
    const limitErr = parseFloat(document.getElementById('allowable-error').value) || 0.5;

    document.getElementById('stat-nominal-class').textContent = nominalRatio.toFixed(2) + ' : 1';

    const rows = document.querySelectorAll('#ratio-tbody tr');
    let total = 0;
    let passed = 0;
    let failed = 0;
    let maxError = 0;
    let polarityPass = true;

    rows.forEach(row => {
      total++;
      const id = row.id.split('-').pop();
      const priVal = parseFloat(document.getElementById(`r-pri-${id}`).value);
      const secVal = parseFloat(document.getElementById(`r-sec-${id}`).value);
      const polarity = document.getElementById(`r-pol-${id}`).value;
      const calcCell = document.getElementById(`r-calc-ratio-${id}`);
      const nominalCell = document.getElementById(`r-nominal-ratio-${id}`);
      const errorCell = document.getElementById(`r-err-${id}`);
      const badge = document.getElementById(`r-badge-${id}`);

      if (isNaN(priVal) || isNaN(secVal) || secVal === 0) {
        calcCell.textContent = '-';
        nominalCell.textContent = '-';
        errorCell.textContent = '-';
        badge.textContent = 'N/A';
        badge.className = 'status-badge-inline status-na';
        return;
      }

      const calculatedRatio = priVal / secVal;
      calcCell.textContent = calculatedRatio.toFixed(2);
      nominalCell.textContent = nominalRatio.toFixed(2);

      // Percentage error equation: |Calculated - Nominal| / Nominal * 100
      const pctError = Math.abs(calculatedRatio - nominalRatio) / nominalRatio * 100;
      errorCell.textContent = pctError.toFixed(3) + '%';
      maxError = Math.max(maxError, pctError);

      const polOk = polarity === 'Subtractive';
      if (!polOk) polarityPass = false;

      if (pctError <= limitErr && polOk) {
        badge.textContent = 'PASS';
        badge.className = 'status-badge-inline status-pass';
        passed++;
      } else {
        badge.textContent = 'FAIL';
        badge.className = 'status-badge-inline status-fail';
        failed++;
      }
    });

    document.getElementById('stat-max-error').textContent = maxError.toFixed(3) + '%';
    document.getElementById('stat-polarity-ok').textContent = polarityPass ? 'PASS' : 'FAIL';
    document.getElementById('stat-polarity-ok').style.color = polarityPass ? '#16a34a' : '#dc2626';

    const summaryBadge = document.getElementById('ratio-summary-badge');
    if (total === 0) {
      summaryBadge.textContent = 'N/A';
      summaryBadge.className = 'status-badge-inline status-na';
    } else if (failed > 0) {
      summaryBadge.textContent = 'FAIL';
      summaryBadge.className = 'status-badge-inline status-fail';
    } else {
      summaryBadge.textContent = 'PASS';
      summaryBadge.className = 'status-badge-inline status-pass';
    }
  }

  document.getElementById('nominal-ratio-pri').addEventListener('input', ctPtRatioEvaluator);
  document.getElementById('nominal-ratio-sec').addEventListener('input', ctPtRatioEvaluator);
  document.getElementById('allowable-error').addEventListener('input', ctPtRatioEvaluator);

  // Insert initial rows
  addRatioRow('X1-X5 (Tap 1)', '1200', '5.01');
  addRatioRow('X1-X5 (Tap 2)', '600', '2.508');
  addRatioRow('X1-X5 (Tap 3)', '300', '1.248'); // error 0.8% initially

  ctPtRatioEvaluator();
}

// 5. Relay Settings Checklist
function relayChecklistFormBuilder() {
  const root = document.getElementById('form-root');
  root.innerHTML = '';

  // --- Safety Disclaimer (template guide §3: .warning-box) ---
  const disclaimer = el('div', ['warning-box']);
  disclaimer.innerHTML = `
    <i class="fas fa-exclamation-triangle"></i>
    <div>
      <div class="warning-title">⚠ Safety & Testing Disclaimer</div>
      <p style="margin:0; font-size:0.85rem; line-height:1.55;">
        Relay settings verification requires secondary current/voltage injection equipment and must only be conducted by trained electrical protection technicians. Ensure all trip outputs are properly isolated or blocked as required prior to testing to prevent accidental tripping of active substation equipment.
      </p>
    </div>
  `;
  root.appendChild(disclaimer);

  const f = el('form', [], 'onsubmit="event.preventDefault();"');

  // --- Section 1: Site Metadata & Feeder ---
  const sec1 = el('div', ['form-section']);
  sec1.style.background = 'var(--background-dark)';
  sec1.innerHTML = `
    <h3 class="section-h3"><i class="fas fa-file-contract" style="color:var(--primary-color);"></i> 1. Relay Identification & Feeder Metadata</h3>
    <div class="input-row">
      <div class="input-group">
        <label for="site-name">Project / Site Name</label>
        <input type="text" id="site-name" placeholder="e.g. Red Mesa Solar Grid" required>
      </div>
      <div class="input-group">
        <label for="eq-id">Relay Tag / Feeder Name</label>
        <input type="text" id="eq-id" placeholder="e.g. Main 34.5kV Feeder 1" required>
      </div>
      <div class="input-group">
        <label for="relay-model">Relay Manufacturer & Model</label>
        <input type="text" id="relay-model" value="SEL-751A Feeder Protection" placeholder="e.g. SEL-751A" required>
      </div>
      <div class="input-group">
        <label for="tech-name">Commissioning Tech</label>
        <input type="text" id="tech-name" placeholder="e.g. A. Provero" required>
      </div>
    </div>
  `;
  f.appendChild(sec1);

  // --- Section 2: Operational Protection Checklist ---
  const sec2 = el('div', ['form-section']);
  sec2.style.background = 'var(--background-dark)';
  sec2.innerHTML = `
    <h3 class="section-h3"><i class="fas fa-shield-alt" style="color:var(--primary-color);"></i> 2. Protection Settings Verification</h3>
    <div class="dynamic-table-wrapper">
      <table class="dynamic-table">
        <thead>
          <tr>
            <th style="width: 80px;">ANSI Code</th>
            <th style="width: 140px;">Function Name</th>
            <th style="width: 150px;">Target Settings Value</th>
            <th style="width: 150px;">Measured Pickup</th>
            <th style="width: 150px;">Measured Trip Time</th>
            <th style="width: 120px;">Evaluation</th>
            <th>Notes / Comments</th>
            <th style="width: 50px;"></th>
          </tr>
        </thead>
        <tbody id="relay-tbody"></tbody>
      </table>
    </div>
    <button type="button" class="button-secondary btn-add-row" id="add-relay-row-btn" style="margin-top:0; width:auto; padding: 6px 12px; font-size:0.8rem;">
      <i class="fas fa-plus"></i> Add Protection Setting
    </button>
  `;
  f.appendChild(sec2);

  // --- Section 3: Functional Visual Checks ---
  const sec3 = el('div', ['form-section']);
  sec3.style.background = 'var(--background-dark)';
  sec3.innerHTML = `
    <h3 class="section-h3"><i class="fas fa-check-double" style="color:var(--primary-color);"></i> 3. Functional Visual & Secondary Injection Checks</h3>
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
      <div class="cb-row">
        <input type="checkbox" id="check-comms">
        <label for="check-comms">Confirm Modbus/IEC 61850 communications connection</label>
      </div>
      <div class="cb-row">
        <input type="checkbox" id="check-aux">
        <label for="check-aux">Verify auxiliary contact status feedback loop works</label>
      </div>
      <div class="cb-row">
        <input type="checkbox" id="check-triptest">
        <label for="check-triptest">Execute actual circuit breaker trip test via relay (Pass/Fail)</label>
      </div>
      <div class="cb-row">
        <input type="checkbox" id="check-dc">
        <label for="check-dc">Check dual auxiliary DC power supply voltage level</label>
      </div>
    </div>
  `;
  f.appendChild(sec3);

  // --- Summary Card & Approvals ---
  const sec4 = el('div', ['form-section']);
  sec4.style.background = 'var(--background-dark)';
  sec4.innerHTML = `
    <h3 class="section-h3"><i class="fas fa-signature" style="color:var(--primary-color);"></i> 4. Evaluation Summary & Sign-Off</h3>
    <div class="summary-card">
      <div class="result-header">
        <span>PROTECTION SETTINGS COMMISSIONING STATUS</span>
        <span id="relay-summary-badge" class="status-badge-inline status-na">N/A</span>
      </div>
      <div class="summary-grid">
        <div class="summary-item">
          <div class="summary-item-label">Verified Protection Settings</div>
          <div class="summary-item-value" id="stat-relay-verified">0</div>
        </div>
        <div class="summary-item">
          <div class="summary-item-label">Relay Firmware Version</div>
          <div class="summary-item-value" id="stat-firmware">R104-V3.2</div>
        </div>
        <div class="summary-item">
          <div class="summary-item-label">Secondary Injection Trip</div>
          <div class="summary-item-value" id="stat-trip-ver" style="color:#16a34a;">PASS</div>
        </div>
        <div class="summary-item">
          <div class="summary-item-label">Settings File Hash</div>
          <div class="summary-item-value" id="stat-hash">0x8F92BE91</div>
        </div>
      </div>
    </div>
    <div class="input-row" style="margin-top:20px; margin-bottom:0;">
      <div class="input-group" style="margin-bottom:0;">
        <label>Technician Signature</label>
        <div class="sig-placeholder">[ Commissioning Field Tech ]</div>
      </div>
      <div class="input-group" style="margin-bottom:0;">
        <label>Site Electrical Lead Signature</label>
        <div class="sig-placeholder">[ Authorized QC Witness ]</div>
      </div>
    </div>
  `;
  f.appendChild(sec4);

  root.appendChild(f);

  // --- Calculations & Assumptions Box (template guide §4: .assumptions-box) ---
  const assumptionsBox = el('div', ['assumptions-box']);
  assumptionsBox.innerHTML = `
    <div class="assumptions-title"><i class="fas fa-calculator"></i> ANSI / IEEE Protection Relay Standards</div>
    <ul class="assumptions-list">
      <li><strong>IEEE C37.90:</strong> Standard for Relays and Relay Systems Associated with Electric Power Apparatus. Outlines testing tolerances and operational thresholds.</li>
      <li><strong>ANSI Protection Codes:</strong> Common codes checked include 50P/50N (Instantaneous Overcurrent), 51P/51N (AC Time Overcurrent), 59 (Overvoltage), and 27 (Undervoltage).</li>
      <li><strong>Calibration Tolerance:</strong> Measured pickup levels are expected to fall within +/- 5% of the target values set by protection settings coordination studies.</li>
    </ul>
  `;
  root.appendChild(assumptionsBox);

  // --- Dynamic Interactions & Logic ---
  let rowCount = 0;
  function addRelayRow(ansi = '50P', funcName = 'Instantaneous Overcurrent', target = '15.0 A', pickup = '', time = '', evalVal = 'PASS') {
    rowCount++;
    const tr = el('tr', [], `id="relay-row-${rowCount}"`);
    tr.innerHTML = `
      <td><input type="text" id="l-ansi-${rowCount}" value="${ansi}" placeholder="e.g. 50" required style="width:100%; font-weight:bold;"></td>
      <td><input type="text" id="l-func-${rowCount}" value="${funcName}" placeholder="e.g. Overcurrent" style="width:100%;"></td>
      <td><input type="text" id="l-target-${rowCount}" value="${target}" placeholder="e.g. 10.0 A" style="width:100%;"></td>
      <td><input type="text" id="l-pick-${rowCount}" value="${pickup}" placeholder="e.g. 10.05 A" style="width:100%;"></td>
      <td><input type="text" id="l-time-${rowCount}" value="${time}" placeholder="e.g. 0.05s" style="width:100%;"></td>
      <td>
        <select id="l-badge-${rowCount}" class="relay-eval-select" style="width:100%;">
          <option value="PASS" ${evalVal === 'PASS' ? 'selected' : ''}>PASS</option>
          <option value="FAIL" ${evalVal === 'FAIL' ? 'selected' : ''}>FAIL</option>
          <option value="REVIEW" ${evalVal === 'REVIEW' ? 'selected' : ''}>REVIEW</option>
        </select>
      </td>
      <td><input type="text" id="l-note-${rowCount}" value="" placeholder="e.g. Secondary test ok" style="width:100%;"></td>
      <td style="text-align:center;"><button type="button" style="background:transparent; border:none; color:var(--error-color); cursor:pointer;" onclick="this.closest('tr').remove(); relayEvaluator();"><i class="fas fa-trash-alt"></i></button></td>
    `;
    document.getElementById('relay-tbody').appendChild(tr);

    tr.querySelector('.relay-eval-select').addEventListener('change', relayEvaluator);
  }

  document.getElementById('add-relay-row-btn').addEventListener('click', () => {
    addRelayRow();
    relayEvaluator();
  });

  function relayEvaluator() {
    const rows = document.querySelectorAll('#relay-tbody tr');
    let total = 0;
    let passed = 0;
    let failed = 0;

    rows.forEach(row => {
      total++;
      const id = row.id.split('-').pop();
      const evalVal = document.getElementById(`l-badge-${id}`).value;
      if (evalVal === 'PASS') passed++;
      else if (evalVal === 'FAIL') failed++;
    });

    document.getElementById('stat-relay-verified').textContent = total;

    const summaryBadge = document.getElementById('relay-summary-badge');
    if (total === 0) {
      summaryBadge.textContent = 'N/A';
      summaryBadge.className = 'status-badge-inline status-na';
    } else if (failed > 0) {
      summaryBadge.textContent = 'FAIL';
      summaryBadge.className = 'status-badge-inline status-fail';
    } else {
      summaryBadge.textContent = 'PASS';
      summaryBadge.className = 'status-badge-inline status-pass';
    }
  }

  // Insert initial rows
  addRelayRow('50P', 'Instantaneous Overcurrent', '15.0 A', '15.02 A', '0.045 s');
  addRelayRow('51P', 'Time Overcurrent', '5.0 A (U3 Curve)', '5.01 A', '1.24 s');
  addRelayRow('59', 'Overvoltage Phase', '120.0 V', '120.1 V', '2.05 s');
  addRelayRow('27', 'Undervoltage Phase', '90.0 V', '89.92 V', '5.02 s');

  relayEvaluator();
}

// Expose builders on window using dash‑compatible keys
window['insulation-resistanceFormBuilder'] = insulationResistanceFormBuilderStub;
window['transformer-testFormBuilder'] = transformerTestFormBuilderStub;
window['grounding-continuityFormBuilder'] = groundingContinuityFormBuilder;
window['ct-pt-ratioFormBuilder'] = ctPtRatioFormBuilder;
window['relay-checklistFormBuilder'] = relayChecklistFormBuilder;

// Export function references for HTML button handlers
window.exportFormToCSV = exportFormToCSV;
window.exportFormToJSON = exportFormToJSON;

