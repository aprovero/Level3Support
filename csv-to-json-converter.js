// csv-to-json-converter.js

// This script converts both PV and BESS CSV files to a unified JSON format

// You'll need to install these dependencies:
// npm install papaparse fs lodash

const fs = require('fs');
const Papa = require('papaparse');
const _ = require('lodash');

// Simple local paths for renamed files
const PV_CSV_PATH = './PV.csv';
const BESS_CSV_PATH = './BESS.csv';
const OUTPUT_JSON_PATH = 'unified-training-data.js';

// Add debugging info
console.log('Current working directory:', process.cwd());
console.log('Looking for PV file at:', PV_CSV_PATH);
console.log('PV file exists?', fs.existsSync(PV_CSV_PATH));
console.log('Looking for BESS file at:', BESS_CSV_PATH);
console.log('BESS file exists?', fs.existsSync(BESS_CSV_PATH));

// Read CSV files
const pvCsvData = fs.readFileSync(PV_CSV_PATH, 'utf8');
const bessCsvData = fs.readFileSync(BESS_CSV_PATH, 'utf8');

// Parse CSV files
const parsedPvData = Papa.parse(pvCsvData, {
    header: true,
    skipEmptyLines: true
}).data;

const parsedBessData = Papa.parse(bessCsvData, {
    header: true,
    skipEmptyLines: true
}).data;

// Process PV data
function processPvData(data) {
    const result = {};
    
    // Group by Category and Subject
    const grouped = _.groupBy(data, item => {
        return `${item.Category || 'Uncategorized'}-${item.Subject || 'General'}`;
    });
    
    // Process each group
    Object.keys(grouped).forEach(key => {
        const items = grouped[key];
        if (items.length === 0) return;
        
        const firstItem = items[0];
        const category = firstItem.Category || 'Uncategorized';
        const subject = firstItem.Subject || 'General';
        
        // Create a clean ID
        const id = `pv-${_.kebabCase(subject)}`;
        
        // Collect all knowledge levels
        const levels = _.uniq(items
            .map(item => item['Knowledge Level'])
            .filter(Boolean));
        
        // Process topics
        const topics = items.map(item => ({
            title: item.Topic || 'N/A',
            details: item['Detail Requirements'] || 'N/A',
            level: item['Knowledge Level'] || 'N/A',
            courseName: item['Course Name'] || '',
            courseModule: item['Course module'] || ''
        }));
        
        // Store in result
        result[id] = {
            id,
            system: 'pv',
            category,
            subject,
            levels,
            topics
        };
    });
    
    return result;
}

// Process BESS data
function processBessData(data) {
    const result = {};
    
    // Group by Category and Subject
    const grouped = _.groupBy(data, item => {
        return `${item.Category || 'Uncategorized'}-${item.Subject || 'General'}`;
    });
    
    // Process each group
    Object.keys(grouped).forEach(key => {
        const items = grouped[key];
        if (items.length === 0) return;
        
        const firstItem = items[0];
        const category = firstItem.Category || 'Uncategorized';
        const subject = firstItem.Subject || 'General';
        
        // Create a clean ID
        const id = `bess-${_.kebabCase(subject)}`;
        
        // Collect all knowledge levels
        const levels = _.uniq(items
            .map(item => item.Level)
            .filter(Boolean));
        
        // Process topics
        const topics = items.map(item => ({
            title: item['Ability Requirement'] || 'N/A',
            details: item['Detailed Instruction'] || 'N/A',
            level: item.Level || 'N/A',
            courseName: item['Training Document Name'] || '',
            courseModule: item['Training Material'] || ''
        }));
        
        // Store in result
        result[id] = {
            id,
            system: 'bess',
            category,
            subject,
            levels,
            topics
        };
    });
    
    return result;
}

// Process both datasets
const pvData = processPvData(parsedPvData);
const bessData = processBessData(parsedBessData);

// Merge the datasets
const unifiedData = {
    ...pvData,
    ...bessData
};

// Create the output JavaScript file
const outputContent = `// unified-training-data.js
const trainingData = ${JSON.stringify(unifiedData, null, 2)};
`;

// Write to file
fs.writeFileSync(OUTPUT_JSON_PATH, outputContent);

console.log(`Processed ${Object.keys(pvData).length} PV entries`);
console.log(`Processed ${Object.keys(bessData).length} BESS entries`);
console.log(`Total: ${Object.keys(unifiedData).length} entries`);
console.log(`Output saved to ${OUTPUT_JSON_PATH}`);