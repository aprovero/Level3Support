/**
 * Level3Support — jha-pre-task-plan.js
 * © 2026 Level3Support
 */

document.addEventListener("DOMContentLoaded", () => {
  // Pre-fill date input
  const today = new Date().toISOString().substring(0, 16);
  document.getElementById("plan-date").value = today;

  // Add default tool inspection entry
  addToolRow("1000V Insulated Hand tools", "Inspected - OK", "Verify insulation is free of nicks");
  addToolRow("Fluke 87V Digital Multimeter", "Calibration Verified", "Inspected leads - OK");

  // Add default JHA steps
  addHazardRow("Setup exclusion boundary & open PCS door", "Unauthorized entry, arc flash risk", "Severe shock or burns", "Setup barricade tape, check panel door interlocks, check arc-flash boundary", "Low");
  addHazardRow("Perform voltage measurement checks", "Contact with live terminals", "Electrocution / severe injury", "Wear Class 2 insulated gloves, live-dead-live verification check", "Low");

  // Add initial crew rows
  addCrewRow("John Doe", "Lead Commissioning Engineer", "[ Signed ]");
  addCrewRow("Alex Smith", "Electrical Specialist Tech", "[ Signed ]");

  // Emergency defaults
  document.getElementById("em-contact").value = "Robert Vance (Site Safety Mgr)";
  document.getElementById("em-phone").value = "+1 432-555-0144";
  document.getElementById("em-medical").value = "Pecos Regional Health Clinic";
  document.getElementById("em-muster").value = "Main Admin Building Assembly Yard";

  // Wire actions
  document.getElementById("copy-summary-btn").addEventListener("click", copySafetySummary);
  document.getElementById("export-json-btn").addEventListener("click", exportJSON);
});

// Dynamic Rows Tools
function addToolRow(name = "", status = "Inspected - OK", notes = "") {
  const tbody = document.getElementById("tools-tbody");
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input type="text" value="${name}" placeholder="e.g. Insulated hand tools" class="tool-name-input"></td>
    <td>
      <select class="tool-status-input">
        <option value="Inspected - OK" ${status === 'Inspected - OK' ? 'selected' : ''}>Inspected - OK</option>
        <option value="Calibration Verified" ${status === 'Calibration Verified' ? 'selected' : ''}>Calibration Verified</option>
        <option value="Needs repair - Tagged out" ${status === 'Needs repair - Tagged out' ? 'selected' : ''}>Needs repair - Tagged out</option>
      </select>
    </td>
    <td><input type="text" value="${notes}" placeholder="Notes..." class="tool-notes-input"></td>
    <td style="text-align: center;"><button type="button" class="btn-remove" style="padding: 4px 8px; width:auto; min-height:unset;" onclick="this.closest('tr').remove()"><i class="fas fa-trash-alt"></i></button></td>
  `;
  tbody.appendChild(tr);
}

// Dynamic Rows Hazards
function addHazardRow(step = "", hazard = "", consequence = "", control = "", risk = "Low") {
  const tbody = document.getElementById("hazards-tbody");
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input type="text" value="${step}" placeholder="e.g. Test voltage" class="haz-step-input"></td>
    <td><input type="text" value="${hazard}" placeholder="e.g. Energized contact" class="haz-desc-input"></td>
    <td><input type="text" value="${consequence}" placeholder="e.g. Shock/burns" class="haz-cons-input"></td>
    <td><input type="text" value="${control}" placeholder="e.g. Insulated gloves" class="haz-ctrl-input"></td>
    <td>
      <select class="haz-risk-input">
        <option value="Low" ${risk === 'Low' ? 'selected' : ''}>Low</option>
        <option value="Medium" ${risk === 'Medium' ? 'selected' : ''}>Medium</option>
        <option value="High" ${risk === 'High' ? 'selected' : ''}>High</option>
      </select>
    </td>
    <td style="text-align: center;"><button type="button" class="btn-remove" style="padding: 4px 8px; width:auto; min-height:unset;" onclick="this.closest('tr').remove()"><i class="fas fa-trash-alt"></i></button></td>
  `;
  tbody.appendChild(tr);
}

// Dynamic Rows Crew
function addCrewRow(name = "", role = "", sig = "[ Signed ]") {
  const tbody = document.getElementById("crew-tbody");
  const tr = document.createElement("tr");
  const timeStr = new Date().toLocaleTimeString();
  tr.innerHTML = `
    <td><input type="text" value="${name}" placeholder="Name..." class="crew-name-input"></td>
    <td><input type="text" value="${role}" placeholder="e.g. Technician" class="crew-role-input"></td>
    <td><div style="border: 1px dashed var(--border-color); height:30px; display:flex; align-items:center; justify-content:center; border-radius:4px; font-size:0.75rem; color:var(--text-light); font-weight:600;">${sig}</div></td>
    <td style="font-family:monospace; font-size:0.8rem; vertical-align:middle;">${timeStr}</td>
    <td style="text-align: center;"><button type="button" class="btn-remove" style="padding: 4px 8px; width:auto; min-height:unset;" onclick="this.closest('tr').remove()"><i class="fas fa-trash-alt"></i></button></td>
  `;
  tbody.appendChild(tr);
}

