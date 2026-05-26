// scada-checklist.js
// Premium SCADA Tag QA/QC Checklist functionality
// Dependencies: PapaParse (already available as papaparse.min.js in other pages)

document.addEventListener('DOMContentLoaded', () => {
  const sections = ['analog', 'digital', 'commands'];
  sections.forEach(initSection);
  const exportBtn = document.getElementById('export-csv');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportCSV);
  }
});

function initSection(section) {
  const addBtn = document.querySelector(`.add-row[data-section="${section}"]`);
  if (addBtn) {
    addBtn.addEventListener('click', () => addRow(section));
  }
}

function addRow(section) {
  const tbody = document.getElementById(`${section}-body`);
  if (!tbody) return;
  const tr = document.createElement('tr');
  // Define column layout per section
  let cols = [];
  if (section === 'analog') {
    cols = ['Tag', 'Engineering Unit', 'Scaling OK?', 'Timestamp Verified', 'Comments'];
  } else if (section === 'digital') {
    cols = ['Tag', 'Status Meaning', 'Logic Validated', 'Timestamp Verified', 'Comments'];
  } else if (section === 'commands') {
    cols = ['Tag', 'Command Description', 'Safety Check', 'Enable/Disable', 'Comments'];
  }
  cols.forEach(() => {
    const td = document.createElement('td');
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'input-cell';
    td.appendChild(input);
    tr.appendChild(td);
  });
  tbody.appendChild(tr);
}

function collectData() {
  const data = [];
  const sections = ['analog', 'digital', 'commands'];
  sections.forEach(section => {
    const tbody = document.getElementById(`${section}-body`);
    if (!tbody) return;
    const rows = Array.from(tbody.querySelectorAll('tr'));
    rows.forEach(row => {
      const cells = Array.from(row.querySelectorAll('input')).map(inp => inp.value.trim());
      data.push({ section, ...Object.fromEntries(cells.map((v, i) => [`col${i + 1}`, v])) });
    });
  });
  return data;
}

function exportCSV() {
  const data = collectData();
  if (data.length === 0) {
    alert('No data to export. Please add rows first.');
    return;
  }
  // Convert to CSV using PapaParse
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const timestamp = new Date().toISOString().split('T')[0];
  a.download = `scada-checklist_${timestamp}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
