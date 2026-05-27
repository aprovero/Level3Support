/**
 * Level3Support — daily-progress.js
 * © 2026 Level3Support
 */

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const addWorkBtn = document.getElementById("add-work-btn");
  const addTestBtn = document.getElementById("add-test-btn");
  const addIssueBtn = document.getElementById("add-issue-btn");
  const addPlanBtn = document.getElementById("add-plan-btn");
  const addPhotoBtn = document.getElementById("add-photo-btn");

  const compileBtn = document.getElementById("compile-btn");
  const sampleBtn = document.getElementById("sample-btn");
  const resetBtn = document.getElementById("reset-btn");
  const copyBtn = document.getElementById("copy-btn");
  const exportBtn = document.getElementById("export-btn");

  // Event Listeners
  addWorkBtn.addEventListener("click", () => addWorkRow());
  addTestBtn.addEventListener("click", () => addTestRow());
  addIssueBtn.addEventListener("click", () => addIssueRow());
  addPlanBtn.addEventListener("click", () => addPlanRow());
  addPhotoBtn.addEventListener("click", () => addPhotoRow());

  compileBtn.addEventListener("click", runLiveEvaluation);
  sampleBtn.addEventListener("click", loadSampleValues);
  resetBtn.addEventListener("click", resetReport);
  copyBtn.addEventListener("click", copyHandoverSummary);
  exportBtn.addEventListener("click", exportReportJSON);

  // Set default date
  document.getElementById("report-date").value = new Date().toISOString().split('T')[0];

  // Set default rows
  addWorkRow("Inverter Pad 3", "INV-03", "ABB REJ603 parameter verification", "1", "Completed", "No communication issues");
  addTestRow("Insulation Resistance", "COMB-03 Strings", "18", "12", "12", "0", "6", "Awaiting cable tray covers");
  addIssueRow("Combiner cover missing", "Electrical DC", "Medium", "John Doe", "Obtain replacement cover from spare stock", "Open", "Under review");
  addPlanRow("Megger testing on blocked COMB-03 strings", "Inverter Pad 3 COMB-03", "Safety standby observer needed", "Weather conditions");
  addPhotoRow("PH-01", "COMB-03 Interior", "Pre-test insulation setup", "Ok");
});

// Row Adders
function addWorkRow(area = "", eq = "", activity = "", qty = "", status = "Completed", notes = "") {
  const tbody = document.getElementById("work-tbody");
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td><input type="text" class="w-area" value="${area}" placeholder="Area/System"></td>
    <td><input type="text" class="w-eq" value="${eq}" placeholder="Equipment ID"></td>
    <td><input type="text" class="w-activity" value="${activity}" placeholder="Work scope"></td>
    <td><input type="number" class="w-qty" value="${qty}" placeholder="Qty" style="width:80px;"></td>
    <td>
      <select class="w-status">
        <option value="Completed" ${status === 'Completed' ? 'selected' : ''}>Completed</option>
        <option value="In Progress" ${status === 'In Progress' ? 'selected' : ''}>In Progress</option>
        <option value="Blocked" ${status === 'Blocked' ? 'selected' : ''}>Blocked</option>
        <option value="Pending" ${status === 'Pending' ? 'selected' : ''}>Pending</option>
      </select>
    </td>
    <td><input type="text" class="w-notes" value="${notes}" placeholder="Notes..."></td>
    <td class="print-hide" style="text-align: center;"><button type="button" class="btn-remove" style="padding: 4px 8px; width:auto; min-height:unset; margin:0;" onclick="this.closest('tr').remove()"><i class="fas fa-trash-alt"></i></button></td>
  `;
  tbody.appendChild(tr);
}

function addTestRow(test = "", eq = "", planned = "", completed = "", passed = "", failed = "", blocked = "", notes = "") {
  const tbody = document.getElementById("test-tbody");
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td><input type="text" class="t-test" value="${test}" placeholder="Test type"></td>
    <td><input type="text" class="t-eq" value="${eq}" placeholder="Equipment ID"></td>
    <td><input type="number" class="t-planned" value="${planned}" placeholder="Planned" style="width:70px;"></td>
    <td><input type="number" class="t-completed" value="${completed}" placeholder="Completed" style="width:70px;"></td>
    <td><input type="number" class="t-passed" value="${passed}" placeholder="Passed" style="width:70px;"></td>
    <td><input type="number" class="t-failed" value="${failed}" placeholder="Failed" style="width:70px;"></td>
    <td><input type="number" class="t-blocked" value="${blocked}" placeholder="Blocked" style="width:70px;"></td>
    <td><input type="text" class="t-notes" value="${notes}" placeholder="Notes..."></td>
    <td class="print-hide" style="text-align: center;"><button type="button" class="btn-remove" style="padding: 4px 8px; width:auto; min-height:unset; margin:0;" onclick="this.closest('tr').remove()"><i class="fas fa-trash-alt"></i></button></td>
  `;
  tbody.appendChild(tr);
}

