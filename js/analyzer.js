// analyzer.js — updated with axis toggle and fault overlay
const chartRef = document.getElementById('chart-canvas');
const chartContainer = document.getElementById('chart-container');
const paramContainer = document.getElementById('param-container');
const exportBtn = document.getElementById('export-chart');
const hisInput = document.getElementById('his-upload');
const eventsInput = document.getElementById('events-upload');
const eventSummary = document.getElementById('event-summary');
const stateFilter = document.getElementById('state-select');

let hisData = [];
let eventsData = [];
let selectedParams = [];
let axisAssignments = {}; // 'paramName' -> 'left' or 'right'
let chartInstance = null;
let selectedState = "";
let hisFileDate = null;

hisInput.addEventListener('change', (e) => handleFileUpload(e.target.files[0], 'his'));
eventsInput.addEventListener('change', (e) => handleFileUpload(e.target.files[0], 'events'));

function handleFileUpload(file, type) {
  if (!file) return;

  if (type === 'his') {
    const nameMatch = file.name.match(/(\d{4})(\d{2})(\d{2})/);
    if (nameMatch) {
      hisFileDate = `${nameMatch[1]}-${nameMatch[2]}-${nameMatch[3]}`;
    }
  }

  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: (results) => {
      if (type === 'his') {
        hisData = results.data;
        selectedParams = ['Output power of Turnkey Station', 'DC power of Turnkey Station'];
        axisAssignments = {
          'Output power of Turnkey Station': 'left',
          'DC power of Turnkey Station': 'right'
        };
        renderParams();
        populateStateFilter();
        renderChart();
      } else {
        eventsData = results.data;
        renderEventSummary();
        renderChart();
      }
    },
    error: (err) => alert(`Failed to parse ${type} file: ${err.message}`)
  });
}

function filterHisData() {
  return selectedState
    ? hisData.filter(row => row["Working state of unit 1"] === selectedState)
    : hisData;
}

function resetChart() {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
}

function renderChart() {
  const ctx = chartRef.getContext('2d');
  if (!hisData.length || !selectedParams.length) return;
  resetChart();

  const filteredData = filterHisData();
  const labels = filteredData.map(row => row.Time);

  const datasets = selectedParams.map((param, index) => ({
    label: param,
    data: filteredData.map(row => row[param]),
    borderColor: ['#2196F3', '#F44336', '#4CAF50', '#FF9800', '#9C27B0', '#795548', '#607D8B'][index % 7],
    yAxisID: axisAssignments[param] || 'left',
    fill: false,
    tension: 0.1
  }));

  // Add Fault markers (matching date)
  if (eventsData.length && hisFileDate) {
    const matchingFaults = eventsData.filter(ev => {
      return ev["Event Level"] === "Fault" && ev["Generation time"]?.startsWith(hisFileDate);
    });

    matchingFaults.forEach((fault, idx) => {
      datasets.push({
        label: `Fault ${idx + 1}`,
        data: filteredData.map(row => row.Time === fault["Generation time"] ? null : null),
        pointStyle: 'crossRot',
        pointRadius: 6,
        pointBackgroundColor: 'red',
        borderColor: 'rgba(0,0,0,0)',
        showLine: false,
        data: filteredData.map(row => row.Time === fault["Generation time"] ? 0 : null),
        yAxisID: 'left'
      });
    });
  }

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        left: {
          type: 'linear',
          position: 'left',
          title: { display: true, text: 'Y (Left)' }
        },
        right: {
          type: 'linear',
          position: 'right',
          grid: { drawOnChartArea: false },
          title: { display: true, text: 'Y (Right)' }
        },
        x: {
          title: { display: true, text: 'Time' }
        }
      }
    }
  });
}

function renderParams() {
  if (!hisData.length) return;
  const allKeys = Object.keys(hisData[0]).filter(k => typeof hisData[0][k] === 'number');
  const general = allKeys.filter(k => !k.includes('unit 1') && !k.includes('unit 2'));
  const unit1 = allKeys.filter(k => k.toLowerCase().includes('unit 1'));
  const unit2 = allKeys.filter(k => k.toLowerCase().includes('unit 2'));

  const renderColumn = (list, title) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'param-group';
    wrapper.innerHTML = `<div class="section-title">${title}</div>`;
    const inner = document.createElement('div');
    inner.className = 'param-list';
    list.forEach(param => {
      const row = document.createElement('label');
      row.className = 'param-checkbox';
      row.innerHTML = `
        <input type="checkbox" ${selectedParams.includes(param) ? 'checked' : ''} />
        <span>${param}</span>
        <select>
          <option value="left" ${axisAssignments[param] === 'left' ? 'selected' : ''}>L</option>
          <option value="right" ${axisAssignments[param] === 'right' ? 'selected' : ''}>R</option>
        </select>
      `;
      row.querySelector('input').addEventListener('change', (e) => {
        if (e.target.checked) {
          if (selectedParams.length < 6) {
            selectedParams.push(param);
          } else {
            e.target.checked = false;
            alert("Max 6 parameters allowed");
          }
        } else {
          selectedParams = selectedParams.filter(p => p !== param);
        }
        renderChart();
      });
      row.querySelector('select').addEventListener('change', (e) => {
        axisAssignments[param] = e.target.value;
        renderChart();
      });
      inner.appendChild(row);
    });
    wrapper.appendChild(inner);
    return wrapper;
  };

  paramContainer.innerHTML = '';
  paramContainer.appendChild(renderColumn(general, 'General'));
  paramContainer.appendChild(renderColumn(unit1, 'Unit 1'));
  paramContainer.appendChild(renderColumn(unit2, 'Unit 2'));
}

function populateStateFilter() {
  const states = Array.from(new Set(hisData.map(row => row["Working state of unit 1"])));
  stateFilter.innerHTML = '<option value="">All States</option>' +
    states.map(s => `<option value="${s}">${s}</option>`).join('');
  stateFilter.addEventListener('change', (e) => {
    selectedState = e.target.value;
    renderChart();
  });
}

function renderEventSummary() {
  if (!eventsData.length) return;
  const faultCount = eventsData.filter(e => e["Event Level"] === "Fault").length;
  const alarmCount = eventsData.filter(e => e["Event Level"] === "Alarm").length;
  const promptCount = eventsData.filter(e => e["Event Level"] === "Prompt").length;

  eventSummary.innerHTML = `
    <div class="summary-box">
      <div><strong>Faults:</strong> ${faultCount}</div>
      <div><strong>Alarms:</strong> ${alarmCount}</div>
      <div><strong>Prompts:</strong> ${promptCount}</div>
    </div>
  `;
}
