/**
 * Level3Support — loto-checklist.js
 * © 2026 Level3Support
 */

document.addEventListener("DOMContentLoaded", () => {
  // Pre-fill date inputs
  const todayTime = new Date().toISOString().substring(0, 16);
  const today = new Date().toISOString().split('T')[0];
  document.getElementById("loto-date").value = todayTime;
  document.getElementById("sign-date").value = today;

  // Add default energy source rows
  addEnergyRow("Electrical AC", "Main AC output feeder backfeed from MV transformer", "1500V AC fatal shock risk", "Open Main AC Breaker 52-PCS3", "Verify terminal voltage with 1000V rated DMM");
  addEnergyRow("Electrical DC", "BESS container DC input battery rack combiners", "1500V DC fatal shock / arc flash risk", "Open DC switches Rack A through Rack H", "Verify busbar voltage with 1000V rated DMM");

  // Add default isolation points
  addIsolationRow("IP-01", "INV Pad 3 AC Box", "AC Air Circuit Breaker", "Closed", "Open / Rack-out", "L-9082", "T-4091", "John Doe", "Alex Smith");
  addIsolationRow("IP-02", "BESS Container DC Box", "Main DC Disconnect Switch", "Closed", "Open / Lock", "L-9083", "T-4092", "John Doe", "Alex Smith");

  // Add default restoration steps
  addRestorationRow("1", "Clear all tools, barricade tape, and verify all compartment covers are re-installed.", "John Doe", "Visual inspection of inverter cabinet interior");
  addRestorationRow("2", "Remove all padlock keys and red tags from isolation points IP-01 and IP-02.", "John Doe", "Verified all locks removed from lockbox");

  // Zero-energy instrument defaults
  document.getElementById("verify-inst").value = "Fluke 87V Digital Multimeter";
  document.getElementById("verify-serial").value = "DMM-948271";
  document.getElementById("verify-ldl").value = "Yes";
  document.getElementById("verify-method").value = "Live-Dead-Live check on AC input L1-L2-L3 terminals";

  // Try-out defaults
  document.getElementById("try-controls").value = "Attempted local manual HMI startup. System did not boot.";
  document.getElementById("try-stored").value = "Discharged Spring Charged Breaker mechanisms.";

  // Wire actions
  document.getElementById("copy-summary-btn").addEventListener("click", copyLotoSummary);
  document.getElementById("export-json-btn").addEventListener("click", exportJSON);
});

// Dynamic Rows Energy
function addEnergyRow(type = "Electrical AC", desc = "", hazard = "", isolation = "", verification = "") {
  const tbody = document.getElementById("energy-tbody");
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>
      <select class="energy-type-input">
        <option value="Electrical AC" ${type === 'Electrical AC' ? 'selected' : ''}>Electrical AC</option>
        <option value="Electrical DC" ${type === 'Electrical DC' ? 'selected' : ''}>Electrical DC</option>
        <option value="Mechanical" ${type === 'Mechanical' ? 'selected' : ''}>Mechanical</option>
        <option value="Hydraulic" ${type === 'Hydraulic' ? 'selected' : ''}>Hydraulic</option>
        <option value="Pneumatic" ${type === 'Pneumatic' ? 'selected' : ''}>Pneumatic</option>
        <option value="Thermal" ${type === 'Thermal' ? 'selected' : ''}>Thermal</option>
        <option value="Chemical" ${type === 'Chemical' ? 'selected' : ''}>Chemical</option>
        <option value="Stored energy" ${type === 'Stored energy' ? 'selected' : ''}>Stored energy</option>
        <option value="Gravity" ${type === 'Gravity' ? 'selected' : ''}>Gravity</option>
        <option value="Other" ${type === 'Other' ? 'selected' : ''}>Other</option>
      </select>
    </td>
    <td><input type="text" value="${desc}" placeholder="e.g. Battery busbars" class="energy-desc-input"></td>
    <td><input type="text" value="${hazard}" placeholder="e.g. Arc flash" class="energy-hazard-input"></td>
    <td><input type="text" value="${isolation}" placeholder="e.g. Open DC disconnect" class="energy-isol-input"></td>
    <td><input type="text" value="${verification}" placeholder="e.g. DMM voltage check" class="energy-verify-input"></td>
    <td style="text-align: center;"><button type="button" class="btn-remove" style="padding: 4px 8px; width:auto; min-height:unset;" onclick="this.closest('tr').remove()"><i class="fas fa-trash-alt"></i></button></td>
  `;
  tbody.appendChild(tr);
}

// Dynamic Rows Isolation Points
function addIsolationRow(id = "", loc = "", devType = "", normal = "Closed", isolated = "Open", lockNum = "", tagNum = "", applied = "", verified = "") {
  const tbody = document.getElementById("isolation-tbody");
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input type="text" value="${id}" placeholder="e.g. IP-01" class="ip-id-input" style="font-family:monospace; font-weight:600;"></td>
    <td><input type="text" value="${loc}" placeholder="e.g. Inverter pad" class="ip-loc-input"></td>
    <td><input type="text" value="${devType}" placeholder="e.g. AC Breaker" class="ip-dev-input"></td>
    <td><input type="text" value="${normal}" placeholder="e.g. Closed" class="ip-normal-input"></td>
    <td><input type="text" value="${isolated}" placeholder="e.g. Open" class="ip-isolated-input"></td>
    <td><input type="text" value="${lockNum}" placeholder="e.g. L-12" class="ip-lock-input"></td>
    <td><input type="text" value="${tagNum}" placeholder="e.g. T-34" class="ip-tag-input"></td>
    <td><input type="text" value="${applied}" placeholder="Applied by" class="ip-applied-input"></td>
    <td><input type="text" value="${verified}" placeholder="Verified by" class="ip-verified-input"></td>
    <td style="text-align: center;"><button type="button" class="btn-remove" style="padding: 4px 8px; width:auto; min-height:unset;" onclick="this.closest('tr').remove()"><i class="fas fa-trash-alt"></i></button></td>
  `;
  tbody.appendChild(tr);
}

