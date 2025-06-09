/**
 * Parameter Comparison Tool - JavaScript Functions
 * 
 * Table of Contents:
 * 1. Global Variables and State
 * 2. Initialization
 * 3. File Upload Handling
 * 4. CSV Processing
 * 5. Parameter Comparison Logic
 * 6. Table Generation and Display
 * 7. Search and Filter Functions
 * 8. Statistics Calculation
 * 9. UI Update Functions
 * 10. Utility Functions
 */

/**
 * 1. Global Variables and State
 * ----------------------------
 */
let files = {};
let allParameters = [];
let comparisonData = [];
let showOnlyDifferences = false;
let searchTerm = '';

/**
 * 2. Initialization
 * ----------------
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, checking Papa Parse...');
    
    // Check if Papa Parse loaded successfully
    if (typeof Papa !== 'undefined') {
        console.log('Papa Parse loaded successfully from local file');
        initializeParameterComparison();
    } else {
        console.warn('Papa Parse not loaded from local file, trying CDN fallback...');
        loadPapaParseFromCDN();
    }
});

/**
 * Fallback function to load Papa Parse from CDN if local file fails
 */
function loadPapaParseFromCDN() {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/papaparse@5.3.0/papaparse.min.js';
    script.onload = function() {
        console.log('Papa Parse loaded successfully from CDN fallback');
        initializeParameterComparison();
    };
    script.onerror = function() {
        console.error('Failed to load Papa Parse from both local file and CDN');
        showError('Failed to load Papa Parse library. Please check that papaparse.min.js is in your js/ folder, or check your internet connection for CDN fallback.');
    };
    document.head.appendChild(script);
}

function initializeParameterComparison() {
    console.log('Initializing Parameter Comparison Tool...');
    console.log('Papa Parse available:', typeof Papa !== 'undefined');
    
    // Check if Papa Parse is available
    if (typeof Papa === 'undefined') {
        console.error('Papa Parse library is not loaded! Make sure papaparse.min.js is in your /js/ folder.');
        showError('Papa Parse library not found. Please ensure papaparse.min.js is in your js/ folder.');
        return;
    }
    
    // Get DOM elements
    const fileInput = document.getElementById('file-input');
    const showDifferencesCheckbox = document.getElementById('show-differences-only');
    const searchInput = document.getElementById('search-input');
    const resetButton = document.getElementById('reset-button');
    
    // Add event listeners
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }
    
    if (showDifferencesCheckbox) {
        showDifferencesCheckbox.addEventListener('change', toggleDifferencesOnly);
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    if (resetButton) {
        resetButton.addEventListener('click', resetComparison);
    }
    
    console.log('Parameter Comparison Tool initialized successfully');
}

/**
 * 3. File Upload Handling
 * ----------------------
 */
async function handleFileUpload(event) {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;
    
    showLoading(true);
    clearError();
    
    try {
        const fileContent = await readFileAsText(uploadedFile);
        
        Papa.parse(fileContent, {
            header: true,
            skipEmptyLines: true,
            transformHeader: header => header.trim(),
            complete: (results) => {
                if (results.errors.length > 0) {
                    showError(`Error parsing ${uploadedFile.name}: ${results.errors[0].message}`);
                    showLoading(false);
                    return;
                }
                
                processCSVData(uploadedFile.name, results.data);
                showLoading(false);
                
                // Clear the file input for next upload
                event.target.value = '';
            }
        });
    } catch (err) {
        showError(`Error reading file: ${err.message}`);
        showLoading(false);
    }
}

function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error("File reading failed"));
        reader.readAsText(file);
    });
}

/**
 * 4. CSV Processing
 * ----------------
 */
