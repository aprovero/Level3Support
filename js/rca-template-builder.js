/**
 * Level3Support — rca-template-builder.js
 * © 2026 Level3Support
 */

document.addEventListener("DOMContentLoaded", () => {
  // Pre-fill some dates
  const today = new Date().toISOString().substring(0, 16);
  document.getElementById("event-date").value = today;

  // Add initial chronological timeline rows
  addTimelineRow("14:22:05", "SCADA Historian", "High Temperature Warning Alarm on Rack 4, Cluster 2.", "Temperatures logged at 62°C.");
  addTimelineRow("14:25:10", "PCS Protection System", "PCS-03 shuts down automatically on Cell Overtemp trip signal.", "Unit isolated.");

  // Add initial alarm logs
  addAlarmRow("PCS-03", "E-409", "DC Compartment Over-Temperature Trip", "1", "Active latching alarm");
  
  // Add immediate action taken
  addImmediateRow("PCS isolated and door opened to vent BESS heat container", "O&M Tech", "14:40:00", "Brought temperature down to 42°C in 30 mins");

  // Add initial contributing factor
  addFactorRow("Extremely high ambient outdoor temperature (39°C) combined with high Solar generation run", "Thermal limits reached quicker under max plant output");

  // Add initial CAPA
  addCapaRow("Replace PCS auxiliary cooling fans and clean intake filters", "O&M Auxiliary Team", "2026-06-01", "Open");

  // Add initial open action
  addOpenRow("Validate Modbus communication link back to backup RTU", "SCADA Tech", "2026-05-30", "In Progress");

  // Actions wiring
  document.getElementById("copy-summary-btn").addEventListener("click", copyExecSummary);
  document.getElementById("export-json-btn").addEventListener("click", exportJSON);
  
  // Initialize drafts support
  initDraftSupport();
});

// Tab switching function
window.switchTab = function(tabId) {
  // Hide all tab contents
  document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
  // Deactivate all buttons
  document.querySelectorAll(".tab-btn").forEach(el => el.classList.remove("active"));

  // Show active tab content
  document.getElementById(tabId).classList.add("active");
  
  // Find trigger button and activate it
  const btn = Array.from(document.querySelectorAll(".tab-btn")).find(b => {
    return b.getAttribute("onclick").includes(tabId);
  });
  if (btn) btn.classList.add("active");
};

// Dynamic Rows Timeline
function addTimelineRow(time = "", source = "", desc = "", notes = "") {
  const tbody = document.getElementById("timeline-tbody");
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input type="text" value="${time}" placeholder="e.g. 14:22:05" class="time-input"></td>
    <td><input type="text" value="${source}" placeholder="e.g. Inverter Log" class="source-input"></td>
    <td><input type="text" value="${desc}" placeholder="Description..." class="desc-input"></td>
    <td><input type="text" value="${notes}" placeholder="Notes..." class="notes-input"></td>
    <td style="text-align: center;"><button type="button" class="btn-remove" style="padding: 4px 8px; width:auto; min-height:unset;" onclick="this.closest('tr').remove()"><i class="fas fa-trash-alt"></i></button></td>
  `;
  tbody.appendChild(tr);
}

// Dynamic Rows Alarms
function addAlarmRow(src = "", code = "", desc = "", reps = "1", notes = "") {
  const tbody = document.getElementById("alarms-tbody");
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input type="text" value="${src}" placeholder="e.g. INV-01" class="al-source-input"></td>
    <td><input type="text" value="${code}" placeholder="e.g. 104" class="al-code-input"></td>
    <td><input type="text" value="${desc}" placeholder="Alarm description..." class="al-desc-input"></td>
    <td><input type="number" value="${reps}" placeholder="1" min="1" class="al-reps-input"></td>
    <td><input type="text" value="${notes}" placeholder="Notes..." class="al-notes-input"></td>
    <td style="text-align: center;"><button type="button" class="btn-remove" style="padding: 4px 8px; width:auto; min-height:unset;" onclick="this.closest('tr').remove()"><i class="fas fa-trash-alt"></i></button></td>
  `;
  tbody.appendChild(tr);
}

