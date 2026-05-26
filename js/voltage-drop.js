/**
 * Voltage Drop Calculator
 * Level3Support
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const circuitModeInput = document.getElementById('circuit-mode');
  const systemVoltageInput = document.getElementById('system-voltage');
  const circuitCurrentInput = document.getElementById('circuit-current');
  const allowedDropInput = document.getElementById('allowed-drop');
  const cableLengthInput = document.getElementById('cable-length');
  const lengthUnitInput = document.getElementById('length-unit');
  const cableMaterialInput = document.getElementById('cable-material');
  const cableResistanceInput = document.getElementById('cable-resistance');
  const powerFactorInput = document.getElementById('power-factor');
  const cableReactanceInput = document.getElementById('cable-reactance');
  
  const pfGroup = document.getElementById('pf-group');
  const reactanceGroup = document.getElementById('reactance-group');
  const resUnitLabel = document.getElementById('res-unit-label');
  const reactUnitLabel = document.getElementById('react-unit-label');
  
  const calculateBtn = document.getElementById('calculate-btn');
  const resetBtn = document.getElementById('reset-btn');
  const copyBtn = document.getElementById('copy-btn');
  const exportBtn = document.getElementById('export-btn');
  
  const resultPanel = document.getElementById('result-panel');
  const vdStatusBadge = document.getElementById('vd-status-badge');
  const resVdVolts = document.getElementById('res-vd-volts');
  const resVdPct = document.getElementById('res-vd-pct');
  const resPowerLoss = document.getElementById('res-power-loss');
  const resLoadVoltage = document.getElementById('res-load-voltage');
  const validationError = document.getElementById('validation-error');

  let calculationResults = null;

  // Toggle AC specific fields
  circuitModeInput.addEventListener('change', () => {
    const mode = circuitModeInput.value;
    if (mode === 'dc') {
      pfGroup.style.display = 'none';
      reactanceGroup.style.display = 'none';
    } else {
      pfGroup.style.display = 'block';
      reactanceGroup.style.display = 'grid';
    }
  });

  // Toggle Units labeling
  lengthUnitInput.addEventListener('change', () => {
    const unit = lengthUnitInput.value;
    if (unit === 'ft') {
      resUnitLabel.textContent = 'Ohms/1k ft';
      reactUnitLabel.textContent = 'Ohms/1k ft';
    } else {
      resUnitLabel.textContent = 'Ohms/km';
      reactUnitLabel.textContent = 'Ohms/km';
    }
  });

  // Load sample values
  function loadSampleValues() {
    circuitModeInput.value = 'ac-3';
    systemVoltageInput.value = '480';
    circuitCurrentInput.value = '200';
    allowedDropInput.value = '3.0';
    cableLengthInput.value = '150';
    lengthUnitInput.value = 'm';
    cableResistanceInput.value = '0.35'; // Ohms/km
    powerFactorInput.value = '0.90';
    cableReactanceInput.value = '0.12'; // Ohms/km
    
    pfGroup.style.display = 'block';
    reactanceGroup.style.display = 'grid';
    resUnitLabel.textContent = 'Ohms/km';
    reactUnitLabel.textContent = 'Ohms/km';
  }

  loadSampleValues();

  // Reset
  resetBtn.addEventListener('click', () => {
    circuitModeInput.value = 'ac-3';
    systemVoltageInput.value = '';
    circuitCurrentInput.value = '';
    allowedDropInput.value = '3.0';
    cableLengthInput.value = '';
    lengthUnitInput.value = 'm';
    cableResistanceInput.value = '';
    powerFactorInput.value = '0.90';
    cableReactanceInput.value = '0.15';
    
    pfGroup.style.display = 'block';
    reactanceGroup.style.display = 'grid';
    resUnitLabel.textContent = 'Ohms/km';
    reactUnitLabel.textContent = 'Ohms/km';
    
    validationError.style.display = 'none';
    resultPanel.style.display = 'none';
    calculationResults = null;
  });

  // Calculate
  calculateBtn.addEventListener('click', () => {
    validationError.style.display = 'none';

    const mode = circuitModeInput.value;
    const voltage = parseFloat(systemVoltageInput.value);
    const current = parseFloat(circuitCurrentInput.value);
    const allowedDrop = parseFloat(allowedDropInput.value);
    const length = parseFloat(cableLengthInput.value);
    const resistance = parseFloat(cableResistanceInput.value);
    const pf = parseFloat(powerFactorInput.value || 1.0);
    const reactance = parseFloat(cableReactanceInput.value || 0.0);

    if (isNaN(voltage) || voltage <= 0) {
      showError('Please enter a positive nominal System Voltage.');
      return;
    }
    if (isNaN(current) || current < 0) {
      showError('Please enter a valid Load Current.');
      return;
    }
    if (isNaN(allowedDrop) || allowedDrop <= 0) {
      showError('Please enter a positive Allowed Voltage Drop %.');
      return;
    }
    if (isNaN(length) || length <= 0) {
      showError('Please enter a positive Feeder Length.');
      return;
    }
    if (isNaN(resistance) || resistance <= 0) {
      showError('Please enter a positive Conductor Resistance.');
      return;
    }
    if (mode !== 'dc' && (isNaN(pf) || pf < 0 || pf > 1)) {
      showError('Please enter a valid Power Factor between 0.0 and 1.0.');
      return;
    }

    // Convert length to thousands
    const lengthFactor = length / 1000;

    let vd = 0;
    let powerLoss = 0;
    const sin_phi = Math.sqrt(1 - Math.pow(pf, 2));

    if (mode === 'dc') {
      // DC Circuit VD = 2 * I * R * L
      vd = 2 * current * resistance * lengthFactor;
      powerLoss = vd * current;
    } else if (mode === 'ac-1') {
      // 1-Phase AC: VD = 2 * I * L * (R cos + X sin)
      vd = 2 * current * lengthFactor * (resistance * pf + reactance * sin_phi);
      powerLoss = vd * current * pf;
    } else if (mode === 'ac-3') {
      // 3-Phase AC: VD = sqrt(3) * I * L * (R cos + X sin)
      vd = Math.sqrt(3) * current * lengthFactor * (resistance * pf + reactance * sin_phi);
      powerLoss = Math.sqrt(3) * vd * current * pf;
    }

    const vdPercentage = (vd / voltage) * 100;
    const finalLoadVoltage = voltage - vd;

    const pass = vdPercentage <= allowedDrop;
    const statusText = pass ? 'PASS' : 'FAIL';
    const badgeClass = pass ? 'status-pass' : 'status-fail';

    calculationResults = {
      mode: mode.toUpperCase(),
      voltage: `${voltage} V`,
      current: `${current} A`,
      feederLength: `${length} ${lengthUnitInput.value}`,
      cableMaterial: cableMaterialInput.value,
      resistance: `${resistance} Ohms`,
      reactance: mode !== 'dc' ? `${reactance} Ohms` : '0',
      powerFactor: mode !== 'dc' ? pf.toFixed(2) : '1.0',
      voltageDropVolts: `${vd.toFixed(2)} V`,
      voltageDropPct: `${vdPercentage.toFixed(2)}%`,
      estimatedPowerLoss: `${powerLoss.toFixed(1)} W`,
      loadVoltage: `${finalLoadVoltage.toFixed(1)} V`,
      status: statusText
    };

    // Render results
    resVdVolts.textContent = `${vd.toFixed(2)} V`;
    resVdPct.textContent = `${vdPercentage.toFixed(2)}%`;
    resPowerLoss.textContent = `${(powerLoss / 1000).toFixed(3)} kW (${powerLoss.toFixed(0)} W)`;
    resLoadVoltage.textContent = `${finalLoadVoltage.toFixed(1)} V`;

    if (pass) {
      resVdPct.style.color = '#166534';
    } else {
      resVdPct.style.color = '#991b1b';
    }

    vdStatusBadge.textContent = statusText;
    vdStatusBadge.className = `status-badge-inline ${badgeClass}`;

    resultPanel.style.display = 'block';
    resultPanel.scrollIntoView({ behavior: 'smooth' });
  });

  // Copy Results
  copyBtn.addEventListener('click', () => {
    if (!calculationResults) return;
    const text = `Level3Support Voltage Drop Results
-------------------------------------------
Mode: ${calculationResults.mode}
System Voltage: ${calculationResults.voltage}
Load Current: ${calculationResults.current}
Feeder Length: ${calculationResults.feederLength}
Cable Material: ${calculationResults.cableMaterial}
Conductor Resistance: ${calculationResults.resistance}
Reactance: ${calculationResults.reactance}
Power Factor: ${calculationResults.powerFactor}
Voltage Drop (V): ${calculationResults.voltageDropVolts}
Voltage Drop (%): ${calculationResults.voltageDropPct}
Power Loss: ${calculationResults.estimatedPowerLoss}
Load Voltage: ${calculationResults.loadVoltage}
Status: ${calculationResults.status}
-------------------------------------------
Disclaimer: Assisted field tool. Always verify against specific project documents.`;
    
    navigator.clipboard.writeText(text).then(() => {
      const origText = copyBtn.innerHTML;
      copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      setTimeout(() => copyBtn.innerHTML = origText, 2000);
    });
  });

  // Export JSON
  exportBtn.addEventListener('click', () => {
    if (!calculationResults) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(calculationResults, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `voltage_drop_results_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });

  function showError(msg) {
    validationError.textContent = msg;
    validationError.style.display = 'block';
  }
});
