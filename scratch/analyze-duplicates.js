const fs = require('fs');
const path = require('path');

const repoDir = path.join(__dirname, '..', '..', '..', '..', '..', 'OneDrive', 'Desktop', 'GitHub', 'Level3Support');
const dataPath = path.join(repoDir, 'tools-data.json');

try {
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const tools = data.tools || [];
  
  console.log(`Analyzing ${tools.length} registry tools for repetitions and redundancies...\n`);
  
  // 1. Check for exact duplicate IDs or URLs in JSON
  const idMap = new Map();
  const urlMap = new Map();
  const nameMap = new Map();
  
  tools.forEach(t => {
    // ID check
    if (idMap.has(t.id)) {
      idMap.get(t.id).push(t);
    } else {
      idMap.set(t.id, [t]);
    }
    
    // URL check (strip parameters)
    const cleanUrl = t.url.split('?')[0];
    if (urlMap.has(cleanUrl)) {
      urlMap.get(cleanUrl).push(t);
    } else {
      urlMap.set(cleanUrl, [t]);
    }
    
    // Name similarity check (lowercase)
    const normName = t.name.toLowerCase().trim();
    if (nameMap.has(normName)) {
      nameMap.get(normName).push(t);
    } else {
      nameMap.set(normName, [t]);
    }
  });
  
  console.log('=== 1. Duplicate IDs in tools-data.json ===');
  let duplicateIdsFound = false;
  for (const [id, list] of idMap.entries()) {
    if (list.length > 1) {
      duplicateIdsFound = true;
      console.log(`ID ${id} is defined multiple times:`);
      list.forEach(t => console.log(`  - "${t.name}" (${t.url})`));
    }
  }
  if (!duplicateIdsFound) console.log('None. All tool IDs are unique.');
  
  console.log('\n=== 2. Tools referencing the same HTML File (Overlapping Registry Entries) ===');
  let overlapUrlsFound = false;
  for (const [url, list] of urlMap.entries()) {
    if (list.length > 1) {
      // Ignore if they use query parameters (e.g. electrical-test-forms.html)
      const uniqueFullUrls = new Set(list.map(t => t.url));
      if (uniqueFullUrls.size === 1) {
        overlapUrlsFound = true;
        console.log(`URL "${url}" is shared by multiple registry entries:`);
        list.forEach(t => console.log(`  - ID ${t.id}: "${t.name}" (Status: ${t.status})`));
      }
    }
  }
  if (!overlapUrlsFound) console.log('None. All unique HTML files are mapped to distinct tool registry items.');
  
  console.log('\n=== 3. Similar / Identical Tool Names ===');
  let nameOverlapFound = false;
  for (const [name, list] of nameMap.entries()) {
    if (list.length > 1) {
      nameOverlapFound = true;
      console.log(`Name "${list[0].name}" is repeated:`);
      list.forEach(t => console.log(`  - ID ${t.id}: url "${t.url}" (Status: ${t.status})`));
    }
  }
  if (!nameOverlapFound) console.log('None. All registry tool names are distinct.');

  console.log('\n=== 4. Redundant HTML files on Disk (Unreferenced or Duplicate Names) ===');
  // Check files in the repo directory that are HTML but not in tools-data.json URL list
  const referencedFiles = new Set(tools.map(t => t.url.split('?')[0]));
  const diskFiles = fs.readdirSync(repoDir).filter(f => f.endsWith('.html'));
  
  console.log('Unreferenced HTML files on disk:');
  diskFiles.forEach(f => {
    if (!referencedFiles.has(f) && f !== 'index.html' && f !== '404.html' && f !== 'offline.html' && f !== 'tool-placeholder.html') {
      console.log(`  - [Unreferenced] ${f}`);
    }
  });

  // Check for suspicious name overlaps in files (e.g., pv-weather-correction.html vs weather-correction.html)
  console.log('\nPotential Overlapping/Redundant File Names on Disk:');
  const baseNames = diskFiles.map(f => f.replace('.html', ''));
  baseNames.forEach(b1 => {
    baseNames.forEach(b2 => {
      if (b1 !== b2 && b1.includes(b2) && b1.length > b2.length) {
        console.log(`  - Possible duplicate: "${b1}.html" may overlap with shorter file "${b2}.html"`);
      }
    });
  });

} catch (err) {
  console.error('Error running duplicate check:', err);
}
