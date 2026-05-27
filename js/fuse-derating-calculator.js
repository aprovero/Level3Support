/**
 * Fuse Continuous Current & Temperature Derating Calculator
 * Level3Support — js/fuse-derating-calculator.js
 * © 2026 Level3Support
 */

'use strict';

// ── Common Fuse Rating List (generic selectable ratings) ──
const COMMON_FUSE_RATINGS = [
  1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 32, 35, 40, 45, 50,
  60, 63, 70, 80, 90, 100, 110, 125, 150, 160, 175, 200, 225, 250,
  300, 315, 350, 400, 450, 500, 600, 630, 700, 800, 1000, 1200, 1250, 1600
];

let currentMode = 'check'; // 'check' | 'recommend'
let lastResults = null;

// ── DOM Ready ──
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
});

// ── Mode Toggle ──
function setMode(mode) {
  currentMode = mode;

  const checkBtn = document.getElementById('mode-check-btn');
  const recBtn   = document.getElementById('mode-recommend-btn');
  const fuseGroup = document.getElementById('fuse-select-group');

  if (mode === 'check') {
    checkBtn.classList.add('active');
    recBtn.classList.remove('active');
    fuseGroup.style.display = 'grid';
  } else {
    recBtn.classList.add('active');
    checkBtn.classList.remove('active');
    fuseGroup.style.display = 'none';
  }

  // Hide results on mode switch
  document.getElementById('result-panel').style.display = 'none';
  hideError();
}

// Expose globally for onclick
window.setMode = setMode;

// ── Advanced Toggle ──
function toggleAdvanced() {
  const toggle  = document.getElementById('advanced-toggle');
  const section = document.getElementById('advanced-section');
  toggle.classList.toggle('open');
  section.classList.toggle('visible');
}
window.toggleAdvanced = toggleAdvanced;

// ── Event Listeners ──
function setupEventListeners() {
  document.getElementById('calculate-btn').addEventListener('click', calculate);
  document.getElementById('reset-btn').addEventListener('click', resetForm);
  document.getElementById('copy-summary-btn').addEventListener('click', copySummary);
  document.getElementById('export-json-btn').addEventListener('click', exportJSON);

  // Real-time ambient temp warning
  const ambientInput = document.getElementById('ambient-temp');
  if (ambientInput) {
    ambientInput.addEventListener('change', () => {
      // Re-trigger soft warnings if results already shown
      if (lastResults) calculate();
    });
  }
}