// Dynamic Rows Restoration Steps
function addRestorationRow(stepNum = "", action = "", resp = "", verify = "") {
  const tbody = document.getElementById("restoration-tbody");
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input type="text" value="${stepNum}" placeholder="e.g. 1" class="rest-step-input"></td>
    <td><input type="text" value="${action}" placeholder="De-isolation step..." class="rest-action-input"></td>
    <td><input type="text" value="${resp}" placeholder="Responsible person" class="rest-resp-input"></td>
    <td><input type="text" value="${verify}" placeholder="Verification check..." class="rest-verify-input"></td>
    <td style="text-align: center;"><button type="button" class="btn-remove" style="padding: 4px 8px; width:auto; min-height:unset;" onclick="this.closest('tr').remove()"><i class="fas fa-trash-alt"></i></button></td>
  `;
  tbody.appendChild(tr);
}

// Collect data
function collectLotoData() {
  const data = {
    site: document.getElementById("site-name").value,
    equipment: document.getElementById("loto-eq").value,
    description: document.getElementById("loto-desc").value,
    lead: document.getElementById("loto-auth").value,
    supervisor: document.getElementById("loto-supervisor").value,
    date: document.getElementById("loto-date").value,

    verifyInstrument: document.getElementById("verify-inst").value,
    verifySerial: document.getElementById("verify-serial").value,
    verifyLdl: document.getElementById("verify-ldl").value,
    verifyMethod: document.getElementById("verify-method").value,
    verifyResult: document.getElementById("verify-result").value,

    tryControls: document.getElementById("try-controls").value,
    tryStored: document.getElementById("try-stored").value,
    tryResult: document.getElementById("try-result").value,

    energySources: [],
    isolationPoints: [],
    restorationSteps: [],
    
    releaseDate: document.getElementById("sign-date").value
  };

  // Energy Sources
  document.querySelectorAll("#energy-tbody tr").forEach(tr => {
    data.energySources.push({
      type: tr.querySelector(".energy-type-input").value,
      description: tr.querySelector(".energy-desc-input").value,
      hazard: tr.querySelector(".energy-hazard-input").value,
      isolation: tr.querySelector(".energy-isol-input").value,
      verification: tr.querySelector(".energy-verify-input").value
    });
  });

  // Isolation Points
  document.querySelectorAll("#isolation-tbody tr").forEach(tr => {
    data.isolationPoints.push({
      id: tr.querySelector(".ip-id-input").value,
      location: tr.querySelector(".ip-loc-input").value,
      device: tr.querySelector(".ip-dev-input").value,
      normal: tr.querySelector(".ip-normal-input").value,
      isolated: tr.querySelector(".ip-isolated-input").value,
      lock: tr.querySelector(".ip-lock-input").value,
      tag: tr.querySelector(".ip-tag-input").value,
      applied: tr.querySelector(".ip-applied-input").value,
      verified: tr.querySelector(".ip-verified-input").value
    });
  });

  // Restoration Steps
  document.querySelectorAll("#restoration-tbody tr").forEach(tr => {
    data.restorationSteps.push({
      step: tr.querySelector(".rest-step-input").value,
      action: tr.querySelector(".rest-action-input").value,
      responsible: tr.querySelector(".rest-resp-input").value,
      verification: tr.querySelector(".rest-verify-input").value
    });
  });

  return data;
}

function copyLotoSummary() {
  const l = collectLotoData();
  let txt = `LOCKOUT/TAGOUT (LOTO) PLAN SUMMARY\n`;
  txt += `=====================================\n`;
  txt += `Site: ${l.site} | System Isolated: ${l.equipment}\n`;
  txt += `Scope: ${l.description}\n`;
  txt += `LOTO Lead Authorized: ${l.lead} | Supervisor: ${l.supervisor}\n`;
  txt += `=====================================\n\n`;
  
  txt += `Locked Isolation Points:\n`;
  l.isolationPoints.forEach(ip => {
    txt += `- [${ip.id}] Location: ${ip.location} | Device: ${ip.device} | Target: ${ip.isolated} [Lock: ${ip.lock}, Tag: ${ip.tag}]\n`;
  });

  txt += `\nZero-Energy Verification:\n`;
  txt += `- Instrument: ${l.verifyInstrument} (S/N: ${l.verifySerial})\n`;
  txt += `- LDL Check Complete: ${l.verifyLdl}\n`;
  txt += `- Method: ${l.verifyMethod}\n`;
  txt += `- Result: ${l.verifyResult}\n\n`;

  txt += `Try-Out Confirmation:\n`;
  txt += `- Control Push: ${l.tryControls}\n`;
  txt += `- Spring Charge: ${l.tryStored}\n`;
  txt += `- Result: ${l.tryResult}`;

  navigator.clipboard.writeText(txt).then(() => {
    alert("LOTO isolation briefing summary copied to clipboard!");
  }).catch(() => {
    alert("Failed to copy summary.");
  });
}

function exportJSON() {
  const data = collectLotoData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `loto_plan_${data.site.replace(/\s+/g, '_')}_${data.equipment.replace(/\s+/g, '_')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function resetForm() {
  if (confirm("Reset LOTO planning log and empty out current checklist?")) {
    document.getElementById("loto-form").reset();
    document.getElementById("energy-tbody").innerHTML = "";
    document.getElementById("isolation-tbody").innerHTML = "";
    document.getElementById("restoration-tbody").innerHTML = "";
  }
}