// Collect data for exports
function collectJhaData() {
  const data = {
    site: document.getElementById("site-name").value,
    location: document.getElementById("work-loc").value,
    taskDescription: document.getElementById("task-desc").value,
    date: document.getElementById("plan-date").value,
    supervisor: document.getElementById("supervisor").value,

    permits: {
      ptw: document.getElementById("permit-req").checked,
      energized: document.getElementById("energized-work").checked,
      loto: document.getElementById("loto-req").checked,
      heights: document.getElementById("heights-work").checked,
      hot: document.getElementById("hot-work").checked,
      confined: document.getElementById("confined-space").checked
    },

    ppe: {
      hardhat: document.getElementById("ppe-hardhat").checked,
      glasses: document.getElementById("ppe-glasses").checked,
      gloves: document.getElementById("ppe-gloves").checked,
      elec_gloves: document.getElementById("ppe-elec-gloves").checked,
      arc: document.getElementById("ppe-arc").checked,
      shoes: document.getElementById("ppe-shoes").checked,
      hearing: document.getElementById("ppe-hearing").checked,
      fall: document.getElementById("ppe-fall").checked,
      respiratory: document.getElementById("ppe-respiratory").checked,
      other: document.getElementById("ppe-other").checked
    },

    tools: [],
    hazards: [],

    weather: document.getElementById("env-weather").value,
    heatRisk: document.getElementById("env-heat").value,
    lightning: document.getElementById("env-lightning").value,
    access: document.getElementById("env-access").value,

    emergencyContact: document.getElementById("em-contact").value,
    emergencyPhone: document.getElementById("em-phone").value,
    medicalFacility: document.getElementById("em-medical").value,
    musterPoint: document.getElementById("em-muster").value,
    firstAid: document.getElementById("em-firstaid").value,

    crew: []
  };

  // Collect Tools
  document.querySelectorAll("#tools-tbody tr").forEach(tr => {
    data.tools.push({
      name: tr.querySelector(".tool-name-input").value,
      status: tr.querySelector(".tool-status-input").value,
      notes: tr.querySelector(".tool-notes-input").value
    });
  });

  // Collect Hazards
  document.querySelectorAll("#hazards-tbody tr").forEach(tr => {
    data.hazards.push({
      step: tr.querySelector(".haz-step-input").value,
      hazard: tr.querySelector(".haz-desc-input").value,
      consequence: tr.querySelector(".haz-cons-input").value,
      control: tr.querySelector(".haz-ctrl-input").value,
      residualRisk: tr.querySelector(".haz-risk-input").value
    });
  });

  // Collect Crew
  document.querySelectorAll("#crew-tbody tr").forEach(tr => {
    data.crew.push({
      name: tr.querySelector(".crew-name-input").value,
      role: tr.querySelector(".crew-role-input").value
    });
  });

  return data;
}

function copySafetySummary() {
  const j = collectJhaData();
  let txt = `DAILY PRE-TASK PLAN SAFETY SUMMARY\n`;
  txt += `=====================================\n`;
  txt += `Site: ${j.site} | Location: ${j.location}\n`;
  txt += `Task: ${j.taskDescription}\n`;
  txt += `Supervisor: ${j.supervisor} | Date: ${j.date}\n`;
  txt += `=====================================\n\n`;
  
  txt += `Active High Risk Permits:\n`;
  let activePermits = [];
  if (j.permits.ptw) activePermits.push("Permit-to-Work (PTW)");
  if (j.permits.energized) activePermits.push("Energized Work");
  if (j.permits.loto) activePermits.push("LOTO Isolation");
  if (j.permits.heights) activePermits.push("Working at Heights");
  if (j.permits.hot) activePermits.push("Hot Work");
  if (j.permits.confined) activePermits.push("Confined Space");
  txt += activePermits.length > 0 ? `- ${activePermits.join('\n- ')}\n\n` : `- Standard work, no special permits required\n\n`;

  txt += `Key Job Steps & Hazards:\n`;
  j.hazards.forEach(h => {
    txt += `- Step: ${h.step}\n  Hazard: ${h.hazard} -> Control: ${h.control} (Risk: ${h.residualRisk})\n`;
  });

  txt += `\nEmergency Muster Point: ${j.musterPoint}\n`;
  txt += `Nearest Hospital: ${j.medicalFacility}\n`;
  txt += `Supervisor Emergency Contacts: ${j.emergencyContact} / ${j.emergencyPhone}\n\n`;
  txt += `Signed-off Crew size: ${j.crew.length} members.`;

  navigator.clipboard.writeText(txt).then(() => {
    alert("Safety briefing summary copied to clipboard successfully!");
  }).catch(() => {
    alert("Failed to copy summary.");
  });
}

function exportJSON() {
  const data = collectJhaData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `jha_plan_${data.site.replace(/\s+/g, '_')}_${data.taskDescription.replace(/\s+/g, '_')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function resetForm() {
  if (confirm("Clear all crew, tools, hazards, and reset safety plan?")) {
    document.getElementById("jha-form").reset();
    document.getElementById("tools-tbody").innerHTML = "";
    document.getElementById("hazards-tbody").innerHTML = "";
    document.getElementById("crew-tbody").innerHTML = "";
  }
}