// ── Main Calculate ──
function calculate() {
  hideError();

  // ── Parse Inputs ──
  const loadCurrentRaw    = parseFloat(document.getElementById('load-current').value);
  const ccFactorRaw       = parseFloat(document.getElementById('cc-factor').value);
  const fuseRatingRaw     = parseFloat(document.getElementById('fuse-rating').value);
  const tempDeratingRaw   = parseFloat(document.getElementById('temp-derating').value);
  const addDeratingRaw    = parseFloat(document.getElementById('add-derating').value);
  const designMarginRaw   = parseFloat(document.getElementById('design-margin').value);
  const ambientTempRaw    = parseFloat(document.getElementById('ambient-temp').value);
  const fuseType          = document.getElementById('fuse-type').value;
  const loadType          = document.getElementById('load-type').value;

  // ── Validation ──
  if (isNaN(loadCurrentRaw) || loadCurrentRaw <= 0) {
    return showError('Load Current must be greater than 0 A.');
  }
  if (isNaN(ccFactorRaw) || ccFactorRaw < 1.0) {
    return showError('Continuous-Current Factor must be ≥ 1.0.');
  }
  if (currentMode === 'check') {
    if (isNaN(fuseRatingRaw) || fuseRatingRaw <= 0) {
      return showError('Selected Fuse Rating must be greater than 0 A.');
    }
  }
  if (isNaN(tempDeratingRaw) || tempDeratingRaw <= 0 || tempDeratingRaw > 1.5) {
    return showError('Temperature Derating Factor must be > 0 and ≤ 1.5.');
  }
  if (isNaN(addDeratingRaw) || addDeratingRaw <= 0 || addDeratingRaw > 1.5) {
    return showError('Additional Derating Factor must be > 0 and ≤ 1.5.');
  }
  const designMargin = isNaN(designMarginRaw) ? 0 : designMarginRaw;
  if (designMargin < 0) {
    return showError('Design Margin % cannot be negative.');
  }

  // Ambient temp range warning (informational, not a block)
  const ambientTempWarning = !isNaN(ambientTempRaw) && (ambientTempRaw < -40 || ambientTempRaw > 85);

  // ── Core Calculations ──
  const adjustedRequired      = loadCurrentRaw * ccFactorRaw;
  const adjustedWithMargin    = adjustedRequired * (1 + designMargin / 100);

  // Determine fuse rating to evaluate (either entered or we'll find recommended)
  let fuseRating = currentMode === 'check' ? fuseRatingRaw : null;
  let deratedCurrent = null;

  if (fuseRating !== null) {
    deratedCurrent = fuseRating * tempDeratingRaw * addDeratingRaw;
  }

  // ── Recommended Fuse Size (always compute for both modes) ──
  let recommendedFuse = null;
  for (const rating of COMMON_FUSE_RATINGS) {
    const derated = rating * tempDeratingRaw * addDeratingRaw;
    if (derated >= adjustedWithMargin) {
      recommendedFuse = rating;
      break;
    }
  }

  // In Mode 2, the fuse we evaluate IS the recommended one
  if (currentMode === 'recommend') {
    fuseRating    = recommendedFuse;
    deratedCurrent = fuseRating !== null ? fuseRating * tempDeratingRaw * addDeratingRaw : null;
  }

  // ── Loading Percentages ──
  const fuseLoadingPct    = deratedCurrent > 0 ? (loadCurrentRaw / deratedCurrent) * 100 : null;
  const adjustedLoadingPct = deratedCurrent > 0 ? (adjustedWithMargin / deratedCurrent) * 100 : null;

  // ── Pass / Fail / Review Logic ──
  let status = 'pass';
  const reviewReasons = [];

  if (deratedCurrent === null) {
    status = 'review';
    reviewReasons.push('No fuse rating available to evaluate — no generic rating can meet the requirement at applied derating factors.');
  } else if (deratedCurrent < adjustedWithMargin) {
    status = 'fail';
  } else {
    // Check review conditions
    if (tempDeratingRaw === 1.0 || addDeratingRaw === 1.0) {
      // Check if ambient is elevated — potential missing derating
      if (!isNaN(ambientTempRaw) && ambientTempRaw > 35 && tempDeratingRaw === 1.0) {
        reviewReasons.push('Temperature derating factor is 1.00 but ambient temperature is elevated. Verify fuse manufacturer derating data.');
      }
    }
    if (loadType === 'mixed') {
      reviewReasons.push('Load type is "Mixed / Review Required" — verify continuous vs. non-continuous portions and applicable factors.');
    }
    if (fuseType === 'other') {
      reviewReasons.push('Fuse type is "Other / Unknown" — verify manufacturer rating, voltage class, and derating data.');
    }
    // Heavily loaded warning (based on adjustedLoadingPct)
    if (adjustedLoadingPct !== null && adjustedLoadingPct > 80 && adjustedLoadingPct <= 100) {
      reviewReasons.push('Fuse is heavily loaded (>80%). Verify continuous operation capability, enclosure temperature, and manufacturer derating guidance.');
    }
    if (reviewReasons.length > 0) {
      status = 'review';
    }
  }

  // ── Margin ──
  const marginAmps = deratedCurrent !== null ? deratedCurrent - adjustedWithMargin : null;

  // ── Build Result Strings ──
  const siteName    = document.getElementById('site-name').value.trim();
  const circuitId   = document.getElementById('circuit-id').value.trim();
  const circuitType = document.getElementById('circuit-type').value;
  const holderNotes = document.getElementById('holder-notes').value.trim();
  const mfrNotes    = document.getElementById('mfr-notes').value.trim();

  // ── Generate Summary Text ──
  const summaryText = buildSummaryText({
    siteName, circuitId, circuitType, loadType, fuseType,
    loadCurrent: loadCurrentRaw, ccFactor: ccFactorRaw, designMargin,
    fuseRating, tempDerating: tempDeratingRaw, addDerating: addDeratingRaw,
    adjustedRequired, adjustedWithMargin, deratedCurrent,
    fuseLoadingPct, adjustedLoadingPct, marginAmps,
    recommendedFuse, status, holderNotes, mfrNotes
  });

  // ── Store for copy/export ──
  lastResults = {
    mode: currentMode,
    siteName, circuitId, circuitType, loadType, fuseType,
    loadCurrent: loadCurrentRaw,
    ccFactor: ccFactorRaw,
    designMarginPct: designMargin,
    fuseRating,
    tempDeratingFactor: tempDeratingRaw,
    addDeratingFactor: addDeratingRaw,
    ambientTempC: isNaN(ambientTempRaw) ? null : ambientTempRaw,
    adjustedRequiredCurrent: round2(adjustedRequired),
    adjustedRequiredWithMargin: round2(adjustedWithMargin),
    deratedFuseCurrent: deratedCurrent !== null ? round2(deratedCurrent) : null,
    fuseLoadingPct: fuseLoadingPct !== null ? round2(fuseLoadingPct) : null,
    adjustedLoadingPct: adjustedLoadingPct !== null ? round2(adjustedLoadingPct) : null,
    marginAmps: marginAmps !== null ? round2(marginAmps) : null,
    recommendedFuseA: recommendedFuse,
    status,
    reviewReasons,
    holderNotes, mfrNotes,
    summaryText,
    timestamp: new Date().toISOString()
  };

  // ── Render Results ──
  renderResults(lastResults, ambientTempWarning);
}

