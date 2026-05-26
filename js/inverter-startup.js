/**
 * Inverter Start-Up Commissioning Checklist
 * Level3Support — js/inverter-startup.js
 */

// ── Checklist Data ──────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 'visual',
    title: '1. Visual Inspection',
    icon: 'fa-eye',
    color: '#3b82f6',
    items: [
      'Cabinet / enclosure free of physical damage, corrosion, or contamination',
      'All cable glands, conduit fittings, and penetrations properly sealed',
      'Cooling fans / filters present, clean, and unobstructed',
      'Internal wiring tidy — no loose, pinched, or chafed cables',
      'All warning labels and arc-flash labels present and legible',
      'AC / DC busbars free of foreign objects, tools, or debris',
    ]
  },
  {
    id: 'dc',
    title: '2. DC Side Checks',
    icon: 'fa-sun',
    color: '#f59e0b',
    items: [
      'DC string polarity verified with calibrated meter before connection',
      'All string fuses / breakers rated correctly per single-line diagram',
      'DC insulation resistance test (Megger) completed — results within project spec',
      'String currents balanced within site-accepted tolerance',
      'DC bus voltage within inverter rated input range',
    ]
  },
  {
    id: 'ac',
    title: '3. AC Side Checks',
    icon: 'fa-bolt',
    color: '#8b5cf6',
    items: [
      'Phase rotation confirmed as clockwise (L1–L2–L3) with phase rotation meter',
      'Grid voltage within inverter AC operating range (all three phases)',
      'Grid frequency within inverter spec (typically 49.5–50.5 Hz)',
      'AC contactor / circuit breaker rated correctly per design',
      'No abnormal voltage unbalance between phases (< site limit)',
    ]
  },
  {
    id: 'grounding',
    title: '4. Grounding & Bonding',
    icon: 'fa-shield-alt',
    color: '#10b981',
    items: [
      'DC negative / positive ground configuration verified per design',
      'Inverter frame to ground bus continuity confirmed with resistance meter',
      'All grounding conductors terminated and torqued to spec',
      'Ground bond resistance below project acceptance threshold',
    ]
  },
  {
    id: 'comms',
    title: '5. Communications',
    icon: 'fa-network-wired',
    color: '#06b6d4',
    items: [
      'Modbus / RS-485 address set per SCADA tag list',
      'Ethernet or fibre link established — link light confirmed',
      'SCADA polling confirmed — all registers responding',
      'Remote E-Stop / TRIP signal wired, labelled, and tested',
    ]
  },
  {
    id: 'firmware',
    title: '6. Firmware & Software',
    icon: 'fa-microchip',
    color: '#6366f1',
    items: [
      'Firmware version confirmed — matches approved version on record',
      'Parameter file loaded and verified against approved parameter sheet',
      'Country / grid code selected correctly per project requirement',
      'Reactive power / power factor curve configured per grid operator requirement',
    ]
  },
  {
    id: 'safety',
    title: '7. Safety Interlocks',
    icon: 'fa-lock',
    color: '#ef4444',
    items: [
      'E-Stop loop tested — inverter trips on activation',
      'External TRIP signal tested — confirmed functional end-to-end',
      'Fire suppression / detection system integration confirmed (if applicable)',
      'All arc-flash labels, PPE requirements, and safety signage in place',
    ]
  },
  {
    id: 'energize',
    title: '8. First Energization',
    icon: 'fa-power-off',
    color: '#f97316',
    items: [
      'DC switch-on sequence followed per manufacturer commissioning procedure',
      'No abnormal sounds, smells, or alarms on DC energization',
      'AC breaker close procedure followed — personnel clear of equipment',
      'No abnormal AC transients observed during connection',
      'DC and AC voltage values on HMI match meter measurements',
    ]
  },
  {
    id: 'ramp',
    title: '9. Power Ramp & Production',
    icon: 'fa-chart-line',
    color: '#22c55e',
    items: [
      'Active power output visible and ramping on HMI / SCADA',
      'Reactive power mode confirmed — matches specified grid code',
      'Cooling fans operational — confirmed running during ramp',
      'No thermal alarms or high-temperature warnings after 15-minute run',
      'AC power quality within spec (THD, voltage, frequency)',
    ]
  },
  {
    id: 'final',
    title: '10. Final Status',
    icon: 'fa-clipboard-check',
    color: '#64748b',
    items: [
      'Cabinet / door properly closed, latched, and locked',
      'Cabinet key handed to authorized site personnel',
      'Commissioning test records updated and signed',
      'Snag list / punch list items documented and submitted',
      'Sign-off witnessed by supervisor or client representative',
    ]
  }
];

