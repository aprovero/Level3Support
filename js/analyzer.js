// analyzer.js — clean version with full logic (CSS moved out)

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

hisInput.addEventListener('change', (e) => handleFileUpload(e.target.files[0], 'his'));
eventsInput.addEventListener('change', (e) => handleFileUpload(e.target.files[0], 'events'));
stateFilter.addEventListener('change', (e) => {
  selectedState = e.target.value;
  renderChart();
});

exportBtn.addEventListener('click', () => {
  html2canvas(chartContainer).then(canvas => {
    const link = document.createElement('a');
    link.download = 'SG3125_Chart.png';
    link.href = canvas.toDataURL();
    link.click();
  });
});

function handleFileUpload(file, type) {
  if (!file) return;
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
      }
    },
    error: (err) => {
      alert(`Failed to parse ${type} file: ${err.message}`);
    }
  });
}

function renderParams() {
  paramContainer.innerHTML = '';
  const keys = Object.keys(hisData[0] || {}).filter(k =>
    typeof hisData[0][k] === 'number' &&
    !k.includes('No.') && !k.includes('Monthly') &&
    !k.includes('Annual') && !k.includes('Total')
  ).slice(0, 20);

  keys.forEach(param => {
    const wrapper = document.createElement('div');
    wrapper.className = 'param-checkbox';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = param;
    checkbox.checked = selectedParams.includes(param);
    checkbox.onchange = () => {
      if (checkbox.checked) {
        selectedParams.push(param);
        axisAssignments[param] = 'left';
      } else {
        selectedParams = selectedParams.filter(p => p !== param);
        delete axisAssignments[param];
      }
      renderChart();
    };

    const label = document.createElement('label');
    label.textContent = param;
    label.style.flex = '1';
    label.style.marginLeft = '0.5rem';

    const axisSelect = document.createElement('select');
    axisSelect.innerHTML = `<option value="left">Left</option><option value="right">Right</option>`;
    axisSelect.value = axisAssignments[param] || 'left';
    axisSelect.onchange = (e) => {
      axisAssignments[param] = e.target.value;
      renderChart();
    };

    wrapper.appendChild(checkbox);
    wrapper.appendChild(label);
    wrapper.appendChild(axisSelect);
    paramContainer.appendChild(wrapper);
  });
}

function populateStateFilter() {
  const states = new Set(hisData.map(row => row["Working state of unit 1"]))
  stateFilter.innerHTML = '<option value="">-- All States --</option>';
  states.forEach(state => {
    const opt = document.createElement('option');
    opt.value = state;
    opt.textContent = state;
    stateFilter.appendChild(opt);
  });
}

function renderEventSummary() {
  const faults = eventsData.filter(e => e['Event Level'] === 'Fault').length;
  const alarms = eventsData.filter(e => e['Event Level'] === 'Alarm').length;
  const prompts = eventsData.filter(e => e['Event Level'] === 'Prompt').length;
  eventSummary.innerHTML = `
    <p>Total Events: ${eventsData.length}</p>
    <p>Faults: ${faults}, Alarms: ${alarms}, Prompts: ${prompts}</p>
  `;
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
  const filteredData = filterHisData();
  if (!filteredData.length || !selectedParams.length) return;
  resetChart();

  const labels = filteredData.map(row => row.Time);
  const datasets = selectedParams.map((param, index) => ({
    label: param,
    data: filteredData.map(row => row[param]),
    borderColor: ['#2196F3', '#F44336', '#4CAF50', '#FF9800', '#9C27B0', '#795548', '#607D8B'][index % 7],
    yAxisID: axisAssignments[param] || 'left',
    fill: false,
    tension: 0.1
  }));

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
