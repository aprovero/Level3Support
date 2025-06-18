// analyzer.js

const chartRef = document.getElementById('chart-canvas');
const chartContainer = document.getElementById('chart-container');
const paramContainer = document.getElementById('param-container');
const toggleContainer = document.getElementById('selected-param-toggles');
const exportBtn = document.getElementById('export-chart');
const hisFileInput = document.getElementById('hisdata-file');
const eventFileInput = document.getElementById('event-file');
const eventTableBody = document.querySelector('#event-log tbody');

let parsedHisData = [], parsedEventData = [], selectedParams = [], allParams = [], chartInstance = null;

const colors = ['#42a5f5', '#ef5350', '#66bb6a', '#ffa726', '#ab47bc', '#26c6da'];

function parseCSV(file, cb) {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: results => cb(results.data)
  });
}

function groupParams(params) {
  const general = [], unit1 = [], unit2 = [];
  params.forEach(p => {
    const lower = p.toLowerCase();
    if (lower.includes('unit 1')) unit1.push(p);
    else if (lower.includes('unit 2')) unit2.push(p);
    else general.push(p);
  });
  return { general, unit1, unit2 };
}

function createCheckbox(label) {
  const wrapper = document.createElement('label');
  wrapper.className = 'param-label';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.value = label;
  input.addEventListener('change', toggleParam);
  wrapper.appendChild(input);
  wrapper.appendChild(document.createTextNode(label));
  return wrapper;
}

function toggleParam(e) {
  const val = e.target.value;
  if (e.target.checked) {
    if (selectedParams.length >= 6) {
      e.target.checked = false;
      alert('Max 6 parameters.');
      return;
    }
    selectedParams.push(val);
  } else {
    selectedParams = selectedParams.filter(p => p !== val);
  }
  renderAxisToggles();
  drawChart();
}

function renderAxisToggles() {
  toggleContainer.innerHTML = '';
  selectedParams.forEach((param, idx) => {
    const div = document.createElement('div');
    div.className = 'selected-param-toggle';
    div.innerHTML = `
      <label>${param}</label>
      <label class="switch">
        <input type="checkbox" data-param="${param}">
        <span class="slider round"></span>
      </label>
    `;
    toggleContainer.appendChild(div);
  });
}

function drawChart() {
  if (!parsedHisData.length) return;
  if (chartInstance) chartInstance.destroy();

  const labels = parsedHisData.map(r => r.Time);
  const datasets = selectedParams.map((param, i) => {
    const axis = toggleContainer.querySelector(`[data-param="${param}"]`)?.checked ? 'yRight' : 'yLeft';
    return {
      label: param,
      data: parsedHisData.map(r => parseFloat(r[param] || 0)),
      borderColor: colors[i % colors.length],
      backgroundColor: colors[i % colors.length],
      yAxisID: axis,
      tension: 0.2,
      pointRadius: 1
    };
  });

  chartInstance = new Chart(chartRef, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        yLeft: { type: 'linear', position: 'left', beginAtZero: false },
        yRight: { type: 'linear', position: 'right', beginAtZero: false, grid: { drawOnChartArea: false } }
      }
    }
  });
}

function renderParamSelectors() {
  const grouped = groupParams(allParams);
  paramContainer.innerHTML = '';
  ['general', 'unit1', 'unit2'].forEach(group => {
    const section = document.createElement('div');
    section.className = 'param-group';
    const title = document.createElement('h3');
    title.textContent = group === 'unit1' ? 'Unit 1' : group === 'unit2' ? 'Unit 2' : 'General';
    section.appendChild(title);
    grouped[group].forEach(p => section.appendChild(createCheckbox(p)));
    paramContainer.appendChild(section);
  });
}

function renderEventTable() {
  const tbody = eventTableBody;
  tbody.innerHTML = '';
  const showFault = document.getElementById('filter-fault').checked;
  const showAlarm = document.getElementById('filter-alarm').checked;
  const showPrompt = document.getElementById('filter-prompt').checked;

  parsedEventData.forEach(row => {
    const level = row.Level.toLowerCase();
    if ((level === 'fault' && !showFault) || (level === 'alarm' && !showAlarm) || (level === 'prompt' && !showPrompt)) return;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.Time}</td>
      <td>${row.Device || ''}</td>
      <td>${row.Event}</td>
      <td>${row.Level}</td>
    `;
    tbody.appendChild(tr);
  });
}

function exportChart() {
  html2canvas(chartContainer, { backgroundColor: '#ffffff', scale: 2 })
    .then(canvas => {
      const link = document.createElement('a');
      link.download = 'SG3125_Chart.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
}

hisFileInput.addEventListener('change', e => {
  parseCSV(e.target.files[0], data => {
    parsedHisData = data;
    allParams = Object.keys(data[0]).filter(k => k !== 'Time');
    renderParamSelectors();
  });
});

eventFileInput.addEventListener('change', e => {
  parseCSV(e.target.files[0], data => {
    parsedEventData = data;
    renderEventTable();
  });
});

['filter-fault', 'filter-alarm', 'filter-prompt'].forEach(id =>
  document.getElementById(id).addEventListener('change', renderEventTable)
);

exportBtn.addEventListener('click', exportChart);
