/**
 * BESS Pre-Energization Checklist — Logic
 * Level3Support
 */

document.addEventListener('DOMContentLoaded', () => {
  // 15 Safety Checkpoints configuration
  const checklistItems = [
    { id: 'container-inspect', name: 'Container physical inspection complete & approved (structural integrity ok)' },
    { id: 'fire-ready', name: 'Fire suppression system active, pressurized & release panel verified ready' },
    { id: 'hvac-ready', name: 'HVAC units commissioned, active, stable setpoints, no blower alarms' },
    { id: 'ems-comm', name: 'EMS (Energy Management System) network/fibre communications established' },
    { id: 'bms-comm', name: 'BMS (Battery Management System) internal and SCADA communications established' },
    { id: 'pcs-comm', name: 'PCS (Power Conversion System / Inverter) communications active & responsive' },
    { id: 'dc-isolate', name: 'DC isolation switches verified in correct state (closed/open per LOTO)' },
    { id: 'aux-power', name: 'Auxiliary AC power fully available, stable phase voltage, UPS charged' },
    { id: 'estop-reset', name: 'E-stop circuits reset, keys present, visual beacons operational' },
    { id: 'ground-verify', name: 'Grounding grid connections physically checked and torque-marked' },
    { id: 'soc-range', name: 'Battery rack SOC within manufacturer allowed storage/energization window' },
    { id: 'safety-signage', name: 'Safety signage (arc flash, high voltage, NFPA 704, LOTO tags) installed' },
    { id: 'remote-monitor', name: 'Remote monitoring / Master SCADA active and logging telemetry data' },
    { id: 'approvals', name: 'Required local authorities, utility connections & manager approvals signed' },
    { id: 'loto-status', name: 'Lockout/Tagout (LOTO) audited, keys accounted for, restoration checklist signed' }
  ];

  // State structure
  const checklistState = {};
  checklistItems.forEach(item => {
    checklistState[item.id] = {
      name: item.name,
      status: null, // 'PASS', 'FAIL', or 'NA'
      note: ''
    };
  });

  // DOM elements cache
  const energizeSite = document.getElementById('energize-site');
  const energizeBlock = document.getElementById('energize-block');
  const progressText = document.getElementById('energize-progress-text');
  const progressFill = document.getElementById('energize-progress-fill');
  const checklistContainer = document.getElementById('checklist-items-container');
  const energizeCalcBtn = document.getElementById('energize-calc-btn');
  const energizeResetBtn = document.getElementById('energize-reset-btn');
  
  const resultPanel = document.getElementById('result-panel');
  const energizeStatusBadge = document.getElementById('energize-status-badge');
  const resMetaSite = document.getElementById('res-meta-site');
  const resMetaDate = document.getElementById('res-meta-date');
  const resCompletion = document.getElementById('res-energize-completion');
  const resPassed = document.getElementById('res-energize-passed');
  const resFailed = document.getElementById('res-energize-failed');
  const resNa = document.getElementById('res-energize-na');
  const failedConditionsPanel = document.getElementById('failed-conditions-panel');
  const failedConditionsList = document.getElementById('failed-conditions-list');
  const printTableBody = document.getElementById('print-checklist-table-body');
  
  const copyBtn = document.getElementById('copy-btn');
  const printBtn = document.getElementById('print-btn');
  const exportBtn = document.getElementById('export-btn');
  const validationError = document.getElementById('validation-error');

  let reportData = null;

  // Build checklist DOM elements
  function buildChecklistUI() {
    checklistContainer.innerHTML = '';
    
    checklistItems.forEach(item => {
      const row = document.createElement('div');
      row.className = 'checklist-row';
      row.id = `row-${item.id}`;
      
      row.innerHTML = `
        <div class="item-header">
          <span class="item-title">${item.name}</span>
          <div class="checklist-buttons">
            <button type="button" class="check-btn pass" data-id="${item.id}" data-val="PASS"><i class="fas fa-check"></i> Pass</button>
            <button type="button" class="check-btn fail" data-id="${item.id}" data-val="FAIL"><i class="fas fa-times"></i> Fail</button>
            <button type="button" class="check-btn na" data-id="${item.id}" data-val="NA">N/A</button>
          </div>
        </div>
        <input type="text" class="item-note-input" data-id="${item.id}" placeholder="Specify field notes, serials, torque numbers, or isolation tag IDs...">
      `;
      
      checklistContainer.appendChild(row);
    });

    // Add event listeners for checklist status buttons
    const buttons = checklistContainer.querySelectorAll('.check-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        const val = this.getAttribute('data-val');
        
        // Remove active class from sibling buttons in this row
        const siblings = this.parentElement.querySelectorAll('.check-btn');
        siblings.forEach(sib => sib.classList.remove('active'));
        
        // Toggle or set active
        this.classList.add('active');
        checklistState[id].status = val;
        
        // Trigger row styling changes
        const row = document.getElementById(`row-${id}`);
        row.style.background = val === 'PASS' ? '#f0fdf4' : val === 'FAIL' ? '#fff5f5' : '#f8fafc';
        
        updateProgressBar();
      });
    });

    // Add note inputs listeners
    const notes = checklistContainer.querySelectorAll('.item-note-input');
    notes.forEach(note => {
      note.addEventListener('input', function() {
        const id = this.getAttribute('data-id');
        checklistState[id].note = this.value.trim();
      });
    });
  }

  // Pre-seed sample checklist values
  function seedSampleAudit() {
    energizeSite.value = 'Mojave Oasis Storage Facility';
    energizeBlock.value = 'Block 04 - Container A (Sample)';
    
    // Seed checklist choices representing a fully ready-to-energize safe state
    const selections = {
      'container-inspect': { status: 'PASS', note: 'Sign-off complete. Walkway clear, structure verified.' },
      'fire-ready': { status: 'PASS', note: 'Gaseous system armed. Cylinder weight matches curve.' },
      'hvac-ready': { status: 'PASS', note: 'Blower nominal. Return air temperature is 21.8C.' },
      'ems-comm': { status: 'PASS', note: 'Fibre optic link verified. TCP/IP ping 4ms.' },
      'bms-comm': { status: 'PASS', note: 'Master BMS active. Dynamic mapping complete.' },
      'pcs-comm': { status: 'PASS', note: 'Modbus registers polling. No communication timeouts.' },
      'dc-isolate': { status: 'PASS', note: 'DC switches verified open for current pre-charge alignment.' },
      'aux-power': { status: 'PASS', note: 'Aux voltage stable at 480VAC. UPS battery level at 100%.' },
      'estop-condition': { status: 'PASS', note: 'E-stop loop audited and verified functional.' },
      'estop-reset': { status: 'PASS', note: 'Safety circuit loop reset successfully.' },
      'ground-verify': { status: 'PASS', note: 'Grounding connections torqued to 35Nm & marked.' },
      'soc-range': { status: 'PASS', note: 'Rack average SOC is 48.5%, nominal storage state.' },
      'safety-signage': { status: 'PASS', note: 'Warning placards and ARC FLASH labels visible.' },
      'remote-monitor': { status: 'PASS', note: 'SCADA cloud logging telemetry live.' },
      'approvals': { status: 'PASS', note: 'Utility connection permit signed (Grid-Clear-Ref #4829).' },
      'loto-status': { status: 'PASS', note: 'LOTO key released. Work locks removed, box empty.' }
    };

    Object.keys(selections).forEach(id => {
      const sel = selections[id];
      if (checklistState[id]) {
        checklistState[id].status = sel.status;
        checklistState[id].note = sel.note;
      }
      
      const row = document.getElementById(`row-${id}`);
      if (row) {
        row.style.background = sel.status === 'PASS' ? '#f0fdf4' : sel.status === 'FAIL' ? '#fff5f5' : '#f8fafc';
        const btn = row.querySelector(`.check-btn.${sel.status.toLowerCase()}`);
        if (btn) btn.classList.add('active');
        const input = row.querySelector('.item-note-input');
        if (input) input.value = sel.note;
      }
    });

    updateProgressBar();
  }

  // Update progress calculation
  function updateProgressBar() {
    let checkedCount = 0;
    let failedCount = 0;
    const total = checklistItems.length;
    
    Object.keys(checklistState).forEach(id => {
      if (checklistState[id].status !== null) {
        checkedCount++;
      }
      if (checklistState[id].status === 'FAIL') {
        failedCount++;
      }
    });

    const pct = Math.round((checkedCount / total) * 100);
    progressText.textContent = `${pct}% (${checkedCount} / ${total} Checked)`;
    progressFill.style.width = `${pct}%`;

    // Dynamic Progress Bar Color - turns bright green only when 100% completed and ZERO failures
    if (pct === 100 && failedCount === 0) {
      progressFill.style.backgroundColor = '#22c55e';
    } else {
      progressFill.style.backgroundColor = '#dc2626'; // warning red
    }
  }

  // Initialize Checklist
  buildChecklistUI();
  seedSampleAudit();

  // Reset Checklist Action
  energizeResetBtn.addEventListener('click', () => {
    energizeSite.value = '';
    energizeBlock.value = '';
    
    // Clear selections
    Object.keys(checklistState).forEach(id => {
      checklistState[id].status = null;
      checklistState[id].note = '';
      
      const row = document.getElementById(`row-${id}`);
      if (row) {
        row.style.background = '#ffffff';
        const btns = row.querySelectorAll('.check-btn');
        btns.forEach(btn => btn.classList.remove('active'));
        const input = row.querySelector('.item-note-input');
        if (input) input.value = '';
      }
    });

    validationError.style.display = 'none';
    resultPanel.style.display = 'none';
    reportData = null;
    updateProgressBar();
  });

  // Generate Safety Report Action
  energizeCalcBtn.addEventListener('click', () => {
    validationError.style.display = 'none';
    
    const site = energizeSite.value.trim();
    const block = energizeBlock.value.trim();

    if (!site || !block) {
      showError('Please populate Site and Block identifiers.');
      return;
    }

    // Collect Checklist metrics
    let passed = 0;
    let failed = 0;
    let na = 0;
    let unchecked = 0;
    
    const failedItems = [];
    
    Object.keys(checklistState).forEach(id => {
      const status = checklistState[id].status;
      if (status === 'PASS') passed++;
      else if (status === 'FAIL') {
        failed++;
        failedItems.push({ name: checklistState[id].name, note: checklistState[id].note || 'No notes added.' });
      }
      else if (status === 'NA') na++;
      else unchecked++;
    });

    if (unchecked > 0) {
      showError(`Safety check incomplete. Please resolve all ${unchecked} unchecked controls before generating safety report.`);
      return;
    }

    const completionPct = 100;
    // System is only authorized to energize if zero safety items failed!
    const verdict = failed > 0 ? 'STARTUP BLOCKED' : 'READY TO ENERGIZE';

    reportData = {
      site: site,
      block: block,
      date: new Date().toLocaleDateString(),
      completion: `${completionPct}%`,
      passedCount: passed,
      failedCount: failed,
      naCount: na,
      verdict: verdict,
      failedItemsList: failedItems,
      checklistLog: checklistState
    };

    // Render summary data
    resMetaSite.textContent = `${site} / ${block}`;
    resMetaDate.textContent = reportData.date;
    resCompletion.textContent = reportData.completion;
    resPassed.textContent = `${passed} / 15`;
    resFailed.textContent = `${failed} / 15`;
    resNa.textContent = `${na} / 15`;

    // Render status badge style
    energizeStatusBadge.textContent = verdict;
    if (verdict === 'READY TO ENERGIZE') {
      energizeStatusBadge.className = 'status-badge-inline status-normal';
      resultPanel.style.borderLeft = '6px solid #22c55e';
      const header = resultPanel.querySelector('.result-header');
      header.style.backgroundColor = '#f0fdf4';
      header.style.color = '#15803d';
    } else {
      energizeStatusBadge.className = 'status-badge-inline status-critical';
      resultPanel.style.borderLeft = '6px solid #dc2626';
      const header = resultPanel.querySelector('.result-header');
      header.style.backgroundColor = '#fef2f2';
      header.style.color = '#991b1b';
    }

    // Render failed findings panel
    if (failed > 0) {
      failedConditionsList.innerHTML = '';
      failedItems.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${item.name}</strong><br><span style="color:#dc2626; font-size:0.8rem;">Failure Detail: ${item.note}</span>`;
        failedConditionsList.appendChild(li);
      });
      failedConditionsPanel.style.display = 'block';
    } else {
      failedConditionsPanel.style.display = 'none';
    }

    // Build print Table Body
    printTableBody.innerHTML = '';
    Object.keys(checklistState).forEach(id => {
      const item = checklistState[id];
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight:600;">${item.name}</td>
        <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight:700; color: ${item.status === 'PASS' ? '#166534' : item.status === 'FAIL' ? '#991b1b' : '#475569'};">${item.status}</td>
        <td style="padding: 6px; border: 1px solid #cbd5e1; font-style:italic;">${item.note || 'Nominal.'}</td>
      `;
      printTableBody.appendChild(tr);
    });

    resultPanel.style.display = 'block';
    resultPanel.scrollIntoView({ behavior: 'smooth' });
  });

  // Copy Summary
  copyBtn.addEventListener('click', () => {
    if (!reportData) return;
    
    let failedDetailStr = '';
    if (reportData.failedCount > 0) {
      failedDetailStr = '\nCRITICAL HAZARDS DETECTED (STARTUP BLOCKED):\n';
      reportData.failedItemsList.forEach((item, index) => {
        failedDetailStr += `${index + 1}. ${item.name} — Note: ${item.note}\n`;
      });
    }

    const text = `LEVEL3SUPPORT BESS PRE-ENERGIZATION REPORT
--------------------------------------------------
Site: ${reportData.site}
Container / Block ID: ${reportData.block}
Verification Date: ${reportData.date}
Safety Integrity Score: ${reportData.completion}
--------------------------------------------------
Passed Safety Controls: ${reportData.passedCount} / 15
Failed Safety Controls: ${reportData.failedCount} / 15
N/A Safety Controls: ${reportData.naCount} / 15
--------------------------------------------------
ENERGIZATION VERDICT: ${reportData.verdict}
${failedDetailStr}--------------------------------------------------
SAFETY NOTICE: This checklist verifies prerequisite readiness but does NOT constitute authorization to energize. Verify local electrical utility clearance before switching breakers.`;

    navigator.clipboard.writeText(text).then(() => {
      const origText = copyBtn.innerHTML;
      copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      setTimeout(() => copyBtn.innerHTML = origText, 2000);
    });
  });

  // Print Summary
  printBtn.addEventListener('click', () => {
    window.print();
  });

  // Export JSON file
  exportBtn.addEventListener('click', () => {
    if (!reportData) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `bess_pre_energization_report_${reportData.block.replace(/\s+/g, '_')}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });

  function showError(msg) {
    validationError.textContent = msg;
    validationError.style.display = 'block';
  }
});
