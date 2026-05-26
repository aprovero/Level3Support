/**
 * String Current Imbalance Calculator
 * Level3Support — js/string-imbalance.js
 */

document.addEventListener('DOMContentLoaded', () => {
  const tbody       = document.getElementById('string-tbody');
  const addRowBtn   = document.getElementById('add-row-btn');
  const resetBtn    = document.getElementById('reset-btn');
  const calcBtn     = document.getElementById('calculate-btn');
  const errDiv      = document.getElementById('validation-error');
  const resultPanel = document.getElementById('result-panel');
  const exportBtn   = document.getElementById('export-csv-btn');
  const copyBtn     = document.getElementById('copy-btn');

  let rowCount = 0;
  let lastResults = null;

  // ── Row Management ──────────────────────────────────────────────────────
  function addRow(defaultId = '', defaultCurrent = '') {
    rowCount++;
    const tr = document.createElement('tr');
    tr.dataset.rowId = rowCount;
    tr.innerHTML = `
      <td style="color:var(--text-secondary); font-size:0.85rem; padding-left:14px;">${rowCount}</td>
      <td><input type="text" class="str-id" value="${defaultId}" placeholder="e.g. STR-0${rowCount}" style="min-width:90px;"></td>
      <td>
        <div class="input-with-unit" style="min-width:120px;">
          <input type="number" class="str-current" value="${defaultCurrent}" placeholder="e.g. 8.8" step="any" min="0" style="border-top-right-radius:0;border-bottom-right-radius:0;margin-bottom:0;height:36px;">
          <div class="input-unit" style="height:36px;">A</div>
        </div>
      </td>
      <td>
        <button class="btn-remove" onclick="removeRow(this)"><i class="fas fa-trash-alt"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  }

  // ── Load Sample Data ─────────────────────────────────────────────────────
  function loadSampleData() {
    tbody.innerHTML = '';
    rowCount = 0;
    document.getElementById('site-name').value = 'Solar Farm Alpha';
    document.getElementById('inv-id').value = 'INV-03';
    document.getElementById('mppt-id').value = 'MPPT-A';
    document.getElementById('irradiance').value = '850';
    document.getElementById('modules-per-string').value = '20';
    document.getElementById('threshold').value = '5';

    const samples = [
      ['STR-01', '8.90'],
      ['STR-02', '8.70'],
      ['STR-03', '7.20'],  // outlier — will be flagged
      ['STR-04', '8.80'],
    ];
    samples.forEach(([id, cur]) => addRow(id, cur));
  }

  // ── Remove Row ─────────────────────────────────────────────────────────
  window.removeRow = function(btn) {
    const tr = btn.closest('tr');
    tr.remove();
    // renumber
    Array.from(tbody.querySelectorAll('tr')).forEach((row, i) => {
      row.querySelector('td:first-child').textContent = i + 1;
    });
  };

  // ── Add Row Button ──────────────────────────────────────────────────────
  addRowBtn.addEventListener('click', () => addRow());

  // ── Reset ───────────────────────────────────────────────────────────────
  resetBtn.addEventListener('click', () => {
    loadSampleData();
    resultPanel.style.display = 'none';
    errDiv.style.display = 'none';
    lastResults = null;
  });

  // ── Calculate ───────────────────────────────────────────────────────────
  calcBtn.addEventListener('click', () => {
    errDiv.style.display = 'none';

    const threshold = parseFloat(document.getElementById('threshold').value);
    if (isNaN(threshold) || threshold <= 0) {
      showError('Please enter a valid positive imbalance threshold %.');
      return;
    }

    const rows = Array.from(tbody.querySelectorAll('tr'));
    if (rows.length < 2) {
      showError('Please add at least 2 strings.');
      return;
    }

    const strings = [];
    let hasError = false;
    rows.forEach((tr, idx) => {
      const id      = tr.querySelector('.str-id').value.trim();
      const current = parseFloat(tr.querySelector('.str-current').value);
      if (!id) {
        showError(`Row ${idx + 1}: String ID is required.`);
        hasError = true;
        return;
      }
      if (isNaN(current) || current < 0) {
        showError(`Row ${idx + 1}: Current must be a non-negative number.`);
        hasError = true;
        return;
      }
      strings.push({ id, current });
    });
    if (hasError) return;

    // Compute
    const currents = strings.map(s => s.current);
    const avg = currents.reduce((a, b) => a + b, 0) / currents.length;
    const minC = Math.min(...currents);
    const maxC = Math.max(...currents);

    let overallStatus = 'Normal';
    const results = strings.map(s => {
      const dev = ((s.current - avg) / avg) * 100;
      const absdev = Math.abs(dev);
      let status = 'NORMAL';
      if (s.current < 0 || absdev > 2 * threshold) {
        status = 'HIGH';
        overallStatus = 'Investigate';
      } else if (absdev > threshold) {
        status = 'WATCH';
        if (overallStatus === 'Normal') overallStatus = 'Watch';
      }
      return { id: s.id, current: s.current, dev, status };
    });

    lastResults = {
      site: document.getElementById('site-name').value,
      inv:  document.getElementById('inv-id').value,
      mppt: document.getElementById('mppt-id').value,
      irr:  document.getElementById('irradiance').value,
      mods: document.getElementById('modules-per-string').value,
      threshold, avg, minC, maxC, overallStatus, strings: results
    };

    renderResults(lastResults);
  });

  // ── Render Results ───────────────────────────────────────────────────────
  function renderResults(r) {
    document.getElementById('res-avg').textContent = r.avg.toFixed(2);
    document.getElementById('res-min').textContent = r.minC.toFixed(2);
    document.getElementById('res-max').textContent = r.maxC.toFixed(2);

    const badge = document.getElementById('overall-badge');
    badge.className = 'badge';
    if (r.overallStatus === 'Normal')      { badge.classList.add('badge-normal');  badge.textContent = '✓ Normal'; }
    else if (r.overallStatus === 'Watch')  { badge.classList.add('badge-watch');   badge.textContent = '⚠ Watch'; }
    else                                   { badge.classList.add('badge-investigate'); badge.textContent = '✗ Investigate'; }

    const resTbody = document.getElementById('result-tbody');
    resTbody.innerHTML = '';
    r.strings.forEach(s => {
      const tr = document.createElement('tr');
      const rowClass = s.status === 'NORMAL' ? 'row-normal' : s.status === 'WATCH' ? 'row-watch' : 'row-high';
      tr.className = rowClass;
      const badgeClass = s.status === 'NORMAL' ? 'badge-normal' : s.status === 'WATCH' ? 'badge-watch' : 'badge-high';
      const sign = s.dev > 0 ? '+' : '';
      tr.innerHTML = `
        <td style="font-weight:600;">${s.id}</td>
        <td>${s.current.toFixed(2)}</td>
        <td style="font-weight:600;">${sign}${s.dev.toFixed(2)}%</td>
        <td><span class="badge ${badgeClass}">${s.status}</span></td>
      `;
      resTbody.appendChild(tr);
    });

    resultPanel.style.display = 'block';
    resultPanel.scrollIntoView({ behavior: 'smooth' });
  }

  // ── Export CSV ──────────────────────────────────────────────────────────
  exportBtn.addEventListener('click', () => {
    if (!lastResults) return;
    const r = lastResults;
    const rows = [
      ['Level3Support — String Current Imbalance Calculator'],
      [`Site: ${r.site}`, `Inverter: ${r.inv}`, `MPPT: ${r.mppt}`, `Irradiance (W/m2): ${r.irr}`, `Modules/String: ${r.mods}`, `Threshold (%): ${r.threshold}`],
      [],
      ['String ID', 'Current (A)', 'Deviation (%)', 'Status'],
      ...r.strings.map(s => [s.id, s.current.toFixed(2), s.dev.toFixed(2), s.status]),
      [],
      ['Summary', `Average (A): ${r.avg.toFixed(2)}`, `Min (A): ${r.minC.toFixed(2)}`, `Max (A): ${r.maxC.toFixed(2)}`, `Overall: ${r.overallStatus}`],
      ['Disclaimer', 'Assisted field tool. Verify against approved project documents.']
    ];
    const csv = rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    triggerDownload(csv, `string_imbalance_${Date.now()}.csv`, 'text/csv');
  });

  // ── Copy Summary ─────────────────────────────────────────────────────────
  copyBtn.addEventListener('click', () => {
    if (!lastResults) return;
    const r = lastResults;
    const lines = [
      `Level3Support — String Current Imbalance`,
      `Site: ${r.site} | Inverter: ${r.inv} | MPPT: ${r.mppt}`,
      `Irradiance: ${r.irr} W/m² | Modules/String: ${r.mods} | Threshold: ${r.threshold}%`,
      `─────────────────────────────`,
      `Average: ${r.avg.toFixed(2)} A | Min: ${r.minC.toFixed(2)} A | Max: ${r.maxC.toFixed(2)} A`,
      `Overall Status: ${r.overallStatus}`,
      `─────────────────────────────`,
      ...r.strings.map(s => {
        const sign = s.dev > 0 ? '+' : '';
        return `${s.id}: ${s.current.toFixed(2)} A  Δ${sign}${s.dev.toFixed(2)}%  [${s.status}]`;
      }),
      `─────────────────────────────`,
      `Disclaimer: Assisted field tool. Verify against approved documents.`
    ];
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      const orig = copyBtn.innerHTML;
      copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      setTimeout(() => copyBtn.innerHTML = orig, 2000);
    });
  });

  // ── Helpers ──────────────────────────────────────────────────────────────
  function showError(msg) {
    errDiv.textContent = msg;
    errDiv.style.display = 'block';
  }

  function triggerDownload(content, filename, type) {
    const blob = new Blob([content], { type });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  loadSampleData();
});
