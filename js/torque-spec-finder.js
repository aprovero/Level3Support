/**
 * Level3Support — torque-spec-finder.js
 * © 2026 Level3Support
 */

// Default high-quality sample data
const DEFAULT_SPECS = [
  {
    equipment: "Inverter",
    mfr: "Sungrow",
    model: "SG3125HV",
    component: "AC Output Terminal",
    connType: "Busbar",
    boltSize: "M12",
    torque: 45,
    unit: "Nm",
    sourceDoc: "Sungrow SG3125HV Installation Manual v1.1",
    status: "Sample only",
    notes: "Requires standard Belleville washers. Do not lubricate threads."
  },
  {
    equipment: "Battery rack",
    mfr: "CATL",
    model: "EnerOne",
    component: "Module to Module Busbar",
    connType: "Battery terminal",
    boltSize: "M8",
    torque: 9,
    unit: "Nm",
    sourceDoc: "CATL EnerOne Safety & Installation Guide Rev C",
    status: "Sample only",
    notes: "Strictly use insulated torque wrench. Apply anti-corrosive grease if specified."
  },
  {
    equipment: "Transformer",
    mfr: "ABB",
    model: "MVS-3150kVA",
    component: "LV Bushing Copper Palm",
    connType: "Busbar",
    boltSize: "M16",
    torque: 85,
    unit: "Nm",
    sourceDoc: "ABB Pad-Mounted Transformer Commissioning Doc",
    status: "Sample only",
    notes: "Contact surfaces must be cleaned and treated with copper joint compound."
  },
  {
    equipment: "Combiner box",
    mfr: "SolarBOS",
    model: "1500V Disconnect",
    component: "Main DC Output Lugs",
    connType: "Lug",
    boltSize: "1/2 inch",
    torque: 375,
    unit: "lb-in",
    sourceDoc: "SolarBOS Installation Instructions v4.0",
    status: "Sample only",
    notes: "Check wire strip length. Set screw requires hex drive."
  },
  {
    equipment: "Grounding",
    mfr: "Burndy",
    model: "GB26",
    component: "Ground Grid Copper Bonding Clamp",
    connType: "Grounding/bonding",
    boltSize: "3/8-16",
    torque: 240,
    unit: "lb-in",
    sourceDoc: "Burndy Grounding Connector Catalog",
    status: "Sample only",
    notes: "Direct burial rated connection clamp."
  }
];

let specs = [];

document.addEventListener("DOMContentLoaded", () => {
  loadSpecs();

  // Search & Filter Listeners
  document.getElementById("search-input").addEventListener("input", renderSpecs);
  document.getElementById("filter-equipment").addEventListener("change", renderSpecs);
  document.getElementById("filter-status").addEventListener("change", renderSpecs);

  // Form & Reset Listeners
  document.getElementById("add-spec-btn").addEventListener("click", () => openModal());
  document.getElementById("reset-btn").addEventListener("click", resetToDefault);
  document.getElementById("export-csv-btn").addEventListener("click", exportCSV);
  document.getElementById("csv-file-input").addEventListener("change", importCSV);
});

function loadSpecs() {
  const stored = localStorage.getItem("l3s_torque_specs");
  if (stored) {
    try {
      specs = JSON.parse(stored);
    } catch (e) {
      specs = [...DEFAULT_SPECS];
    }
  } else {
    specs = [...DEFAULT_SPECS];
    saveToStorage();
  }
  renderSpecs();
}

function saveToStorage() {
  localStorage.setItem("l3s_torque_specs", JSON.stringify(specs));
}

