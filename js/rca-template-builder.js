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

    evidenceDesc: document.getElementById("evidence-desc").value,
    evidenceAttach: document.getElementById("evidence-attach").value,
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
  }
}
