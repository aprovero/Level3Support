/**
 * Level3Support — commissioning-punchlist.js
 * © 2026 Level3Support
 */

// Initial Sample Punchlist Items
const DEFAULT_ITEMS = [
  {
    id: "PL-001",
    location: "Inverter Pad 3",
    equipment: "INV-03",
    desc: "AC door gasket loose, showing potential for water ingress.",
    category: "Mechanical",
    severity: "High",
    assignee: "EPC Mechanical Team",
    dueDate: "2026-06-01",
    status: "Open",
    evidence: "",
    notes: "Requires replacement of weatherproofing strip."
  },
  {
    id: "PL-002",
    location: "BESS Container 2",
    equipment: "Rack-A4-Battery",
    desc: "Communication cable daisy chain loose on cell cluster module 8.",
    category: "SCADA/communications",
    severity: "Critical",
    assignee: "BESS Integration Specialist",
    dueDate: "2026-05-28",
    status: "In Progress",
    evidence: "",
    notes: "Affects battery rack monitoring. Critical before heat runs."
  },
  {
    id: "PL-003",
    location: "Substation Yard",
    equipment: "AUX-TX-01",
    desc: "Ground bonding strap lug loose at the transformer neutral bushing transformer housing connection.",
    category: "DC electrical",
    severity: "Critical",
    assignee: "Substation Electrical Lead",
    dueDate: "2026-05-30",
    status: "Blocked",
    evidence: "",
    notes: "Needs M12 stainless bolt replacement. Awaiting parts."
  },
  {
    id: "PL-004",
    location: "Control House",
    equipment: "SCADA-RTU-01",
    desc: "Verify that UPS alarm telemetry register points are mapped correct to utility master HMI.",
    category: "Documentation",
    severity: "Medium",
    assignee: "SCADA Engineer",
    dueDate: "2026-06-05",
    status: "Closed",
    evidence: "Verified via SCADA register point check test protocol.",
    notes: "Done."
  }
];

let punchlist = [];

document.addEventListener("DOMContentLoaded", () => {
  loadPunchlist();
  loadMetadata();

  // Project Meta Listeners to save locally
  const metaIds = ["proj-name", "proj-site", "proj-customer", "proj-date", "proj-author"];
  metaIds.forEach(id => {
    document.getElementById(id).addEventListener("input", saveMetadata);
  });

  // Filter Listeners
  document.getElementById("filter-category").addEventListener("change", renderPunchlist);
  document.getElementById("filter-severity").addEventListener("change", renderPunchlist);
  document.getElementById("filter-status").addEventListener("change", renderPunchlist);

  // Button Action Listeners
  document.getElementById("add-item-btn").addEventListener("click", () => openModal());
  document.getElementById("export-csv-btn").addEventListener("click", exportCSV);
  document.getElementById("export-json-btn").addEventListener("click", exportJSON);
  document.getElementById("copy-summary-btn").addEventListener("click", copyEmailSummary);
  document.getElementById("reset-btn").addEventListener("click", resetPunchlist);
});

function loadPunchlist() {
  const stored = localStorage.getItem("l3s_punchlist");
  if (stored) {
    try {
      punchlist = JSON.parse(stored);
    } catch (e) {
      punchlist = [...DEFAULT_ITEMS];
    }
  } else {
    punchlist = [...DEFAULT_ITEMS];
    savePunchlistToStorage();
  }
  renderPunchlist();
}

function savePunchlistToStorage() {
  localStorage.setItem("l3s_punchlist", JSON.stringify(punchlist));
}

function loadMetadata() {
  document.getElementById("proj-name").value = localStorage.getItem("l3s_pl_name") || "Alpha PV Solar Project";
  document.getElementById("proj-site").value = localStorage.getItem("l3s_pl_site") || "Main Substation";
  document.getElementById("proj-customer").value = localStorage.getItem("l3s_pl_cust") || "Clean Power Corp";
  document.getElementById("proj-author").value = localStorage.getItem("l3s_pl_author") || "";
  
  const storedDate = localStorage.getItem("l3s_pl_date");
  document.getElementById("proj-date").value = storedDate || new Date().toISOString().split('T')[0];
}