function processCSVData(fileName, data) {
    console.log(`Processing CSV data for ${fileName}`, data);
    
    // Create a map of parameter names to their values
    const paramMap = {};
    data.forEach(row => {
        // Skip rows that don't have required fields
        if (!row['Parameter Name'] || !row['Current Value']) return;
        
        const paramName = String(row['Parameter Name']).trim();
        const rawValue = String(row['Current Value']).trim();
        const illustrate = row['Illustrate'] ? String(row['Illustrate']).trim() : '';
        
        paramMap[paramName] = {
            value: rawValue,                    // Keep original value for display
            normalizedValue: normalizeValue(rawValue),  // Normalized value for comparison
            illustrate: illustrate
        };
    });
    
    // Store the file data
    files[fileName] = {
        paramMap,
        displayName: fileName.replace('.csv', '')
    };
    
    // Update the UI
    updateUploadedFilesList();
    updateAllParameters();
    
    console.log(`Processed ${Object.keys(paramMap).length} parameters from ${fileName}`);
}

/**
 * 5. Parameter Comparison Logic
 * ----------------------------
 */
function updateAllParameters() {
    const paramSet = new Set();
    
    Object.values(files).forEach(file => {
        Object.keys(file.paramMap).forEach(param => {
            paramSet.add(param);
        });
    });
    
    allParameters = [...paramSet].sort();
    generateComparisonData();
    
    console.log(`Found ${allParameters.length} unique parameters across all files`);
}

function generateComparisonData() {
    if (Object.keys(files).length === 0) {
        comparisonData = [];
        updateDisplay();
        return;
    }
    
    const fileNames = Object.keys(files);
    
    comparisonData = allParameters.map(param => {
        const paramData = {
            parameterName: param,
            hasDifferences: false,
            values: {}
        };
        
        // Store parameters from each file
        fileNames.forEach(fileName => {
            const file = files[fileName];
            const paramInfo = file.paramMap[param];
            if (paramInfo) {
                paramData.values[file.displayName] = {
                    value: paramInfo.value,                    // Original value for display
                    normalizedValue: paramInfo.normalizedValue, // Normalized for comparison
                    illustrate: paramInfo.illustrate
                };
            } else {
                paramData.values[file.displayName] = {
                    value: 'N/A',
                    normalizedValue: 'N/A',
                    illustrate: ''
                };
            }
        });
        
        // Check if there are differences using NORMALIZED values
        const uniqueNormalizedValues = new Set();
        Object.values(paramData.values).forEach(v => {
            uniqueNormalizedValues.add(v.normalizedValue);
        });
        paramData.hasDifferences = uniqueNormalizedValues.size > 1;
        
        return paramData;
    });
    
    updateDisplay();
}

/**
 * 6. Table Generation and Display
 * ------------------------------
 */
function updateDisplay() {
    updateControlsVisibility();
    updateTable();
    updateStats();
    updateInstructionsVisibility();
}

function updateTable() {
    const tableContainer = document.getElementById('comparison-table-container');
    const tableHeader = document.getElementById('table-header');
    const tableBody = document.getElementById('table-body');
    
    if (Object.keys(files).length < 2) {
        tableContainer.style.display = 'none';
        return;
    }
    
    // Get filtered data
    const filteredData = getFilteredData();
    
    if (filteredData.length === 0) {
        tableContainer.style.display = 'none';
        updateStatus();
        return;
    }
    
    // Generate table header
    generateTableHeader(tableHeader);
    
    // Generate table body
    generateTableBody(tableBody, filteredData);
    
    tableContainer.style.display = 'block';
    updateStatus();
}

function generateTableHeader(headerElement) {
    const fileDisplayNames = Object.values(files).map(file => file.displayName);
    
    let headerHTML = `
        <tr>
            <th>Parameter Name</th>
            ${fileDisplayNames.map(name => `<th>${name}</th>`).join('')}
            <th>Allowed Values</th>
        </tr>
    `;
    
    headerElement.innerHTML = headerHTML;
}

