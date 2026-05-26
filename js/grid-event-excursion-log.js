/**
 * Grid Event Voltage/Frequency Excursion Log JS
 * Level3Support
 */

document.addEventListener('DOMContentLoaded', () => {
  const siteNameInput = document.getElementById('site-name');
  const eventTimeInput = document.getElementById('event-time');
  const poiVoltageInput = document.getElementById('poi-voltage');
  const nominalVoltageInput = document.getElementById('nominal-voltage');
  const measuredFreqInput = document.getElementById('measured-freq');
  const nominalFreqInput = document.getElementById('nominal-freq');
  const durationInput = document.getElementById('duration');
  const tripOccurredSelect = document.getElementById('trip-occurred');
  const responseInput = document.getElementById('equipment-response');
  const notesInput = document.getElementById('notes');

  const addBtn = document.getElementById('add-btn');
  const copySummaryBtn = document.getElementById('copy-summary-btn');
  const exportJsonBtn = document.getElementById('export-json-btn');
  const eventTbody = document.getElementById('event-tbody');
  const validationError = document.getElementById('validation-error');

  let loggedEvents = [];

  // Set default timestamp
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  eventTimeInput.value = now.toISOString().slice(0, 16);

  function loadEvents() {
    const saved = localStorage.getItem('l3s_grid_events');
    if (saved) {
      loggedEvents = JSON.parse(saved);
    } else {
      // Sample data
      loggedEvents = [
        {
          timestamp: "2026-05-26T14:30",
          voltage: 37.8,
          nominalVoltage: 34.5,
          voltageDeviation: 9.57,
          frequency: 60.18,
          nominalFreq: 60.00,
          freqDeviation: 0.18,
          duration: 350,
          tripOccurred: "No",
          response: "Inverters successfully entered FRT (fault ride-through) mode. Standard power tracking resumed within 1.2s.",
          notes: "Observed transient voltage swell on high-voltage substation side."
        },
        {
          timestamp: "2026-05-26T15:15",
          voltage: 31.2,
          nominalVoltage: 34.5,
          voltageDeviation: -9.57,
          frequency: 59.82,
          nominalFreq: 60.00,
          freqDeviation: -0.18,
          duration: 850,
          tripOccurred: "Yes",
          response: "Under-voltage protection tripped 12 out of 24 field inverters. Manual reconnection required.",
          notes: "System fault occurred on transmission grid side feeder line."
        }
      ];
      saveEvents();
    }
    renderTable();
  }

  function saveEvents() {
    localStorage.setItem('l3s_grid_events', JSON.stringify(loggedEvents));
  }

  addBtn.addEventListener('click', () => {
    validationError.style.display = 'none';

    const timestamp = eventTimeInput.value;
    const voltage = parseFloat(poiVoltageInput.value);
    const nominalVoltage = parseFloat(nominalVoltageInput.value);
    const frequency = parseFloat(measuredFreqInput.value);
    const nominalFreq = parseFloat(nominalFreqInput.value);
    const duration = parseFloat(durationInput.value || 0);
    const tripOccurred = tripOccurredSelect.value;
    const response = responseInput.value.trim();
    const notes = notesInput.value.trim();

    if (!timestamp) {
      showError('Please select an Event Timestamp.');
      return;
    }
    if (isNaN(voltage) || voltage <= 0 || isNaN(nominalVoltage) || nominalVoltage <= 0) {
      showError('Please enter positive voltage values.');
      return;
    }
    if (isNaN(frequency) || frequency <= 0 || isNaN(nominalFreq) || nominalFreq <= 0) {
      showError('Please enter positive frequency values.');
      return;
    }

    // Formulas
    const voltageDeviation = ((voltage - nominalVoltage) / nominalVoltage) * 100;
    const freqDeviation = frequency - nominalFreq;

    const newEvent = {
      timestamp,
      voltage,
      nominalVoltage,
      voltageDeviation,
      frequency,
      nominalFreq,
      freqDeviation,
      duration,
      tripOccurred,
      response,
      notes
    };

    loggedEvents.push(newEvent);
    saveEvents();
    renderTable();

    // Reset inputs
    poiVoltageInput.value = "";
    measuredFreqInput.value = "";
    durationInput.value = "";
    responseInput.value = "";
    notesInput.value = "";
  });

  function renderTable() {
    eventTbody.innerHTML = '';

    if (loggedEvents.length === 0) {
      eventTbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-light);">No events logged yet.</td></tr>';
      return;
    }

    loggedEvents.forEach((ev, idx) => {
      const tr = document.createElement('tr');
      if (ev.tripOccurred === 'Yes') {
        tr.className = 'trip-alert';
      }

      tr.innerHTML = `
        <td>${ev.timestamp.replace('T', ' ')}</td>
        <td style="font-weight: 600; color: ${ev.voltageDeviation >= 5 ? 'var(--error-color)' : 'inherit'};">${ev.voltageDeviation.toFixed(2)}%</td>
        <td style="font-weight: 600;">${ev.freqDeviation >= 0 ? '+' : ''}${ev.freqDeviation.toFixed(3)} Hz</td>
        <td>${ev.duration > 0 ? ev.duration + ' ms' : 'N/A'}</td>
        <td><span class="status-badge-inline ${ev.tripOccurred === 'Yes' ? 'status-critical' : 'status-normal'}">${ev.tripOccurred}</span></td>
        <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${ev.response}">${ev.response}</td>
        <td>
          <button onclick="deleteGridEvent(${idx})" class="btn-danger" style="margin-top: 0; min-height: auto; width: 28px; height: 28px; padding: 0;"><i class="fas fa-trash" style="font-size: 0.8rem;"></i></button>
        </td>
      `;

      eventTbody.appendChild(tr);
    });
  }

  window.deleteGridEvent = (idx) => {
    if (confirm("Are you sure you want to delete this event?")) {
      loggedEvents.splice(idx, 1);
      saveEvents();
      renderTable();
    }
  };

  copySummaryBtn.addEventListener('click', () => {
    if (loggedEvents.length === 0) return;
    let text = `Level3Support Grid Event Excursion Log Timeline Summary\r\n`;
    text += `====================================================================\r\n`;

    loggedEvents.forEach(ev => {
      text += `[${ev.timestamp.replace('T', ' ')}] Voltage Dev: ${ev.voltageDeviation.toFixed(2)}%, Freq Dev: ${ev.freqDeviation.toFixed(3)} Hz, Duration: ${ev.duration} ms. Trip: ${ev.tripOccurred}. Response: ${ev.response}\r\n`;
    });

    navigator.clipboard.writeText(text).then(() => {
      const origText = copySummaryBtn.innerHTML;
      copySummaryBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      setTimeout(() => copySummaryBtn.innerHTML = origText, 2000);
    });
  });

  exportJsonBtn.addEventListener('click', () => {
    if (loggedEvents.length === 0) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(loggedEvents, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `grid_event_log_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });

  function showError(msg) {
    validationError.textContent = msg;
    validationError.style.display = 'block';
  }

  loadEvents();
});