// Dynamic Rows Immediate Actions
function addImmediateRow(act = "", owner = "", time = "", res = "") {
  const tbody = document.getElementById("immediate-tbody");
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input type="text" value="${act}" placeholder="Action taken..." class="imm-action-input"></td>
    <td><input type="text" value="${owner}" placeholder="e.g. Operator" class="imm-owner-input"></td>
    <td><input type="text" value="${time}" placeholder="e.g. 14:30" class="imm-time-input"></td>
    <td><input type="text" value="${res}" placeholder="Result..." class="imm-result-input"></td>
    <td style="text-align: center;"><button type="button" class="btn-remove" style="padding: 4px 8px; width:auto; min-height:unset;" onclick="this.closest('tr').remove()"><i class="fas fa-trash-alt"></i></button></td>
  `;
  tbody.appendChild(tr);
}

// Dynamic Rows Contributing Factors
function addFactorRow(factor = "", notes = "") {
  const tbody = document.getElementById("factors-tbody");
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input type="text" value="${factor}" placeholder="Factor..." class="fac-input"></td>
    <td><input type="text" value="${notes}" placeholder="Evidence..." class="fac-notes-input"></td>
    <td style="text-align: center;"><button type="button" class="btn-remove" style="padding: 4px 8px; width:auto; min-height:unset;" onclick="this.closest('tr').remove()"><i class="fas fa-trash-alt"></i></button></td>
  `;
  tbody.appendChild(tr);
}

// Dynamic Rows CAPA
function addCapaRow(act = "", owner = "", due = "", status = "Open") {
  const tbody = document.getElementById("capa-tbody");
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input type="text" value="${act}" placeholder="CAPA Action Item..." class="capa-act-input"></td>
    <td><input type="text" value="${owner}" placeholder="Owner..." class="capa-owner-input"></td>
    <td><input type="date" value="${due}" class="capa-due-input"></td>
    <td>
      <select class="capa-status-input">
        <option value="Open" ${status === 'Open' ? 'selected' : ''}>Open</option>
        <option value="In Progress" ${status === 'In Progress' ? 'selected' : ''}>In Progress</option>
        <option value="Closed" ${status === 'Closed' ? 'selected' : ''}>Closed</option>
      </select>
    </td>
    <td style="text-align: center;"><button type="button" class="btn-remove" style="padding: 4px 8px; width:auto; min-height:unset;" onclick="this.closest('tr').remove()"><i class="fas fa-trash-alt"></i></button></td>
  `;
  tbody.appendChild(tr);
}

// Dynamic Rows Open Actions
function addOpenRow(act = "", owner = "", due = "", status = "Open") {
  const tbody = document.getElementById("open-tbody");
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input type="text" value="${act}" placeholder="Open Action Item..." class="open-act-input"></td>
    <td><input type="text" value="${owner}" placeholder="Owner..." class="open-owner-input"></td>
    <td><input type="date" value="${due}" class="open-due-input"></td>
    <td>
      <select class="open-status-input">
        <option value="Open" ${status === 'Open' ? 'selected' : ''}>Open</option>
        <option value="In Progress" ${status === 'In Progress' ? 'selected' : ''}>In Progress</option>
        <option value="Closed" ${status === 'Closed' ? 'selected' : ''}>Closed</option>
      </select>
    </td>
    <td style="text-align: center;"><button type="button" class="btn-remove" style="padding: 4px 8px; width:auto; min-height:unset;" onclick="this.closest('tr').remove()"><i class="fas fa-trash-alt"></i></button></td>
  `;
  tbody.appendChild(tr);
}

