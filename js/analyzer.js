// analyzer.js — with grouped columns, chart export below, 6 max selected, axis toggles below chart

const chartRef = document.getElementById('chart-canvas');
const chartContainer = document.getElementById('chart-container');
const paramContainer = document.getElementById('param-container');
const exportBtn = document.getElementById('export-chart');
const hisInput = document.getElementById('his-upload');
const eventsInput = document.getElementById('events-upload');
const eventSummary = document.getElementById('event-summary');
const stateFilter = document.getElementById('state-select');
const selectedParamToggles = document.createElement('div');
selectedParamToggles.id = 'selected-param-toggles';

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
        selectedParams = [];
        axisAssignments = {};
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

  // Add red X markers for faults matching the date
  if (eventsData.length && hisFileDate) {
    const faultEvents = eventsData.filter(ev => ev["Event Level"] === "Fault" && ev["Generation time"]?.startsWith(hisFileDate));
    faultEvents.forEach((fault, idx) => {
      datasets.push({
        label: `Fault ${idx + 1}`,
        data: filteredData.map(row => row.Time === fault["Generation time"] ? 0 : null),
        pointStyle: 'crossRot',
        pointRadius: 6,
        pointBackgroundColor: 'red',
        borderColor: 'rgba(0,0,0,0)',
        showLine: false,
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
        left: { type: 'linear', position: 'left', title: { display: true, text: 'Left Y' }, beginAtZero: false },
        right: { type: 'linear', position: 'right', title: { display: true, text: 'Right Y' }, grid: { drawOnChartArea: false }, beginAtZero: false },
        x: { title: { display: true, text: 'Time' } }
      }
    }
  });
}

function renderParams() {
  if (!hisData.length) return;
  const allKeys = Object.keys(hisData[0]).filter(k => typeof hisData[0][k] === 'number');
  const general = allKeys.filter(k => !k.toLowerCase().includes('unit 1') && !k.toLowerCase().includes('unit 2'));
  const unit1 = allKeys.filter(k => k.toLowerCase().includes('unit 1'));
  const unit2 = allKeys.filter(k => k.toLowerCase().includes('unit 2'));

  const createColumn = (title, list) => {
    const col = document.createElement('div');
    col.className = 'param-group';
    const heading = document.createElement('div');
    heading.className = 'section-title';
    heading.textContent = title;
    const inner = document.createElement('div');
    inner.className = 'param-list';
    list.forEach(param => {
      const row = document.createElement('label');
      row.innerHTML = `
        <input type="checkbox" value="${param}" />
        <span>${param}</span>
      `;
      const checkbox = row.querySelector('input');
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          if (selectedParams.length >= 6) {
            checkbox.checked = false;
            alert("Max 6 parameters allowed.");
          } else {
            selectedParams.push(param);
            axisAssignments[param] = 'left';
          }
        } else {
          selectedParams = selectedParams.filter(p => p !== param);
          delete axisAssignments[param];
        }
        renderToggles();
        renderChart();
      });
      inner.appendChild(row);
    });
    col.appendChild(heading);
    col.appendChild(inner);
    return col;
  };

  paramContainer.innerHTML = '';
  paramContainer.appendChild(createColumn('General', general));
  paramContainer.appendChild(createColumn('Unit 1', unit1));
  paramContainer.appendChild(createColumn('Unit 2', unit2));

  if (!document.getElementById('selected-param-toggles')) {
    chartContainer.insertAdjacentElement('afterend', selectedParamToggles);
  }
}

function renderToggles() {
  selectedParamToggles.innerHTML = '';
  selectedParams.forEach(param => {
    const toggle = document.createElement('div');
    toggle.className = 'selected-param-toggle';
    toggle.innerHTML = `
      <label>${param}</label>
      <select>
        <option value="left" ${axisAssignments[param] === 'left' ? 'selected' : ''}>Left</option>
        <option value="right" ${axisAssignments[param] === 'right' ? 'selected' : ''}>Right</option>
      </select>
    `;
    toggle.querySelector('select').addEventListener('change', e => {
      axisAssignments[param] = e.target.value;
      renderChart();
    });
    selectedParamToggles.appendChild(toggle);
  });
}

function populateStateFilter() {
  const states = Array.from(new Set(hisData.map(row => row["Working state of unit 1"]))).filter(Boolean);
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

exportBtn.addEventListener('click', () => {
  html2canvas(chartContainer).then(canvas => {
    const link = document.createElement('a');
    link.download = 'SG3125_Chart.png';
    link.href = canvas.toDataURL();
    link.click();
  });
});
