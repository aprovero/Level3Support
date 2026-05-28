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
  const f = el('form');
  f.appendChild(inputGroup('site-name', 'Site / Substation', 'e.g. Desert Sunrise BESS'));
  f.appendChild(inputGroup('ground-point-a', 'Ground Point A', 'e.g. Panel A'));
  f.appendChild(inputGroup('ground-point-b', 'Ground Point B', 'e.g. Earth Rod'));
  f.appendChild(inputGroup('max-resistance', 'Maximum Allowed Resistance', '0.5', 'number', [{value:'Ω', label:'Ω'}], '0.5'));
  f.appendChild(inputGroup('measured-resistance', 'Measured Resistance', '', 'number', [{value:'Ω', label:'Ω'}]));
  document.getElementById('form-root').appendChild(f);
}

// 4. CT/PT Ratio Verification Tool
function ctPtRatioFormBuilder() {
  const f = el('form');
  f.appendChild(inputGroup('site-name', 'Site / Substation'));
  f.appendChild(inputGroup('ct-ratio-nominal', 'CT Nominal Ratio', '', 'text'));
  f.appendChild(inputGroup('pt-ratio-nominal', 'PT Nominal Ratio', '', 'text'));
  f.appendChild(inputGroup('ct-ratio-measured', 'CT Measured Ratio', '', 'text'));
  f.appendChild(inputGroup('pt-ratio-measured', 'PT Measured Ratio', '', 'text'));
  f.appendChild(inputGroup('allowable-error', 'Allowable Error %', '5', 'number', null, '5'));
  document.getElementById('form-root').appendChild(f);
}

// 5. Relay Settings Checklist
function relayChecklistFormBuilder() {
  const f = el('form');
  f.appendChild(inputGroup('site-name', 'Site / Substation'));
  f.appendChild(inputGroup('relay-manufacturer', 'Relay Manufacturer', 'SampleCo'));
  f.appendChild(inputGroup('relay-model', 'Relay Model', 'R-1234'));
  f.appendChild(inputGroup('settings-loaded', 'Settings Loaded', '', 'checkbox'));
  f.appendChild(inputGroup('verification-notes', 'Verification Notes', '', 'text'));
  document.getElementById('form-root').appendChild(f);
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
