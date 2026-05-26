/**
 * Interactive Power Triangle Tool JS
 * Level3Support
 */

document.addEventListener('DOMContentLoaded', () => {
  const solveModeSelect = document.getElementById('solve-mode');
  const powerPInput = document.getElementById('power-p');
  const powerPUnit = document.getElementById('power-p-unit');
  const powerQInput = document.getElementById('power-q');
  const powerQUnit = document.getElementById('power-q-unit');
  const powerSInput = document.getElementById('power-s');
  const powerSUnit = document.getElementById('power-s-unit');
  const powerPfInput = document.getElementById('power-pf');
  const powerAngleInput = document.getElementById('power-angle');
  const pfTypeSelect = document.getElementById('pf-type');
  const voltageLlInput = document.getElementById('voltage-ll');
  const voltageUnitSelect = document.getElementById('voltage-unit');

  const resetBtn = document.getElementById('reset-btn');
  const copyBtn = document.getElementById('copy-btn');
  const canvas = document.getElementById('triangle-canvas');
  const ctx = canvas.getContext('2d');

  const resP = document.getElementById('res-p');
  const resQ = document.getElementById('res-q');
  const resS = document.getElementById('res-s');
  const resPf = document.getElementById('res-pf');
  const resAngle = document.getElementById('res-angle');
  const resCurrent = document.getElementById('res-current');
  const currentCalcRow = document.getElementById('current-calc-row');
  const validationError = document.getElementById('validation-error');

  const inputPGroups = [document.getElementById('input-p-group')];
  const inputQGroups = [document.getElementById('input-q-group')];
  const inputSGroups = [document.getElementById('input-s-group')];
  const inputPfGroups = [document.getElementById('input-pf-group')];
  const inputAngleGroups = [document.getElementById('input-angle-group')];

  let calculatedResults = null;

  // Toggle visible input groups depending on solve mode
  solveModeSelect.addEventListener('change', () => {
    const mode = solveModeSelect.value;
    validationError.style.display = 'none';

    // Hide all
    inputPGroups.forEach(el => el.style.display = 'none');
    inputQGroups.forEach(el => el.style.display = 'none');
    inputSGroups.forEach(el => el.style.display = 'none');
    inputPfGroups.forEach(el => el.style.display = 'none');
    inputAngleGroups.forEach(el => el.style.display = 'none');

    if (mode === 'pq') {
      inputPGroups.forEach(el => el.style.display = 'block');
      inputQGroups.forEach(el => el.style.display = 'block');
    } else if (mode === 'ppf') {
      inputPGroups.forEach(el => el.style.display = 'block');
      inputPfGroups.forEach(el => el.style.display = 'block');
    } else if (mode === 'spf') {
      inputSGroups.forEach(el => el.style.display = 'block');
      inputPfGroups.forEach(el => el.style.display = 'block');
    } else if (mode === 'pangle') {
      inputPGroups.forEach(el => el.style.display = 'block');
      inputAngleGroups.forEach(el => el.style.display = 'block');
    }

    calculatePowerTriangle();
  });

  // Event Listeners for real-time recalculation
  const inputsToWatch = [
    powerPInput, powerPUnit, powerQInput, powerQUnit,
    powerSInput, powerSUnit, powerPfInput, powerAngleInput,
    pfTypeSelect, voltageLlInput, voltageUnitSelect
  ];

  inputsToWatch.forEach(input => {
    input.addEventListener('input', calculatePowerTriangle);
    input.addEventListener('change', calculatePowerTriangle);
  });

  resetBtn.addEventListener('click', () => {
    solveModeSelect.value = "pq";
    powerPInput.value = "100";
    powerPUnit.value = "kW";
    powerQInput.value = "50";
    powerQUnit.value = "kvar";
    powerSInput.value = "";
    powerSUnit.value = "kVA";
    powerPfInput.value = "0.90";
    powerAngleInput.value = "";
    pfTypeSelect.value = "lagging";
    voltageLlInput.value = "";
    voltageUnitSelect.value = "V";

    solveModeSelect.dispatchEvent(new Event('change'));
  });

  function calculatePowerTriangle() {
    validationError.style.display = 'none';

    const mode = solveModeSelect.value;
    const pUnit = powerPUnit.value;
    const qUnit = powerQUnit.value;
    const sUnit = powerSUnit.value;
    const pfType = pfTypeSelect.value;

    let P = 0; // standard standard is in kW
    let Q = 0; // standard standard is in kvar
    let S = 0; // standard standard is in kVA
    let PF = 1.0;
    let angle = 0;

    if (mode === 'pq') {
      let rawP = parseFloat(powerPInput.value);
      let rawQ = parseFloat(powerQInput.value);

      if (isNaN(rawP) || rawP <= 0) return;
      if (isNaN(rawQ) || rawQ < 0) return;

      // Base conversion to k units
      P = pUnit === 'MW' ? rawP * 1000 : rawP;
      Q = qUnit === 'Mvar' ? rawQ * 1000 : rawQ;

      S = Math.sqrt(P * P + Q * Q);
      PF = S > 0 ? P / S : 1.0;
      angle = Math.acos(PF) * (180 / Math.PI);
    } 
    else if (mode === 'ppf') {
      let rawP = parseFloat(powerPInput.value);
      let rawPF = parseFloat(powerPfInput.value);

      if (isNaN(rawP) || rawP <= 0) return;
      if (isNaN(rawPF) || rawPF <= 0 || rawPF > 1.0) {
        showError('Power Factor must be between 0.01 and 1.0.');
        return;
      }

      P = pUnit === 'MW' ? rawP * 1000 : rawP;
      PF = rawPF;
      S = P / PF;
      Q = Math.sqrt(Math.max(0, S * S - P * P));
      angle = Math.acos(PF) * (180 / Math.PI);
    } 
    else if (mode === 'spf') {
      let rawS = parseFloat(powerSInput.value);
      let rawPF = parseFloat(powerPfInput.value);

      if (isNaN(rawS) || rawS <= 0) return;
      if (isNaN(rawPF) || rawPF <= 0 || rawPF > 1.0) {
        showError('Power Factor must be between 0.01 and 1.0.');
        return;
      }

      S = sUnit === 'MVA' ? rawS * 1000 : rawS;
      PF = rawPF;
      P = S * PF;
      Q = Math.sqrt(Math.max(0, S * S - P * P));
      angle = Math.acos(PF) * (180 / Math.PI);
    } 
    else if (mode === 'pangle') {
      let rawP = parseFloat(powerPInput.value);
      let rawAngle = parseFloat(powerAngleInput.value);

      if (isNaN(rawP) || rawP <= 0) return;
      if (isNaN(rawAngle) || rawAngle < 0 || rawAngle >= 90) {
        showError('Angle φ must be between 0 and 89.9 degrees.');
        return;
      }

      P = pUnit === 'MW' ? rawP * 1000 : rawP;
      angle = rawAngle;
      const angleRad = angle * (Math.PI / 180);
      PF = Math.cos(angleRad);
      S = P / PF;
      Q = P * Math.tan(angleRad);
    }

    // Display formatted results
    resP.textContent = P >= 1000 ? `${(P / 1000).toFixed(3)} MW` : `${P.toFixed(2)} kW`;
    resQ.textContent = Q >= 1000 ? `${(Q / 1000).toFixed(3)} Mvar` : `${Q.toFixed(2)} kvar`;
    resS.textContent = S >= 1000 ? `${(S / 1000).toFixed(3)} MVA` : `${S.toFixed(2)} kVA`;
    resPf.textContent = `${PF.toFixed(3)} (${pfType === 'lagging' ? 'Lagging' : 'Leading'})`;
    resAngle.textContent = `${angle.toFixed(2)}°`;

    // 3-Phase Current calculation
    const rawVolt = parseFloat(voltageLlInput.value);
    const voltUnit = voltageUnitSelect.value;
    if (!isNaN(rawVolt) && rawVolt > 0) {
      currentCalcRow.style.display = 'flex';
      const V_LL = voltUnit === 'kV' ? rawVolt * 1000 : rawVolt;
      const S_VA = S * 1000;
      const current = S_VA / (Math.sqrt(3) * V_LL);
      resCurrent.textContent = current >= 1000 ? `${(current / 1000).toFixed(3)} kA` : `${current.toFixed(2)} A`;
    } else {
      currentCalcRow.style.display = 'none';
    }

    calculatedResults = {
      P: P >= 1000 ? `${(P / 1000).toFixed(3)} MW` : `${P.toFixed(2)} kW`,
      Q: Q >= 1000 ? `${(Q / 1000).toFixed(3)} Mvar` : `${Q.toFixed(2)} kvar`,
      S: S >= 1000 ? `${(S / 1000).toFixed(3)} MVA` : `${S.toFixed(2)} kVA`,
      PF: `${PF.toFixed(3)} (${pfType === 'lagging' ? 'Lagging' : 'Leading'})`,
      angle: `${angle.toFixed(2)}°`
    };

    drawTriangle(P, Q, pfType);
  }

  // Live Drawing inside HTML5 Canvas
  function drawTriangle(P, Q, pfType) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padLeft = 60;
    const padBottom = pfType === 'lagging' ? 200 : 50;

    // Draw active axes
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padLeft, padBottom);
    ctx.lineTo(canvas.width - 50, padBottom);
    ctx.stroke();

    // Scale calculations
    const maxVal = Math.max(P, Q, 1);
    const scale = 280 / maxVal;

    const tWidth = P * scale;
    const tHeight = Q * scale * (pfType === 'lagging' ? -1 : 1);

    const endX = padLeft + tWidth;
    const endY = padBottom + tHeight;

    // Horizontal Line - P
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(padLeft, padBottom);
    ctx.lineTo(endX, padBottom);
    ctx.stroke();

    // Vertical Line - Q
    ctx.strokeStyle = "#d97706";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(endX, padBottom);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Hypotenuse Line - S
    ctx.strokeStyle = "#7c3aed";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(padLeft, padBottom);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Draw Angle Arc
    if (P > 0 && Q > 0) {
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      const radius = 30;
      const startAngle = 0;
      const endAngle = Math.atan2(tHeight, tWidth);
      ctx.arc(padLeft, padBottom, radius, startAngle, endAngle, pfType === 'lagging');
      ctx.stroke();
    }

    // Label texts
    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText(`P = ${(P).toFixed(1)}`, padLeft + tWidth / 2 - 20, padBottom + (pfType === 'lagging' ? 18 : -10));

    ctx.fillStyle = "#d97706";
    ctx.fillText(`Q = ${(Q).toFixed(1)}`, endX + 8, padBottom + tHeight / 2);

    ctx.fillStyle = "#7c3aed";
    ctx.fillText(`S = ${Math.sqrt(P*P + Q*Q).toFixed(1)}`, padLeft + tWidth / 2 - 40, padBottom + tHeight / 2 - 10);
  }

  copyBtn.addEventListener('click', () => {
    if (!calculatedResults) return;
    const text = `Level3Support Power Triangle Technical Summary
------------------------------------------------------------
Active Power (P): ${calculatedResults.P}
Reactive Power (Q): ${calculatedResults.Q}
Apparent Power (S): ${calculatedResults.S}
Power Factor (PF): ${calculatedResults.PF}
Phase Angle (φ): ${calculatedResults.angle}
------------------------------------------------------------
Disclaimer: Assisted field screening tool. Verify against specific project requirements.`;
    
    navigator.clipboard.writeText(text).then(() => {
      const origText = copyBtn.innerHTML;
      copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      setTimeout(() => copyBtn.innerHTML = origText, 2000);
    });
  });

  function showError(msg) {
    validationError.textContent = msg;
    validationError.style.display = 'block';
  }

  // Initialize
  solveModeSelect.dispatchEvent(new Event('change'));
});