function generateTableBody(bodyElement, data) {
    const fileDisplayNames = Object.values(files).map(file => file.displayName);
    
    let bodyHTML = data.map(param => {
        const rowClass = param.hasDifferences ? 'row-different' : '';
        
        const valuesHTML = fileDisplayNames.map(displayName => {
            const paramValue = param.values[displayName]?.value || 'N/A';
            const normalizedValue = param.values[displayName]?.normalizedValue || 'N/A';
            
            // Check if this specific value is different from others using normalized values
            const otherNormalizedValues = Object.values(param.values).map(v => v.normalizedValue);
            const isDifferent = param.hasDifferences && 
                               normalizedValue !== 'N/A' && 
                               otherNormalizedValues.some(v => v !== normalizedValue && v !== 'N/A');
            
            let cellClass = '';
            if (paramValue === 'N/A') {
                cellClass = 'value-na';
            } else if (isDifferent) {
                cellClass = 'value-different';
            }
            
            return `<td class="${cellClass}">${paramValue}</td>`;
        }).join('');
        
        const illustrate = Object.values(param.values)[0]?.illustrate || 'N/A';
        
        return `
            <tr class="${rowClass}">
                <td class="parameter-name">${param.parameterName}</td>
                ${valuesHTML}
                <td class="value-na">${illustrate}</td>
            </tr>
        `;
    }).join('');
    
    bodyElement.innerHTML = bodyHTML;
}

/**
 * 7. Search and Filter Functions
 * -----------------------------
 */
