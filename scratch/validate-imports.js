const fs = require('fs');
const urls = [
  'torque-spec-finder.html',
  'commissioning-punchlist.html',
  'site-visit-report.html',
  'rca-template-builder.html',
  'jha-pre-task-plan.html',
  'loto-checklist.html',
  'technical-reference-search.html'
];
urls.forEach(u => {
  const content = fs.readFileSync(u, 'utf8');
  const css = [];
  const regex = /<link\s+rel="stylesheet"\s+href="([^"]+)">/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    css.push(match[1]);
  }
  console.log(u, 'css:', css);
  css.forEach(c => {
    const cleanPath = c.split('?')[0];
    const exists = fs.existsSync(cleanPath);
    console.log('  -', c, exists ? 'OK' : 'MISSING!!!');
  });
});