// Collect form fields
function getRcaData() {
  const data = {
    title: document.getElementById("event-title").value,
    date: document.getElementById("event-date").value,
    site: document.getElementById("rca-site").value,
    equipment: document.getElementById("rca-eq").value,
    author: document.getElementById("rca-author").value,
    referenceId: document.getElementById("rca-ref").value,
    
    summary: document.getElementById("exec-summary").value,
    impact: document.getElementById("rca-impact").value,
    status: document.getElementById("rca-status").value,
    initialConditions: document.getElementById("initial-condition").value,

    timeline: [],
    alarms: [],
    immediateActions: [],

    rootCauseStatement: document.getElementById("rca-statement").value,
    confidence: document.getElementById("rca-confidence").value,
    evidence: document.getElementById("rca-evidence").value,
    
    contributingFactors: [],
    capa: [],
    openActions: [],

    photos: photos,
    signatures: signatures,
    internalNotes: document.getElementById("internal-notes").value
  };

  // Timelines
  document.querySelectorAll("#timeline-tbody tr").forEach(tr => {
    data.timeline.push({
      time: tr.querySelector(".time-input").value,
      source: tr.querySelector(".source-input").value,
      description: tr.querySelector(".desc-input").value,
      notes: tr.querySelector(".notes-input").value
    });
  });

  // Alarms
  document.querySelectorAll("#alarms-tbody tr").forEach(tr => {
    data.alarms.push({
      source: tr.querySelector(".al-source-input").value,
      code: tr.querySelector(".al-code-input").value,
      description: tr.querySelector(".al-desc-input").value,
      repetitions: parseInt(tr.querySelector(".al-reps-input").value) || 1,
      notes: tr.querySelector(".al-notes-input").value
    });
  });

  // Immediate Actions
  document.querySelectorAll("#immediate-tbody tr").forEach(tr => {
    data.immediateActions.push({
      action: tr.querySelector(".imm-action-input").value,
      owner: tr.querySelector(".imm-owner-input").value,
      time: tr.querySelector(".imm-time-input").value,
      result: tr.querySelector(".imm-result-input").value
    });
  });

  // Contributing Factors
  document.querySelectorAll("#factors-tbody tr").forEach(tr => {
    data.contributingFactors.push({
      factor: tr.querySelector(".fac-input").value,
      notes: tr.querySelector(".fac-notes-input").value
    });
  });

  // CAPA
  document.querySelectorAll("#capa-tbody tr").forEach(tr => {
    data.capa.push({
      action: tr.querySelector(".capa-act-input").value,
      owner: tr.querySelector(".capa-owner-input").value,
      dueDate: tr.querySelector(".capa-due-input").value,
      status: tr.querySelector(".capa-status-input").value
    });
  });

  // Open Actions
  document.querySelectorAll("#open-tbody tr").forEach(tr => {
    data.openActions.push({
      action: tr.querySelector(".open-act-input").value,
      owner: tr.querySelector(".open-owner-input").value,
      dueDate: tr.querySelector(".open-due-input").value,
      status: tr.querySelector(".open-status-input").value
    });
  });

  return data;
}

function copyExecSummary() {
  const d = getRcaData();
  let txt = `RCA EXECUTIVE SUMMARY: ${d.title}\n`;
  txt += `=========================================\n`;
  txt += `Site: ${d.site} | Date of Event: ${d.date}\n`;
  txt += `Equipment Affected: ${d.equipment} | Ref: ${d.referenceId || 'N/A'}\n`;
  txt += `Prepared By: ${d.author}\n`;
  txt += `=========================================\n\n`;
  txt += `Incident Summary:\n${d.summary}\n\n`;
  txt += `Root Cause [Confidence: ${d.confidence}]:\n${d.rootCauseStatement}\n\n`;
  txt += `Supporting Evidence:\n${d.evidence}\n`;

  navigator.clipboard.writeText(txt).then(() => {
    alert("Executive Summary copied to clipboard for easy client notification!");
  }).catch(() => {
    alert("Failed to copy summary.");
  });
}

