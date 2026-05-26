/**
 * Firmware Version Tracker
 * Level3Support — js/firmware-tracker.js
 */

document.addEventListener('DOMContentLoaded', () => {
  const addBtn    = document.getElementById('add-device-btn');
  const clearBtn  = document.getElementById('clear-form-btn');
  const exportBtn = document.getElementById('export-csv-btn');
  const formError = document.getElementById('form-error');
  const tbody     = document.getElementById('devices-tbody');
  const emptyRow  = document.getElementById('empty-row');
  const searchEl  = document.getElementById('search-input');

  let devices = [];

  // ── Expose render for filter pills ────────────────────────────────────
  window._renderDevices = () => renderTable(applyFilters());

  // ── Sample Data ────────────────────────────────────────────────────────
  function loadSamples() {
    devices = [
      {
        type: 'Inverter', mfr: 'SolarEdge', model: 'SE100K',
        serial: 'SN12345', location: 'Block-A Row-5',
        currentFw: 'v4.12.31', approvedFw: 'v4.12.35',
        updated: 'pending', result: 'Not Started', notes: 'Scheduled for next maintenance window'
      },
      {
        type: 'Datalogger', mfr: 'SMA', model: 'Sunny Portal Logger',
        serial: 'SN98765', location: 'Control Room',
        currentFw: 'v2.1.0', approvedFw: 'v2.1.0',
        updated: 'yes', result: 'Success', notes: 'Updated 2026-03-10'
      },
      {
        type: 'Router / Comms Gateway', mfr: 'Moxa', model: 'EDR-810',
        serial: 'SNMOXA01', location: 'Comm Cabinet',
        currentFw: 'v5.1', approvedFw: 'v5.4',
        updated: 'no', result: 'Not Started', notes: ''
      }
    ];
    renderTable(devices);
    updateStats();
  }

  // ── Add Device ────────────────────────────────────────────────────────
  addBtn.addEventListener('click', () => {
    formError.style.display = 'none';

    const type       = document.getElementById('f-type').value;
    const mfr        = document.getElementById('f-mfr').value.trim();
    const model      = document.getElementById('f-model').value.trim();
    const serial     = document.getElementById('f-serial').value.trim();
    const location   = document.getElementById('f-location').value.trim();
    const currentFw  = document.getElementById('f-current-fw').value.trim();
    const approvedFw = document.getElementById('f-approved-fw').value.trim();
    const updated    = window.updatedStatus;
    const result     = document.getElementById('f-result').value;
    const notes      = document.getElementById('f-notes').value.trim();

    if (!type)       return showError('Equipment Type is required.');
    if (!mfr)        return showError('Manufacturer is required.');
    if (!model)      return showError('Model is required.');
    if (!serial)     return showError('Serial Number is required.');
    if (!location)   return showError('Location / Tag is required.');
    if (!currentFw)  return showError('Current Firmware version is required.');
    if (!approvedFw) return showError('Approved Firmware version is required.');

    devices.push({ type, mfr, model, serial, location, currentFw, approvedFw, updated, result, notes });
    renderTable(applyFilters());
    updateStats();
    clearForm();
  });

  // ── Clear Form ────────────────────────────────────────────────────────
  clearBtn.addEventListener('click', clearForm);

  function clearForm() {
    document.getElementById('f-type').value = '';
    ['f-mfr','f-model','f-serial','f-location',
     'f-current-fw','f-approved-fw','f-notes'].forEach(id => {
      document.getElementById(id).value = '';
    });
    document.getElementById('f-result').value = '';
    window.updatedStatus = '';
    ['yes','no','pending'].forEach(v => {
      document.getElementById(`up-${v}`).className = 'up-pill';
    });
    formError.style.display = 'none';
  }

  // ── Delete Device ─────────────────────────────────────────────────────
  window.deleteDevice = function(serial) {
    devices = devices.filter(d => d.serial !== serial);
    renderTable(applyFilters());
    updateStats();
  };

  // ── Search ────────────────────────────────────────────────────────────
  searchEl.addEventListener('input', () => renderTable(applyFilters()));

  // ── Filter ────────────────────────────────────────────────────────────
  function applyFilters() {
    const q      = searchEl.value.toLowerCase().trim();
    const filter = window.activeFilter || 'all';

    return devices.filter(d => {
      const updateNeeded = isUpdateNeeded(d);

      // Text search across all fields
      const matchText = !q || [d.type, d.mfr, d.model, d.serial, d.location,
        d.currentFw, d.approvedFw, d.notes].some(v => v.toLowerCase().includes(q));

      // Status filter
      const matchFilter =
        filter === 'all'     ? true :
        filter === 'needs'   ? (updateNeeded && d.updated !== 'yes') :
        filter === 'ok'      ? (!updateNeeded || d.result === 'Success') :
        filter === 'pending' ? (d.updated === 'pending') : true;

      return matchText && matchFilter;
    });
  }

  // ── Update Needed Logic ───────────────────────────────────────────────
  function isUpdateNeeded(d) {
    if (!d.currentFw || !d.approvedFw) return false;
    return d.currentFw.trim().toLowerCase() !== d.approvedFw.trim().toLowerCase();
  }

  // ── Render Table ──────────────────────────────────────────────────────
  function renderTable(list) {
    Array.from(tbody.querySelectorAll('tr.data-row')).forEach(r => r.remove());

    if (list.length === 0) {
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

    list.forEach((d, displayIdx) => {
      const updateNeeded = isUpdateNeeded(d);
      const tr = document.createElement('tr');

      // Row highlight
      if (d.result === 'Success' && !updateNeeded) {
        tr.className = 'data-row up-to-date';
      } else if (updateNeeded && d.updated !== 'yes') {
        tr.className = 'data-row needs-update';
      } else {
        tr.className = 'data-row';
      }

      // Update Needed badge
      const needsBadge = updateNeeded
        ? '<span class="badge badge-yes">YES</span>'
        : '<span class="badge badge-no">No</span>';

      // Updated badge
      const updatedBadge =
        d.updated === 'yes'     ? '<span class="badge badge-updated-yes">Yes</span>'     :
        d.updated === 'no'      ? '<span class="badge badge-updated-no">No</span>'       :
        d.updated === 'pending' ? '<span class="badge badge-updated-pending">Pending</span>' :
        '<span style="color:var(--text-secondary); font-size:0.8rem;">—</span>';

      // Result badge
      const resultBadge =
        d.result === 'Success'     ? '<span class="badge badge-success">Success</span>'    :
        d.result === 'Failed'      ? '<span class="badge badge-failed">Failed</span>'      :
        d.result === 'Partial'     ? '<span class="badge badge-partial">Partial</span>'    :
        d.result === 'Not Started' ? '<span class="badge badge-na">Not Started</span>'     :
        '<span style="color:var(--text-secondary); font-size:0.8rem;">—</span>';

      tr.innerHTML = `
        <td style="color:var(--text-secondary); font-size:0.78rem;">${displayIdx + 1}</td>
        <td style="font-weight:600; white-space:nowrap;">${d.type}</td>
        <td>${d.mfr}</td>
        <td>${d.model}</td>
        <td style="font-family:monospace; font-size:0.8rem;">${d.serial}</td>
        <td>${d.location}</td>
        <td style="font-family:monospace; font-size:0.82rem; ${updateNeeded ? 'color:var(--error-color); font-weight:600;' : ''}">${d.currentFw}</td>
        <td style="font-family:monospace; font-size:0.82rem; color:var(--success-color); font-weight:600;">${d.approvedFw}</td>
        <td>${needsBadge}</td>
        <td>${updatedBadge}</td>
        <td>${resultBadge}</td>
        <td class="notes-cell" title="${d.notes}">${d.notes || '—'}</td>
        <td>
          <button class="btn-delete" onclick="deleteDevice('${d.serial}')">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // ── Update Stats ──────────────────────────────────────────────────────
  function updateStats() {
    const total  = devices.length;
    const needs  = devices.filter(d => isUpdateNeeded(d) && d.updated !== 'yes').length;
    const ok     = devices.filter(d => d.result === 'Success').length;
    const pend   = devices.filter(d => d.updated === 'pending').length;

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-needs').textContent = needs;
    document.getElementById('stat-ok').textContent    = ok;
    document.getElementById('stat-pend').textContent  = pend;
  }

  // ── Export CSV ────────────────────────────────────────────────────────
  exportBtn.addEventListener('click', () => {
    if (devices.length === 0) return;

    const cols = ['#','Type','Manufacturer','Model','Serial Number','Location',
                  'Current Firmware','Approved Firmware','Update Required',
                  'Update Performed','Result','Notes'];

    const rows = devices.map((d, i) => [
      i + 1, d.type, d.mfr, d.model, d.serial, d.location,
      d.currentFw, d.approvedFw,
      isUpdateNeeded(d) ? 'YES' : 'No',
      d.updated || '—', d.result || '—', d.notes
    ]);

    const escape = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csvLines = [
      escape('Level3Support — Firmware Version Tracker'),
      escape(`Exported: ${new Date().toISOString()}`),
      '',
      cols.map(escape).join(','),
      ...rows.map(r => r.map(escape).join(','))
    ];

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `firmware_tracker_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  // ── Helpers ───────────────────────────────────────────────────────────
  function showError(msg) {
    formError.textContent  = msg;
    formError.style.display = 'block';
  }

  // ── Init ──────────────────────────────────────────────────────────────
  loadSamples();
});
