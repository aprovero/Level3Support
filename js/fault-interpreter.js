// DOM elements
const inverterRadios = document.querySelectorAll('input[name="inverter"]');
const sectionContainer = document.getElementById('section-options');
const inputField = document.getElementById('fault-code');
const interpretBtn = document.getElementById('interpret-btn');
const binaryOutput = document.getElementById('binary-output');
const resultContainer = document.getElementById('fault-result');

// Fault mappings
const faultCodeMappings = {
  sg3125: {
    pdpFault: {
      0: "A1-Phase overcurrent", 1: "B1-Phase overcurrent", 2: "C1-Phase overcurrent",
      3: "A2-Phase overcurrent", 4: "B2-Phase overcurrent", 5: "C2-Phase overcurrent",
      6: "DC overcurrent", 7: "FA1", 8: "FB1", 9: "FC1",
      10: "FA2", 11: "FB2", 12: "FC2", 13: "Module 1 Through",
      14: "Module 2 Through", 15: "Carrier fault"
    },
    fanState: {
      0: "Phase failure", 1: "Reserved", 2: "Power mod overheated",
      3: "Comm error Mas/Sla", 4: "Fan bad", 5: "Motor overheated",
      6: "Hall sensor error", 7: "Locked motor", 8: "Reserved",
      9: "Electronics Overheated", 10: "Reserved", 11: "DC-link OverVolt",
      12: "DC-link underVolt", 13: "Mains underVolt", 14: "Mains overVolt", 15: "Reserved"
    },
    fanAlarm: {
      0: "I_Limit Current limitation in mesh", 1: "DC-link voltage unstable",
      2: "P_Limit Power limit in mesh", 3: "Output stage temperature high",
      4: "Motor temperature high", 5: "TEI_high Electronics interior temperature high",
      6: "UzLow Dclink volt low", 7: "Brake", 8: "Reserved", 9: "n_low",
      10: "Cable break", 11: "Reserved", 12: "Reserved", 13: "Reserved",
      14: "Reserved", 15: "Comm fan PA fail"
    }
  },
  onePlusX: {
    moduleFault: {
      0: "A1-Phase overcurrent", 1: "B1-Phase overcurrent", 2: "C1-Phase overcurrent",
      3: "Reserved", 4: "Reserved", 5: "Reserved", 6: "DC overcurrent",
      7: "FA", 8: "FB", 9: "FC", 10: "Reserved", 11: "Reserved",
      12: "Reserved", 13: "Module 1 Through", 14: "Fast protection PDP", 15: "Carrier fault"
    },
    fanStatus: {
      0: "Phase failure", 1: "Reserved", 2: "Power Mod overheated",
      3: "Comm error between master and slave controller", 4: "Fan Bad",
      5: "Motor overheated", 6: "Hall sensor error", 7: "Locked motor",
      8: "Reserved", 9: "Electronics overheated", 10: "Reserved",
      11: "DC link overvoltage", 12: "DC link undervoltage", 13: "Mains undervoltage",
      14: "Mains overvoltage", 15: "Reserved"
    },
    fanAlarm: {
      0: "I_limit", 1: "L_high", 2: "Power limitation in mesh",
      3: "Output stage temperature high", 4: "Motor temperature high",
      5: "Electronics temperature high", 6: "DC link voltage low",
      7: "Brake", 8: "Reserved", 9: "n_low", 10: "Cable break",
      11: "Reserved", 12: "Reserved", 13: "Reserved", 14: "Reserved", 15: "Reserved"
    }
  }
};

// Dynamic radio rendering
function renderFaultSections() {
  const selectedSeries = getSelectedInverter();
  const mapping = faultCodeMappings[selectedSeries];
  sectionContainer.innerHTML = '';

  Object.keys(mapping).forEach((key, idx) => {
    const id = `section-${key}`;
    const label = document.createElement('label');
    label.className = 'radio-option';
    label.innerHTML = `
      <input type="radio" name="fault-section" value="${key}" ${idx === 0 ? 'checked' : ''} />
      ${prettify(key)}
    `;
    sectionContainer.appendChild(label);
  });
}

// Helpers
function getSelectedInverter() {
  return [...inverterRadios].find(r => r.checked)?.value;
}

function getSelectedSection() {
  const selected = document.querySelector('input[name="fault-section"]:checked');
  return selected?.value;
}

function prettify(text) {
  return text.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, s => s.toUpperCase());
}

function showErrorMessage(msg) {
  resultContainer.innerHTML = `<div class="message error">${msg}</div>`;
  resultContainer.style.display = 'block';
  binaryOutput.style.display = 'none';
}

// Interpret logic
function interpretCode() {
  const code = inputField.value.trim();
  const series = getSelectedInverter();
  const section = getSelectedSection();
  const type = series === 'sg3125' ? 'hex' : 'dec';

  let value;
  if (type === 'hex') {
    const clean = code.replace(/^0x/i, '');
    if (!/^[\da-fA-F]+$/.test(clean)) return showErrorMessage('Invalid hexadecimal');
    value = parseInt(clean, 16);
  } else {
    if (!/^\d+$/.test(code)) return showErrorMessage('Invalid decimal');
    value = parseInt(code, 10);
  }

  const binary = value.toString(2).padStart(16, '0');
  renderBinary(binary);
  renderFaults(binary, series, section);
}

function renderBinary(binStr) {
  binaryOutput.innerHTML = `<h3>Binary</h3>`;
  const labels = document.createElement('div');
  labels.className = 'bit-labels';
  const bits = document.createElement('div');
  bits.className = 'bit-grid';

  [...binStr].forEach((bit, i) => {
    const pos = 15 - i;
    labels.innerHTML += `<div>${pos}</div>`;
    bits.innerHTML += `<div data-bit="${bit}">${bit}</div>`;
  });

  binaryOutput.appendChild(labels);
  binaryOutput.appendChild(bits);
  binaryOutput.style.display = 'block';
}

function renderFaults(binStr, series, section) {
  const map = faultCodeMappings?.[series]?.[section];
  if (!map) return showErrorMessage('Invalid fault section');

  const faults = [...binStr].map((bit, i) => {
    const pos = 15 - i;
    if (bit === '1') return `<div><strong>Bit ${pos}</strong>: ${map[pos] || 'Unknown fault'}</div>`;
    return null;
  }).filter(Boolean);

  resultContainer.innerHTML = `<h3>Active Faults</h3>${faults.length ? faults.join('') : `<div class="message success">No active faults</div>`}`;
  resultContainer.style.display = 'block';
}

// Init
inverterRadios.forEach(r => r.addEventListener('change', renderFaultSections));
interpretBtn.addEventListener('click', interpretCode);
document.addEventListener('DOMContentLoaded', renderFaultSections);
