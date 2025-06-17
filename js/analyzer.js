// File: SG3125Analyzer.js (Final Fixed Vanilla JS Version)

const chartRef = document.getElementById('chart-canvas');
const chartContainer = document.getElementById('chart-container');
const paramContainer = document.getElementById('param-container');
const toggleContainer = document.getElementById('selected-param-toggles');
const exportBtn = document.getElementById('export-chart');
const hisFileInput = document.getElementById('hisdata-file');
const eventFileInput = document.getElementById('event-file');
const stateFilter = document.getElementById('state-filter');
const eventTableBody = document.querySelector('#event-log tbody');

let parsedHisData = [];
let parsedEventData = [];
let selectedParams = [];
let allParams = [];
let chartInstance = null;

const colorPalette = [
  '#42a5f5', '#ef5350', '#66bb6a', '#ffa726', '#ab47bc', '#26c6da', '#8d6e63', '#ffca28',
  '#5c6bc0', '#ec407a', '#26a69a', '#ff7043', '#7e57c2', '#26c6da', '#9ccc65', '#ffb74d'
];

function parseCSV(file, callback) {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: results => callback(results.data)
  });
}

function groupParams(params) {
  const general = [], unit1 = [], unit2 = [];
  params.forEach(p => {
    const key = p.toLowerCase();
    if (key.includes('unit 1')) unit1.push(p);
    else if (key.includes('unit 2')) unit2.push(p);
    else general.push(p);
  });
  return { general, unit1, unit2 };
}

function createCheckbox(label) {
  const wrapper = document.createElement('label');
  wrapper.className = 'param-label';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.value = label;
  checkbox.addEventListener('change', handleParamToggle);

  const span = document.createElement('span');
  span.textContent = label;

  wrapper.appendChild(checkbox);
  wrapper.appendChild(span);
  return wrapper;
}

function handleParamToggle(e) {
  const value = e.target.value;
  if (e.target.checked) {
    if (selectedParams.length >= 6) {
      e.target.checked = false;
      alert('Maximum of 6 parameters allowed.');
      return;
    }
    selectedParams.push(value);
  } else {
    selectedParams = selectedParams.filter(p => p !== value);
  }
  renderAxisToggles();
  renderChart();
}

function renderAxisToggles() {
  toggleContainer.innerHTML = '';
  selectedParams.forEach(param => {
    const toggleWrap = document.createElement('div');
    toggleWrap.className = 'selected-param-toggle';

    const label = document.createElement('label');
    label.textContent = param;

    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.dataset.param = param;

    toggleWrap.appendChild(label);
    toggleWrap.appendChild(toggle);
    toggleContainer.appendChild(toggleWrap);
  });
}

function renderParamSelectors() {
  const grouped = groupParams(allParams);
  paramContainer.innerHTML = '';
  ['general', 'unit1', 'unit2'].forEach(group => {
    const section = document.createElement('div');
    section.className = 'param-group';

    const title = document.createElement('h3');
    title.className = 'section-title';
    title.textContent = group === 'unit1' ? 'Unit 1' : group === 'unit2' ? 'Unit 2' : 'General';
    section.appendChild(title);

    const list = document.createElement('div');
    list.className = 'param-list';
    grouped[group].forEach(p => list.appendChild(createCheckbox(p)));
    section.appendChild(list);

    paramContainer.appendChild(section);
  });
}

function renderChart() {
  if (!parsedHisData.length) return;
  if (chartInstance) chartInstance.destroy();

  const labels = parsedHisData.map(row => row.Time);
  const datasets = selectedParams.map((param, idx) => {
    const axis = toggleContainer.querySelector(`input[data-param="${param}"]`)?.checked ? 'yRight' : 'yLeft';
    return {
      label: param,
      data: parsedHisData.map(row => parseFloat(row[param] || 0)),
      borderColor: colorPalette[idx % colorPalette.length],
      backgroundColor: colorPalette[idx % colorPalette.length],
      yAxisID: axis,
      tension: 0.1,
      pointRadius: 1
    };
  });

  chartInstance = new Chart(chartRef, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        title: { display: false }
      },
      scales: {
        yLeft: {
          type: 'linear', position: 'left', beginAtZero: false
        },
        yRight: {
          type: 'linear', position: 'right', beginAtZero: false,
          grid: { drawOnChartArea: false }
        }
      }
    }
  });
}

function renderEventTable() {
  eventTableBody.innerHTML = '';
  const showFault = document.getElementById('filter-fault').checked;
  const showAlarm = document.getElementById('filter-alarm').checked;
  const showPrompt = document.getElementById('filter-prompt').checked;

  parsedEventData.forEach(row => {
    const level = row.Level.toLowerCase();
    if ((level === 'fault' && !showFault) ||
        (level === 'alarm' && !showAlarm) ||
        (level === 'prompt' && !showPrompt)) return;

    const tr = document.createElement('tr');
    if (level === 'fault') tr.style.background = '#ffebee';
    if (level === 'alarm') tr.style.background = '#fff8e1';
    if (level === 'prompt') tr.style.background = '#f1f8e9';

    tr.innerHTML = `
      <td>${row.Time}</td>
      <td>${row.Device || ''}</td>
      <td>${row.Event}</td>
      <td>${row.Level}</td>
    `;
    eventTableBody.appendChild(tr);
  });
}

function exportChart() {
  html2canvas(chartContainer, {
    backgroundColor: '#ffffff', scale: 2
  }).then(canvas => {
    const link = document.createElement('a');
    link.download = 'SG3125_Chart.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
}

hisFileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  parseCSV(file, data => {
    parsedHisData = data;
    allParams = Object.keys(data[0] || {}).filter(k => k !== 'Time');
    renderParamSelectors();
  });
});

eventFileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  parseCSV(file, data => {
    parsedEventData = data;
    renderEventTable();
  });
});

['filter-fault', 'filter-alarm', 'filter-prompt'].forEach(id => {
  document.getElementById(id).addEventListener('change', renderEventTable);
});

exportBtn.addEventListener('click', exportChart);
