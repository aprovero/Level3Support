/**
 * Level3Support — site-visit-report.js
 * © 2026 Level3Support
 */

document.addEventListener("DOMContentLoaded", () => {
  // Pre-populate date inputs
  const today = new Date().toISOString().split('T')[0];
  document.getElementById("visit-date").value = today;
  document.getElementById("sign-date").value = today;

  // Add initial rows for dynamic tables
  addWorkRow("INV-01", "Visual inspections, megger checking of main DC feeders", "Pass", "Clean inside");
  addWorkRow("PCS-02", "Inverter power stage testing and thermal camera scan", "Pass", "Temperatures normal");
  
  addIssueRow("High", "Inverter 3 AC Compartment", "Damaged door latch causing door to pop open.", "Taped shut, logged punchlist PL-001");
  
  addActionRow("Replace damaged AC compartment door latch", "EPC Subcontractor", "Open", "2026-06-01");
  
  addPendingRow("Perform insulation test on feeder circuit PV-4B", "O&M Tech crew", "2026-05-30");

  // Wire up Actions
  document.getElementById("copy-summary-btn").addEventListener("click", copyTextSummary);
  document.getElementById("export-json-btn").addEventListener("click", exportJSON);
});

// Dynamic Rows for Work Performed
function addWorkRow(eqId = "", desc = "", result = "", notes = "") {
  const tbody = document.getElementById("work-tbody");
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input type="text" value="${eqId}" placeholder="e.g. INV-01" class="eq-id-input"></td>
    <td><input type="text" value="${desc}" placeholder="e.g. Cleaned fan filters" class="desc-input"></td>
    <td>
      <select class="result-input">
        <option value="Pass" ${result === 'Pass' ? 'selected' : ''}>Pass</option>
        <option value="Fail" ${result === 'Fail' ? 'selected' : ''}>Fail</option>
        <option value="N/A" ${result === 'N/A' ? 'selected' : ''}>N/A</option>
        <option value="Monitor" ${result === 'Monitor' ? 'selected' : ''}>Monitor</option>
      </select>
    </td>
    <td><input type="text" value="${notes}" placeholder="Notes..." class="notes-input"></td>
    <td style="text-align: center;"><button type="button" class="btn-remove" style="padding: 4px 8px; width:auto; min-height:unset;" onclick="this.closest('tr').remove()"><i class="fas fa-trash-alt"></i></button></td>
  `;
  tbody.appendChild(tr);
}

// Dynamic Rows for Issues
function addIssueRow(sev = "Medium", eq = "", desc = "", action = "") {
  const tbody = document.getElementById("issues-tbody");
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>
      <select class="issue-sev-input">
        <option value="Low" ${sev === 'Low' ? 'selected' : ''}>Low</option>
        <option value="Medium" ${sev === 'Medium' ? 'selected' : ''}>Medium</option>
        <option value="High" ${sev === 'High' ? 'selected' : ''}>High</option>
        <option value="Critical" ${sev === 'Critical' ? 'selected' : ''}>Critical</option>
      </select>
    </td>
    <td><input type="text" value="${eq}" placeholder="e.g. Inverter 2" class="issue-eq-input"></td>
    <td><input type="text" value="${desc}" placeholder="Description..." class="issue-desc-input"></td>
    <td><input type="text" value="${action}" placeholder="Actions taken..." class="issue-action-input"></td>
    <td style="text-align: center;"><button type="button" class="btn-remove" style="padding: 4px 8px; width:auto; min-height:unset;" onclick="this.closest('tr').remove()"><i class="fas fa-trash-alt"></i></button></td>
  `;
  tbody.appendChild(tr);
}

// Dynamic Rows for Corrective Actions
function addActionRow(action = "", owner = "", status = "Open", due = "") {
  const tbody = document.getElementById("actions-tbody");
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input type="text" value="${action}" placeholder="Action needed..." class="action-required-input"></td>
    <td><input type="text" value="${owner}" placeholder="e.g. SCADA Team" class="action-owner-input"></td>
    <td>
      <select class="action-status-input">
        <option value="Open" ${status === 'Open' ? 'selected' : ''}>Open</option>
        <option value="In Progress" ${status === 'In Progress' ? 'selected' : ''}>In Progress</option>
        <option value="Closed" ${status === 'Closed' ? 'selected' : ''}>Closed</option>
      </select>
    </td>
    <td><input type="date" value="${due}" class="action-due-input"></td>
    <td style="text-align: center;"><button type="button" class="btn-remove" style="padding: 4px 8px; width:auto; min-height:unset;" onclick="this.closest('tr').remove()"><i class="fas fa-trash-alt"></i></button></td>
  `;
  tbody.appendChild(tr);
}

// Dynamic Rows for Pending Items
function addPendingRow(item = "", responsible = "", date = "") {
  const tbody = document.getElementById("pending-tbody");
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input type="text" value="${item}" placeholder="e.g. Megger main feeder" class="pending-item-input"></td>
    <td><input type="text" value="${responsible}" placeholder="e.g. EPC crew" class="pending-resp-input"></td>
    <td><input type="date" value="${date}" class="pending-date-input"></td>
    <td style="text-align: center;"><button type="button" class="btn-remove" style="padding: 4px 8px; width:auto; min-height:unset;" onclick="this.closest('tr').remove()"><i class="fas fa-trash-alt"></i></button></td>
  `;
  tbody.appendChild(tr);
}

