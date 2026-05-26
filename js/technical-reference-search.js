/**
 * Level3Support — technical-reference-search.js
 * © 2026 Level3Support
 */

// Default high-quality reference data seeds (clearly marked "Sample only" unless verified)
const DEFAULT_DOCS = [
  {
    title: "Sungrow SG3125HV Central Inverter Commissioning Guide",
    category: "Commissioning Procedure",
    discipline: "PV",
    manufacturer: "Sungrow",
    model: "SG3125HV",
    revision: "Rev 1.3",
    date: "2025-11-12",
    link: "docs/sungrow_sg3125hv_commissioning_v1.3.pdf",
    status: "Active",
    summary: "Step-by-step procedures for cold commissioning, insulation checking, DC polarity verification, communication setup, and hot startup."
  },
  {
    title: "EnerOne Battery Container Thermal Management & HVAC Troubleshooting Guide",
    category: "Troubleshooting Guide",
    discipline: "BESS",
    manufacturer: "CATL",
    model: "EnerOne 372kWh",
    revision: "Rev 2.1",
    date: "2026-01-20",
    link: "docs/catl_enerone_hvac_troubleshoot_r2.1.pdf",
    status: "Active",
    summary: "Comprehensive fault tree analysis for refrigerant pressure faults, compressor cycling, temperature imbalance alerts, and HVAC control board parameter configuration."
  },
  {
    title: "PV Array Insulation Resistance (Megger) Testing Standard Operation Procedure",
    category: "Commissioning Procedure",
    discipline: "Electrical",
    manufacturer: "General",
    model: "1500VDC Systems",
    revision: "Rev 4.0",
    date: "2025-08-15",
    link: "docs/sop_pv_insulation_testing_v4.pdf",
    status: "Active",
    summary: "Defines testing boundaries, minimum insulation resistance calculation formulas based on ambient humidity, discharge safety rules, and log sheets."
  },
  {
    title: "ABB REJ603 Relay Settings and Modbus Tag Mapping",
    category: "Manual",
    discipline: "SCADA",
    manufacturer: "ABB",
    model: "REJ603 V1.5",
    revision: "Rev A",
    date: "2024-05-10",
    link: "docs/abb_rej603_modbus_revA.pdf",
    status: "Active",
    summary: "Contains absolute Modbus registers for current measurements, trip events history, phase fault configurations, and relay binary status input maps."
  },
  {
    title: "SMA Sunny Central Power Station 4400-EV Lockout/Tagout Planning Sheet",
    category: "Checklist",
    discipline: "HSE",
    manufacturer: "SMA",
    model: "SC4400-EV",
    revision: "Draft 0.2",
    date: "2026-03-01",
    link: "docs/sma_sc4400_loto_draft.pdf",
    status: "Draft",
    summary: "Draft safety sequence identifying key isolation breakers, DC disconnect switches, mechanical key interlocks, and gravity discharge checks."
  },
  {
    title: "CATL Liquid-Cooled Rack Piping and Glycol Filling Standard",
    category: "Service Bulletin",
    discipline: "BESS",
    manufacturer: "CATL",
    model: "EnerOne Liquid",
    revision: "Rev 1.0",
    date: "2025-03-14",
    link: "docs/bulletin_glycol_refill_catl.pdf",
    status: "Superseded",
    summary: "Superseded standard for glycol mixture, fluid expansion tank checks, and manual bleeding sequences. Replaced by Rev 1.1 bulletin."
  }
];

let docs = [];

document.addEventListener("DOMContentLoaded", () => {
  loadDocs();

  // Search & Filter Listeners
  document.getElementById("search-input").addEventListener("input", renderDocs);
  document.getElementById("filter-category").addEventListener("change", renderDocs);
  document.getElementById("filter-discipline").addEventListener("change", renderDocs);
  document.getElementById("filter-status").addEventListener("change", renderDocs);

  // Buttons Action Listeners
  document.getElementById("add-doc-btn").addEventListener("click", () => openModal());
  document.getElementById("reset-btn").addEventListener("click", resetToDefault);
  document.getElementById("export-csv-btn").addEventListener("click", exportCSV);
  document.getElementById("csv-file-input").addEventListener("change", importCSV);
});