function addIssueRow(desc = "", cat = "Electrical DC", sev = "Medium", owner = "", action = "", status = "Open", notes = "") {
  const tbody = document.getElementById("issue-tbody");
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td><input type="text" class="i-desc" value="${desc}" placeholder="Blocker issue"></td>
    <td>
      <select class="i-cat">
        <option value="Civil" ${cat === 'Civil' ? 'selected' : ''}>Civil</option>
        <option value="Mechanical" ${cat === 'Mechanical' ? 'selected' : ''}>Mechanical</option>
        <option value="Electrical DC" ${cat === 'Electrical DC' ? 'selected' : ''}>Electrical DC</option>
        <option value="Electrical AC" ${cat === 'Electrical AC' ? 'selected' : ''}>Electrical AC</option>
        <option value="MV" ${cat === 'MV' ? 'selected' : ''}>MV</option>
        <option value="SCADA" ${cat === 'SCADA' ? 'selected' : ''}>SCADA</option>
        <option value="BESS" ${cat === 'BESS' ? 'selected' : ''}>BESS</option>
        <option value="HSE" ${cat === 'HSE' ? 'selected' : ''}>HSE</option>
        <option value="Documentation" ${cat === 'Documentation' ? 'selected' : ''}>Documentation</option>
        <option value="Other" ${cat === 'Other' ? 'selected' : ''}>Other</option>
      </select>
    </td>
    <td>
      <select class="i-sev">
        <option value="Critical" ${sev === 'Critical' ? 'selected' : ''}>Critical</option>
        <option value="High" ${sev === 'High' ? 'selected' : ''}>High</option>
        <option value="Medium" ${sev === 'Medium' ? 'selected' : ''}>Medium</option>
        <option value="Low" ${sev === 'Low' ? 'selected' : ''}>Low</option>
      </select>
    </td>
    <td><input type="text" class="i-owner" value="${owner}" placeholder="Owner"></td>
    <td><input type="text" class="i-action" value="${action}" placeholder="Required action"></td>
    <td>
      <select class="i-status">
        <option value="Open" ${status === 'Open' ? 'selected' : ''}>Open</option>
        <option value="Under Review" ${status === 'Under Review' ? 'selected' : ''}>Under Review</option>
        <option value="Closed" ${status === 'Closed' ? 'selected' : ''}>Closed</option>
      </select>
    </td>
    <td class="print-hide" style="text-align: center;"><button type="button" class="btn-remove" style="padding: 4px 8px; width:auto; min-height:unset; margin:0;" onclick="this.closest('tr').remove()"><i class="fas fa-trash-alt"></i></button></td>
  `;
  tbody.appendChild(tr);
}

function addPlanRow(act = "", target = "", support = "", risk = "") {
  const tbody = document.getElementById("plan-tbody");
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td><input type="text" class="p-act" value="${act}" placeholder="Activity planned"></td>
    <td><input type="text" class="p-target" value="${target}" placeholder="Target systems"></td>
    <td><input type="text" class="p-support" value="${support}" placeholder="Support reqs"></td>
    <td><input type="text" class="p-risk" value="${risk}" placeholder="Risks"></td>
    <td class="print-hide" style="text-align: center;"><button type="button" class="btn-remove" style="padding: 4px 8px; width:auto; min-height:unset; margin:0;" onclick="this.closest('tr').remove()"><i class="fas fa-trash-alt"></i></button></td>
  `;
  tbody.appendChild(tr);
}