// Gather all data into report object
function collectReportData() {
  const data = {
    // Project info
    project: document.getElementById("proj-name").value,
    site: document.getElementById("site-name").value,
    customer: document.getElementById("customer").value,
    location: document.getElementById("location").value,
    date: document.getElementById("visit-date").value,
    author: document.getElementById("prepared-by").value,
    personnel: document.getElementById("personnel").value,

    // Visit objective
    objective: document.getElementById("main-objective").value,
    requestedBy: document.getElementById("requested-by").value,
    scope: document.getElementById("scope-visit").value,

    // Conditions
    weather: document.getElementById("weather").value,
    access: document.getElementById("access-cond").value,
    safety: document.getElementById("safety-cond").value,
    arrivalStatus: document.getElementById("eq-status-arrival").value,

    // Dynamic Lists
    workPerformed: [],
    issuesFound: [],
    correctiveActions: [],
    pendingItems: [],

    // Safety & Recommendations
    safetyPositive: document.getElementById("safety-positive").value,
    safetyUnsafe: document.getElementById("safety-unsafe").value,
    safetyTaken: document.getElementById("safety-taken").value,
    recommendation: document.getElementById("recs-desc").value,
    recommendationPriority: document.getElementById("recs-priority").value,

    // Sign off
    signedCustomerRep: document.getElementById("rep-customer").value,
    signedDate: document.getElementById("sign-date").value
  };

  // Collect Work Performed
  document.querySelectorAll("#work-tbody tr").forEach(tr => {
    data.workPerformed.push({
      equipmentId: tr.querySelector(".eq-id-input").value,
      description: tr.querySelector(".desc-input").value,
      result: tr.querySelector(".result-input").value,
      notes: tr.querySelector(".notes-input").value
    });
  });

  // Collect Issues
  document.querySelectorAll("#issues-tbody tr").forEach(tr => {
    data.issuesFound.push({
      severity: tr.querySelector(".issue-sev-input").value,
      equipment: tr.querySelector(".issue-eq-input").value,
      description: tr.querySelector(".issue-desc-input").value,
      action: tr.querySelector(".issue-action-input").value
    });
  });

  // Collect Corrective Actions
  document.querySelectorAll("#actions-tbody tr").forEach(tr => {
    data.correctiveActions.push({
      action: tr.querySelector(".action-required-input").value,
      owner: tr.querySelector(".action-owner-input").value,
      status: tr.querySelector(".action-status-input").value,
      dueDate: tr.querySelector(".action-due-input").value
    });
  });

  // Collect Pending Items
  document.querySelectorAll("#pending-tbody tr").forEach(tr => {
    data.pendingItems.push({
      item: tr.querySelector(".pending-item-input").value,
      responsible: tr.querySelector(".pending-resp-input").value,
      targetDate: tr.querySelector(".pending-date-input").value
    });
  });

  return data;
}

function copyTextSummary() {
  const r = collectReportData();
  let txt = `FIELD SERVICE SITE VISIT REPORT SUMMARY\n`;
  txt += `=========================================\n`;
  txt += `Project: ${r.project} | Site: ${r.site}\n`;
  txt += `Customer: ${r.customer} | Date: ${r.date}\n`;
  txt += `Prepared By: ${r.author}\n`;
  txt += `=========================================\n\n`;
  txt += `Visit Objective:\n- ${r.objective}\n\n`;
  txt += `Work Performed:\n`;
  r.workPerformed.forEach(w => {
    txt += `- [${w.equipmentId}] ${w.description} (Result: ${w.result}) ${w.notes ? 'Note: '+w.notes : ''}\n`;
  });
  txt += `\nIssues Identified:\n`;
  if (r.issuesFound.length === 0) {
    txt += `- None identified\n`;
  } else {
    r.issuesFound.forEach(i => {
      txt += `- [${i.severity}] Location: ${i.equipment} - ${i.description} (Action: ${i.action})\n`;
    });
  }
  txt += `\nPending Close-out Plan:\n`;
  r.correctiveActions.forEach(a => {
    txt += `- Action: ${a.action} (Owner: ${a.owner}, Status: ${a.status}, Due: ${a.dueDate || 'N/A'})\n`;
  });

  navigator.clipboard.writeText(txt).then(() => {
    alert("Professional text summary copied to clipboard!");
  }).catch(() => {
    alert("Failed to copy summary.");
  });
}

function exportJSON() {
  const data = collectReportData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `site_visit_report_${data.project.replace(/\s+/g, '_')}_${data.date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function resetReport() {
  if (confirm("Reset the report back to blank template? Custom inputs will be cleared.")) {
    document.getElementById("report-form").reset();
    document.getElementById("work-tbody").innerHTML = "";
    document.getElementById("issues-tbody").innerHTML = "";
    document.getElementById("actions-tbody").innerHTML = "";
    document.getElementById("pending-tbody").innerHTML = "";
  }
}
