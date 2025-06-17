// SG3125 Analyzer — JS logic for CSV upload, parameter selection, charting and events

let hisData = [], eventData = [], filteredEvents = [];
let selectedParams = new Set();
let axisMapping = {}; // { paramName: 'left' | 'right' }

const maxSelectable = 6;

const hisInput = document.getElementById('hisdata-file');
const eventInput = document.getElementById('event-file');
const paramContainer = document.getElementById('param-container');
const toggleContainer = document.getElementById('selected-param-toggles');
const chartCanvas = document.getElementById('chart-canvas');
const chartExportBtn = document.getElementById('export-chart');
const stateFilter = document.getElementById('state-filter');
const faultCheckbox = document.getElementById('filter-fault');
const alarmCheckbox = document.getElementById('filter-alarm');
const promptCheckbox = document.getElementById('filter-prompt');
const logTableBody = document.querySelector('#event-log tbody');

let chart = null;

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

function renderParamSelectors() {
  paramContainer.innerHTML = '';
  const groups = { General: [], 'Unit 1': [], 'Unit 2': [] };
  if (hisData.length === 0) return;

  const headers = Object.keys(hisData[0]);
  headers.forEach(h => {
    const key = h.toLowerCase();
    if (key.includes('unit 1')) groups['Unit 1'].push(h);
    else if (key.includes('unit 2')) groups['Unit 2'].push(h);
    else groups.General.push(h);
  });

  Object.entries(groups).forEach(([groupName, params]) => {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'param-group';

    const title = document.createElement('h3');
    title.className = 'section-title';
    title.textContent = groupName;
    groupDiv.appendChild(title);

    const list = document.createElement('div');
    list.className = 'param-list';

    params.forEach(param => {
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.dataset.param = param;
      checkbox.addEventListener('change', handleParamToggle);

      const span = document.createElement('span');
      span.textContent = param;

      label.appendChild(checkbox);
      label.appendChild(span);
      list.appendChild(label);
    });

    groupDiv.appendChild(list);
    paramContainer.appendChild(groupDiv);
  });
}

function handleParamToggle(e) {
  const param = e.target.dataset.param;
  if (e.target.checked) {
    if (selectedParams.size >= maxSelectable) {
      e.target.checked = false;
      alert(`You can only select up to ${maxSelectable} parameters.`);
      return;
    }
    selectedParams.add(param);
    axisMapping[param] = 'left';
  } else {
    selectedParams.delete(param);
    delete axisMapping[param];
  }
  renderAxisToggles();
  updateChart();
}

function renderAxisToggles() {
  toggleContainer.innerHTML = '';
  [...selectedParams].forEach(param => {
    const div = document.createElement('div');
    div.className = 'selected-param-toggle';

    const label = document.createElement('label');
    label.textContent = param;

    const switchContainer = document.createElement('label');
    switchContainer.className = 'toggle-switch';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = axisMapping[param] === 'right';
    input.addEventListener('change', () => {
      axisMapping[param] = input.checked ? 'right' : 'left';
      updateChart();
    });

    const slider = document.createElement('span');
    slider.className = 'toggle-slider';

    switchContainer.appendChild(input);
    switchContainer.appendChild(slider);
    div.appendChild(label);
    div.appendChild(switchContainer);
    toggleContainer.appendChild(div);
  });
}

function updateChart() {
  if (!hisData.length || selectedParams.size === 0) return;

  const labels = hisData.map(row => row['Time']);
  const datasets = [...selectedParams].map((param, idx) => {
    const axis = axisMapping[param];
    return {
      label: param,
      data: hisData.map(row => parseFloat(row[param]) || 0),
      borderColor: Chart.defaults.color[idx % 10] || '#000',
      backgroundColor: 'transparent',
      yAxisID: axis
    };
  });

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      left: {
        type: 'linear',
        position: 'left',
        title: { display: true, text: 'Left Y' }
      },
      right: {
        type: 'linear',
        position: 'right',
        title: { display: true, text: 'Right Y' },
        grid: { drawOnChartArea: false }
      }
    }
  };

  if (chart) chart.destroy();
  chart = new Chart(chartCanvas.getContext('2d'), {
    type: 'line',
    data: { labels, datasets },
    options
  });
}

function exportChartAsImage() {
  const canvas = chartCanvas;
  const link = document.createElement('a');
  link.download = 'SG3125_Chart.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function handleStateFilter() {
  const selectedState = stateFilter.value;
  renderEventTable(selectedState);
}

function renderEventTable(filter) {
  logTableBody.innerHTML = '';
  const relevant = filter === 'All States'
    ? eventData
    : eventData.filter(e => (e.State || '').includes(filter));

  filteredEvents = relevant;

  relevant.forEach(e => {
    if (!e.Time || !e.Level) return;
    const row = document.createElement('tr');
    row.className = `event-row ${e.Level}`;

    ['Time', 'Device', 'Event', 'Level'].forEach(key => {
      const td = document.createElement('td');
      td.textContent = e[key] || '';
      row.appendChild(td);
    });

    const isVisible = (e.Level === 'Fault' && faultCheckbox.checked) ||
                      (e.Level === 'Alarm' && alarmCheckbox.checked) ||
                      (e.Level === 'Prompt' && promptCheckbox.checked);
    if (isVisible) logTableBody.appendChild(row);
  });
}

function refreshAfterUpload() {
  renderParamSelectors();
  renderAxisToggles();
  updateChart();
  renderEventTable(stateFilter.value);
}

hisInput.addEventListener('change', e => {
  const file = e.target.files[0];
  parseCSV(file, data => {
    hisData = data;
    refreshAfterUpload();
  });
});

eventInput.addEventListener('change', e => {
  const file = e.target.files[0];
  parseCSV(file, data => {
    eventData = data;
    refreshAfterUpload();
  });
});

stateFilter.addEventListener('change', handleStateFilter);
faultCheckbox.addEventListener('change', handleStateFilter);
alarmCheckbox.addEventListener('change', handleStateFilter);
promptCheckbox.addEventListener('change', handleStateFilter);

chartExportBtn.addEventListener('click', exportChartAsImage);
