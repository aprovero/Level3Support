// File: SG3125Analyzer.js (Vanilla JS Version)

import Papa from 'https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js';
import html2canvas from 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
import Chart from 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';

const chartRef = document.getElementById('chart-canvas');
const chartContainer = document.getElementById('chart-container');
const paramContainer = document.getElementById('param-container');
const exportBtn = document.getElementById('export-chart');
const hisInput = document.getElementById('his-upload');
const eventsInput = document.getElementById('events-upload');
const eventSummary = document.getElementById('event-summary');

let hisData = [];
let eventsData = [];
let selectedParams = [];
let chartInstance = null;

function resetChart() {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
}

function renderChart() {
  if (!hisData.length || !selectedParams.length) return;
  resetChart();

  const labels = hisData.map(row => row.Time);
  const datasets = selectedParams.map((param, index) => ({
    label: param,
    data: hisData.map(row => row[param]),
    borderColor: [
      '#2196F3', '#F44336', '#4CAF50', '#FF9800',
      '#9C27B0', '#795548', '#607D8B'
    ][index % 7],
    fill: false,
    tension: 0.1
  }));

  chartInstance = new Chart(chartRef, {
    type: 'line',
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        x: { display: true, title: { display: true, text: 'Time' } },
        y: { display: true, title: { display: true, text: 'Value' } }
      }
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

  keys.forEach((param) => {
    const label = document.createElement('label');
    label.className = 'param-checkbox';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = param;
    checkbox.checked = selectedParams.includes(param);
    checkbox.onchange = () => {
      if (checkbox.checked) {
        selectedParams.push(param);
      } else {
        selectedParams = selectedParams.filter(p => p !== param);
      }
      renderChart();
    };
    label.appendChild(checkbox);
    label.append(param);
    paramContainer.appendChild(label);
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

function handleFileUpload(file, type) {
  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: (results) => {
      if (type === 'his') {
        hisData = results.data;
        selectedParams = ['Output power of Turnkey Station', 'DC power of Turnkey Station'];
        renderParams();
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

hisInput.addEventListener('change', (e) => handleFileUpload(e.target.files[0], 'his'));
eventsInput.addEventListener('change', (e) => handleFileUpload(e.target.files[0], 'events'));

exportBtn.addEventListener('click', () => {
  html2canvas(chartContainer).then(canvas => {
    const link = document.createElement('a');
    link.download = 'SG3125_Chart.png';
    link.href = canvas.toDataURL();
    link.click();
  });
});
