/**
 * BESS Container & Rack Inspection — Checklist Logic
 * Level3Support
 */

document.addEventListener('DOMContentLoaded', () => {
  // Checklist Items configuration
  const checklistItems = [
    { id: 'ext-structure', name: 'Container exterior (panels, rust, locks, roof integrity)' },
    { id: 'door-seals', name: 'Door seals (gasket elasticity, compression, seal locks)' },
    { id: 'water-ingress', name: 'Water ingress verification (moisture checking, no standing liquid)' },
    { id: 'hvac-status', name: 'HVAC operational status (compressors, supply/return temp, fans)' },
    { id: 'fire-suppression', name: 'Fire suppression system active (cylinder pressure, release panel)' },
    { id: 'smoke-heat-detect', name: 'Smoke/heat detection system status (alarm contacts clear)' },
    { id: 'estop-condition', name: 'E-stop system condition (buttons physical state, no active trip)' },
    { id: 'rack-structure', name: 'Rack physical status (bolted tightness, mechanical squareness)' },
    { id: 'bms-alarms', name: 'BMS communication and alarm states (no active cell faults/warnings)' },
    { id: 'soc-balance', name: 'SOC balancing check (cell delta SOC < 3% threshold)' },
    { id: 'temp-spread', name: 'Cell/module temperature spread (thermal deviation within limits)' },
    { id: 'ground-bonding', name: 'Grounding and bonding verification (continuity resistance test < 0.1 ohm)' },
    { id: 'cable-glands', name: 'Cable glands and entries (proper tightening, IP integrity seals)' },
    { id: 'housekeeping', name: 'Housekeeping (clear walks, no debris, wire protection active)' },
    { id: 'labels-signage', name: 'Safety labels and cautionary signage (HV, arc flash, NFPA 704 placards)' }
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
  const inspectSite = document.getElementById('inspect-site');
  const inspectContainer = document.getElementById('inspect-container');
  const progressText = document.getElementById('inspect-progress-text');
  const progressFill = document.getElementById('inspect-progress-fill');
  const checklistContainer = document.getElementById('checklist-items-container');
  const inspectCalcBtn = document.getElementById('inspect-calc-btn');
  const inspectResetBtn = document.getElementById('inspect-reset-btn');
  
  const resultPanel = document.getElementById('result-panel');
  const inspectStatusBadge = document.getElementById('inspect-status-badge');
  const resMetaSite = document.getElementById('res-meta-site');
  const resMetaDate = document.getElementById('res-meta-date');
  const resCompletion = document.getElementById('res-inspect-completion');
  const resPassed = document.getElementById('res-inspect-passed');
  const resFailed = document.getElementById('res-inspect-failed');
  const resNa = document.getElementById('res-inspect-na');
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
        <input type="text" class="item-note-input" data-id="${item.id}" placeholder="Add observations or comments for this verification...">
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
        row.style.background = val === 'PASS' ? '#f0fdf4' : val === 'FAIL' ? '#fef2f2' : '#f8fafc';
        
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
  function seedSampleWalkdown() {
    inspectSite.value = 'Mojave Oasis Storage Facility';
    inspectContainer.value = 'Block 04 - Unit B (Sample)';
    
    // Seed checklist choices
    const selections = {
      'ext-structure': { status: 'PASS', note: 'No rust, weather seals tight.' },
      'door-seals': { status: 'PASS', note: 'Compression nominal.' },
      'water-ingress': { status: 'PASS', note: 'Sump pumps check, dry interior.' },
      'hvac-status': { status: 'PASS', note: 'Operating on Setpoint: 22C.' },
      'fire-suppression': { status: 'PASS', note: 'Cylinder pressure matches target curve.' },
      'smoke-heat-detect': { status: 'PASS', note: 'No active alarms.' },
      'estop-condition': { status: 'PASS', note: 'E-stop keys present.' },
      'rack-structure': { status: 'PASS', note: 'Torque validation tests verified.' },
      'bms-alarms': { status: 'PASS', note: 'No warning codes.' },
      'soc-balance': { status: 'PASS', note: 'Delta SOC: 0.8%.' },
      'temp-spread': { status: 'FAIL', note: 'Outlier module on Rack 3 (Module 8 delta temp is +4.2C over threshold).' },
      'ground-bonding': { status: 'PASS', note: 'Measurement: 0.04 ohms.' },
      'cable-glands': { status: 'PASS', note: 'Glands nominal.' },
      'housekeeping': { status: 'PASS', note: 'Clear walkways.' },
      'labels-signage': { status: 'PASS', note: 'High Voltage and NFPA labels updated.' }
    };

    Object.keys(selections).forEach(id => {
      const sel = selections[id];
      checklistState[id].status = sel.status;
      checklistState[id].note = sel.note;
      
      const row = document.getElementById(`row-${id}`);
      if (row) {
        row.style.background = sel.status === 'PASS' ? '#f0fdf4' : sel.status === 'FAIL' ? '#fef2f2' : '#f8fafc';
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
    const total = checklistItems.length;
    
    Object.keys(checklistState).forEach(id => {
      if (checklistState[id].status !== null) {
        checkedCount++;
      }
    });

    const pct = Math.round((checkedCount / total) * 100);
    progressText.textContent = `${pct}% (${checkedCount} / ${total} Checked)`;
    progressFill.style.width = `${pct}%`;
  }

  // Initialize Checklist
  buildChecklistUI();
  seedSampleWalkdown();

  // Reset Checklist Action
  inspectResetBtn.addEventListener('click', () => {
    inspectSite.value = '';
    inspectContainer.value = '';
    
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

  // Generate Inspection Report Action
  inspectCalcBtn.addEventListener('click', () => {
    validationError.style.display = 'none';
    
    const site = inspectSite.value.trim();
    const container = inspectContainer.value.trim();

    if (!site || !container) {
      showError('Please populate Site and Container identifiers.');
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
      showError(`Checklist is incomplete. Please resolve all ${unchecked} unchecked items before submission.`);
      return;
    }

    const completionPct = 100;
    const verdict = failed > 0 ? 'CRITICAL ALERT' : 'ACCEPTED';

    reportData = {
      site: site,
      container: container,
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
    resMetaSite.textContent = `${site} / ${container}`;
    resMetaDate.textContent = reportData.date;
    resCompletion.textContent = reportData.completion;
    resPassed.textContent = `${passed} / 15`;
    resFailed.textContent = `${failed} / 15`;
    resNa.textContent = `${na} / 15`;

    // Render status badge style
    inspectStatusBadge.textContent = verdict;
    if (verdict === 'ACCEPTED') {
      inspectStatusBadge.className = 'status-badge-inline status-normal';
    } else {
      inspectStatusBadge.className = 'status-badge-inline status-critical';
    }

    // Render failed findings panel
    if (failed > 0) {
      failedConditionsList.innerHTML = '';
      failedItems.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${item.name}</strong><br><span style="color:#ef4444; font-size:0.8rem;">Note: ${item.note}</span>`;
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
        <td style="padding: 6px; border: 1px solid #cbd5e1; font-style:italic;">${item.note || 'Nominal / Checked.'}</td>
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
      failedDetailStr = '\nCRITICAL FAILURES IDENTIFIED:\n';
      reportData.failedItemsList.forEach((item, index) => {
        failedDetailStr += `${index + 1}. ${item.name} — Note: ${item.note}\n`;
      });
    }

    const text = `LEVEL3SUPPORT BESS CONTAINER INSPECTION SUMMARY
--------------------------------------------------
Site: ${reportData.site}
Container / Block ID: ${reportData.container}
Inspection Date: ${reportData.date}
Completion Integrity: ${reportData.completion}
--------------------------------------------------
Passed Checkpoints: ${reportData.passedCount} / 15
Failed Checkpoints: ${reportData.failedCount} / 15
N/A Checkpoints: ${reportData.naCount} / 15
--------------------------------------------------
WALKDOWN STATUS: ${reportData.verdict}
${failedDetailStr}--------------------------------------------------
Disclaimer: Digital verification tool. Always cross-reference client standards.`;

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
    downloadAnchor.setAttribute("download", `bess_inspection_report_${reportData.container.replace(/\s+/g, '_')}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });

  function showError(msg) {
    validationError.textContent = msg;
    validationError.style.display = 'block';
  }
});