// ── Render Results ──
function renderResults(r, ambientTempWarning) {
  const panel    = document.getElementById('result-panel');
  const card     = document.getElementById('result-status-card');
  const badge    = document.getElementById('status-badge');

  // Status styling
  card.className = 'result-panel';
  if (r.status === 'fail')   { card.classList.add('fail-panel'); }
  if (r.status === 'review') { card.classList.add('review-panel'); }

  // Badge
  badge.className = 'status-badge-lg';
  if (r.status === 'pass') {
    badge.className += ' status-pass-lg';
    badge.innerHTML = '<i class="fas fa-check-circle"></i> PASS';
  } else if (r.status === 'fail') {
    badge.className += ' status-fail-lg';
    badge.innerHTML = '<i class="fas fa-times-circle"></i> FAIL';
  } else {
    badge.className += ' status-review-lg';
    badge.innerHTML = '<i class="fas fa-exclamation-triangle"></i> REVIEW';
  }

  // Numbers
  document.getElementById('res-adj-current').textContent =
    `${fmt(r.adjustedRequiredWithMargin)} A` +
    (r.designMarginPct > 0 ? ` (incl. ${r.designMarginPct}% margin)` : '');
  
  document.getElementById('res-derated').textContent =
    r.deratedFuseCurrent !== null ? `${fmt(r.deratedFuseCurrent)} A` : '—';

  document.getElementById('res-derated-sub').textContent =
    r.deratedFuseCurrent !== null
      ? `${fmt(r.fuseRating)} A × ${r.tempDeratingFactor} × ${r.addDeratingFactor} = ${fmt(r.deratedFuseCurrent)} A`
      : 'No fuse evaluated';

  const marginEl = document.getElementById('res-margin');
  if (r.marginAmps !== null) {
    const sign = r.marginAmps >= 0 ? '+' : '';
    marginEl.textContent = `${sign}${fmt(r.marginAmps)} A`;
    marginEl.style.color = r.marginAmps >= 0 ? '#15803d' : '#b91c1c';
  } else {
    marginEl.textContent = '—';
    marginEl.style.color = '';
  }

  // Loading bar
  const loadPct = r.fuseLoadingPct;
  const adjPct  = r.adjustedLoadingPct;
  document.getElementById('res-loading-pct').textContent =
    loadPct !== null ? `${fmt(loadPct)}%` : '—';
  document.getElementById('res-adj-loading-pct').textContent =
    adjPct !== null ? `${fmt(adjPct)}%` : '—';

  const bar = document.getElementById('loading-bar');
  if (loadPct !== null) {
    const barW = Math.min(loadPct, 100);
    bar.style.width = `${barW}%`;
    bar.className = 'loading-bar-fill';
    if (loadPct > 100)       bar.classList.add('fill-red');
    else if (loadPct > 80)   bar.classList.add('fill-amber');
    else                     bar.classList.add('fill-green');
  } else {
    bar.style.width = '0%';
    bar.className = 'loading-bar-fill fill-green';
  }

  // Recommended fuse
  const recWrapper = document.getElementById('rec-fuse-wrapper');
  const recValue   = document.getElementById('rec-fuse-value');
  const recNote    = document.getElementById('rec-fuse-note');

  if (r.recommendedFuseA !== null) {
    recWrapper.style.display = 'block';
    recValue.textContent = `${r.recommendedFuseA} A`;
    recNote.innerHTML = `Smallest generic rating where Fuse Rating × ${r.tempDeratingFactor} × ${r.addDeratingFactor} ≥ ${fmt(r.adjustedRequiredWithMargin)} A.<br>
      <strong>Generic selectable ratings only.</strong> Not every rating is available for every fuse type, voltage, manufacturer, or application. Verify with manufacturer.`;
  } else {
    recWrapper.style.display = 'block';
    recValue.textContent = 'Not found';
    recNote.textContent = 'No standard rating in the generic list can meet the derated requirement. Apply a higher-rated fuse and confirm with manufacturer data.';
  }

  // Soft Warnings
  const warningsContainer = document.getElementById('soft-warnings');
  warningsContainer.innerHTML = '';

  if (ambientTempWarning) {
    warningsContainer.innerHTML += `
      <div class="soft-warning">
        <i class="fas fa-exclamation-triangle"></i>
        <span>Ambient temperature is outside the typical range (−40 °C to +85 °C). Verify input is correct.</span>
      </div>`;
  }

  // Elevated ambient + no derating
  const ambTemp = r.ambientTempC;
  if (ambTemp !== null && ambTemp > 35 && r.tempDeratingFactor === 1.0) {
    warningsContainer.innerHTML += `
      <div class="soft-warning">
        <i class="fas fa-thermometer-three-quarters"></i>
        <span><strong>Elevated ambient temperature detected but no temperature derating applied.</strong> Verify fuse manufacturer derating data and apply the appropriate correction factor.</span>
      </div>`;
  }

  if (r.status === 'fail') {
    warningsContainer.innerHTML += `
      <div class="soft-warning" style="background:#fef2f2; border-color:#fca5a5; border-left-color:#ef4444; color:#991b1b;">
        <i class="fas fa-times-circle" style="color:#ef4444;"></i>
        <span><strong>FAIL:</strong> The derated fuse current (${fmt(r.deratedFuseCurrent)} A) is less than the adjusted required current (${fmt(r.adjustedRequiredWithMargin)} A). Select a higher-rated fuse and verify with manufacturer data.</span>
      </div>`;
  }

  (r.reviewReasons || []).forEach(reason => {
    warningsContainer.innerHTML += `
      <div class="soft-warning">
        <i class="fas fa-exclamation-triangle"></i>
        <span>${reason}</span>
      </div>`;
  });

  warningsContainer.innerHTML += `
    <div class="info-warning">
      <i class="fas fa-info-circle"></i>
      <span>This result is based on current derating only. Final fuse selection must be confirmed against manufacturer data, fuse holder rating, enclosure conditions, local code, system voltage, and protection coordination requirements.</span>
    </div>`;

  // Summary
  document.getElementById('summary-text').textContent = r.summaryText;

  // Show panel
  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth' });
}