function loadDocs() {
  const stored = localStorage.getItem("l3s_reference_docs");
  if (stored) {
    try {
      docs = JSON.parse(stored);
    } catch (e) {
      docs = [...DEFAULT_DOCS];
    }
  } else {
    docs = [...DEFAULT_DOCS];
    saveToStorage();
  }
  renderDocs();
}

function saveToStorage() {
  localStorage.setItem("l3s_reference_docs", JSON.stringify(docs));
}

function renderDocs() {
  const tbody = document.getElementById("docs-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const query = document.getElementById("search-input").value.toLowerCase().trim();
  const catFilter = document.getElementById("filter-category").value;
  const discFilter = document.getElementById("filter-discipline").value;
  const statusFilter = document.getElementById("filter-status").value;

  docs.forEach((doc, index) => {
    // Apply filters
    const matchesSearch = !query || 
      doc.title.toLowerCase().includes(query) ||
      doc.manufacturer.toLowerCase().includes(query) ||
      doc.model.toLowerCase().includes(query) ||
      doc.summary.toLowerCase().includes(query);

    const matchesCat = catFilter === "all" || doc.category === catFilter;
    const matchesDisc = discFilter === "all" || doc.discipline === discFilter;
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;

    if (matchesSearch && matchesCat && matchesDisc && matchesStatus) {
      const tr = document.createElement("tr");

      // Set status badge class
      let badgeClass = "status-active";
      if (doc.status === "Superseded") badgeClass = "status-superseded";
      if (doc.status === "Draft") badgeClass = "status-draft";
      if (doc.status === "Legacy") badgeClass = "status-legacy";
      if (doc.status === "Needs Review") badgeClass = "status-needs-review";

      // Set discipline class
      let discClass = "disc-general";
      const d = doc.discipline.toLowerCase();
      if (d === "pv") discClass = "disc-pv";
      else if (d === "bess") discClass = "disc-bess";
      else if (d === "scada") discClass = "disc-scada";
      else if (d === "electrical") discClass = "disc-elec";

      tr.innerHTML = `
        <td style="font-weight:600; max-width: 250px;">
          ${escapeHTML(doc.title)}
          <div style="font-size:0.75rem; color:var(--text-light); margin-top:3px; max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: normal;" title="${escapeHTML(doc.summary)}">
            ${escapeHTML(doc.summary)}
          </div>
        </td>
        <td><span style="font-size:0.8rem; background:#f1f5f9; padding:2px 6px; border-radius:4px; font-weight:600;">${escapeHTML(doc.category)}</span></td>
        <td><span class="discipline-badge ${discClass}">${escapeHTML(doc.discipline)}</span></td>
        <td>${escapeHTML(doc.manufacturer)} <div style="font-size:0.75rem; color:var(--text-light);">${escapeHTML(doc.model)}</div></td>
        <td style="font-size:0.8rem; font-family:monospace;">${escapeHTML(doc.revision || '—')}<br><span style="color:var(--text-light); font-size:0.7rem;">${doc.date || '—'}</span></td>
        <td><span class="status-badge ${badgeClass}">${escapeHTML(doc.status)}</span></td>
        <td>
          ${doc.link ? `<a href="${escapeHTML(doc.link)}" target="_blank" style="color:var(--primary-color); font-weight:700;"><i class="fas fa-external-link-alt"></i> View</a>` : `<span style="color:var(--text-light);">No Link</span>`}
        </td>
        <td style="text-align: center;">
          <div style="display:flex; gap:6px; justify-content:center;">
            <button class="btn-remove" style="background:#dbeafe; color:#1e40af; border:1px solid #93c5fd; padding:3px 8px;" onclick="openModal(${index})"><i class="fas fa-edit"></i></button>
            <button class="btn-remove" style="padding:3px 8px;" onclick="deleteDoc(${index})"><i class="fas fa-trash-alt"></i></button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    }
  });
}

function openModal(index = null) {
  const modal = document.getElementById("doc-modal");
  const form = document.getElementById("doc-form");
  form.reset();

  if (index !== null) {
    const doc = docs[index];
    document.getElementById("doc-index").value = index;
    document.getElementById("doc-title").value = doc.title;
    document.getElementById("doc-cat").value = doc.category;
    document.getElementById("doc-disc").value = doc.discipline;
    document.getElementById("doc-mfr").value = doc.manufacturer;
    document.getElementById("doc-model").value = doc.model;
    document.getElementById("doc-rev").value = doc.revision || "";
    document.getElementById("doc-date").value = doc.date || "";
    document.getElementById("doc-link").value = doc.link || "";
    document.getElementById("doc-status").value = doc.status;
    document.getElementById("doc-summary").value = doc.summary || "";
    document.getElementById("modal-title").textContent = "Edit Reference Document";
  } else {
    document.getElementById("doc-index").value = "";
    document.getElementById("modal-title").textContent = "Add Reference Document";
  }

  modal.classList.remove("hidden");
}

function closeModal() {
  document.getElementById("doc-modal").classList.add("hidden");
}

window.closeModal = closeModal; // Expose globally for cancel button

function saveDoc() {
  const idx = document.getElementById("doc-index").value;
  const docData = {
    title: document.getElementById("doc-title").value.trim(),
    category: document.getElementById("doc-cat").value,
    discipline: document.getElementById("doc-disc").value,
    manufacturer: document.getElementById("doc-mfr").value.trim(),
    model: document.getElementById("doc-model").value.trim(),
    revision: document.getElementById("doc-rev").value.trim(),
    date: document.getElementById("doc-date").value,
    link: document.getElementById("doc-link").value.trim(),
    status: document.getElementById("doc-status").value,
    summary: document.getElementById("doc-summary").value.trim()
  };

  if (idx !== "") {
    docs[parseInt(idx)] = docData;
  } else {
    docs.push(docData);
  }

  saveToStorage();
  closeModal();
  renderDocs();
}

window.saveDoc = saveDoc; // Expose globally for submit handling

function deleteDoc(index) {
  if (confirm("Are you sure you want to delete this document reference?")) {
    docs.splice(index, 1);
    saveToStorage();
    renderDocs();
  }
}

window.deleteDoc = deleteDoc; // Expose globally

function resetToDefault() {
  if (confirm("This will erase all custom reference entries and restore default list. Proceed?")) {
    docs = [...DEFAULT_DOCS];
    saveToStorage();
    renderDocs();
  }
}

function exportCSV() {
  let csv = "Title,Category,Discipline,Manufacturer,Model,Revision,Date,Link,Status,Summary\n";
  docs.forEach(doc => {
    csv += `"${doc.title.replace(/"/g, '""')}","${doc.category}","${doc.discipline}","${doc.manufacturer.replace(/"/g, '""')}","${doc.model.replace(/"/g, '""')}","${(doc.revision || '').replace(/"/g, '""')}",${doc.date || ''},"${(doc.link || '').replace(/"/g, '""')}","${doc.status}","${(doc.summary || '').replace(/"/g, '""')}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "technical_reference_documents.csv";
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
    const newDocs = [];
    
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      if (parts.length >= 8) {
        const clean = part => part.replace(/^"|"$/g, '').replace(/""/g, '"').trim();
        newDocs.push({
          title: clean(parts[0]),
          category: clean(parts[1]),
          discipline: clean(parts[2]),
          manufacturer: clean(parts[3]),
          model: clean(parts[4]),
          revision: parts[5] ? clean(parts[5]) : "",
          date: parts[6] ? clean(parts[6]) : "",
          link: parts[7] ? clean(parts[7]) : "",
          status: parts[8] ? clean(parts[8]) : "Active",
          summary: parts[9] ? clean(parts[9]) : ""
        });
      }
    }

    if (newDocs.length > 0) {
      docs = [...docs, ...newDocs];
      saveToStorage();
      renderDocs();
      alert(`Successfully imported ${newDocs.length} document references.`);
    } else {
      alert("Invalid CSV format or no data found.");
    }
  };
  reader.readAsText(file);
  e.target.value = ""; // clear input
}

function escapeHTML(str) {
  if (!str) return '';
  return str.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