function addPhotoRow(ref = "", loc = "", desc = "", notes = "") {
  const tbody = document.getElementById("photo-tbody");
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td><input type="text" class="ph-ref" value="${ref}" placeholder="e.g. PH-01"></td>
    <td><input type="text" class="ph-loc" value="${loc}" placeholder="Location"></td>
    <td><input type="text" class="ph-desc" value="${desc}" placeholder="Evidence scope"></td>
    <td><input type="text" class="ph-notes" value="${notes}" placeholder="Notes..."></td>
    <td class="print-hide" style="text-align: center;"><button type="button" class="btn-remove" style="padding: 4px 8px; width:auto; min-height:unset; margin:0;" onclick="this.closest('tr').remove()"><i class="fas fa-trash-alt"></i></button></td>
  `;
  tbody.appendChild(tr);
}

function loadSampleValues() {
  document.getElementById("site-name").value = "Red Mesa BESS Phase 2";
  document.getElementById("customer").value = "Apex Power Partners";
  document.getElementById("prepared-by").value = "Andres Provero";
  document.getElementById("supervisor").value = "Andres Provero";
  document.getElementById("weather").value = "Dry, Sunny 34°C";
  document.getElementById("crew-count").value = "14";
  document.getElementById("safety-meeting").value = "Yes";

  document.getElementById("hse-positive").value = "All staff actively using required shock hazard PPE during inverter audits.";
  document.getElementById("hse-unsafe").value = "Grounding strap disconnected in COMB-02 box door.";
  document.getElementById("hse-incidents").value = "None";
  document.getElementById("hse-corrective").value = "Grounding strap reconnected immediately prior to closing container door.";

  // Work performed
  document.getElementById("work-tbody").innerHTML = "";
  addWorkRow("INV Pad 3", "INV-03 / COMB-03", "Megger testing and torque auditing", "6 strings", "Completed", "Acceptable insulation confirmed");
  addWorkRow("Aux Transformer Area", "AUX-TX-02", "TTR Winding Turns Ratio measurements", "1", "Completed", "Deviation well under 0.5% limit");
  addWorkRow("BESS Container 1", "ESS-BC-01", "Cell voltage balancer tests", "1 rack", "In Progress", "LFP cell balancing within float charge");

  // Testing progress
  document.getElementById("test-tbody").innerHTML = "";
  addTestRow("Insulation Resistance", "INV-03 COMB-03", "12", "12", "12", "0", "0", "Megger VDC applied");
  addTestRow("Turns Ratio (TTR)", "AUX-TX-02", "9", "9", "8", "1", "0", "Tap 3 phase C failed, under review");
  addTestRow("Grounding Continuity", "Pad 3 Frame", "12", "10", "10", "0", "2", "Barricaded MV safety enclosure");

  // Issues
  document.getElementById("issue-tbody").innerHTML = "";
  addIssueRow("TTR Winding Phase C Tap 3 Out-of-Tolerance", "Electrical AC", "High", "Andres Provero", "Inspect tap contact adjustments and repeat testing", "Open", "Under investigation");
  addIssueRow("Access blocked by MV enclosure trenching", "Civil", "Medium", "John Doe", "Wait for trench backfill", "Open", "Trenching in progress");

  // Tomorrow
  document.getElementById("plan-tbody").innerHTML = "";
  addPlanRow("Complete balancing diagnostics ESS-BC-01", "BESS Container 1", "BMS remote telemetry connection", "BMS software lockouts");
  addPlanRow("Repeat turns ratio test on AUX-TX-02 after contact cleanup", "Transformer Pad", "Double-insulated high voltage gloves", "HV line backfeed check");

  // Photos
  document.getElementById("photo-tbody").innerHTML = "";
  addPhotoRow("PH-01", "AUX-TX-02 tap selector", "Close up of turns ratio connection terminals", "Ok");
  addPhotoRow("PH-02", "ESS-BC-01 balancing panel", "BMS live cell screen display values", "Ok");

  runLiveEvaluation();
}

function resetReport() {
  if (confirm("Reset daily progress report sheet and clear all lists?")) {
    document.getElementById("site-name").value = "";
    document.getElementById("customer").value = "";
    document.getElementById("prepared-by").value = "";
    document.getElementById("supervisor").value = "";
    document.getElementById("weather").value = "";
    document.getElementById("crew-count").value = "";
    document.getElementById("safety-meeting").value = "Yes";

    document.getElementById("hse-positive").value = "";
    document.getElementById("hse-unsafe").value = "";
    document.getElementById("hse-incidents").value = "None";
    document.getElementById("hse-corrective").value = "";

    document.getElementById("work-tbody").innerHTML = "";
    document.getElementById("test-tbody").innerHTML = "";
    document.getElementById("issue-tbody").innerHTML = "";
    document.getElementById("plan-tbody").innerHTML = "";
    document.getElementById("photo-tbody").innerHTML = "";

    document.getElementById("result-panel").style.display = "none";
    document.getElementById("validation-error").style.display = "none";
  }
}

function runLiveEvaluation() {
  const errorDiv = document.getElementById("validation-error");
  errorDiv.style.display = "none";

  const site = document.getElementById("site-name").value.trim();
  const prep = document.getElementById("prepared-by").value.trim();

  if (!site || !prep) {
    showError("Please enter Site Name and Report Author.");
    return;
  }

  // Aggregate totals
  let totalPlanned = 0;
  let totalCompleted = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  let totalBlocked = 0;

  document.querySelectorAll("#test-tbody tr").forEach(tr => {
    totalPlanned += parseInt(tr.querySelector(".t-planned").value) || 0;
    totalCompleted += parseInt(tr.querySelector(".t-completed").value) || 0;
    totalPassed += parseInt(tr.querySelector(".t-passed").value) || 0;
    totalFailed += parseInt(tr.querySelector(".t-failed").value) || 0;
    totalBlocked += parseInt(tr.querySelector(".t-blocked").value) || 0;
  });

  let blockersCount = 0;
  document.querySelectorAll("#issue-tbody tr").forEach(tr => {
    const sev = tr.querySelector(".i-sev").value;
    const stat = tr.querySelector(".i-status").value;
    if (stat !== "Closed" && (sev === "Critical" || sev === "High")) {
      blockersCount++;
    }
  });

  document.getElementById("res-test-totals").textContent = `${totalPassed} passed / ${totalCompleted} completed (Planned: ${totalPlanned})`;
  document.getElementById("res-blocker-totals").textContent = `${blockersCount} active Critical/High blockers`;

  const overallBadge = document.getElementById("overall-status-badge");
  if (blockersCount > 0) {
    overallBadge.textContent = "ATTENTION REQUIRED (Active Blockers)";
    overallBadge.className = "status-badge-inline status-fail";
  } else {
    overallBadge.textContent = "DAILY REPORT COMPILED";
    overallBadge.className = "status-badge-inline status-pass";
  }

  document.getElementById("result-panel").style.display = "block";
}

function showError(msg) {
  const errorDiv = document.getElementById("validation-error");
  errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${msg}`;
  errorDiv.style.color = "var(--error-color)";
  errorDiv.style.display = "block";
}