function renderSpecs() {
  const tbody = document.getElementById("specs-tbody");
  tbody.innerHTML = "";

  const query = document.getElementById("search-input").value.toLowerCase().trim();
  const eqFilter = document.getElementById("filter-equipment").value;
  const statusFilter = document.getElementById("filter-status").value;

  specs.forEach((spec, index) => {
    // Apply filters
    const matchesSearch = !query || 
      spec.mfr.toLowerCase().includes(query) ||
      spec.model.toLowerCase().includes(query) ||
      spec.component.toLowerCase().includes(query) ||
      spec.boltSize.toLowerCase().includes(query) ||
      (spec.sourceDoc && spec.sourceDoc.toLowerCase().includes(query));

    const matchesEq = eqFilter === "all" || spec.equipment === eqFilter;
    const matchesStatus = statusFilter === "all" || spec.status === statusFilter;

    if (matchesSearch && matchesEq && matchesStatus) {
      const tr = document.createElement("tr");

      let badgeClass = "status-sample";
      if (spec.status === "Verified") badgeClass = "status-verified";
      if (spec.status === "Needs verification") badgeClass = "status-needs-verification";

      tr.innerHTML = `
        <td style="font-weight:600;">${spec.equipment}</td>
        <td>${spec.mfr} <div style="font-size:0.75rem; color:var(--text-light);">${spec.model}</div></td>
        <td>${spec.component} <div style="font-size:0.75rem; color:var(--text-secondary);">${spec.connType}</div></td>
        <td style="font-family:monospace; font-weight:600;">${spec.boltSize}</td>
        <td style="font-family:'Outfit'; font-weight:700; color:var(--primary-color);">${spec.torque} ${spec.unit}</td>
        <td style="font-size:0.8rem; max-width:150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${spec.sourceDoc || ''}">${spec.sourceDoc || '—'}</td>
        <td><span class="status-badge ${badgeClass}">${spec.status}</span></td>
        <td style="text-align: center;">
          <div style="display:flex; gap:6px; justify-content:center;">
            <button class="btn-remove" style="background:#dbeafe; color:#1e40af; border:1px solid #93c5fd; padding:3px 8px;" onclick="openModal(${index})"><i class="fas fa-edit"></i></button>
            <button class="btn-remove" style="padding:3px 8px;" onclick="deleteSpec(${index})"><i class="fas fa-trash-alt"></i></button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    }
  });
}

function openModal(index = null) {
  const modal = document.getElementById("spec-modal");
  const form = document.getElementById("spec-form");
  form.reset();

  if (index !== null) {
    const spec = specs[index];
    document.getElementById("spec-index").value = index;
    document.getElementById("eq-type").value = spec.equipment;
    document.getElementById("mfr").value = spec.mfr;
    document.getElementById("model").value = spec.model;
    document.getElementById("component").value = spec.component;
    document.getElementById("conn-type").value = spec.connType;
    document.getElementById("bolt-size").value = spec.boltSize;
    document.getElementById("torque-val").value = spec.torque;
    document.getElementById("torque-unit").value = spec.unit;
    document.getElementById("source-doc").value = spec.sourceDoc || "";
    document.getElementById("data-status").value = spec.status;
    document.getElementById("notes").value = spec.notes || "";
    document.getElementById("modal-title").textContent = "Edit Connection Specification";
  } else {
    document.getElementById("spec-index").value = "";
    document.getElementById("modal-title").textContent = "Add Connection Specification";
  }

  modal.classList.remove("hidden");
}

function closeModal() {
  document.getElementById("spec-modal").classList.add("hidden");
}

function saveSpec() {
  const idx = document.getElementById("spec-index").value;
  const specData = {
    equipment: document.getElementById("eq-type").value,
    mfr: document.getElementById("mfr").value.trim(),
    model: document.getElementById("model").value.trim(),
    component: document.getElementById("component").value.trim(),
    connType: document.getElementById("conn-type").value,
    boltSize: document.getElementById("bolt-size").value.trim(),
    torque: parseFloat(document.getElementById("torque-val").value),
    unit: document.getElementById("torque-unit").value,
    sourceDoc: document.getElementById("source-doc").value.trim(),
    status: document.getElementById("data-status").value,
    notes: document.getElementById("notes").value.trim()
  };

  if (idx !== "") {
    specs[parseInt(idx)] = specData;
  } else {
    specs.push(specData);
  }

  saveToStorage();
  closeModal();
  renderSpecs();
}

function deleteSpec(index) {
  if (confirm("Are you sure you want to delete this specification?")) {
    specs.splice(index, 1);
    saveToStorage();
    renderSpecs();
  }
}

function resetToDefault() {
  if (confirm("This will erase all custom entries and restore defaults. Proceed?")) {
    specs = [...DEFAULT_SPECS];
    saveToStorage();
    renderSpecs();
  }
}

function exportCSV() {
  let csv = "Equipment,Manufacturer,Model,Component,Connection Type,Bolt Size,Torque,Unit,Source Document,Status,Notes\n";
  specs.forEach(spec => {
    csv += `"${spec.equipment}","${spec.mfr}","${spec.model}","${spec.component}","${spec.connType}","${spec.boltSize}",${spec.torque},"${spec.unit}","${spec.sourceDoc || ''}","${spec.status}","${spec.notes || ''}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "torque_specifications.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function importCSV(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    const text = evt.target.result;
    const lines = text.split("\n");
    const newSpecs = [];
    
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle simple CSV splitting (quotes ignored for brevity in field context)
      const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      if (parts.length >= 8) {
        const clean = part => part.replace(/^"|"$/g, '').trim();
        newSpecs.push({
          equipment: clean(parts[0]),
          mfr: clean(parts[1]),
          model: clean(parts[2]),
          component: clean(parts[3]),
          connType: clean(parts[4]),
          boltSize: clean(parts[5]),
          torque: parseFloat(clean(parts[6])) || 0,
          unit: clean(parts[7]),
          sourceDoc: parts[8] ? clean(parts[8]) : "",
          status: parts[9] ? clean(parts[9]) : "Needs verification",
          notes: parts[10] ? clean(parts[10]) : ""
        });
      }
    }

    if (newSpecs.length > 0) {
      specs = [...specs, ...newSpecs];
      saveToStorage();
      renderSpecs();
      alert(`Successfully imported ${newSpecs.length} specs.`);
    } else {
      alert("Invalid CSV format or no data found.");
    }
  };
  reader.readAsText(file);
  e.target.value = ""; // clear input
}
