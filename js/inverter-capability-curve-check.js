/**
 * Inverter Capability Curve Check JS
 * Level3Support
 */

document.addEventListener('DOMContentLoaded', () => {
  const ratingApparentInput = document.getElementById('rating-apparent');
  const ratingApparentUnitSelect = document.getElementById('rating-apparent-unit');
  const setpointPInput = document.getElementById('setpoint-p');
  const setpointQInput = document.getElementById('setpoint-q');
  const invertersOnlineInput = document.getElementById('inverters-online');
  const tempDeratingInput = document.getElementById('temp-derating');
  const voltageFactorInput = document.getElementById('voltage-factor');
  const notesInput = document.getElementById('notes');

  const calculateBtn = document.getElementById('calculate-btn');
  const resetBtn = document.getElementById('reset-btn');
  const copyBtn = document.getElementById('copy-btn');

  const resultPanel = document.getElementById('result-panel');
  const statusBadge = document.getElementById('diagnostic-status');
  const resSReq = document.getElementById('res-s-req');
  const resSRatingAdj = document.getElementById('res-s-rating-adj');
  const resUtilization = document.getElementById('res-utilization');
  const resWithin = document.getElementById('res-within');
  const adjSection = document.getElementById('adj-section');
  const resAdjP = document.getElementById('res-adj-p');
  const resAdjQ = document.getElementById('res-adj-q');
  const validationError = document.getElementById('validation-error');

  let resultsSummary = null;

  // Load sample values
  function loadSampleValues() {
    setpointPInput.value = "3100";
    setpointQInput.value = "1600";
  }

  loadSampleValues();

  resetBtn.addEventListener('click', () => {
    ratingApparentInput.value = "3450";
    ratingApparentUnitSelect.value = "kVA";
    setpointPInput.value = "";
    setpointQInput.value = "";
    invertersOnlineInput.value = "1";
    tempDeratingInput.value = "1.0";
    voltageFactorInput.value = "1.0";
    notesInput.value = "";
    validationError.style.display = 'none';
    resultPanel.style.display = 'none';
    resultsSummary = null;
  });

  calculateBtn.addEventListener('click', () => {
    validationError.style.display = 'none';

    const rawS = parseFloat(ratingApparentInput.value);
    const unitS = ratingApparentUnitSelect.value;
    const rawP = parseFloat(setpointPInput.value);
    const rawQ = parseFloat(setpointQInput.value);
    const online = parseInt(invertersOnlineInput.value || 1);
    const tempFactor = parseFloat(tempDeratingInput.value || 1.0);
    const voltFactor = parseFloat(voltageFactorInput.value || 1.0);

    if (isNaN(rawS) || rawS <= 0) {
      showError('Please enter a positive Apparent Power rating.');
      return;
    }
    if (isNaN(rawP) || rawP < 0) {
      showError('Please enter a valid Active Power setpoint.');
      return;
    }
    if (isNaN(rawQ) || rawQ < 0) {
      showError('Please enter a valid Reactive Power setpoint.');
      return;
    }
    if (online <= 0) {
      showError('Online inverters count must be 1 or higher.');
      return;
    }
    if (tempFactor < 0 || tempFactor > 1.0) {
      showError('Derating factor must be between 0 and 1.0.');
      return;
    }

    // Convert apparent power to kVA if entered in MVA
    const baseSRatingSingle = unitS === 'MVA' ? rawS * 1000 : rawS;
    const totalSRatingAdj = baseSRatingSingle * online * tempFactor * voltFactor;

    // S Required = sqrt(P^2 + Q^2)
    const requiredS = Math.sqrt(rawP * rawP + rawQ * rawQ);
    const utilization = (requiredS / totalSRatingAdj) * 100;

    resSReq.textContent = `${requiredS.toFixed(2)} kVA`;
    resSRatingAdj.textContent = `${totalSRatingAdj.toFixed(2)} kVA`;
    resUtilization.textContent = `${utilization.toFixed(1)}%`;

    const withinCapability = requiredS <= totalSRatingAdj;
    resWithin.textContent = withinCapability ? "YES" : "NO (Apparent power limit exceeded)";
    resWithin.style.color = withinCapability ? "var(--success-color)" : "var(--error-color)";

    let badgeClass = "status-normal";
    let statusText = "WITHIN LIMITS";

    if (!withinCapability) {
      badgeClass = "status-critical";
      statusText = "OUT OF BOUNDS";
      adjSection.style.display = 'block';

      // Calculations for corrections
      // Max P at requested Q
      let maxP = 0;
      if (totalSRatingAdj > rawQ) {
        maxP = Math.sqrt(totalSRatingAdj * totalSRatingAdj - rawQ * rawQ);
      }
      resAdjP.textContent = `${maxP.toFixed(1)} kW`;

      // Max Q at requested P
      let maxQ = 0;
      if (totalSRatingAdj > rawP) {
        maxQ = Math.sqrt(totalSRatingAdj * totalSRatingAdj - rawP * rawP);
      }
      resAdjQ.textContent = `${maxQ.toFixed(1)} kvar`;
    } else {
      badgeClass = "status-normal";
      statusText = "WITHIN LIMITS";
      adjSection.style.display = 'none';
    }

    statusBadge.textContent = statusText;
    statusBadge.className = `status-badge-inline ${badgeClass}`;

    resultsSummary = {
      pSetpoint: `${rawP} kW`,
      qSetpoint: `${rawQ} kvar`,
      reqS: `${requiredS.toFixed(2)} kVA`,
      utilization: `${utilization.toFixed(1)}%`,
      within: withinCapability ? 'YES' : 'NO',
      status: statusText
    };

    resultPanel.style.display = 'block';
    resultPanel.scrollIntoView({ behavior: 'smooth' });
  });

  copyBtn.addEventListener('click', () => {
    if (!resultsSummary) return;
    const text = `Level3Support Inverter Capability Curve Check
------------------------------------------------------------
Active Power Setpoint: ${resultsSummary.pSetpoint}
Reactive Power Setpoint: ${resultsSummary.qSetpoint}
Required Apparent Power: ${resultsSummary.reqS}
Utilization Factor: ${resultsSummary.utilization}
Within Curve boundary: ${resultsSummary.within}
Capability Status: ${resultsSummary.status}
------------------------------------------------------------
Disclaimer: Simplified apparent power capability check. Always consult active OEM operational charts.`;
    
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
});