function collectData() {
  const c = {
    siteName: document.getElementById("site-name").value,
    customer: document.getElementById("customer").value,
    date: document.getElementById("report-date").value,
    preparedBy: document.getElementById("prepared-by").value,
    supervisor: document.getElementById("supervisor").value,
    weather: document.getElementById("weather").value,
    crewCount: parseInt(document.getElementById("crew-count").value) || 0,
    safetyMeeting: document.getElementById("safety-meeting").value,
    
    hsePositive: document.getElementById("hse-positive").value,
    hseUnsafe: document.getElementById("hse-unsafe").value,
    hseIncidents: document.getElementById("hse-incidents").value,
    hseCorrective: document.getElementById("hse-corrective").value,

    workPerformed: [],
    testingProgress: [],
    blockers: [],
    nextPlan: [],
    photos: []
  };

  // Work performed
  document.querySelectorAll("#work-tbody tr").forEach(tr => {
    c.workPerformed.push({
      area: tr.querySelector(".w-area").value,
      eq: tr.querySelector(".w-eq").value,
      activity: tr.querySelector(".w-activity").value,
      qty: parseInt(tr.querySelector(".w-qty").value) || 0,
      status: tr.querySelector(".w-status").value,
      notes: tr.querySelector(".w-notes").value
    });
  });

  // Testing
  document.querySelectorAll("#test-tbody tr").forEach(tr => {
    c.testingProgress.push({
      test: tr.querySelector(".t-test").value,
      eq: tr.querySelector(".t-eq").value,
      planned: parseInt(tr.querySelector(".t-planned").value) || 0,
      completed: parseInt(tr.querySelector(".t-completed").value) || 0,
      passed: parseInt(tr.querySelector(".t-passed").value) || 0,
      failed: parseInt(tr.querySelector(".t-failed").value) || 0,
      blocked: parseInt(tr.querySelector(".t-blocked").value) || 0,
      notes: tr.querySelector(".t-notes").value
    });
  });

  // Blockers
  document.querySelectorAll("#issue-tbody tr").forEach(tr => {
    c.blockers.push({
      desc: tr.querySelector(".i-desc").value,
      category: tr.querySelector(".i-cat").value,
      severity: tr.querySelector(".i-sev").value,
      owner: tr.querySelector(".i-owner").value,
      action: tr.querySelector(".i-action").value,
      status: tr.querySelector(".i-status").value
    });
  });

  // Tomorrow
  document.querySelectorAll("#plan-tbody tr").forEach(tr => {
    c.nextPlan.push({
      activity: tr.querySelector(".p-act").value,
      target: tr.querySelector(".p-target").value,
      support: tr.querySelector(".p-support").value,
      risk: tr.querySelector(".p-risk").value
    });
  });

  // Photos
  document.querySelectorAll("#photo-tbody tr").forEach(tr => {
    c.photos.push({
      ref: tr.querySelector(".ph-ref").value,
      location: tr.querySelector(".ph-loc").value,
      description: tr.querySelector(".ph-desc").value,
      notes: tr.querySelector(".ph-notes").value
    });
  });

  return c;
}