// ── Summary Text Builder ──
function buildSummaryText(p) {
  const dateStr = new Date().toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
  const project = p.siteName ? `Project: ${p.siteName}` : '';
  const circuit = p.circuitId ? `Circuit: ${p.circuitId}` : '';
  const header  = [project, circuit].filter(Boolean).join(' | ');

  let status = p.status.toUpperCase();
  let verdict = '';
  if (p.status === 'pass') {
    verdict = `The selected ${p.fuseRating !== null ? p.fuseRating + ' A' : ''} fuse derates to ${p.deratedCurrent !== null ? fmt(p.deratedCurrent) + ' A' : '—'} at the applied derating factors (temp factor: ${p.tempDerating}, additional factor: ${p.addDerating}). The adjusted required current is ${fmt(p.adjustedWithMargin)} A. The selected fuse appears acceptable based on current derating only, with an estimated margin of ${p.marginAmps !== null ? fmt(p.marginAmps) + ' A' : '—'}.`;
  } else if (p.status === 'fail') {
    verdict = `The selected ${p.fuseRating !== null ? p.fuseRating + ' A' : ''} fuse derates to ${p.deratedCurrent !== null ? fmt(p.deratedCurrent) + ' A' : '—'} at the applied derating factors (temp factor: ${p.tempDerating}, additional factor: ${p.addDerating}). The adjusted required current is ${fmt(p.adjustedWithMargin)} A. The derated fuse current is insufficient. A minimum fuse of ${p.recommendedFuse !== null ? p.recommendedFuse + ' A' : 'higher than available standard rating'} (generic reference) should be considered.`;
  } else {
    verdict = `The evaluation returned a REVIEW status. Inputs require additional verification before fuse selection can be confirmed. Adjusted required current: ${fmt(p.adjustedWithMargin)} A.`;
  }

  const disclaimer = 'Final selection must be verified against manufacturer data, fuse holder rating, enclosure conditions, local code, and protection coordination requirements. No NEC, IEC, UL, OEM, or project compliance is implied.';

  const lines = [
    `Level3Support — Fuse Derating Calculator`,
    `Date: ${dateStr}`,
    header ? header : null,
    `---`,
    `Mode: ${p.fuseRating !== null ? 'Check Selected Fuse' : 'Recommend Minimum Fuse'}`,
    `Circuit Type: ${p.circuitType}  |  Load Type: ${p.loadType}  |  Fuse Type: ${p.fuseType}`,
    `Load Current: ${p.loadCurrent} A  |  CC Factor: ${p.ccFactor}×  |  Margin: ${p.designMargin}%`,
    `Temp Derating: ${p.tempDerating}×  |  Additional Derating: ${p.addDerating}×`,
    p.fuseRating !== null ? `Selected Fuse: ${p.fuseRating} A` : null,
    `---`,
    `Adjusted Required Current: ${fmt(p.adjustedRequired)} A (before margin)`,
    `Adjusted Required w/ Margin: ${fmt(p.adjustedWithMargin)} A`,
    `Derated Fuse Current: ${p.deratedCurrent !== null ? fmt(p.deratedCurrent) + ' A' : 'N/A'}`,
    `Margin: ${p.marginAmps !== null ? (p.marginAmps >= 0 ? '+' : '') + fmt(p.marginAmps) + ' A' : 'N/A'}`,
    `Recommended Min. Fuse (generic): ${p.recommendedFuse !== null ? p.recommendedFuse + ' A' : 'Not found in standard list'}`,
    `Status: ${status}`,
    `---`,
    verdict,
    `---`,
    disclaimer,
    p.holderNotes ? `Holder/Enclosure Notes: ${p.holderNotes}` : null,
    p.mfrNotes    ? `Manufacturer Notes: ${p.mfrNotes}`        : null,
  ].filter(Boolean);

  return lines.join('\n');
}

