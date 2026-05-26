/**
 * SCADA Tag QA/QC Checklist Logic
 * Level3Support
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const projectNameInput = document.getElementById('project-name');
  const systemTypeSelect = document.getElementById('system-type');
  const searchTagInput = document.getElementById('search-tag');
  const filterTypeSelect = document.getElementById('filter-type');
  const filterResultSelect = document.getElementById('filter-result');
  const tagTbody = document.getElementById('tag-tbody');
  
  const metricPass = document.getElementById('metric-pass');
  const metricFail = document.getElementById('metric-fail');
  const metricPending = document.getElementById('metric-pending');
  const metricPct = document.getElementById('metric-pct');
  
  const failedSummary = document.getElementById('failed-summary');
  const failedList = document.getElementById('failed-list');
  
  const addRowBtn = document.getElementById('add-row-btn');
  const resetBtn = document.getElementById('reset-btn');
  const copyBtn = document.getElementById('copy-btn');
  const exportBtn = document.getElementById('export-btn');
  const importCsvFile = document.getElementById('import-csv-file');

  let checklistRows = [];

  // Sample data to initialize the checklist
  const sampleTags = [
    {
      name: "ESS_CONTAINER1_SOC",
      type: "Analog",
      desc: "Battery container state of charge (Sample only)",
      scale: true,
      time: true,
      hist: true,
      hmi: true,
      ctrl: false,
      expected: "0 to 100",
      observed: "94.5",
      result: "Pass"
    },
    {
      name: "ESS_PCS_AMPS_PHASE_A",
      type: "Analog",
      desc: "Inverter phase A output current (Sample only)",
      scale: false,
      time: true,
      hist: false,
      hmi: true,
      ctrl: false,
      expected: "1200 A",
      observed: "1550 A",
      result: "Fail"
    },
    {
      name: "ESS_BMS_HEARTBEAT",
      type: "Digital status",
      desc: "BMS comms heartbeat register pulse (Sample only)",
      scale: true,
      time: true,
      hist: true,
      hmi: true,
      ctrl: false,
      expected: "Pulse",
      observed: "Static 0",
      result: "Fail"
    },
    {
      name: "ESS_MAIN_MTR_KW_EXP",
      type: "Analog",
      desc: "Utility point of connection active export power (Sample only)",
      scale: true,
      time: true,
      hist: true,
      hmi: true,
      ctrl: false,
      expected: "Grid export",
      observed: "2450 kW",
      result: "Pass"
    },
    {
      name: "ESS_PCS_START_CMD",
      type: "Command",
      desc: "Remote PCS starting command signal (Sample only)",
      scale: true,
      time: true,
      hist: true,
      hmi: true,
      ctrl: true,
      expected: "Pulse 1",
      observed: "None",
      result: "Pending"
    }
  ];

  // Initialize
  function init() {
    projectNameInput.value = localStorage.getItem('scada_qaqc_project') || 'Sample Project PV/BESS';
    systemTypeSelect.value = localStorage.getItem('scada_qaqc_system') || 'SCADA';
    
    const savedData = localStorage.getItem('scada_qaqc_checklist');
    if (savedData) {
      try {
        checklistRows = JSON.parse(savedData);
      } catch (e) {
        checklistRows = [...sampleTags];
      }
    } else {
      checklistRows = [...sampleTags];
    }
    
    renderChecklist();
    updateMetrics();
  }

  // Save State
  function saveState() {
    localStorage.setItem('scada_qaqc_project', projectNameInput.value);
    localStorage.setItem('scada_qaqc_system', systemTypeSelect.value);
    localStorage.setItem('scada_qaqc_checklist', JSON.stringify(checklistRows));
  }

  // Render Table
  function renderChecklist() {
    tagTbody.innerHTML = '';
    
    const searchTerm = searchTagInput.value.toLowerCase().trim();
    const filterType = filterTypeSelect.value;
    const filterResult = filterResultSelect.value;

    checklistRows.forEach((row, index) => {
      // Apply filters
      const matchesSearch = row.name.toLowerCase().includes(searchTerm) || 
                            row.desc.toLowerCase().includes(searchTerm);
      const matchesType = filterType === 'ALL' || row.type === filterType;
      const matchesResult = filterResult === 'ALL' || row.result === filterResult;

      if (!matchesSearch || !matchesType || !matchesResult) return;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input type="text" class="row-input tag-name-input" value="${escapeHtml(row.name)}" placeholder="TAG_NAME"></td>
        <td>
          <select class="row-type-select tag-type-select">
            <option value="Analog" ${row.type === 'Analog' ? 'selected' : ''}>Analog</option>
            <option value="Digital status" ${row.type === 'Digital status' ? 'selected' : ''}>Digital status</option>
            <option value="Command" ${row.type === 'Command' ? 'selected' : ''}>Command</option>
            <option value="Alarm" ${row.type === 'Alarm' ? 'selected' : ''}>Alarm</option>
            <option value="Setpoint" ${row.type === 'Setpoint' ? 'selected' : ''}>Setpoint</option>
          </select>
        </td>
        <td><input type="text" class="row-input tag-desc-input" value="${escapeHtml(row.desc)}" style="width:100%;" placeholder="Description"></td>
        <td class="checkbox-col"><input type="checkbox" class="tag-scale-check" ${row.scale ? 'checked' : ''}></td>
        <td class="checkbox-col"><input type="checkbox" class="tag-time-check" ${row.time ? 'checked' : ''}></td>
        <td class="checkbox-col"><input type="checkbox" class="tag-hist-check" ${row.hist ? 'checked' : ''}></td>
        <td class="checkbox-col"><input type="checkbox" class="tag-hmi-check" ${row.hmi ? 'checked' : ''}></td>
        <td class="checkbox-col"><input type="checkbox" class="tag-ctrl-check" ${row.ctrl ? 'checked' : ''}></td>
        <td><input type="text" class="row-input tag-exp-input" value="${escapeHtml(row.expected)}" placeholder="Expected"></td>
        <td><input type="text" class="row-input tag-obs-input" value="${escapeHtml(row.observed)}" placeholder="Observed"></td>
        <td>
          <select class="row-result-select tag-result-select" style="color: ${getResultColor(row.result)};">
            <option value="Pending" ${row.result === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Pass" ${row.result === 'Pass' ? 'selected' : ''}>Pass</option>
            <option value="Fail" ${row.result === 'Fail' ? 'selected' : ''}>Fail</option>
            <option value="N/A" ${row.result === 'N/A' ? 'selected' : ''}>N/A</option>
          </select>
        </td>
        <td style="text-align: center;">
          <button class="btn-delete" title="Delete tag row"><i class="fas fa-trash-alt"></i></button>
        </td>
      `;

      // Bind events to this row's inputs
      tr.querySelector('.tag-name-input').addEventListener('input', (e) => {
        row.name = e.target.value;
        saveState();
      });
      tr.querySelector('.tag-type-select').addEventListener('change', (e) => {
        row.type = e.target.value;
        saveState();
      });
      tr.querySelector('.tag-desc-input').addEventListener('input', (e) => {
        row.desc = e.target.value;
        saveState();
      });
      tr.querySelector('.tag-scale-check').addEventListener('change', (e) => {
        row.scale = e.target.checked;
        saveState();
      });
      tr.querySelector('.tag-time-check').addEventListener('change', (e) => {
        row.time = e.target.checked;
        saveState();
      });
      tr.querySelector('.tag-hist-check').addEventListener('change', (e) => {
        row.hist = e.target.checked;
        saveState();
      });
      tr.querySelector('.tag-hmi-check').addEventListener('change', (e) => {
        row.hmi = e.target.checked;
        saveState();
      });
      tr.querySelector('.tag-ctrl-check').addEventListener('change', (e) => {
        row.ctrl = e.target.checked;
        saveState();
      });
      tr.querySelector('.tag-exp-input').addEventListener('input', (e) => {
        row.expected = e.target.value;
        saveState();
      });
      tr.querySelector('.tag-obs-input').addEventListener('input', (e) => {
        row.observed = e.target.value;
        saveState();
      });
      
      const resultSelect = tr.querySelector('.tag-result-select');
      resultSelect.addEventListener('change', (e) => {
        row.result = e.target.value;
        resultSelect.style.color = getResultColor(row.result);
        saveState();
        updateMetrics();
      });

      tr.querySelector('.btn-delete').addEventListener('click', () => {
        checklistRows.splice(index, 1);
        saveState();
        renderChecklist();
        updateMetrics();
      });

      tagTbody.appendChild(tr);
    });
  }

  // Update Metrics Summary
  function updateMetrics() {
    let pass = 0;
    let fail = 0;
    let pending = 0;
    let na = 0;
    
    const failedTags = [];

    checklistRows.forEach(row => {
      if (row.result === 'Pass') pass++;
      else if (row.result === 'Fail') {
        fail++;
        failedTags.push(`${row.name} - ${row.desc}`);
      }
      else if (row.result === 'Pending') pending++;
      else if (row.result === 'N/A') na++;
    });

    const totalCount = checklistRows.length;
    const completedCount = pass + fail + na;
    const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    metricPass.textContent = pass;
    metricFail.textContent = fail;
    metricPending.textContent = pending;
    metricPct.textContent = `${completionPct}%`;

    // Render Failed List Summary
    if (failedTags.length > 0) {
      failedSummary.style.display = 'block';
      failedList.innerHTML = failedTags.map(tag => `<li>${escapeHtml(tag)}</li>`).join('');
    } else {
      failedSummary.style.display = 'none';
      failedList.innerHTML = '';
    }
  }

  // Get color for result status
  function getResultColor(res) {
    if (res === 'Pass') return 'var(--success-color)';
    if (res === 'Fail') return 'var(--error-color)';
    if (res === 'Pending') return 'var(--warning-color)';
    return 'var(--text-secondary)';
  }

  // Add row
  addRowBtn.addEventListener('click', () => {
    checklistRows.push({
      name: `NEW_SCADA_TAG_${checklistRows.length + 1}`,
      type: "Analog",
      desc: "Add tag details",
      scale: false,
      time: false,
      hist: false,
      hmi: false,
      ctrl: false,
      expected: "",
      observed: "",
      result: "Pending"
    });
    saveState();
    renderChecklist();
    updateMetrics();
  });

  // Filter triggers
  searchTagInput.addEventListener('input', renderChecklist);
  filterTypeSelect.addEventListener('change', renderChecklist);
  filterResultSelect.addEventListener('change', renderChecklist);
  projectNameInput.addEventListener('input', saveState);
  systemTypeSelect.addEventListener('change', saveState);

  // Reset Button
  resetBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the checklist to sample data?')) {
      checklistRows = [...sampleTags];
      projectNameInput.value = 'Sample Project PV/BESS';
      systemTypeSelect.value = 'SCADA';
      saveState();
      renderChecklist();
      updateMetrics();
    }
  });

  // Copy Summary
  copyBtn.addEventListener('click', () => {
    let pass = 0, fail = 0, pending = 0, na = 0;
    checklistRows.forEach(row => {
      if (row.result === 'Pass') pass++;
      else if (row.result === 'Fail') fail++;
      else if (row.result === 'Pending') pending++;
      else if (row.result === 'N/A') na++;
    });

    const completion = checklistRows.length > 0 ? Math.round(((pass + fail + na) / checklistRows.length) * 100) : 0;

    let summaryText = `SCADA QA/QC Commissioning Handover Report
---------------------------------------------
Site/Project: ${projectNameInput.value}
System Component: ${systemTypeSelect.value}
Checklist Total Tags: ${checklistRows.length}
Completed verification: ${completion}%
- PASS: ${pass}
- FAIL: ${fail}
- PENDING: ${pending}
- N/A: ${na}
---------------------------------------------
Critical Failed tags:
`;

    checklistRows.forEach(row => {
      if (row.result === 'Fail') {
        summaryText += `  * [FAIL] ${row.name} - Expected: ${row.expected}, Observed: ${row.observed}\n`;
      }
    });

    summaryText += `\nVerification conducted under project guidelines. Final SCADA systems checklist complete.`;

    navigator.clipboard.writeText(summaryText).then(() => {
      const origText = copyBtn.innerHTML;
      copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      setTimeout(() => copyBtn.innerHTML = origText, 2000);
    });
  });

  // Export CSV
  exportBtn.addEventListener('click', () => {
    let csvContent = "data:text/csv;charset=utf-8,Tag Name,Type,Description,Scale Verified,Time Verified,Hist Verified,HMI Verified,Ctrl Verified,Expected,Observed,Result\n";
    
    checklistRows.forEach(row => {
      const line = [
        `"${row.name.replace(/"/g, '""')}"`,
        `"${row.type}"`,
        `"${row.desc.replace(/"/g, '""')}"`,
        row.scale ? "TRUE" : "FALSE",
        row.time ? "TRUE" : "FALSE",
        row.hist ? "TRUE" : "FALSE",
        row.hmi ? "TRUE" : "FALSE",
        row.ctrl ? "TRUE" : "FALSE",
        `"${row.expected.replace(/"/g, '""')}"`,
        `"${row.observed.replace(/"/g, '""')}"`,
        `"${row.result}"`
      ].join(",");
      csvContent += line + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", encodedUri);
    downloadAnchor.setAttribute("download", `scada_tag_qaqc_${projectNameInput.value.replace(/\s+/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });

  // Import CSV
  importCsvFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
      const text = evt.target.result;
      const lines = text.split('\n');
      const newRows = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simplified CSV parser (assumes commas split fields)
        const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (parts.length >= 11) {
          newRows.push({
            name: cleanCsvVal(parts[0]),
            type: cleanCsvVal(parts[1]),
            desc: cleanCsvVal(parts[2]),
            scale: parts[3] === 'TRUE',
            time: parts[4] === 'TRUE',
            hist: parts[5] === 'TRUE',
            hmi: parts[6] === 'TRUE',
            ctrl: parts[7] === 'TRUE',
            expected: cleanCsvVal(parts[8]),
            observed: cleanCsvVal(parts[9]),
            result: cleanCsvVal(parts[10])
          });
        }
      }

      if (newRows.length > 0) {
        checklistRows = newRows;
        saveState();
        renderChecklist();
        updateMetrics();
        alert(`Successfully imported ${newRows.length} SCADA tags!`);
      } else {
        alert('Invalid CSV format. Please make sure the header row matches standard schema.');
      }
    };
    reader.readAsText(file);
  });

  function cleanCsvVal(val) {
    if (!val) return "";
    let clean = val.trim();
    if (clean.startsWith('"') && clean.endsWith('"')) {
      clean = clean.substring(1, clean.length - 1);
    }
    return clean.replace(/""/g, '"');
  }

  function escapeHtml(text) {
    if (!text) return "";
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Start checklist
  init();
});
