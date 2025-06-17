// File: SG3125Analyzer.js (Updated Vanilla JS Version)

const chartRef = document.getElementById('chart-canvas');
const chartContainer = document.getElementById('chart-container');
const paramContainer = document.getElementById('param-container');
const toggleContainer = document.getElementById('selected-param-toggles');
const exportBtn = document.getElementById('export-btn');

let parsedHisData = [];
let parsedEventData = [];
let selectedParams = [];
let allParams = [];
let chartInstance = null;

const colorPalette = [
  '#42a5f5', '#ef5350', '#66bb6a', '#ffa726', '#ab47bc', '#26c6da', '#8d6e63', '#ffca28'
];

function parseCSV(file, callback) {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: results => callback(results.data)
  });
}

function extractDateFromFilename(filename) {
  const match = filename.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : null;
}

function groupParams(params) {
  const general = [];
  const unit1 = [];
  const unit2 = [];
  params.forEach(p => {
    const lower = p.toLowerCase();
    if (lower.includes('unit 1')) unit1.push(p);
    else if (lower.includes('unit 2')) unit2.push(p);
    else general.push(p);
  });
  return { general, unit1, unit2 };
}

function createCheckbox(label, category) {
  const wrapper = document.createElement('div');
  wrapper.className = 'param-entry';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.value = label;
  checkbox.addEventListener('change', handleParamToggle);

  const text = document.createElement('label');
  text.textContent = label;

  wrapper.appendChild(checkbox);
  wrapper.appendChild(text);
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
    const toggleWrapper = document.createElement('div');
    toggleWrapper.className = 'selected-param-toggle';

    const label = document.createElement('label');
    label.textContent = param;

    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.checked = false;
    toggle.dataset.param = param;

    toggleWrapper.appendChild(label);
    toggleWrapper.appendChild(toggle);
    toggleContainer.appendChild(toggleWrapper);
  });
}

function renderParamSelectors() {
  const columns = groupParams(allParams);
  paramContainer.innerHTML = '';
  ['general', 'unit1', 'unit2'].forEach(section => {
    const column = document.createElement('div');
    column.className = 'param-column';

    const title = document.createElement('h3');
    title.textContent = section === 'unit1' ? 'Unit 1' : section === 'unit2' ? 'Unit 2' : 'General';
    column.appendChild(title);

    columns[section].forEach(p => column.appendChild(createCheckbox(p, section)));
    paramContainer.appendChild(column);
  });
}

function renderChart() {
  if (chartInstance) chartInstance.destroy();
  const labels = parsedHisData.map(row => row.Time);
  const datasets = [];

  selectedParams.forEach((param, idx) => {
    const toggle = toggleContainer.querySelector(`input[data-param="${param}"]`);
    const axis = toggle && toggle.checked ? 'yRight' : 'yLeft';
    datasets.push({
      label: param,
      data: parsedHisData.map(row => parseFloat(row[param] || 0)),
      yAxisID: axis,
      borderColor: colorPalette[idx % colorPalette.length],
      backgroundColor: colorPalette[idx % colorPalette.length],
      tension: 0.1,
      pointRadius: 1
    });
  });

  chartInstance = new Chart(chartRef, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      stacked: false,
      plugins: {
        legend: { position: 'top' },
        title: { display: false },
      },
      scales: {
        yLeft: {
          type: 'linear',
          display: true,
          position: 'left'
        },
        yRight: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: { drawOnChartArea: false }
        }
      }
    }
  });
}

function handleHisFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  parseCSV(file, data => {
    parsedHisData = data;
    allParams = Object.keys(data[0]).filter(k => k !== 'Time');
    renderParamSelectors();
  });
}

function handleEventsFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  parseCSV(file, data => {
    parsedEventData = data;
    // TODO: Link events to chart with red X
  });
}

function exportChart() {
  html2canvas(chartContainer, { backgroundColor: '#ffffff' }).then(canvas => {
    const link = document.createElement('a');
    link.download = 'SG3125_Chart.png';
    link.href = canvas.toDataURL();
    link.click();
  });
}

document.getElementById('hisfile').addEventListener('change', handleHisFile);
document.getElementById('eventfile').addEventListener('change', handleEventsFile);
document.getElementById('export-btn').addEventListener('click', exportChart);