function saveMetadata() {
  localStorage.setItem("l3s_pl_name", document.getElementById("proj-name").value);
  localStorage.setItem("l3s_pl_site", document.getElementById("proj-site").value);
  localStorage.setItem("l3s_pl_cust", document.getElementById("proj-customer").value);
  localStorage.setItem("l3s_pl_author", document.getElementById("proj-author").value);
  localStorage.setItem("l3s_pl_date", document.getElementById("proj-date").value);
}

function calculateCounts() {
  let total = punchlist.length;
  let openCount = punchlist.filter(item => item.status !== "Closed").length;
  let criticalCount = punchlist.filter(item => (item.severity === "Critical" || item.severity === "High") && item.status !== "Closed").length;
  let closedCount = punchlist.filter(item => item.status === "Closed").length;

  document.getElementById("count-total").textContent = total;
  document.getElementById("count-open").textContent = openCount;
  document.getElementById("count-critical").textContent = criticalCount;
  document.getElementById("count-closed").textContent = closedCount;
}

function renderPunchlist() {
  const tbody = document.getElementById("punch-tbody");
  tbody.innerHTML = "";

  const catFilter = document.getElementById("filter-category").value;
  const sevFilter = document.getElementById("filter-severity").value;
  const statFilter = document.getElementById("filter-status").value;

  punchlist.forEach((item, index) => {
    const matchesCat = catFilter === "all" || item.category === catFilter;
    const matchesSev = sevFilter === "all" || item.severity === sevFilter;
    const matchesStat = statFilter === "all" || item.status === statFilter;

    if (matchesCat && matchesSev && matchesStat) {
      const tr = document.createElement("tr");

      let sevBadge = "badge-low";
      if (item.severity === "Critical") sevBadge = "badge-critical";
      if (item.severity === "High") sevBadge = "badge-high";
      if (item.severity === "Medium") sevBadge = "badge-medium";

      let statusBadge = "badge-open";
      if (item.status === "In Progress") statusBadge = "badge-progress";
      if (item.status === "Blocked") statusBadge = "badge-blocked";
      if (item.status === "Closed") statusBadge = "badge-closed";

      tr.innerHTML = `
        <td style="font-weight:700; font-family:monospace;">${item.id}</td>
        <td>${item.location}</td>
        <td style="font-weight:600;">${item.equipment}</td>
        <td style="max-width:250px; font-size:0.82rem;">${item.desc}</td>
        <td><span style="font-size:0.8rem; font-weight:550; color:var(--text-secondary);">${item.category}</span></td>
        <td><span class="badge ${sevBadge}">${item.severity}</span></td>
        <td style="font-size:0.8rem;">${item.assignee}</td>
        <td><span class="badge ${statusBadge}">${item.status}</span></td>
        <td style="text-align: center;">
          <div style="display:flex; gap:6px; justify-content:center;">
            <button class="btn-remove" style="background:#dbeafe; color:#1e40af; border:1px solid #93c5fd; padding:3px 8px;" onclick="openModal(${index})"><i class="fas fa-edit"></i></button>
            <button class="btn-remove" style="padding:3px 8px;" onclick="deleteItem(${index})"><i class="fas fa-trash-alt"></i></button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    }
  });

  calculateCounts();
}

function openModal(index = null) {
  const modal = document.getElementById("punch-modal");
  const form = document.getElementById("punch-form");
  form.reset();

  if (index !== null) {
    const item = punchlist[index];
    document.getElementById("punch-index").value = index;
    document.getElementById("item-loc").value = item.location;
    document.getElementById("item-eq").value = item.equipment;
    document.getElementById("item-desc").value = item.desc;
    document.getElementById("item-cat").value = item.category;
    document.getElementById("item-sev").value = item.severity;
    document.getElementById("item-assign").value = item.assignee;
    document.getElementById("item-due").value = item.dueDate || "";
    document.getElementById("item-status").value = item.status;
    document.getElementById("item-evidence").value = item.evidence || "";
    document.getElementById("item-notes").value = item.notes || "";
    document.getElementById("modal-title").textContent = `Edit Punchlist Item (${item.id})`;
  } else {
    document.getElementById("punch-index").value = "";
    document.getElementById("modal-title").textContent = "Add Punchlist Item";
    document.getElementById("item-due").value = new Date().toISOString().split('T')[0];
  }

  modal.classList.remove("hidden");
}

function closeModal() {
  document.getElementById("punch-modal").classList.add("hidden");
}

function saveItem() {
  const idx = document.getElementById("punch-index").value;

  const itemData = {
    location: document.getElementById("item-loc").value.trim(),
    equipment: document.getElementById("item-eq").value.trim(),
    desc: document.getElementById("item-desc").value.trim(),
    category: document.getElementById("item-cat").value,
    severity: document.getElementById("item-sev").value,
    assignee: document.getElementById("item-assign").value.trim(),
    dueDate: document.getElementById("item-due").value,
    status: document.getElementById("item-status").value,
    evidence: document.getElementById("item-evidence").value.trim(),
    notes: document.getElementById("item-notes").value.trim()
  };

  if (idx !== "") {
    // Preserve original ID
    itemData.id = punchlist[parseInt(idx)].id;
    punchlist[parseInt(idx)] = itemData;
  } else {
    // Generate new ID
    const nextNum = punchlist.length > 0 
      ? Math.max(...punchlist.map(i => parseInt(i.id.split('-')[1]))) + 1 
      : 1;
    const formattedId = `PL-${nextNum.toString().padStart(3, '0')}`;
    itemData.id = formattedId;
    punchlist.push(itemData);
  }

  savePunchlistToStorage();
  closeModal();
  renderPunchlist();
}

function deleteItem(index) {
  if (confirm("Are you sure you want to delete this punchlist item?")) {
    punchlist.splice(index, 1);
    savePunchlistToStorage();
    renderPunchlist();
  }
}

function resetPunchlist() {
  if (confirm("This will erase all custom items and restore initial sample items. Proceed?")) {
    punchlist = [...DEFAULT_ITEMS];
    savePunchlistToStorage();
    renderPunchlist();
  }
}

function exportCSV() {
  let csv = "Item ID,Location/Area,Equipment ID,Description,Category,Severity,Responsible Party,Due Date,Status,Evidence,Notes\n";
  punchlist.forEach(item => {
    csv += `"${item.id}","${item.location}","${item.equipment}","${item.desc.replace(/"/g, '""')}","${item.category}","${item.severity}","${item.assignee}","${item.dueDate || ''}","${item.status}","${item.evidence || ''}","${item.notes || ''}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `commissioning_punchlist_${document.getElementById("proj-name").value.replace(/\s+/g, '_')}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function exportJSON() {
  const meta = {
    project: document.getElementById("proj-name").value,
    site: document.getElementById("proj-site").value,
    customer: document.getElementById("proj-customer").value,
    date: document.getElementById("proj-date").value,
    author: document.getElementById("proj-author").value,
    items: punchlist
  };

  const blob = new Blob([JSON.stringify(meta, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `commissioning_punchlist_${document.getElementById("proj-name").value.replace(/\s+/g, '_')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function copyEmailSummary() {
  const pName = document.getElementById("proj-name").value || "N/A";
  const pSite = document.getElementById("proj-site").value || "N/A";
  const pDate = document.getElementById("proj-date").value || "N/A";

  const total = punchlist.length;
  const open = punchlist.filter(i => i.status !== "Closed").length;
  const blocked = punchlist.filter(i => i.status === "Blocked").length;
  const closed = punchlist.filter(i => i.status === "Closed").length;

  let text = `Commissioning Punchlist Summary: ${pName} - ${pSite}\n`;
  text += `Report Date: ${pDate}\n`;
  text += `=====================================\n`;
  text += `Total Tracked Items: ${total}\n`;
  text += `Open / In Progress: ${open} (Blocked: ${blocked})\n`;
  text += `Resolved / Closed: ${closed}\n`;
  text += `=====================================\n\n`;
  text += `Outstanding Items:\n`;

  punchlist.forEach(item => {
    if (item.status !== "Closed") {
      text += `- [${item.id}] ${item.severity} - ${item.location} (${item.equipment}): ${item.desc} [Assignee: ${item.assignee}]\n`;
    }
  });

  navigator.clipboard.writeText(text).then(() => {
    alert("Punchlist summary copied to clipboard! You can paste it directly in an email.");
  }).catch(() => {
    alert("Failed to copy summary to clipboard.");
  });
}
