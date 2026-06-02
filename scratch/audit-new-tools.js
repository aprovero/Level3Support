const fs = require('fs');
const path = require('path');

const repoDir = 'c:\\Users\\aprov\\OneDrive\\Desktop\\GitHub\\Level3Support';
const tools = [
  'bess-capacity-test.html',
  'bess-pre-energization.html',
  'bess-rack-inspection.html',
  'bess-spare-parts.html'
];

console.log(`Auditing 4 new BESS tools for template compliance...\n`);

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
    issues.push('Missing or incorrect Back to Tool Library link (must target index.html#tools)');
  }
  
  // 2. CSS Links
  if (!content.includes('css/core.css') || !content.includes('css/components.css')) {
    issues.push('Missing css/core.css or css/components.css link');
  }
  
  // 3. Header title section
  if (!content.includes('tool-header-section')) {
    issues.push('Missing .tool-header-section container');
  }
  
  // 4. Warning box
  if (!content.includes('warning-box') && !content.includes('safety-warning')) {
    issues.push('Missing warning-box or safety disclaimer');
  }
  
  // 5. Assumptions box
  if (!content.includes('assumptions-box')) {
    issues.push('Missing assumptions-box (Sizing Logic / Assumptions)');
  }
  
  // 6. Common JS import
  if (!content.includes('js/common.js')) {
    issues.push('Missing js/common.js script reference');
  }
  
  if (issues.length > 0) {
    console.log(`[${file}] ❌ Issues found:`);
    issues.forEach(iss => console.log(`  - ${iss}`));
  } else {
    console.log(`[${file}]  100% Compliant!`);
  }
});
