/**
 * Corrective Action Tracker / CAPA Log JS
 * Level3Support
 */

document.addEventListener('DOMContentLoaded', () => {
  const capaSourceSelect = document.getElementById('capa-source');
  const capaOwnerInput = document.getElementById('capa-owner');
  const capaDueInput = document.getElementById('capa-due');
  const capaPrioritySelect = document.getElementById('capa-priority');
  const capaStatusSelect = document.getElementById('capa-status');
  const capaVerificationSelect = document.getElementById('capa-verification');
  const capaFindingInput = document.getElementById('capa-finding');
  const capaCorrectiveInput = document.getElementById('capa-corrective');
  const capaPreventiveInput = document.getElementById('capa-preventive');
  const capaEvidenceInput = document.getElementById('capa-evidence');
  const capaNotesInput = document.getElementById('capa-notes');

  const addBtn = document.getElementById('add-btn');
  const exportCsvBtn = document.getElementById('export-csv-btn');
  const filterPriority = document.getElementById('filter-priority');
  const filterStatus = document.getElementById('filter-status');
  const actionTbody = document.getElementById('action-tbody');
  const validationError = document.getElementById('validation-error');

  let actionItems = [];

  // Load items from local storage
  function loadActionItems() {
    const saved = localStorage.getItem('l3s_capa_items');
    if (saved) {
      actionItems = JSON.parse(saved);
    } else {
      // Sample data
      actionItems = [
        {
          id: "CAPA-2026-0001",
          source: "RCA",
          finding: "Inverter INV-02 faulted on IGBT overtemperature. Found cooling intake air filter fully blocked with field dust and cottonwood seeds.",
          corrective: "Replaced all intake filters on inverter block 02.",
          preventive: "Revised monthly preventative maintenance (PM) instructions to include mandatory filter status checks and cleaning.",
          owner: "Andres Provero",
          dueDate: "2026-05-15",
          priority: "High",
          status: "Verified",
          verification: "Yes",
          evidence: "PM ticket #4521 logged in site CMMS.",
          notes: "Completed ahead of schedule."
        },
        {
          id: "CAPA-2026-0002",
          source: "Commissioning",
          finding: "Torque marks missing on DC combiner box #04 positive input cable lugs.",
          corrective: "Re-verified torque to 24 Nm and marked all terminals with paint marker.",
          preventive: "Re-brief electrical QA team on cable termination validation procedure.",
          owner: "John Smith",
          dueDate: "2026-05-30",
          priority: "Medium",
          status: "In Progress",
          verification: "Yes",
          evidence: "In-progress checking list",
          notes: "Verification planned for tomorrow."
        },
        {
          id: "CAPA-2026-0003",
          source: "HSE",
          finding: "Missing LOTO padlocks or tags on feeder breaker 3B lockbox during aux transformer inspection.",
          corrective: "Immediate halt of work. Re-established full boundary isolation and locked the box.",
          preventive: "Conduct safety stand-down with all commissioning technicians regarding LOTO isolation point audits.",
          owner: "Sarah Jenkins",
          dueDate: "2026-05-24", // Overdue in 2026-05-26
          priority: "Critical",
          status: "Open",
          verification: "Yes",
          evidence: "",
          notes: "Investigating why isolation boundary was violated."
        }
      ];
      saveActionItems();
    }
    renderTable();
  }

  function saveActionItems() {
    localStorage.setItem('l3s_capa_items', JSON.stringify(actionItems));
  }

  // Set default due date
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  capaDueInput.value = nextWeek.toISOString().slice(0, 10);

  addBtn.addEventListener('click', () => {
    validationError.style.display = 'none';

    const source = capaSourceSelect.value;
    const owner = capaOwnerInput.value.trim();
    const dueDate = capaDueInput.value;
    const priority = capaPrioritySelect.value;
    const status = capaStatusSelect.value;
    const verification = capaVerificationSelect.value;
    const finding = capaFindingInput.value.trim();
    const corrective = capaCorrectiveInput.value.trim();
    const preventive = capaPreventiveInput.value.trim();
    const evidence = capaEvidenceInput.value.trim();
    const notes = capaNotesInput.value.trim();

    if (!owner) {
      showError('Please enter an Owner.');
      return;
    }
    if (!dueDate) {
      showError('Please select a valid Due Date.');
      return;
    }
    if (!finding) {
      showError('Please describe the Finding/Issue.');
      return;
    }

    const newId = `CAPA-2026-${(actionItems.length + 1).toString().padStart(4, '0')}`;

    const newItem = {
      id: newId,
      source,
      owner,
      dueDate,
      priority,
      status,
      verification,
      finding,
      corrective,
      preventive,
      evidence,
      notes
    };

    actionItems.push(newItem);
    saveActionItems();
    renderTable();

    // Reset inputs
    capaOwnerInput.value = "";
    capaFindingInput.value = "";
    capaCorrectiveInput.value = "";
    capaPreventiveInput.value = "";
    capaEvidenceInput.value = "";
    capaNotesInput.value = "";
  });

  // Render log table with filters
  function renderTable() {
    actionTbody.innerHTML = '';
    const selectedPriority = filterPriority.value;
    const selectedStatus = filterStatus.value;
    const todayStr = new Date().toISOString().slice(0, 10);

    const filtered = actionItems.filter(item => {
      const matchP = selectedPriority === 'all' || item.priority === selectedPriority;
      const matchS = selectedStatus === 'all' || item.status === selectedStatus;
      return matchP && matchS;
    });

    if (filtered.length === 0) {
      actionTbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-light);">No matching action items found.</td></tr>';
      return;
    }

    filtered.forEach(item => {
      const tr = document.createElement('tr');
      const isOverdue = item.dueDate < todayStr && item.status !== 'Closed' && item.status !== 'Verified';

      if (isOverdue) {
        tr.className = 'overdue-alert';
      }

      tr.innerHTML = `
        <td style="font-weight: 600;">${item.id}</td>
        <td>${item.source}</td>
        <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${item.finding}">${item.finding}</td>
        <td>${item.owner}</td>
        <td>${item.dueDate} ${isOverdue ? '<span class="status-badge-inline status-critical" style="font-size: 0.65rem;">Overdue</span>' : ''}</td>
        <td><span class="status-badge-inline ${item.priority === 'Critical' ? 'status-critical' : item.priority === 'High' ? 'status-warning' : 'status-normal'}">${item.priority}</span></td>
        <td><span class="status-badge-inline ${item.status === 'Verified' || item.status === 'Closed' ? 'status-normal' : 'status-warning'}">${item.status}</span></td>
        <td>
          <button onclick="deleteCapaItem('${item.id}')" class="btn-danger" style="margin-top: 0; min-height: auto; width: 28px; height: 28px; padding: 0;"><i class="fas fa-trash" style="font-size: 0.8rem;"></i></button>
        </td>
      `;

      actionTbody.appendChild(tr);
    });
  }

  // Handle item deletion via global scope
  window.deleteCapaItem = (id) => {
    if (confirm(`Are you sure you want to delete ${id}?`)) {
      actionItems = actionItems.filter(item => item.id !== id);
      saveActionItems();
      renderTable();
    }
  };

  // Filters change listener
  filterPriority.addEventListener('change', renderTable);
  filterStatus.addEventListener('change', renderTable);

  // Export CSV
  exportCsvBtn.addEventListener('click', () => {
    if (actionItems.length === 0) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Action ID,Source,Finding,Owner,Due Date,Priority,Status,Verification Required,Evidence,Notes\r\n";

    actionItems.forEach(item => {
      const row = [
        item.id,
        item.source,
        `"${item.finding.replace(/"/g, '""')}"`,
        item.owner,
        item.dueDate,
        item.priority,
        item.status,
        item.verification,
        `"${(item.evidence || '').replace(/"/g, '""')}"`,
        `"${(item.notes || '').replace(/"/g, '""')}"`
      ].join(",");
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `capa_log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  });

  function showError(msg) {
    validationError.textContent = msg;
    validationError.style.display = 'block';
  }

  loadActionItems();
});
