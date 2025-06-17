// fault-interpreter.js

// DOM Elements
const inverterSelect = document.getElementById('inverter-series');
const sectionSelect = document.getElementById('fault-section');
const inputField = document.getElementById('fault-code');
const interpretBtn = document.getElementById('interpret-btn');
const prefixLabel = document.getElementById('prefix-label');
const binaryOutput = document.getElementById('binary-output');
const resultContainer = document.getElementById('fault-result');

// Fault code mappings
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

// Sync fault sections when inverter changes
function updateFaultSectionOptions() {
  const series = inverterSelect.value;
  sectionSelect.innerHTML = '';

  const mappings = faultCodeMappings[series];
  if (!mappings) return;

  Object.keys(mappings).forEach(section => {
    const option = document.createElement('option');
    option.value = section;
    option.textContent = prettify(section);
    sectionSelect.appendChild(option);
  });

  updatePrefixLabel();
  clearOutput();
}

function updatePrefixLabel() {
  prefixLabel.textContent = inverterSelect.value === 'sg3125' ? '0x' : '';
}

function clearOutput() {
  binaryOutput.style.display = 'none';
  resultContainer.style.display = 'none';
  binaryOutput.innerHTML = '';
  resultContainer.innerHTML = '';
  inputField.value = '';
}

// Interpret fault code
function interpretCode() {
  const code = inputField.value.trim();
  const type = inverterSelect.value === 'sg3125' ? 'hex' : 'dec';

  let decimalValue;
  if (type === 'hex') {
    const clean = code.replace(/^0x/i, '');
    if (!/^[\da-fA-F]+$/.test(clean)) return showErrorMessage('Invalid hexadecimal');
    decimalValue = parseInt(clean, 16);
  } else {
    if (!/^\d+$/.test(code)) return showErrorMessage('Invalid decimal');
    decimalValue = parseInt(code, 10);
  }

  const binary = decimalValue.toString(2).padStart(16, '0');
  renderBinaryBits(binary);
  renderFaultDescriptions(binary);
}

function renderBinaryBits(binary) {
  binaryOutput.style.display = 'block';

  const labels = document.createElement('div');
  labels.className = 'bit-labels';
  const bits = document.createElement('div');
  bits.className = 'bit-grid';

  [...binary].forEach((bit, i) => {
    const bitPos = 15 - i;
    const label = document.createElement('div');
    label.textContent = bitPos;
    label.style.width = '24px';
    label.style.textAlign = 'center';
    labels.appendChild(label);

    const box = document.createElement('div');
    box.textContent = bit;
    box.style.width = '24px';
    box.style.height = '24px';
    box.style.display = 'flex';
    box.style.alignItems = 'center';
    box.style.justifyContent = 'center';
    box.style.border = '1px solid #ccc';
    box.style.borderRadius = '4px';
    box.style.fontWeight = bit === '1' ? 'bold' : 'normal';
    box.style.backgroundColor = bit === '1' ? '#fdecea' : '#f5f5f5';
    box.style.color = bit === '1' ? '#c62828' : '#aaa';
    bits.appendChild(box);
  });

  binaryOutput.innerHTML = `<h3>Binary</h3>`;
  binaryOutput.appendChild(labels);
  binaryOutput.appendChild(bits);
}

function renderFaultDescriptions(binary) {
  resultContainer.style.display = 'block';
  const section = sectionSelect.value;
  const series = inverterSelect.value;
  const map = faultCodeMappings?.[series]?.[section];
  if (!map) return showErrorMessage('Mapping not found');

  const active = [];

  [...binary].forEach((bit, i) => {
    const pos = 15 - i;
    if (bit === '1') {
      active.push(`<div><strong>Bit ${pos}</strong>: ${map[pos] || 'Unknown fault'}</div>`);
    }
  });

  resultContainer.innerHTML = `<h3>Active Faults</h3>${
    active.length
      ? active.join('')
      : `<div class="message success">No active faults</div>`
  }`;
}

function prettify(key) {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (s) => s.toUpperCase());
}

// Init
inverterSelect.addEventListener('change', updateFaultSectionOptions);
interpretBtn.addEventListener('click', interpretCode);
document.addEventListener('DOMContentLoaded', updateFaultSectionOptions);
