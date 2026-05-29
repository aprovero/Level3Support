const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'tools-data.json');
const outputPath = path.join(__dirname, 'l3-navigator-registry.json');

const rawData = fs.readFileSync(inputPath, 'utf8');
const data = JSON.parse(rawData);

// Heuristic function to generate useCases
function generateUseCases(tool) {
  const useCases = [];
  const nameLower = tool.name.toLowerCase();
  const descLower = tool.description.toLowerCase();
  const tagsLower = tool.tags ? tool.tags.map(t => t.toLowerCase()) : [];

  if (nameLower.includes('pv string sizer')) {
    useCases.push("size a PV string", "calculate VOC", "determine min/max modules per string");
  } else if (nameLower.includes('bess cable sizing')) {
    useCases.push("calculate BESS cable size", "estimate cable ampacity", "calculate battery cable voltage drop");
  } else if (nameLower.includes('megger')) {
    useCases.push("check insulation resistance", "run a megger test", "record ground fault test results");
  } else if (nameLower.includes('cell voltage imbalance')) {
    useCases.push("check battery cell imbalance", "analyze module voltage spread");
  } else if (nameLower.includes('transformer turns ratio')) {
    useCases.push("record ttr test", "transformer turns ratio test form", "a transformer test form");
  } else if (nameLower.includes('loto')) {
    useCases.push("a LOTO checklist", "verify lockout tagout", "zero energy verification");
  } else if (nameLower.includes('daily commissioning')) {
    useCases.push("a daily commissioning report", "create a daily progress report");
  } else if (nameLower.includes('string current imbalance')) {
    useCases.push("check string current imbalance", "compare solar string currents");
  } else if (nameLower.includes('dc voltage sanity')) {
    useCases.push("check string voltage", "dc voltage sanity check");
  } else if (nameLower.includes('inverter start-up')) {
    useCases.push("inverter startup checklist", "commission an inverter");
  } else if (nameLower.includes('iv curve log')) {
    useCases.push("record iv curve tests", "iv curve test result log");
  } else if (nameLower.includes('firmware version')) {
    useCases.push("track firmware versions", "check equipment firmware");
  } else if (nameLower.includes('performance ratio')) {
    useCases.push("calculate PR", "pv performance ratio calculator");
  } else if (nameLower.includes('modbus')) {
    useCases.push("decode modbus registers", "modbus troubleshooting");
  }

  // Generic fallback if empty
  if (useCases.length === 0) {
    if (tagsLower.includes('calculator')) {
      useCases.push(`calculate ${tool.name.toLowerCase().replace('calculator', '').trim()}`);
    } else if (tagsLower.includes('form') || tool.category.includes('Form')) {
      useCases.push(`record ${tool.name.toLowerCase().replace('form', '').trim()} results`);
    } else {
      useCases.push(`use the ${tool.name} tool`);
    }
  }

  return useCases;
}

const registryTools = data.tools.map(tool => {
  return {
    id: tool.id,
    name: tool.name,
    category: tool.category,
    url: tool.url,
    description: tool.description,
    keywords: tool.tags || [],
    aliases: tool.aliases || [],
    useCases: generateUseCases(tool)
  };
});

const registry = { tools: registryTools };

fs.writeFileSync(outputPath, JSON.stringify(registry, null, 2), 'utf8');
console.log(`Generated ${outputPath} with ${registryTools.length} tools.`);
