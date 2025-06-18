const chartRef = document.getElementById('chart-canvas');
const chartContainer = document.getElementById('chart-container');
const paramContainer = document.getElementById('param-container');
const toggleContainer = document.getElementById('selected-param-toggles');
const exportBtn = document.getElementById('export-chart');
const hisFileInput = document.getElementById('hisdata-file');
const eventFileInput = document.getElementById('event-file');
const eventTableBody = document.querySelector('#event-log tbody');

let parsedHisData = [];
let parsedEventData = [];
let selectedParams = [];
let allParams = [];
let chartInstance = null;

const colorPalette = [
  '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
  '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
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

    const toggle = document.createElement('label');
    toggle.className = 'inline-flex relative items-center cursor-pointer ml-auto';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'sr-only peer';
    input.dataset.param = param;
    input.addEventListener('change', renderChart);

    const slider = document.createElement('div');
    slider.className = 'w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-300 peer-checked:bg-blue-600 after:content-[""] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full';

    toggle.appendChild(input);
    toggle.appendChild(slider);

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
      tension: 0.2,
      pointRadius: 1,
      borderWidth: 2
    };
  });

  chartInstance = new Chart(chartRef, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top' }
      },
      scales: {
        yLeft: {
          type: 'linear',
          position: 'left',
          title: { display: true, text: 'Left Y' }
        },
        yRight: {
          type: 'linear',
          position: 'right',
          title: { display: true, text: 'Right Y' },
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
    const level = row.Level?.toLowerCase();
    if ((level === 'fault' && !showFault) ||
        (level === 'alarm' && !showAlarm) ||
        (level === 'prompt' && !showPrompt)) return;

    const tr = document.createElement('tr');
    tr.dataset.level = level;

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
    backgroundColor: '#ffffff',
    scale: 2
  }).then(canvas => {
    const link = document.createElement('a');
    link.download = 'SG3125_Chart.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
}

// ============ Init ============

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
