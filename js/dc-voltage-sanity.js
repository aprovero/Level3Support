/**
 * DC String Voltage Sanity Check Tool
 * Level3Support — js/dc-voltage-sanity.js
 */

document.addEventListener('DOMContentLoaded', () => {
  const resetBtn    = document.getElementById('reset-btn');
  const checkBtn    = document.getElementById('check-btn');
  const errDiv      = document.getElementById('validation-error');
  const resultPanel = document.getElementById('result-panel');
  const exportBtn   = document.getElementById('export-json-btn');
  const copyBtn     = document.getElementById('copy-btn');

  let lastResults = null;

  // ── Load Sample Data ──────────────────────────────────────────────────
  function loadSampleData() {
    document.getElementById('mod-voc').value  = '46.5';
    document.getElementById('mod-vmp').value  = '38.2';
    document.getElementById('tc-voc').value   = '-0.30';
    document.getElementById('tc-vmp').value   = '-0.45';
    document.getElementById('num-modules').value = '20';
    document.getElementById('mod-temp').value = '50';
    document.getElementById('measured-v').value = '860';
    window.setType('voc');
  }

  // ── Reset ─────────────────────────────────────────────────────────────
  resetBtn.addEventListener('click', () => {
    loadSampleData();
    resultPanel.style.display = 'none';
    errDiv.style.display = 'none';
    lastResults = null;
  });

  // ── Check ──────────────────────────────────────────────────────────────
  checkBtn.addEventListener('click', () => {
    errDiv.style.display = 'none';

    const modVoc    = parseFloat(document.getElementById('mod-voc').value);
    const modVmp    = parseFloat(document.getElementById('mod-vmp').value);
    const tcVoc     = parseFloat(document.getElementById('tc-voc').value);
    const tcVmp     = parseFloat(document.getElementById('tc-vmp').value);
    const numMods   = parseInt(document.getElementById('num-modules').value, 10);
    const modTemp   = parseFloat(document.getElementById('mod-temp').value);
    const measured  = parseFloat(document.getElementById('measured-v').value);
    const type      = window.selectedType;

    // Validate
    if (isNaN(modVoc) || modVoc <= 0)   return showError('Module Voc must be a positive number.');
    if (isNaN(modVmp) || modVmp <= 0)   return showError('Module Vmp must be a positive number.');
    if (isNaN(tcVoc))                   return showError('Voc Temperature Coefficient is required.');
    if (isNaN(tcVmp))                   return showError('Vmp Temperature Coefficient is required.');
    if (isNaN(numMods) || numMods < 1)  return showError('Number of modules must be a positive integer.');
    if (isNaN(modTemp))                 return showError('Module temperature is required.');
    if (isNaN(measured))                return showError('Measured voltage is required.');

    // Calculate
    const baseV      = type === 'voc' ? modVoc : modVmp;
    const baseLabel  = type === 'voc' ? 'Voc' : 'Vmp';
    const tc         = type === 'voc' ? tcVoc : tcVmp;
    const tcDecimal  = tc / 100;  // convert %/°C → per °C

    const expected   = baseV * numMods * (1 + tcDecimal * (modTemp - 25));
    const rangeLow   = expected * 0.975;
    const rangeHigh  = expected * 1.025;
    const diffV      = measured - expected;
    const diffPct    = (diffV / expected) * 100;
    const absDiffPct = Math.abs(diffPct);

    let status = 'PASS';
    if (absDiffPct > 10) status = 'FAIL';
    else if (absDiffPct > 2.5) status = 'WARN';

    // Build hints
    const hints = [];
    if (Math.abs(measured) < 5) {
      hints.push({ icon: 'fa-times-circle', text: 'Measured voltage is near zero — possible open circuit, blown string fuse, or open combiner.' });
    }
    if (measured < 0) {
      hints.push({ icon: 'fa-exclamation-circle', text: 'Negative voltage — reversed polarity. Check probe connections and string wiring.' });
    }
    if (Math.abs(measured - (type === 'voc' ? modVmp * numMods * (1 + (tcVmp / 100) * (modTemp - 25)) : 0)) < expected * 0.05 && type === 'voc') {
      hints.push({ icon: 'fa-info-circle', text: 'Measured value close to expected Vmp — possible measurement taken under load. Verify string isolators are open.' });
    }
    if (absDiffPct > 2.5) {
      // Check if deviation is approximately a module fraction
      const oneMod = expected / numMods;
      const nMissing = Math.round(Math.abs(diffV) / oneMod);
      if (nMissing >= 1 && nMissing < numMods && Math.abs(Math.abs(diffV) - nMissing * oneMod) < oneMod * 0.15) {
        hints.push({ icon: 'fa-layer-group', text: `Voltage difference corresponds approximately to ${nMissing} module(s) — possible module count mismatch, bypassed modules, or failed bypass diodes.` });
      }
    }
    if (diffPct > 10) {
      hints.push({ icon: 'fa-thermometer-half', text: 'Measured voltage significantly higher than expected — verify module temperature input. Cold morning conditions produce higher Voc.' });
    }
    if (measured > 0 && absDiffPct > 2.5 && hints.length === 0) {
      hints.push({ icon: 'fa-search', text: 'Deviation outside ±2.5% — verify module datasheet values, temperature input, and series count.' });
    }

    lastResults = {
      type: baseLabel, baseV, tc, numMods, modTemp, expected,
      rangeLow, rangeHigh, measured, diffV, diffPct, status, hints
    };

    renderResults(lastResults);
  });

  // ── Render Results ─────────────────────────────────────────────────────
  function renderResults(r) {
    document.getElementById('res-expected').textContent = `${r.expected.toFixed(2)} V`;
    document.getElementById('res-range').textContent    = `${r.rangeLow.toFixed(2)} V  to  ${r.rangeHigh.toFixed(2)} V`;
    document.getElementById('res-measured').textContent = `${r.measured.toFixed(2)} V`;

    const sign = r.diffV >= 0 ? '+' : '';
    document.getElementById('res-diff-v').textContent   = `${sign}${r.diffV.toFixed(2)} V`;
    document.getElementById('res-diff-pct').textContent = `${sign}${r.diffPct.toFixed(2)}%`;

    // Color the diff
    const diffPctEl = document.getElementById('res-diff-pct');
    if (r.status === 'PASS') diffPctEl.style.color = 'var(--success-color)';
    else if (r.status === 'WARN') diffPctEl.style.color = '#d97706';
    else diffPctEl.style.color = 'var(--error-color)';

    const badge = document.getElementById('status-badge');
    badge.className = 'status-badge-inline';
    if (r.status === 'PASS')      { badge.classList.add('status-pass'); badge.textContent = '✓ PASS'; }
    else if (r.status === 'WARN') { badge.classList.add('status-warn'); badge.textContent = '⚠ WARN'; }
    else                          { badge.classList.add('status-fail'); badge.textContent = '✗ FAIL'; }

    // Hints
    const hintsPanel = document.getElementById('hints-panel');
    const hintsList  = document.getElementById('hints-list');
    if (r.hints.length > 0) {
      hintsList.innerHTML = r.hints.map(h => `
        <div class="hint-item">
          <i class="fas ${h.icon}" style="color:#d97706;"></i>
          <span>${h.text}</span>
        </div>
      `).join('');
      hintsPanel.style.display = 'block';
    } else {
      hintsPanel.style.display = 'none';
    }

    resultPanel.style.display = 'block';
    resultPanel.scrollIntoView({ behavior: 'smooth' });
  }

  // ── Export JSON ─────────────────────────────────────────────────────────
  exportBtn.addEventListener('click', () => {
    if (!lastResults) return;
    const r = lastResults;
    const payload = {
      tool: 'DC String Voltage Sanity Check',
      inputs: {
        measurementType:  r.type,
        baseVoltage_V:    r.baseV,
        tempCoeff_pct_C:  r.tc,
        modulesInSeries:  r.numMods,
        moduleTemp_C:     r.modTemp
      },
      outputs: {
        expected_V:       parseFloat(r.expected.toFixed(2)),
        rangeLow_V:       parseFloat(r.rangeLow.toFixed(2)),
        rangeHigh_V:      parseFloat(r.rangeHigh.toFixed(2)),
        measured_V:       r.measured,
        diff_V:           parseFloat(r.diffV.toFixed(2)),
        diff_pct:         parseFloat(r.diffPct.toFixed(2)),
        status:           r.status
      },
      hints: r.hints.map(h => h.text),
      exportedAt: new Date().toISOString(),
      disclaimer: 'Assisted field tool. Always verify against approved project documentation.'
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `dc_voltage_check_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  // ── Copy Results ────────────────────────────────────────────────────────
  copyBtn.addEventListener('click', () => {
    if (!lastResults) return;
    const r = lastResults;
    const sign = r.diffV >= 0 ? '+' : '';
    const lines = [
      'Level3Support — DC String Voltage Sanity Check',
      `Measurement Type: ${r.type} | Modules in Series: ${r.numMods} | Module Temp: ${r.modTemp}°C`,
      `─────────────────────────────────`,
      `Expected ${r.type}: ${r.expected.toFixed(2)} V`,
      `Acceptable Range: ${r.rangeLow.toFixed(2)} V – ${r.rangeHigh.toFixed(2)} V`,
      `Measured: ${r.measured.toFixed(2)} V`,
      `Difference: ${sign}${r.diffV.toFixed(2)} V  (${sign}${r.diffPct.toFixed(2)}%)`,
      `Status: ${r.status}`,
      r.hints.length > 0 ? `Hints: ${r.hints.map(h => h.text).join(' | ')}` : '',
      `─────────────────────────────────`,
      'Disclaimer: Assisted field tool. Verify against approved documents.'
    ].filter(Boolean);
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      const orig = copyBtn.innerHTML;
      copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      setTimeout(() => copyBtn.innerHTML = orig, 2000);
    });
  });

  // ── Helpers ─────────────────────────────────────────────────────────────
  function showError(msg) {
    errDiv.textContent  = msg;
    errDiv.style.display = 'block';
  }

  // ── Init ─────────────────────────────────────────────────────────────────
  loadSampleData();
});
