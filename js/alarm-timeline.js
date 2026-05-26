/**
 * Alarm / Fault Event Timeline Builder Logic
 * Level3Support
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const timelineTbody = document.getElementById('timeline-tbody');
  const pasteBox = document.getElementById('paste-box');
  const importPasteBtn = document.getElementById('import-paste-btn');
  const addRowBtn = document.getElementById('add-row-btn');
  const sortAscBtn = document.getElementById('sort-asc-btn');
  const sortDescBtn = document.getElementById('sort-desc-btn');
  
  const metricFirst = document.getElementById('metric-first');
  const metricLast = document.getElementById('metric-last');
  const metricDuration = document.getElementById('metric-duration');
  const metricRepeated = document.getElementById('metric-repeated');
  const rcaSummaryText = document.getElementById('rca-summary-text');
  
  const resetBtn = document.getElementById('reset-btn');
  const copyBtn = document.getElementById('copy-btn');
  const exportBtn = document.getElementById('export-btn');
  const exportJsonBtn = document.getElementById('export-json-btn');

  let timelineEvents = [];

  // Sample data to initialize the timeline
  const sampleEvents = [
    {
      timestamp: "2026-05-25 14:02:11.020",
      tz: "MST",
      device: "BESS_CONTAINER_A1",
      code: "F103",
      desc: "HVAC cooling loop high pressure fault (Sample only)",
      severity: "High",
      status: "Active",
      notes: "Possible mechanical fan failure"
    },
    {
      timestamp: "2026-05-25 14:02:11.120",
      tz: "MST",
      device: "BESS_CONTAINER_A1",
      code: "F103",
      desc: "HVAC cooling loop high pressure fault (Sample only)",
      severity: "High",
      status: "Cleared",
      notes: "Auto-cleared retry"
    },
    {
      timestamp: "2026-05-25 14:02:12.450",
      tz: "MST",
      device: "BESS_PCS_INVERTER1",
      code: "E504",
      desc: "DC Overvoltage lockout shutdown (Sample only)",
      severity: "Critical",
      status: "Active",
      notes: "Main breaker tripped"
    },
    {
      timestamp: "2026-05-25 14:02:13.100",
      tz: "MST",
      device: "SCADA_GATEWAY_PLC",
      code: "W401",
      desc: "Comms link fail with Inverter 1 (Sample only)",
      severity: "Medium",
      status: "Active",
      notes: "Loss of telemetry"
    },
    {
      timestamp: "2026-05-25 14:02:13.110",
      tz: "MST",
      device: "SCADA_GATEWAY_PLC",
      code: "W401",
      desc: "Comms link fail with Inverter 1 (Sample only)",
      severity: "Medium",
      status: "Active",
      notes: "Repeated ping timeout"
    }
  ];

  // Initialize
  function init() {
    const savedData = localStorage.getItem('scada_timeline_events');
    if (savedData) {
      try {
        timelineEvents = JSON.parse(savedData);
      } catch (e) {
        timelineEvents = [...sampleEvents];
      }
    } else {
      timelineEvents = [...sampleEvents];
    }
    
    sortChronologically(true); // Default sort ascending
    renderTimeline();
  }

  // Save State
  function saveState() {
    localStorage.setItem('scada_timeline_events', JSON.stringify(timelineEvents));
  }

  // Sort function
  function sortChronologically(ascending = true) {
    timelineEvents.sort((a, b) => {
      const da = new Date(a.timestamp.replace(/-/g, '/'));
      const db = new Date(b.timestamp.replace(/-/g, '/'));
      return ascending ? da - db : db - da;
    });
  }

  // Render Table
  function renderTimeline() {
    timelineTbody.innerHTML = '';

    // Calculate time deltas
    // Deltas are always calculated relative to the *previous chronological event*
    // So we sort ascending to get standard deltas
    const sortedTemp = [...timelineEvents].sort((a, b) => {
      return new Date(a.timestamp.replace(/-/g, '/')) - new Date(b.timestamp.replace(/-/g, '/'));
    });

    const deltaMap = new Map();
    for (let i = 0; i < sortedTemp.length; i++) {
      if (i === 0) {
        deltaMap.set(sortedTemp[i], 'First');
      } else {
        const current = new Date(sortedTemp[i].timestamp.replace(/-/g, '/'));
        const prev = new Date(sortedTemp[i-1].timestamp.replace(/-/g, '/'));
        const diffMs = current - prev;
        
        if (isNaN(diffMs)) {
          deltaMap.set(sortedTemp[i], 'Error');
        } else if (diffMs < 1000) {
          deltaMap.set(sortedTemp[i], `+${diffMs}ms`);
        } else {
          deltaMap.set(sortedTemp[i], `+${(diffMs / 1000).toFixed(2)}s`);
        }
      }
    }

    // Render in the actual array order
    timelineEvents.forEach((evt, index) => {
      const deltaText = deltaMap.get(evt) || '--';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input type="text" class="row-input evt-time" value="${escapeHtml(evt.timestamp)}" placeholder="YYYY-MM-DD HH:MM:SS.mmm"></td>
        <td><input type="text" class="row-input evt-tz" value="${escapeHtml(evt.tz)}" style="width:100%;" placeholder="TZ"></td>
        <td><input type="text" class="row-input evt-device" value="${escapeHtml(evt.device)}" style="width:100%;" placeholder="Device"></td>
        <td><input type="text" class="row-input evt-code" value="${escapeHtml(evt.code)}" style="width:100%; font-family:monospace;" placeholder="Code"></td>
        <td><input type="text" class="row-input evt-desc" value="${escapeHtml(evt.desc)}" style="width:100%;" placeholder="Event Description"></td>
        <td>
          <select class="row-select evt-severity" style="font-weight:600;">
            <option value="Critical" ${evt.severity === 'Critical' ? 'selected' : ''}>Critical</option>
            <option value="High" ${evt.severity === 'High' ? 'selected' : ''}>High</option>
            <option value="Medium" ${evt.severity === 'Medium' ? 'selected' : ''}>Medium</option>
            <option value="Low" ${evt.severity === 'Low' ? 'selected' : ''}>Low</option>
            <option value="Info" ${evt.severity === 'Info' ? 'selected' : ''}>Info</option>
          </select>
        </td>
        <td>
          <select class="row-select evt-status">
            <option value="Active" ${evt.status === 'Active' ? 'selected' : ''}>Active</option>
            <option value="Cleared" ${evt.status === 'Cleared' ? 'selected' : ''}>Cleared</option>
            <option value="Info" ${evt.status === 'Info' ? 'selected' : ''}>Info</option>
          </select>
        </td>
        <td><span class="delta-badge">${deltaText}</span></td>
        <td style="text-align: center;">
          <button class="btn-delete" title="Delete event"><i class="fas fa-trash-alt"></i></button>
        </td>
      `;

      // Apply severity badge color to select element dynamically
      const sevSelect = tr.querySelector('.evt-severity');
      applySeverityColor(sevSelect);

      // Bind input handlers
      tr.querySelector('.evt-time').addEventListener('input', (e) => {
        evt.timestamp = e.target.value;
        saveState();
        updateAnalysisDelayed();
      });
      tr.querySelector('.evt-tz').addEventListener('input', (e) => {
        evt.tz = e.target.value;
        saveState();
      });
      tr.querySelector('.evt-device').addEventListener('input', (e) => {
        evt.device = e.target.value;
        saveState();
        updateAnalysisDelayed();
      });
      tr.querySelector('.evt-code').addEventListener('input', (e) => {
        evt.code = e.target.value;
        saveState();
        updateAnalysisDelayed();
      });
      tr.querySelector('.evt-desc').addEventListener('input', (e) => {
        evt.desc = e.target.value;
        saveState();
      });
      
      sevSelect.addEventListener('change', (e) => {
        evt.severity = e.target.value;
        applySeverityColor(sevSelect);
        saveState();
        updateAnalysisDelayed();
      });
      
      tr.querySelector('.evt-status').addEventListener('change', (e) => {
        evt.status = e.target.value;
        saveState();
      });

      tr.querySelector('.btn-delete').addEventListener('click', () => {
        timelineEvents.splice(index, 1);
        saveState();
        renderTimeline();
        updateMetricsAndRCA();
      });

      timelineTbody.appendChild(tr);
    });

    updateMetricsAndRCA();
  }

  function applySeverityColor(select) {
    const val = select.value;
    select.className = "row-select evt-severity";
    if (val === 'Critical') select.style.color = '#b91c1c';
    else if (val === 'High') select.style.color = '#c2410c';
    else if (val === 'Medium') select.style.color = '#b45309';
    else if (val === 'Low') select.style.color = '#166534';
    else select.style.color = '#0369a1';
  }

  // Defer analysis to prevent typing lag
  let analysisTimeout;
  function updateAnalysisDelayed() {
    clearTimeout(analysisTimeout);
    analysisTimeout = setTimeout(updateMetricsAndRCA, 500);
  }

  // Compute stats and write narrative
  function updateMetricsAndRCA() {
    if (timelineEvents.length === 0) {
      metricFirst.textContent = '--';
      metricLast.textContent = '--';
      metricDuration.textContent = '--';
      metricRepeated.textContent = '0';
      rcaSummaryText.textContent = "Add at least two fault event logs to generate a root cause analysis narrative.";
      return;
    }

    // Sort ascending for time measurements
    const sorted = [...timelineEvents].sort((a, b) => {
      return new Date(a.timestamp.replace(/-/g, '/')) - new Date(b.timestamp.replace(/-/g, '/'));
    });

    const firstTime = sorted[0].timestamp;
    const lastTime = sorted[sorted.length - 1].timestamp;

    metricFirst.textContent = firstTime.split(' ')[1] || firstTime;
    metricLast.textContent = lastTime.split(' ')[1] || lastTime;

    // Outage Duration
    const dateFirst = new Date(sorted[0].timestamp.replace(/-/g, '/'));
    const dateLast = new Date(sorted[sorted.length - 1].timestamp.replace(/-/g, '/'));
    const durationMs = dateLast - dateFirst;
    
    if (isNaN(durationMs)) {
      metricDuration.textContent = 'Error';
    } else {
      const durSec = durationMs / 1000;
      if (durSec < 60) {
        metricDuration.textContent = `${durSec.toFixed(2)} sec`;
      } else {
        metricDuration.textContent = `${Math.floor(durSec / 60)}m ${(durSec % 60).toFixed(1)}s`;
      }
    }

    // Repeated Codes detection (Chatter)
    const codeCounts = {};
    let repeatedCodesCount = 0;
    
    timelineEvents.forEach(evt => {
      if (evt.code) {
        codeCounts[evt.code] = (codeCounts[evt.code] || 0) + 1;
      }
    });

    Object.values(codeCounts).forEach(cnt => {
      if (cnt > 1) repeatedCodesCount += (cnt - 1);
    });
    
    metricRepeated.textContent = repeatedCodesCount;

    // Generate RCA Narrative Paragraph
    if (timelineEvents.length >= 2) {
      const earliest = sorted[0];
      const second = sorted[1];
      const criticalEvents = sorted.filter(e => e.severity === 'Critical' || e.severity === 'High');
      
      let deltaText = "";
      const deltaMs = new Date(second.timestamp.replace(/-/g, '/')) - new Date(earliest.timestamp.replace(/-/g, '/'));
      if (!isNaN(deltaMs)) {
        deltaText = deltaMs < 1000 ? `within ${deltaMs}ms` : `after ${(deltaMs / 1000).toFixed(2)} seconds`;
      } else {
        deltaText = "immediately following";
      }

      let narrative = `The event sequence initiated at ${earliest.timestamp} (${earliest.tz || 'Local'}) on ${earliest.device} with a severity level of ${earliest.severity} when Event Code ${earliest.code} (${earliest.desc}) was triggered. ${deltaText}, a cascading event was registered on ${second.device} logging Code ${second.code} (${second.desc}). `;
      
      if (criticalEvents.length > 0) {
        narrative += `During this cascade, ${criticalEvents.length} alarms were classified as High/Critical, requiring immediate manual inspection. `;
      }
      
      if (repeatedCodesCount > 0) {
        narrative += `Notably, telemetry chattering was detected on repeated codes (such as ${Object.keys(codeCounts).filter(k => codeCounts[k] > 1).join(', ')}), suggesting active relay bouncing or device signal oscillation. `;
      }

      narrative += `Total fault correlation spans a duration of ${metricDuration.textContent}. Engineering review is recommended to synchronize telemetry clocks and review SCADA signal logs.`;

      rcaSummaryText.textContent = narrative;
    } else {
      rcaSummaryText.textContent = "Add at least two fault event logs to generate a root cause analysis narrative.";
    }
  }

  // Parse bulk paste CSV
  importPasteBtn.addEventListener('click', () => {
    const rawText = pasteBox.value.trim();
    if (!rawText) {
      alert('Please paste some log text first.');
      return;
    }

    const lines = rawText.split('\n');
    let importedCount = 0;
    
    lines.forEach(line => {
      const cleanLine = line.trim();
      if (!cleanLine) return;

      // Split by comma or tab
      const parts = cleanLine.split(/,|\t/);
      if (parts.length >= 2) {
        const timestamp = parts[0].trim();
        const device = parts[1].trim();
        const code = parts[2] ? parts[2].trim() : "W100";
        const desc = parts[3] ? parts[3].trim() : "Raw pasted event";
        const severity = parts[4] ? capitalize(parts[4].trim()) : "Medium";
        const status = parts[5] ? capitalize(parts[5].trim()) : "Active";

        timelineEvents.push({
          timestamp: timestamp,
          tz: "UTC",
          device: device,
          code: code,
          desc: desc,
          severity: ['Critical', 'High', 'Medium', 'Low', 'Info'].includes(severity) ? severity : 'Medium',
          status: ['Active', 'Cleared', 'Info'].includes(status) ? status : 'Active',
          notes: "Pasted raw log"
        });
        importedCount++;
      }
    });

    if (importedCount > 0) {
      sortChronologically(true);
      saveState();
      renderTimeline();
      pasteBox.value = '';
      alert(`Successfully parsed and imported ${importedCount} event logs!`);
    } else {
      alert('Failed to parse text. Please ensure columns are comma-separated or tab-separated.');
    }
  });

  function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // Add empty row
  addRowBtn.addEventListener('click', () => {
    const now = new Date();
    const formattedNow = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}.000`;
    
    timelineEvents.push({
      timestamp: formattedNow,
      tz: "MST",
      device: `DEVICE_${timelineEvents.length + 1}`,
      code: "F100",
      desc: "New manual event entry",
      severity: "Medium",
      status: "Active",
      notes: ""
    });
    
    saveState();
    renderTimeline();
  });

  // Sort buttons
  sortAscBtn.addEventListener('click', () => {
    sortChronologically(true);
    saveState();
    renderTimeline();
  });

  sortDescBtn.addEventListener('click', () => {
    sortChronologically(false);
    saveState();
    renderTimeline();
  });

  // Reset Builder
  resetBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the timeline builder to sample data?')) {
      timelineEvents = [...sampleEvents];
      saveState();
      sortChronologically(true);
      renderTimeline();
    }
  });

  // Copy RCA report
  copyBtn.addEventListener('click', () => {
    if (timelineEvents.length === 0) return;
    
    let report = `Level3Support Chronological RCA Timeline Report
---------------------------------------------
Duration: ${metricDuration.textContent}
First Time: ${metricFirst.textContent}
Last Time: ${metricLast.textContent}
Repeated Count: ${metricRepeated.textContent}

Summary Narrative:
${rcaSummaryText.textContent}

Timeline Event Sequence:
`;

    const sortedTemp = [...timelineEvents].sort((a, b) => {
      return new Date(a.timestamp.replace(/-/g, '/')) - new Date(b.timestamp.replace(/-/g, '/'));
    });

    sortedTemp.forEach((evt, idx) => {
      report += `[${evt.timestamp} ${evt.tz}] [${evt.severity.toUpperCase()}] Device: ${evt.device} | Code: ${evt.code} | ${evt.desc} (${evt.status})\n`;
    });

    report += `---------------------------------------------\nReport compiled automatically for field review.`;

    navigator.clipboard.writeText(report).then(() => {
      const origText = copyBtn.innerHTML;
      copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      setTimeout(() => copyBtn.innerHTML = origText, 2000);
    });
  });

  // Export JSON
  exportJsonBtn.addEventListener('click', () => {
    if (timelineEvents.length === 0) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(timelineEvents, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `fault_timeline_rca_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });

  // Export CSV
  exportBtn.addEventListener('click', () => {
    if (timelineEvents.length === 0) return;
    let csvContent = "data:text/csv;charset=utf-8,Timestamp,Timezone,Device,Code,Description,Severity,Status,Notes\n";

    timelineEvents.forEach(row => {
      const line = [
        `"${row.timestamp}"`,
        `"${row.tz}"`,
        `"${row.device.replace(/"/g, '""')}"`,
        `"${row.code}"`,
        `"${row.desc.replace(/"/g, '""')}"`,
        `"${row.severity}"`,
        `"${row.status}"`,
        `"${row.notes.replace(/"/g, '""')}"`
      ].join(",");
      csvContent += line + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", encodedUri);
    downloadAnchor.setAttribute("download", `fault_timeline_rca_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });

  function escapeHtml(text) {
    if (!text) return "";
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Run
  init();
});