// ── State ───────────────────────────────────────────────────────────────────
// items map: `${sectionId}-${itemIndex}` → { status: '', notes: '' }
const itemState = {};

let totalItems = 0;

// ── Init ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Default date to today
  document.getElementById('check-date').value = new Date().toISOString().slice(0, 10);

  renderChecklist();
  updateProgress();
});

// ── Render Checklist ─────────────────────────────────────────────────────────
function renderChecklist() {
  const container = document.getElementById('checklist-container');
  container.innerHTML = '';
  totalItems = 0;

  SECTIONS.forEach(section => {
    totalItems += section.items.length;

    const sectionEl = document.createElement('div');
    sectionEl.className = 'checklist-section';
    sectionEl.id = `section-${section.id}`;

    // Header
    const header = document.createElement('div');
    header.className = 'section-header';
    header.innerHTML = `
      <div class="section-icon" style="background:${section.color};">
        <i class="fas ${section.icon}"></i>
      </div>
      <span class="section-title">${section.title}</span>
      <span class="section-badge" id="badge-${section.id}">0/${section.items.length}</span>
      <i class="fas fa-chevron-down section-chevron"></i>
    `;
    header.addEventListener('click', () => toggleSection(sectionEl, header));

    // Body
    const body = document.createElement('div');
    body.className = 'section-body';

    section.items.forEach((itemText, idx) => {
      const key = `${section.id}-${idx}`;
      itemState[key] = { status: '', notes: '' };

      const itemEl = document.createElement('div');
      itemEl.className = 'checklist-item';
      itemEl.id = `item-${key}`;

      itemEl.innerHTML = `
        <div class="item-row">
          <span class="item-text">${itemText}</span>
          <div class="item-toggles">
            <button class="toggle-btn" data-key="${key}" data-status="pass" title="Pass">✓ Pass</button>
            <button class="toggle-btn" data-key="${key}" data-status="fail" title="Fail">✗ Fail</button>
            <button class="toggle-btn" data-key="${key}" data-status="na"   title="Not Applicable">— N/A</button>
          </div>
        </div>
        <textarea class="item-notes" id="notes-${key}" placeholder="Notes (optional)..." rows="2"></textarea>
      `;

      // Toggle button click
      itemEl.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => handleToggle(key, btn.dataset.status, section.id, section.items.length));
      });

      // Notes change
      itemEl.querySelector(`#notes-${key}`).addEventListener('input', e => {
        itemState[key].notes = e.target.value;
      });

      body.appendChild(itemEl);
    });

    sectionEl.appendChild(header);
    sectionEl.appendChild(body);
    container.appendChild(sectionEl);
  });
}

// ── Toggle Item Status ───────────────────────────────────────────────────────
function handleToggle(key, newStatus, sectionId, sectionTotal) {
  const state = itemState[key];

  // If clicking current status again, deselect
  if (state.status === newStatus) {
    state.status = '';
  } else {
    state.status = newStatus;
  }

  // Update row appearance
  const itemEl = document.getElementById(`item-${key}`);
  itemEl.className = 'checklist-item';
  if (state.status === 'pass') itemEl.classList.add('row-pass');
  if (state.status === 'fail') itemEl.classList.add('row-fail');
  if (state.status === 'na')   itemEl.classList.add('row-na');

  // Update toggle button active state
  itemEl.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.classList.remove('active-pass', 'active-fail', 'active-na');
    if (btn.dataset.status === state.status) {
      btn.classList.add(`active-${state.status}`);
    }
  });

  // Show/hide notes textarea
  const notesEl = document.getElementById(`notes-${key}`);
  if (state.status) {
    notesEl.classList.add('visible');
  } else {
    notesEl.classList.remove('visible');
  }

  updateSectionBadge(sectionId, sectionTotal);
  updateProgress();
  updateSummaries();
}

// ── Section Badge ─────────────────────────────────────────────────────────────
function updateSectionBadge(sectionId, total) {
  const section = SECTIONS.find(s => s.id === sectionId);
  const addressed = section.items.filter((_, idx) => itemState[`${sectionId}-${idx}`].status !== '').length;
  document.getElementById(`badge-${sectionId}`).textContent = `${addressed}/${total}`;
}

