const fs = require('fs');
const path = require('path');

const repoDir = path.join(__dirname, '..', '..', '..', '..', '..', 'OneDrive', 'Desktop', 'GitHub', 'Level3Support');

const tools = [
  'alarm-timeline.html',
  'analyzer.html',
  'arc-flash.html',
  'battery-soc-imbalance-analyzer.html',
  'battery-temperature-spread.html',
  'bess-availability.html',
  'bess-cable-sizer.html',
  'bess-cell-imbalance.html',
  'cable-ampacity.html',
  'capa-tracker.html',
  'clean-vs-soiled-strings.html',
  'cleaning-roi.html',
  'clipping-curtailment-check.html',
  'commissioning-punchlist.html',
  'daily-progress.html',
  'dc-voltage-sanity.html',
  'electrical-test-forms.html',
  'fault-interpreter.html',
  'firmware-tracker.html',
  'fuse-derating-calculator.html',
  'grid-event-excursion-log.html',
  'hvac-delta-t.html',
  'inverter-capability-curve-check.html',
  'inverter-derating-analyzer.html',
  'inverter-startup.html',
  'irradiance-sensor-check.html',
  'iv-curve-log.html',
  'jha-pre-task-plan.html',
  'loto-checklist.html',
  'modbus-decoder.html',
  'number-base-converter.html',
  'parameter-comparison.html',
  'power-triangle.html',
  'pv-megger-tester.html',
  'pv-performance-ratio.html',
  'pv-string-sizer.html',
  'pv-weather-correction.html',
  'rca-template-builder.html',
  'rej603-configurator.html',
  'scada-tag-qaqc.html',
  'site-visit-report.html',
  'soiling-customer-report.html',
  'soiling-loss-estimator.html',
  'soiling-lost-energy.html',
  'string-imbalance.html',
  'technical-reference-search.html',
  'tracker-angle-qaqc.html',
  'ttr-form.html',
  'voltage-drop.html'
];

console.log(`Starting audit on ${tools.length} active tool files...\n`);

const results = [];

tools.forEach(file => {
  const filePath = path.join(repoDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`File does not exist: ${file}`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  const issues = [];
  
  // 1. Back link
  if (!content.includes('index.html#tools')) {
    const hasBackLink = content.includes('back-link') || content.includes('btn-back') || content.includes('Back to');
    if (hasBackLink) {
      issues.push('Back link target is not index.html#tools (or is misaligned)');
    } else {
      issues.push('Back to Tool Library link is missing completely');
    }
  }
  
  // 2. CSS Links
  if (!content.includes('css/core.css') || !content.includes('css/components.css')) {
    issues.push('Missing css/core.css or css/components.css stylesheet link');
  }
  
  // 3. Title Card (.tool-header-section)
  if (!content.includes('tool-header-section') && !content.includes('tool-title') && !file.includes('electrical-test-forms')) {
    issues.push('Missing standardized .tool-header-section header card container');
  }
  
  // 4. Safety Warning / Disclaimer (.warning-box)
  const hasWarning = content.includes('warning-box') || content.includes('safety-warning') || content.includes('disclaimer');
  if (!hasWarning) {
    issues.push('Missing safety warning / disclaimer box');
  } else if (content.includes('safety-warning')) {
    issues.push('Uses legacy .safety-warning class instead of standard .warning-box');
  }
  
  // 5. Assumptions / Math / Standards Box (.assumptions-box)
  if (!content.includes('assumptions-box') && !content.includes('calculation-basis') && !file.includes('electrical-test-forms')) {
    issues.push('Missing standard .assumptions-box for calculations or math basis');
  }
  
  // 6. Resources Card integration check
  if (!content.includes('tool-resources.js') && !content.includes('common.js')) {
    issues.push('Missing common.js or tool-resources.js to render footer/resources');
  }
  
  if (issues.length > 0) {
    results.push({ file, issues });
  }
});

console.log(`Audit completed. Found ${results.length} files with issues:\n`);
results.forEach(r => {
  console.log(`[${r.file}]`);
  r.issues.forEach(iss => console.log(`  - ${iss}`));
});