function getFilteredData() {
    let filtered = comparisonData;
    
    // Filter by differences if checkbox is checked
    if (showOnlyDifferences) {
        filtered = filtered.filter(item => item.hasDifferences);
    }
    
    // Filter by search term
    if (searchTerm) {
        filtered = filtered.filter(item => 
            item.parameterName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    return filtered;
}

function toggleDifferencesOnly() {
    const checkbox = document.getElementById('show-differences-only');
    showOnlyDifferences = checkbox.checked;
    updateDisplay();
}

function handleSearch(event) {
    searchTerm = event.target.value;
    updateDisplay();
}

/**
 * 8. Statistics Calculation
 * ------------------------
 */
function updateStats() {
    const statsSection = document.getElementById('stats-section');
    
    if (Object.keys(files).length < 2 || comparisonData.length === 0) {
        statsSection.style.display = 'none';
        return;
    }
    
    // Calculate statistics
    const totalParams = allParameters.length;
    const differentParams = comparisonData.filter(p => p.hasDifferences).length;
    const missingParams = comparisonData.filter(p => 
        Object.values(p.values).some(v => v.normalizedValue === 'N/A')
    ).length;
    
    // Update display
    document.getElementById('total-parameters').textContent = totalParams;
    document.getElementById('different-parameters').textContent = differentParams;
    document.getElementById('missing-parameters').textContent = missingParams;
    
    statsSection.style.display = 'block';
}

/**
 * 9. UI Update Functions
 * ---------------------
 */
function updateUploadedFilesList() {
    const filesList = document.getElementById('uploaded-files-list');
    const fileCount = document.getElementById('file-count');
    
    fileCount.textContent = Object.keys(files).length;
    
    if (Object.keys(files).length === 0) {
        filesList.innerHTML = '<p class="no-files-message">No files uploaded yet</p>';
        return;
    }
    
    const filesHTML = Object.keys(files).map((fileName) => `
        <div class="file-item">
            <span class="file-item-name">• ${fileName} (${files[fileName].displayName})</span>
            <a href="#" class="remove-file-btn" onclick="removeFile('${fileName}')">Remove</a>
        </div>
    `).join('');
    
    filesList.innerHTML = filesHTML;
}

function updateControlsVisibility() {
    const controlsSection = document.getElementById('comparison-controls');
    
    if (Object.keys(files).length > 1) {
        controlsSection.style.display = 'block';
    } else {
        controlsSection.style.display = 'none';
    }
}

function updateInstructionsVisibility() {
    const instructions = document.getElementById('instructions');
    
    if (Object.keys(files).length < 2) {
        instructions.style.display = 'block';
    } else {
        instructions.style.display = 'none';
    }
}

function updateStatus() {
    const parametersShown = document.getElementById('parameters-shown');
    const differencesNote = document.getElementById('differences-note');
    const searchNote = document.getElementById('search-note');
    
    const filteredData = getFilteredData();
    parametersShown.textContent = filteredData.length;
    
    // Show/hide differences note
    if (showOnlyDifferences) {
        differencesNote.style.display = 'inline';
    } else {
        differencesNote.style.display = 'none';
    }
    
    // Show/hide search note
    if (searchTerm) {
        searchNote.textContent = ` matching "${searchTerm}"`;
        searchNote.style.display = 'inline';
    } else {
        searchNote.style.display = 'none';
    }
}

function showLoading(show) {
    const loadingMessage = document.getElementById('loading-message');
    loadingMessage.style.display = show ? 'block' : 'none';
}

function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function clearError() {
    const errorElement = document.getElementById('error-message');
    errorElement.style.display = 'none';
    errorElement.textContent = '';
}

/**
 * 10. Utility Functions
 * --------------------
 */

/**
 * Normalize a parameter value for comparison
 * @param {string} value - The raw value to normalize
 * @returns {string} - The normalized value
 */
function normalizeValue(value) {
    if (!value || value === 'N/A') return value;
    
    // Convert to string and trim whitespace
    let normalized = String(value).trim();
    
    // Handle empty values
    if (normalized === '' || normalized === 'null' || normalized === 'undefined') {
        return 'N/A';
    }
    
    // Try to normalize as a number
    const numValue = parseFloat(normalized);
    if (!isNaN(numValue)) {
        // If it's a valid number, normalize decimal representation
        // Remove trailing zeros and unnecessary decimal points
        if (Number.isInteger(numValue)) {
            const result = numValue.toString();
            // Log normalization for debugging (only for different results)
            if (result !== normalized) {
                console.log(`Normalized number: "${normalized}" → "${result}"`);
            }
            return result;
        } else {
            // For decimals, keep reasonable precision and remove trailing zeros
            const result = parseFloat(numValue.toFixed(10)).toString();
            if (result !== normalized) {
                console.log(`Normalized decimal: "${normalized}" → "${result}"`);
            }
            return result;
        }
    }
    
    // Handle boolean-like values
    const lowerValue = normalized.toLowerCase();
    if (lowerValue === 'true' || lowerValue === 'yes' || lowerValue === 'on' || lowerValue === '1') {
        if (normalized !== 'true') {
            console.log(`Normalized boolean: "${normalized}" → "true"`);
        }
        return 'true';
    }
    if (lowerValue === 'false' || lowerValue === 'no' || lowerValue === 'off' || lowerValue === '0') {
        if (normalized !== 'false') {
            console.log(`Normalized boolean: "${normalized}" → "false"`);
        }
        return 'false';
    }
    
    // For other text values, normalize case and whitespace
    const result = normalized.toLowerCase().replace(/\s+/g, ' ');
    if (result !== normalized) {
        console.log(`Normalized text: "${normalized}" → "${result}"`);
    }
    return result;
}

function removeFile(fileName) {
    delete files[fileName];
    updateUploadedFilesList();
    updateAllParameters();
}

function resetComparison() {
    // Reset all state
    files = {};
    allParameters = [];
    comparisonData = [];
    showOnlyDifferences = false;
    searchTerm = '';
    
    // Reset UI elements
    document.getElementById('file-input').value = '';
    document.getElementById('show-differences-only').checked = false;
    document.getElementById('search-input').value = '';
    
    // Update display
    updateUploadedFilesList();
    updateDisplay();
    clearError();
    
    console.log('Parameter comparison tool reset');
}

// Export functions for global access (for onclick handlers)
window.removeFile = removeFile;
window.resetComparison = resetComparison;