function exportJSON() {
  const data = getRcaData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `rca_report_${data.site.replace(/\s+/g, '_')}_${data.title.replace(/\s+/g, '_')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function resetForm() {
  if (confirm("Clear all entries and reset the RCA template?")) {
    document.getElementById("rca-form").reset();
    document.getElementById("timeline-tbody").innerHTML = "";
    document.getElementById("alarms-tbody").innerHTML = "";
    document.getElementById("immediate-tbody").innerHTML = "";
    document.getElementById("factors-tbody").innerHTML = "";
    document.getElementById("capa-tbody").innerHTML = "";
    document.getElementById("open-tbody").innerHTML = "";
    
    // Reset evidence/signatures
    photos = [];
    signatures = [];
    renderPhotoThumbnails();
    renderSignaturesGrid();
    
    // Reset save status
    currentDraftId = null;
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('draftId');
    window.history.replaceState({}, '', newUrl);
    updateSaveIndicator("Unsaved");
  }
}

/**
 * ── Auto-Save & Resume Draft Integration (v5.5.5) ──
 */
let currentDraftId = null;
let saveTimeout = null;
let photos = [];
let signatures = [];

async function initDraftSupport() {
  const urlParams = new URLSearchParams(window.location.search);
  const draftIdParam = urlParams.get('draftId');
  
  // Dynamically inject Save Indicator in Header next to Title
  const titleHeader = document.querySelector(".tool-title-row h1") || document.querySelector(".tool-header-section h1");
  if (titleHeader) {
      const saveIndicator = document.createElement("span");
      saveIndicator.id = "save-indicator";
      saveIndicator.style.cssText = "font-size:0.8rem; font-weight:600; color:#64748b; background:#f1f5f9; padding:4px 8px; border-radius:6px; margin-left:12px;";
      saveIndicator.textContent = "Unsaved";
      titleHeader.appendChild(saveIndicator);
  }

  if (draftIdParam && window.L3DB) {
      currentDraftId = draftIdParam;
      updateSaveIndicator("Loading...");
      try {
          const record = await L3DB.getRecord(currentDraftId);
          if (record && record.formData) {
              populateForm(record.formData);
              updateSaveIndicator("Saved locally");
          }
      } catch (err) {
          console.error("Failed to load draft:", err);
          updateSaveIndicator("Error loading");
      }
  }

  // Setup auto-save listeners on all form controls
  const form = document.getElementById("rca-form");
  if (form) {
      // Listen for input, change, and button clicks (for dynamic rows)
      form.addEventListener("input", triggerAutoSave);
      form.addEventListener("change", triggerAutoSave);
      form.addEventListener("click", (e) => {
          if (e.target.closest("button") || e.target.closest("a")) {
              triggerAutoSave();
          }
      });
  }
}

function updateSaveIndicator(text) {
    const indicator = document.getElementById("save-indicator");
    if (indicator) {
        indicator.textContent = text;
    }
}

function triggerAutoSave() {
    updateSaveIndicator("Saving...");
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveDraft, 1200);
}

async function saveDraft() {
    if (!window.L3DB) return;
    
    const title = document.getElementById("event-title").value.trim();
    const site = document.getElementById("rca-site").value.trim();
    
    // Don't auto-create draft on page load with completely empty fields
    if (!currentDraftId && !title && !site) {
        updateSaveIndicator("Unsaved");
        return;
    }
    
    if (!currentDraftId) {
        currentDraftId = crypto.randomUUID();
        // Update URL query parameters silently
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('draftId', currentDraftId);
        window.history.replaceState({}, '', newUrl);
    }
    
    const formData = getRcaData();
    const record = {
        id: currentDraftId,
        contextType: "standalone",
        status: "draft",
        toolId: "rca-builder",
        toolName: "RCA Template Builder",
        toolRoute: "rca-template-builder.html",
        title: title || "Untitled RCA",
        discipline: "Reports",
        siteName: site,
        updatedAt: new Date().toISOString(),
        formData: formData
    };
    
    try {
        await L3DB.saveRecord(record);
        updateSaveIndicator("Saved locally");
    } catch (err) {
        console.error("Failed to save draft:", err);
        updateSaveIndicator("Save failed");
    }
}

function populateForm(data) {
    if (!data) return;
    
    if (data.title) document.getElementById("event-title").value = data.title;
    if (data.date) document.getElementById("event-date").value = data.date;
    if (data.site) document.getElementById("rca-site").value = data.site;
    if (data.equipment) document.getElementById("rca-eq").value = data.equipment;
    if (data.author) document.getElementById("rca-author").value = data.author;
    if (data.referenceId) document.getElementById("rca-ref").value = data.referenceId;
    if (data.summary) document.getElementById("exec-summary").value = data.summary;
    if (data.impact) document.getElementById("rca-impact").value = data.impact;
    if (data.status) document.getElementById("rca-status").value = data.status;
    if (data.initialConditions) document.getElementById("initial-condition").value = data.initialConditions;
    if (data.rootCauseStatement) document.getElementById("rca-statement").value = data.rootCauseStatement;
    if (data.confidence) document.getElementById("rca-confidence").value = data.confidence;
    if (data.evidence) document.getElementById("rca-evidence").value = data.evidence;
    if (data.internalNotes) document.getElementById("internal-notes").value = data.internalNotes;

    // Reset lists
    document.getElementById("timeline-tbody").innerHTML = "";
    document.getElementById("alarms-tbody").innerHTML = "";
    document.getElementById("immediate-tbody").innerHTML = "";
    document.getElementById("factors-tbody").innerHTML = "";
    document.getElementById("capa-tbody").innerHTML = "";
    document.getElementById("open-tbody").innerHTML = "";

    if (data.timeline) {
        data.timeline.forEach(row => addTimelineRow(row.time, row.source, row.description, row.notes));
    }
    if (data.alarms) {
        data.alarms.forEach(row => addAlarmRow(row.source, row.code, row.description, row.repetitions, row.notes));
    }
    if (data.immediateActions) {
        data.immediateActions.forEach(row => addImmediateRow(row.action, row.owner, row.time, row.result));
    }
    if (data.contributingFactors) {
        data.contributingFactors.forEach(row => addFactorRow(row.factor, row.notes));
    }
    if (data.capa) {
        data.capa.forEach(row => addCapaRow(row.action, row.owner, row.dueDate, row.status));
    }
    if (data.openActions) {
        data.openActions.forEach(row => addOpenRow(row.action, row.owner, row.dueDate, row.status));
    }

    photos = data.photos || [];
    signatures = data.signatures || [];
    renderPhotoThumbnails();
    renderSignaturesGrid();
}

/**
 * ── Evidence Upload & Signature Handlers ──
 */
window.triggerPhotoUpload = function() {
    document.getElementById("photo-evidence-file").click();
};

window.handlePhotoUpload = async function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        updateSaveIndicator("Compressing...");
        const compressedDataUrl = await L3Evidence.compressImage(file, 1024, 0.6, "Nameplate");
        const photoObj = {
            id: crypto.randomUUID(),
            tag: "Nameplate",
            caption: "",
            dataUrl: compressedDataUrl
        };
        photos.push(photoObj);
        renderPhotoThumbnails();
        triggerAutoSave();
    } catch (err) {
        console.error("Image compression/upload failed:", err);
        alert("Failed to compress or upload image: " + err.message);
    } finally {
        event.target.value = "";
    }
};

window.renderPhotoThumbnails = function() {
    const grid = document.getElementById("photos-thumbnail-grid");
    if (!grid) return;
    grid.innerHTML = "";
    
    photos.forEach(photo => {
        const card = document.createElement("div");
        card.style.cssText = "background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:8px; box-sizing:border-box; display:flex; flex-direction:column; gap:8px;";
        
        card.innerHTML = `
            <div style="position:relative; width:100%; height:120px; overflow:hidden; border-radius:6px; background:#f1f5f9;">
                <img src="${photo.dataUrl}" style="width:100%; height:100%; object-fit:cover;">
                <button type="button" class="btn-remove" style="position:absolute; top:4px; right:4px; padding:4px 8px; width:auto; min-height:unset; background:rgba(239, 68, 68, 0.9); color:white; border:none; border-radius:4px; cursor:pointer;" onclick="deletePhoto('${photo.id}')"><i class="fas fa-trash-alt"></i></button>
            </div>
            <select class="photo-tag-select" style="width:100%; height:32px; padding:4px; border:1px solid #cbd5e1; border-radius:4px; font-size:0.8rem; background:#ffffff;">
                <option value="Nameplate" ${photo.tag === 'Nameplate' ? 'selected' : ''}>Nameplate</option>
                <option value="Serial Number" ${photo.tag === 'Serial Number' ? 'selected' : ''}>Serial Number</option>
                <option value="Before Work" ${photo.tag === 'Before Work' ? 'selected' : ''}>Before Work</option>
                <option value="After Work" ${photo.tag === 'After Work' ? 'selected' : ''}>After Work</option>
                <option value="Defect" ${photo.tag === 'Defect' ? 'selected' : ''}>Defect</option>
                <option value="Corrective Action" ${photo.tag === 'Corrective Action' ? 'selected' : ''}>Corrective Action</option>
                <option value="Safety Condition" ${photo.tag === 'Safety Condition' ? 'selected' : ''}>Safety Condition</option>
            </select>
            <input type="text" class="photo-caption-input" value="${photo.caption || ''}" placeholder="Enter caption..." style="width:100%; height:32px; padding:4px 8px; border:1px solid #cbd5e1; border-radius:4px; font-size:0.8rem; box-sizing:border-box;">
        `;
        
        const tagSelect = card.querySelector(".photo-tag-select");
        tagSelect.addEventListener("change", (e) => {
            photo.tag = e.target.value;
            triggerAutoSave();
        });
        
        const captionInput = card.querySelector(".photo-caption-input");
        captionInput.addEventListener("input", (e) => {
            photo.caption = e.target.value;
            triggerAutoSave();
        });
        
        grid.appendChild(card);
    });
};

window.deletePhoto = function(id) {
    photos = photos.filter(p => p.id !== id);
    renderPhotoThumbnails();
    triggerAutoSave();
};

window.triggerSignatureCapture = function() {
    if (!window.L3Signatures) {
        alert("Signature capture library not loaded.");
        return;
    }
    L3Signatures.showSignatureModal((sigObj) => {
        signatures.push(sigObj);
        renderSignaturesGrid();
        triggerAutoSave();
    });
};

window.renderSignaturesGrid = function() {
    const grid = document.getElementById("signatures-display-grid");
    if (!grid) return;
    grid.innerHTML = "";
    
    signatures.forEach(sig => {
        const card = document.createElement("div");
        card.style.cssText = "background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:12px; box-sizing:border-box; display:flex; flex-direction:column; gap:8px; position:relative;";
        
        const timeStr = sig.timestamp ? new Date(sig.timestamp).toLocaleString() : '';
        
        card.innerHTML = `
            <div style="border:1px solid #cbd5e1; border-radius:6px; background:#f8fafc; height:80px; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                <img src="${sig.dataUrl}" style="max-width:100%; max-height:100%; object-fit:contain;">
            </div>
            <div style="font-size:0.8rem; color:#0f172a; line-height:1.4;">
                <strong>${sig.name}</strong><br>
                <span style="color:#64748b;">${sig.role} (${sig.meaning})</span><br>
                <span style="font-size:0.7rem; color:#94a3b8;">${timeStr}</span>
            </div>
            <button type="button" class="btn-remove" style="position:absolute; top:8px; right:8px; padding:4px 8px; width:auto; min-height:unset; background:none; color:#64748b; border:none; cursor:pointer;" onclick="deleteSignature('${sig.id}')"><i class="fas fa-trash-alt"></i></button>
        `;
        
        grid.appendChild(card);
    });
};

window.deleteSignature = function(id) {
    signatures = signatures.filter(s => s.id !== id);
    renderSignaturesGrid();
    triggerAutoSave();
};

window.triggerPdfExport = function() {
    let modal = document.getElementById('l3s-print-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'l3s-print-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(15, 23, 42, 0.6); display: flex; align-items: center;
            justify-content: center; z-index: 10000; font-family: 'Inter', sans-serif;
        `;
        document.body.appendChild(modal);
    }

    const isDraft = !currentDraftId || true;

    modal.innerHTML = `
        <div style="background: #ffffff; width: 90%; max-width: 440px; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); padding: 24px; box-sizing: border-box;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
                <h3 style="margin:0; font-family:'Outfit',sans-serif; font-size:1.25rem; color:#0f172a; display:flex; align-items:center; gap:6px;">
                    <i class="fas fa-file-pdf" style="color:#ef4444;"></i> PDF / Print Options
                </h3>
                <button id="l3s-print-close" style="background:none; border:none; font-size:1.2rem; cursor:pointer; color:#64748b;"><i class="fas fa-times"></i></button>
            </div>
            
            <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:20px; font-size:0.9rem; color:#475569;">
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                    <input type="checkbox" id="l3s-print-opt-photos" checked style="width:16px; height:16px;"> Include Photo Evidence
                </label>
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                    <input type="checkbox" id="l3s-print-opt-sigs" checked style="width:16px; height:16px;"> Include Digital Signatures
                </label>
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                    <input type="checkbox" id="l3s-print-opt-refs" checked style="width:16px; height:16px;"> Include Methodology & References
                </label>
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                    <input type="checkbox" id="l3s-print-opt-open" checked style="width:16px; height:16px;"> Include Open Actions Section
                </label>
            </div>

            ${isDraft ? `
                <div style="background:#fffbeb; border:1px solid #fef3c7; border-left:4px solid #d97706; padding:10px 12px; border-radius:6px; font-size:0.78rem; color:#b45309; margin-bottom:20px; line-height:1.4;">
                    <i class="fas fa-info-circle"></i> <strong>Draft Watermark Active:</strong> This record is in-progress. The printed layout will include a non-final draft banner with the draft ID and generation date.
                </div>
            ` : ''}

            <div style="display:flex; gap:12px; justify-content:flex-end;">
                <button id="l3s-print-cancel" style="background:#f1f5f9; color:#475569; border:none; padding:8px 16px; border-radius:8px; font-weight:600; cursor:pointer; font-size:0.85rem;">Cancel</button>
                <button id="l3s-print-proceed" style="background:#2563eb; color:white; border:none; padding:8px 16px; border-radius:8px; font-weight:600; cursor:pointer; font-size:0.85rem;">Proceed to Print</button>
            </div>
        </div>
    `;

    modal.style.display = 'flex';

    const closeModal = () => {
        modal.style.display = 'none';
    };

    document.getElementById('l3s-print-close').addEventListener('click', closeModal);
    document.getElementById('l3s-print-cancel').addEventListener('click', closeModal);

    document.getElementById('l3s-print-proceed').addEventListener('click', () => {
        const showPhotos = document.getElementById('l3s-print-opt-photos').checked;
        const showSigs = document.getElementById('l3s-print-opt-sigs').checked;
        const showRefs = document.getElementById('l3s-print-opt-refs').checked;
        const showOpen = document.getElementById('l3s-print-opt-open').checked;

        closeModal();

        const printStyles = document.createElement('style');
        printStyles.id = 'l3s-print-style-rules';
        printStyles.innerHTML = `
            @media print {
                .tab-content { display: block !important; opacity: 1 !important; visibility: visible !important; margin-bottom: 2rem; }
                .tab-container, .back-link, .btn-row, .btn-add-row, td button, .btn-remove { display: none !important; }
                
                body { background: white !important; color: black !important; }
                .placeholder-container { padding: 0 !important; margin: 0 !important; box-shadow: none !important; }
                input, select, textarea {
                    border: none !important;
                    background: transparent !important;
                    color: black !important;
                    padding: 0 !important;
                    box-sizing: border-box !important;
                    pointer-events: none !important;
                    resize: none !important;
                }
                
                ${!showPhotos ? '#photo-evidence-section { display: none !important; }' : ''}
                ${!showSigs ? '#signatures-section { display: none !important; }' : ''}
                ${!showRefs ? '.assumptions-box { display: none !important; }' : ''}
                ${!showOpen ? '#open-actions-section { display: none !important; }' : ''}

                .draft-watermark-print {
                    display: block !important;
                    border: 2px solid #ef4444;
                    background: #fef2f2;
                    color: #b91c1c;
                    padding: 10px 14px;
                    border-radius: 6px;
                    text-align: center;
                    font-weight: 700;
                    font-size: 0.85rem;
                    margin-bottom: 20px;
                    line-height: 1.4;
                }
            }
            .draft-watermark-print { display: none; }
        `;
        document.head.appendChild(printStyles);

        let watermarkBanner = null;
        if (isDraft) {
            watermarkBanner = document.createElement('div');
            watermarkBanner.className = 'draft-watermark-print';
            const draftIdStr = currentDraftId ? `Draft ID: ${currentDraftId}` : 'Standalone Draft Instance';
            watermarkBanner.innerHTML = `
                <div>⚠️ DRAFT - NOT FINAL</div>
                <div style="font-size: 0.7rem; font-weight: normal; margin-top: 2px; color: #7f1d1d;">
                    ${draftIdStr} | Generated: ${new Date().toLocaleString()}
                </div>
            `;
            const header = document.querySelector('.placeholder-container');
            if (header) {
                header.insertBefore(watermarkBanner, header.firstChild);
            }
        }

        setTimeout(() => {
            window.print();
            if (printStyles) printStyles.remove();
            if (watermarkBanner) watermarkBanner.remove();
        }, 150);
    });
};
