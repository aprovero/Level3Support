// fault-interpreter.js (Updated for radio layout with dynamic prefix)

document.addEventListener('DOMContentLoaded', () => {
  const inverterRadios = document.querySelectorAll('input[name="inverter-series"]');
  const faultSectionContainer = document.getElementById('fault-section-options');
  const faultCodeInput = document.getElementById('fault-code');
  const prefix0x = document.getElementById('prefix-0x');
  const interpretBtn = document.getElementById('interpret-btn');
  const binaryOutput = document.getElementById('binary-output');
  const resultContainer = document.getElementById('fault-result');

  const faultCodeMappings = {
    sg3125: {
      pdpFault: { 0: "A1-Phase overcurrent", 1: "B1-Phase overcurrent", 2: "C1-Phase overcurrent", 3: "A2-Phase overcurrent", 4: "B2-Phase overcurrent", 5: "C2-Phase overcurrent", 6: "DC overcurrent", 7: "FA1", 8: "FB1", 9: "FC1", 10: "FA2", 11: "FB2", 12: "FC2", 13: "Module 1 Through", 14: "Module 2 Through", 15: "Carrier fault" },
      fanState: { 0: "Phase failure", 1: "Reserved", 2: "Power mod overheated", 3: "Comm error Mas/Sla", 4: "Fan bad", 5: "Motor overheated", 6: "Hall sensor error", 7: "Locked motor", 8: "Reserved", 9: "Electronics Overheated", 10: "Reserved", 11: "DC-link OverVolt", 12: "DC-link underVolt", 13: "Mains underVolt", 14: "Mains overVolt", 15: "Reserved" },
      fanAlarm: { 0: "I_Limit Current limitation in mesh", 1: "DC-link voltage unstable", 2: "P_Limit Power limit in mesh", 3: "Output stage temperature high", 4: "Motor temperature high", 5: "TEI_high Electronics interior temperature high", 6: "UzLow Dclink volt low", 7: "Brake", 8: "Reserved", 9: "n_low", 10: "Cable break", 11: "Reserved", 12: "Reserved", 13: "Reserved", 14: "Reserved", 15: "Comm fan PA fail" }
    },
    onePlusX: {
      moduleFault: { 0: "A1-Phase overcurrent", 1: "B1-Phase overcurrent", 2: "C1-Phase overcurrent", 3: "Reserved", 4: "Reserved", 5: "Reserved", 6: "DC overcurrent", 7: "FA", 8: "FB", 9: "FC", 10: "Reserved", 11: "Reserved", 12: "Reserved", 13: "Module 1 Through", 14: "Fast protection PDP", 15: "Carrier fault" },
      fanStatus: { 0: "Phase failure", 1: "Reserved", 2: "Power Mod overheated", 3: "Comm error between master and slave controller", 4: "Fan Bad", 5: "Motor overheated", 6: "Hall sensor error", 7: "Locked motor", 8: "Reserved", 9: "Electronics overheated", 10: "Reserved", 11: "DC link overvoltage", 12: "DC link undervoltage", 13: "Mains undervoltage", 14: "Mains overvoltage", 15: "Reserved" },
      fanAlarm: { 0: "I_limit", 1: "L_high", 2: "Power limitation in mesh", 3: "Output stage temperature high", 4: "Motor temperature high", 5: "Electronics temperature high", 6: "DC link voltage low", 7: "Brake", 8: "Reserved", 9: "n_low", 10: "Cable break", 11: "Reserved", 12: "Reserved", 13: "Reserved", 14: "Reserved", 15: "Reserved" }
    }
  };

  function getSelectedInverterSeries() {
    return document.querySelector('input[name="inverter-series"]:checked').value;
  }

  function getSelectedFaultSection() {
    const selected = faultSectionContainer.querySelector('input[name="fault-section"]:checked');
    return selected ? selected.value : null;
  }

  function updateFaultSections(seriesKey) {
    const mappings = faultCodeMappings[seriesKey];
    faultSectionContainer.innerHTML = '';
    Object.entries(mappings).forEach(([val, label]) => {
      const id = `fault-section-${val}`;
      faultSectionContainer.innerHTML += `
        <label for="${id}" style="margin-right: 20px;">
          <input type="radio" name="fault-section" id="${id}" value="${val}"> ${prettify(val)}
        </label>
      `;
    });
  }

  function updatePrefixDisplay(series) {
    prefix0x.style.display = series === 'sg3125' ? 'inline' : 'none';
  }

  function interpretCode() {
    const series = getSelectedInverterSeries();
    const section = getSelectedFaultSection();
    const raw = faultCodeInput.value.trim();

    if (!section || !raw) return;

    const isHex = series === 'sg3125';
    let decValue;
    try {
      if (isHex) {
        const clean = raw.replace(/^0x/i, '');
        if (!/^[\da-fA-F]+$/.test(clean)) throw new Error('Invalid hex');
        decValue = parseInt(clean, 16);
      } else {
        if (!/^\d+$/.test(raw)) throw new Error('Invalid decimal');
        decValue = parseInt(raw, 10);
      }

      const binary = decValue.toString(2).padStart(16, '0');
      showBinary(binary);
      showFaults(binary, series, section);
    } catch (e) {
      binaryOutput.style.display = 'none';
      resultContainer.style.display = 'block';
      resultContainer.innerHTML = `<div class="message error">${e.message}</div>`;
    }
  }

  function showBinary(binary) {
    binaryOutput.style.display = 'block';
    binaryOutput.innerHTML = '<h3>Binary</h3>';

    const labels = document.createElement('div');
    labels.className = 'bit-labels';
    const bits = document.createElement('div');
    bits.className = 'bit-grid';

    [...binary].forEach((bit, i) => {
      const pos = 15 - i;
      labels.innerHTML += `<div>${pos}</div>`;
      bits.innerHTML += `<div data-bit="${bit}">${bit}</div>`;
    });

    binaryOutput.appendChild(labels);
    binaryOutput.appendChild(bits);
  }

  function showFaults(binary, series, section) {
    const map = faultCodeMappings?.[series]?.[section];
    resultContainer.style.display = 'block';
    resultContainer.innerHTML = '<h3>Active Faults:</h3>';

    const active = [];
    [...binary].forEach((b, i) => {
      const pos = 15 - i;
      if (b === '1') {
        active.push(`<div><strong>Bit ${pos}</strong>: ${map?.[pos] || 'Unknown fault'}</div>`);
      }
    });

    if (active.length) {
      resultContainer.innerHTML += active.join('');
    } else {
      resultContainer.innerHTML += '<div class="message success">No active faults</div>';
    }
  }

  function prettify(key) {
    return key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, s => s.toUpperCase());
  }

  inverterRadios.forEach(r => {
    r.addEventListener('change', () => {
      const selected = getSelectedInverterSeries();
      updateFaultSections(selected);
      updatePrefixDisplay(selected);
    });
  });

  interpretBtn.addEventListener('click', interpretCode);

  // Initial load
  const initial = getSelectedInverterSeries();
  updateFaultSections(initial);
  updatePrefixDisplay(initial);
});