// ── Copy Summary ──
function copySummary() {
  if (!lastResults) return;
  navigator.clipboard.writeText(lastResults.summaryText).then(() => {
    const btn = document.getElementById('copy-summary-btn');
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    setTimeout(() => btn.innerHTML = orig, 2000);
  });
}

// ── Export JSON ──
function exportJSON() {
  if (!lastResults) return;
  const payload = JSON.stringify(lastResults, null, 2);
  const blob    = new Blob([payload], { type: 'application/json' });
  const url     = URL.createObjectURL(blob);
  const a       = document.createElement('a');
  const ts      = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  a.href        = url;
  a.download    = `fuse_derating_${ts}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ── Reset ──
function resetForm() {
  document.getElementById('site-name').value    = '';
  document.getElementById('circuit-id').value   = '';
  document.getElementById('circuit-type').value = 'pv-string';
  document.getElementById('load-type').value    = 'continuous';
  document.getElementById('load-current').value = '';
  document.getElementById('cc-factor').value    = '1.25';
  document.getElementById('fuse-rating').value  = '';
  document.getElementById('fuse-type').value    = 'gPV';
  document.getElementById('ambient-temp').value = '';
  document.getElementById('temp-derating').value = '1.00';
  document.getElementById('add-derating').value  = '1.00';
  document.getElementById('design-margin').value = '0';
  document.getElementById('holder-notes').value  = '';
  document.getElementById('mfr-notes').value     = '';
  document.getElementById('fuses-grouped').value = '';
  document.getElementById('enclosure-temp').value = '';
  document.getElementById('system-voltage').value = '';
  document.getElementById('ac-dc').value          = '';
  document.getElementById('isc-note').value       = '';
  document.getElementById('coord-notes').value    = '';

  document.getElementById('result-panel').style.display = 'none';
  hideError();
  lastResults = null;
}

// ── Helpers ──
function fmt(val) {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return parseFloat(val.toFixed(2)).toString();
}

function round2(val) {
  return Math.round(val * 100) / 100;
}

function showError(msg) {
  const el = document.getElementById('validation-error');
  el.textContent = msg;
  el.style.display = 'block';
  el.scrollIntoView({ behavior: 'smooth' });
}

function hideError() {
  const el = document.getElementById('validation-error');
  el.style.display = 'none';
  el.textContent   = '';
}
