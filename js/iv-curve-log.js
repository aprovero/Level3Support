/**
 * IV Curve Test Result Log
 * Level3Support — js/iv-curve-log.js
 */

document.addEventListener('DOMContentLoaded', () => {
  const addBtn      = document.getElementById('add-record-btn');
  const clearBtn    = document.getElementById('clear-form-btn');
  const exportBtn   = document.getElementById('export-csv-btn');
  const formError   = document.getElementById('form-error');
  const tbody       = document.getElementById('records-tbody');
  const emptyRow    = document.getElementById('empty-row');

  let records = [];

  // ── Load Sample Data ──────────────────────────────────────────────────
  function loadSamples() {
    document.getElementById('test-date').value     = new Date().toISOString().slice(0, 10);
    document.getElementById('site-name').value     = 'Solar Farm Alpha';
    document.getElementById('engineer').value      = 'J. Smith';
    document.getElementById('tracer-model').value  = 'Solmetric PVA-1500HE';

    const samples = [
      {
        inv: 'INV-01', mppt: 'MPPT-A', string: 'STR-01',
        voc: 682, isc: 10.2, vmp: 560, imp: 9.7, pmax: 5432,
        irr: 870, temp: 48, status: 'pass', defect: 'None', notes: ''
      },
      {
        inv: 'INV-01', mppt: 'MPPT-A', string: 'STR-03',
        voc: 664, isc: 9.8, vmp: 548, imp: 9.1, pmax: 4987,
        irr: 870, temp: 48, status: 'warn', defect: 'Shading',
        notes: 'Partial shading on rows 3-4 confirmed'
      }
    ];

    samples.forEach(s => {
      records.push(s);
    });
    renderTable();
    updateStats();
  }

  // ── Add Record ────────────────────────────────────────────────────────
  addBtn.addEventListener('click', () => {
    formError.style.display = 'none';

    const inv    = document.getElementById('f-inv').value.trim();
    const mppt   = document.getElementById('f-mppt').value.trim();
    const string = document.getElementById('f-string').value.trim();
    const voc    = parseFloat(document.getElementById('f-voc').value);
    const isc    = parseFloat(document.getElementById('f-isc').value);
    const vmp    = document.getElementById('f-vmp').value !== '' ? parseFloat(document.getElementById('f-vmp').value) : null;
    const imp    = document.getElementById('f-imp').value !== '' ? parseFloat(document.getElementById('f-imp').value) : null;
    const pmax   = document.getElementById('f-pmax').value !== '' ? parseFloat(document.getElementById('f-pmax').value) : null;
    const irr    = document.getElementById('f-irr').value !== '' ? parseFloat(document.getElementById('f-irr').value) : null;
    const temp   = document.getElementById('f-temp').value !== '' ? parseFloat(document.getElementById('f-temp').value) : null;
    const status = window.curveStatus;
    const defect = document.getElementById('f-defect').value;
    const notes  = document.getElementById('f-notes').value.trim();

    // Validate required fields
    if (!inv)                    return showFormError('Inverter ID is required.');
    if (!mppt)                   return showFormError('MPPT ID is required.');
    if (!string)                 return showFormError('String ID is required.');
    if (isNaN(voc) || voc <= 0) return showFormError('Voc must be a positive number.');
    if (isNaN(isc) || isc <= 0) return showFormError('Isc must be a positive number.');
    if (!status)                 return showFormError('Please select a curve status (Pass / Warning / Fail).');

    records.push({ inv, mppt, string, voc, isc, vmp, imp, pmax, irr, temp, status, defect, notes });
    renderTable();
    updateStats();
    clearForm();
  });

  // ── Clear Form ────────────────────────────────────────────────────────
  clearBtn.addEventListener('click', clearForm);

  function clearForm() {
    ['f-inv','f-mppt','f-string','f-voc','f-isc','f-vmp',
     'f-imp','f-pmax','f-irr','f-temp','f-notes'].forEach(id => {
      document.getElementById(id).value = '';
    });
    document.getElementById('f-defect').value = 'None';
    window.curveStatus = '';
    ['pass','warn','fail'].forEach(s => {
      document.getElementById(`pill-${s}`).className = 'status-pill';
    });
    formError.style.display = 'none';
  }

  // ── Delete Record ─────────────────────────────────────────────────────
  window.deleteRecord = function(idx) {
    records.splice(idx, 1);
    renderTable();
    updateStats();
  };

  // ── Render Table ──────────────────────────────────────────────────────
  function renderTable() {
    // Remove all rows except empty-row template (which we manage manually)
    Array.from(tbody.querySelectorAll('tr.data-row')).forEach(r => r.remove());

    if (records.length === 0) {
      emptyRow.style.display = '';
      exportBtn.disabled = true;
      exportBtn.style.opacity = '0.5';
      exportBtn.style.cursor = 'not-allowed';
      return;
    }

    emptyRow.style.display = 'none';
    exportBtn.disabled = false;
    exportBtn.style.opacity = '1';
    exportBtn.style.cursor = 'pointer';

    records.forEach((r, idx) => {
      const tr = document.createElement('tr');
      tr.className = `data-row row-${r.status}`;

      const badgeClass = r.status === 'pass' ? 'badge-pass' : r.status === 'warn' ? 'badge-warn' : 'badge-fail';
      const badgeLabel = r.status === 'pass' ? 'Pass' : r.status === 'warn' ? 'Warning' : 'Fail';

      const fmt = v => (v !== null && v !== undefined && !isNaN(v)) ? v : '—';

      tr.innerHTML = `
        <td style="color:var(--text-secondary); font-size:0.8rem;">${idx + 1}</td>
        <td style="font-weight:600;">${r.inv}</td>
        <td>${r.mppt}</td>
        <td>${r.string}</td>
        <td>${fmt(r.voc)}</td>
        <td>${fmt(r.isc)}</td>
        <td>${fmt(r.vmp)}</td>
        <td>${fmt(r.imp)}</td>
        <td>${fmt(r.pmax)}</td>
        <td>${fmt(r.irr)}</td>
        <td>${fmt(r.temp)}</td>
        <td><span class="badge ${badgeClass}">${badgeLabel}</span></td>
        <td style="font-size:0.8rem;">${r.defect}</td>
        <td class="notes-cell" title="${r.notes}">${r.notes || '—'}</td>
        <td><button class="btn-delete" onclick="deleteRecord(${idx})"><i class="fas fa-trash-alt"></i></button></td>
      `;
      tbody.appendChild(tr);
    });
  }

  // ── Update Stats ──────────────────────────────────────────────────────
  function updateStats() {
    const pass  = records.filter(r => r.status === 'pass').length;
    const warn  = records.filter(r => r.status === 'warn').length;
    const fail  = records.filter(r => r.status === 'fail').length;
    const total = records.length;

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-pass').textContent  = pass;
    document.getElementById('stat-warn').textContent  = warn;
    document.getElementById('stat-fail').textContent  = fail;
  }

  // ── Export CSV ────────────────────────────────────────────────────────
  exportBtn.addEventListener('click', () => {
    if (records.length === 0) return;

    const site     = document.getElementById('site-name').value;
    const date     = document.getElementById('test-date').value;
    const engineer = document.getElementById('engineer').value;
    const tracer   = document.getElementById('tracer-model').value;

    const header = [
      'Level3Support — IV Curve Test Result Log',
      `Site: ${site}  |  Date: ${date}  |  Engineer: ${engineer}  |  Tracer: ${tracer}`
    ];

    const cols = ['#','Inverter','MPPT','String','Voc (V)','Isc (A)',
                  'Vmp (V)','Imp (A)','Pmax (W)','Irradiance (W/m2)',
                  'Module Temp (C)','Status','Defect','Notes'];

    const dataRows = records.map((r, i) => [
      i + 1, r.inv, r.mppt, r.string,
      r.voc ?? '', r.isc ?? '',
      r.vmp ?? '', r.imp ?? '', r.pmax ?? '',
      r.irr ?? '', r.temp ?? '',
      r.status === 'pass' ? 'Pass' : r.status === 'warn' ? 'Warning' : 'Fail',
      r.defect, r.notes
    ]);

    const escape = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csvLines = [
      ...header.map(h => escape(h)),
      '',
      cols.map(escape).join(','),
      ...dataRows.map(row => row.map(escape).join(','))
    ];

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    const slug = (site || 'site').replace(/\s+/g, '_').toLowerCase();
    a.download = `iv_curve_log_${slug}_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  // ── Helpers ───────────────────────────────────────────────────────────
  function showFormError(msg) {
    formError.textContent  = msg;
    formError.style.display = 'block';
  }

  // ── Init ──────────────────────────────────────────────────────────────
  loadSamples();
});