// ── Progress Bar ─────────────────────────────────────────────────────────────
function updateProgress() {
  let pass = 0, fail = 0, na = 0;
  Object.values(itemState).forEach(s => {
    if (s.status === 'pass') pass++;
    else if (s.status === 'fail') fail++;
    else if (s.status === 'na') na++;
  });

  const addressed = pass + fail + na;
  const pct = totalItems > 0 ? Math.round((addressed / totalItems) * 100) : 0;

  document.getElementById('progress-pct').textContent = `${pct}%`;
  document.getElementById('progress-fill').style.width = `${pct}%`;
  document.getElementById('chip-total').textContent = totalItems;
  document.getElementById('chip-pass').textContent = pass;
  document.getElementById('chip-fail').textContent = fail;
  document.getElementById('chip-na').textContent = na;
}

// ── Summaries ─────────────────────────────────────────────────────────────────
function updateSummaries() {
  // Failed items
  const failedBody = document.getElementById('failed-body');
  const failedItems = [];
  SECTIONS.forEach(section => {
    section.items.forEach((text, idx) => {
      const key = `${section.id}-${idx}`;
      if (itemState[key].status === 'fail') {
        failedItems.push({ section: section.title, text, notes: itemState[key].notes });
      }
    });
  });

  if (failedItems.length === 0) {
    failedBody.innerHTML = '<p class="summary-empty">No failed items.</p>';
  } else {
    failedBody.innerHTML = failedItems.map(item => `
      <div class="summary-item">
        <span class="summary-item-label"><i class="fas fa-times-circle" style="color:var(--error-color);"></i> [${item.section}] ${item.text}</span>
        ${item.notes ? `<span class="summary-item-notes">Notes: ${item.notes}</span>` : ''}
      </div>
    `).join('');
  }

  // N/A items
  const naBody = document.getElementById('na-body');
  const naItems = [];
  SECTIONS.forEach(section => {
    section.items.forEach((text, idx) => {
      const key = `${section.id}-${idx}`;
      if (itemState[key].status === 'na') {
        naItems.push({ section: section.title, text, notes: itemState[key].notes });
      }
    });
  });

  if (naItems.length === 0) {
    naBody.innerHTML = '<p class="summary-empty">No N/A items.</p>';
  } else {
    naBody.innerHTML = naItems.map(item => `
      <div class="summary-item">
        <span class="summary-item-label"><i class="fas fa-minus-circle" style="color:var(--text-secondary);"></i> [${item.section}] ${item.text}</span>
        ${item.notes ? `<span class="summary-item-notes">Notes: ${item.notes}</span>` : ''}
      </div>
    `).join('');
  }
}

// ── Toggle Section Collapse ───────────────────────────────────────────────────
function toggleSection(sectionEl, header) {
  const body = sectionEl.querySelector('.section-body');
  const collapsed = sectionEl.classList.toggle('section-collapsed');
  body.style.display = collapsed ? 'none' : 'block';
}

// ── Toggle Summary Panels ─────────────────────────────────────────────────────
function toggleSummary(bodyId) {
  const body = document.getElementById(bodyId);
  body.style.display = body.style.display === 'none' ? 'block' : 'none';
}

// ── Export JSON ───────────────────────────────────────────────────────────────
function exportJSON() {
  const header = {
    siteName:   document.getElementById('site-name').value,
    inverterId: document.getElementById('inv-id').value,
    invModel:   document.getElementById('inv-model').value,
    engineer:   document.getElementById('engineer').value,
    date:       document.getElementById('check-date').value,
    weather:    document.getElementById('weather').value,
    exportedAt: new Date().toISOString()
  };

  // Collect stats
  let pass = 0, fail = 0, na = 0;
  Object.values(itemState).forEach(s => {
    if (s.status === 'pass') pass++;
    else if (s.status === 'fail') fail++;
    else if (s.status === 'na') na++;
  });
  const addressed = pass + fail + na;
  const pct = totalItems > 0 ? Math.round((addressed / totalItems) * 100) : 0;

  const sections = SECTIONS.map(section => ({
    section: section.title,
    items: section.items.map((text, idx) => {
      const key = `${section.id}-${idx}`;
      return {
        item: text,
        status: itemState[key].status || 'not-checked',
        notes: itemState[key].notes
      };
    })
  }));

  const payload = {
    header,
    summary: { total: totalItems, pass, fail, na, completionPct: pct },
    sections,
    disclaimer: 'This checklist does not replace the approved manufacturer commissioning procedure.'
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  const siteSlug = (header.siteName || 'site').replace(/\s+/g, '_').toLowerCase();
  const invSlug  = (header.inverterId || 'inv').replace(/\s+/g, '_').toLowerCase();
  a.href     = url;
  a.download = `startup_checklist_${siteSlug}_${invSlug}_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