function copyHandoverSummary() {
  const c = collectData();
  let txt = `DAILY COMMISSIONING PROGRESS BRIEFING\n`;
  txt += `=====================================\n`;
  txt += `Site: ${c.siteName} | Date: ${c.date}\n`;
  txt += `Prepared By: ${c.preparedBy} | Crew Count: ${c.crewCount}\n`;
  txt += `Weather: ${c.weather} | Safety Briefing: ${c.safetyMeeting}\n`;
  txt += `=====================================\n\n`;

  txt += `1. Work Completed & Activities:\n`;
  c.workPerformed.forEach(w => {
    txt += `- [${w.status}] ${w.eq} at ${w.area}: ${w.activity} (Qty: ${w.qty})\n`;
  });

  txt += `\n2. Testing & Quality Control Progress:\n`;
  c.testingProgress.forEach(t => {
    txt += `- ${t.test} (${t.eq}): ${t.passed} Passed / ${t.failed} Failed / ${t.blocked} Blocked (Completed: ${t.completed}/${t.planned})\n`;
  });

  txt += `\n3. Active Technical Blockers & HSE Observations:\n`;
  let activeBlockers = c.blockers.filter(b => b.status !== 'Closed');
  if (activeBlockers.length === 0) {
    txt += `- No active technical blockers logged.\n`;
  } else {
    activeBlockers.forEach(b => {
      txt += `- [${b.severity} Blocker] ${b.desc} (Owner: ${b.owner}) | Req: ${b.action}\n`;
    });
  }
  txt += `- Safety Notes: Pos: ${c.hsePositive || 'None'} | Unsafe: ${c.hseUnsafe || 'None'} | Incident: ${c.hseIncidents}\n`;

  txt += `\n4. Tomorrow Plan / Next Shift Target:\n`;
  c.nextPlan.forEach(p => {
    txt += `- Target: ${p.activity} on ${p.target} [Support: ${p.support || 'N/A'}]\n`;
  });

  navigator.clipboard.writeText(txt).then(() => {
    alert("WhatsApp / Email commissioning handover summary copied to clipboard!");
  }).catch(() => {
    alert("Failed to copy summary.");
  });
}

function exportReportJSON() {
  const data = collectData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `daily_progress_report_${(data.siteName || 'export').replace(/\s+/g, '_')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
