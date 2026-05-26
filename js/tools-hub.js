/**
 * Level3Support — tools-hub.js
 * Lead Developer: Andres Provero (@aprovero)
 * © 2026 Level3Support
 */

// Store all tools data
let allTools = [];

// DOM elements
let toolsGrid;
let emptyState;
let loadingIndicator;
let searchInput;

/**
 * Page Initialization
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Tools hub initialization started');
    
    // Cache DOM elements
    toolsGrid = document.getElementById('tools-grid');
    emptyState = document.getElementById('empty-state');
    loadingIndicator = document.getElementById('loading-indicator');
    searchInput = document.getElementById('search-input');
    
    console.log('DOM elements cached:', { 
        toolsGrid: !!toolsGrid, 
        emptyState: !!emptyState, 
        loadingIndicator: !!loadingIndicator 
    });
    
    // Load tools data
    loadToolsData();
    
    // Set up global search if input exists
    if (searchInput) {
        searchInput.addEventListener('input', handleFilterChange);
    }
    
    console.log('Tools hub initialization completed');
});

/**
 * Load tools data from JSON file
 */
function loadToolsData() {
    console.log('Loading tools data from JSON...');
    showLoadingState(true);
    
    // Try to load from JSON file
    fetch('./tools-data.json')
        .then(response => {
            console.log('JSON response status:', response.status);
            if (!response.ok) {
                throw new Error(`Failed to load tools data: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Received tools data:', data);
            
            if (data && data.tools && data.tools.length > 0) {
                allTools = data.tools;
                console.log('Using JSON data with', allTools.length, 'tools');
                renderTools(allTools);
                initializeFilters();
            } else {
                console.warn('No tools data found in JSON file');
                handleError('No tools data available.');
            }
        })
        .catch(error => {
            console.error('Error loading tools data:', error);
            console.log('JSON loading failed, trying fallback data');
            loadFallbackData();
        })
        .finally(() => {
            showLoadingState(false);
        });
}

/**
 * Fallback data if JSON file is not available
 */
function loadFallbackData() {
    console.log('Loading fallback data');
    allTools = [
        {
            "id": 1,
            "name": "Level3Support Request Form",
            "category": "Legacy / Archive",
            "status": "Legacy",
            "description": "Legacy request form for Support, RCA, Training and other Level3Support services.",
            "url": "support-request.html",
            "tags": ["Support", "Form"],
            "notes": "Archived, replaced by local procedures."
        },
        {
            "id": 2,
            "name": "Technical Documentation Database",
            "category": "Legacy / Archive",
            "status": "Legacy",
            "description": "Legacy searchable database of technical documents, manuals, and troubleshooting guides.",
            "url": "training-request.html",
            "tags": ["Reference", "Database"],
            "notes": "Offline legacy document library."
        },
        {
            "id": 3,
            "name": "Training Catalog",
            "category": "Legacy / Archive",
            "status": "Legacy",
            "description": "Legacy list of available training courses and resources provided by Level3Support.",
            "url": "training.html",
            "tags": ["Catalog", "Training"],
            "notes": "Legacy training materials index."
        },
        {
            "id": 4,
            "name": "Training Evaluation Form",
            "category": "Legacy / Archive",
            "status": "Legacy",
            "description": "Legacy training evaluation form (English / Spanish).",
            "url": "evaluation.html",
            "tags": ["Form", "Training"],
            "notes": "Archived course feedback form."
        },
        {
            "id": 5,
            "name": "ABB REJ603 Relay Configuration Tool",
            "category": "SCADA & Diagnostics",
            "status": "Active",
            "description": "Interactive configuration utility for ABB REJ603 protection relays.",
            "url": "rej603-configurator.html",
            "tags": ["Relay", "Protection", "Commissioning"],
            "notes": "Fully operational field tool."
        },
        {
            "id": 6,
            "name": "SG1+x Parameter Comparison Tool",
            "category": "SCADA & Diagnostics",
            "status": "Active",
            "description": "Compare SG1+x parameters and settings between multiple field units.",
            "url": "parameter-comparison.html",
            "tags": ["Inverter", "Parameters", "SCADA"],
            "notes": "Excellent troubleshooting tool."
        },
        {
            "id": 7,
            "name": "UMCG Data Analysis Tool",
            "category": "SCADA & Diagnostics",
            "status": "In Progress",
            "description": "Used for analyzing and parsing data logs extracted from UMCG devices.",
            "url": "analyzer.html",
            "tags": ["UMCG", "Data", "Diagnostics"],
            "notes": "Development in progress."
        },  
        {
            "id": 8,
            "name": "PDP Module Fault Code Interpreter",
            "category": "SCADA & Diagnostics",
            "status": "Active",
            "description": "Decode and troubleshoot PDP power module status and fault codes.",
            "url": "fault-interpreter.html",
            "tags": ["PDP", "Faults", "Troubleshooting"],
            "notes": "Updated with premium styling."
        },
        {
            "id": 9,
            "name": "PV String Sizer & VOC Calculator",
            "category": "Calculators",
            "status": "In Progress",
            "description": "Calculate optimal solar PV string configurations based on panel Voc, thermal coefficients, and ambient temperatures.",
            "url": "tool-placeholder.html?tool=pv-string-sizer",
            "tags": ["PV", "Calculators", "Design"],
            "notes": "Planned for Agent 2"
        },
        {
            "id": 10,
            "name": "BESS Cable Sizing Calculator",
            "category": "Calculators",
            "status": "In Progress",
            "description": "Calculate DC and AC cable ampacity, voltage drop, and temperature derating factors for battery racks.",
            "url": "tool-placeholder.html?tool=bess-cable-sizer",
            "tags": ["BESS", "Calculators", "Electrical"],
            "notes": "Planned for Agent 2"
        },
        {
            "id": 11,
            "name": "Torque & Bolted Connection Calculator",
            "category": "Calculators",
            "status": "In Progress",
            "description": "Lookup target bolt pre-loads and recommended mechanical torques based on size, grade, and lubrication.",
            "url": "tool-placeholder.html?tool=torque-calculator",
            "tags": ["PV", "BESS", "Mechanical", "Torque"],
            "notes": "Planned for Agent 2"
        },
        {
            "id": 12,
            "name": "PV Insulation Resistance (Megger) Tester",
            "category": "PV Field Tools",
            "status": "In Progress",
            "description": "Calculate minimum acceptable insulation values and log field megger readings for array commissioning.",
            "url": "tool-placeholder.html?tool=pv-megger-tester",
            "tags": ["PV", "Testing", "Commissioning"],
            "notes": "Planned for Agent 3"
        },
        {
            "id": 13,
            "name": "BESS Cell Voltage Imbalance Calculator",
            "category": "BESS Field Tools",
            "status": "In Progress",
            "description": "Analyze battery rack pack balancing, identify outlier cells, and calculate standard deviation of voltage imbalance.",
            "url": "tool-placeholder.html?tool=bess-cell-imbalance",
            "tags": ["BESS", "Testing", "Commissioning"],
            "notes": "Planned for Agent 4"
        },
        {
            "id": 14,
            "name": "Transformer Turns Ratio (TTR) Form",
            "category": "Electrical Test Forms",
            "status": "In Progress",
            "description": "Log and calculate deviations for high-voltage and medium-voltage transformer turns ratio testing.",
            "url": "tool-placeholder.html?tool=ttr-form",
            "tags": ["Electrical", "Testing", "Report"],
            "notes": "Planned for Agent 5"
        },
        {
            "id": 15,
            "name": "LOTO Verification Checklist",
            "category": "HSE",
            "status": "In Progress",
            "description": "Standardized digital checklist to audit and confirm Lockout/Tagout energy isolation integrity before starting work.",
            "url": "tool-placeholder.html?tool=loto-checklist",
            "tags": ["HSE", "LOTO", "Safety"],
            "notes": "Critical safety template."
        },
        {
            "id": 16,
            "name": "Arc Flash Boundary Calculator",
            "category": "HSE",
            "status": "In Progress",
            "description": "Determine shock protection boundaries, limited/restricted space access, and required PPE levels based on fault current.",
            "url": "tool-placeholder.html?tool=arc-flash",
            "tags": ["HSE", "Electrical", "Safety"],
            "notes": "Critical safety calculation tool."
        },
        {
            "id": 17,
            "name": "Daily Commissioning Progress Report",
            "category": "Reports & Templates",
            "status": "In Progress",
            "description": "Generate standard supervisor shift handovers detailing completed tests, safety issues, and pending punchlists.",
            "url": "tool-placeholder.html?tool=daily-progress",
            "tags": ["Report", "Commissioning", "SCADA"],
            "notes": "Planned for Agent 6"
        },
        {
            "id": 18,
            "name": "String Current Imbalance Calculator",
            "category": "PV Field Tools",
            "status": "Active",
            "description": "Compare solar string currents against the average and flag abnormal strings above a configurable deviation threshold.",
            "url": "string-imbalance.html",
            "tags": ["PV", "Testing", "Commissioning", "Field"],
            "notes": "Agent 3 — Mobile-first, CSV export."
        },
        {
            "id": 19,
            "name": "DC Voltage Sanity Check Tool",
            "category": "PV Field Tools",
            "status": "Active",
            "description": "Check if measured string voltage matches expected module count and temperature-corrected Voc or Vmp values.",
            "url": "dc-voltage-sanity.html",
            "tags": ["PV", "Testing", "Commissioning", "Field"],
            "notes": "Agent 3 — Includes issue hint diagnostics."
        },
        {
            "id": 20,
            "name": "Inverter Start-Up Checklist",
            "category": "PV Field Tools",
            "status": "Active",
            "description": "Structured digital commissioning checklist covering visual inspection, DC/AC checks, grounding, comms, firmware, and first energization.",
            "url": "inverter-startup.html",
            "tags": ["PV", "Commissioning", "Checklist", "Field"],
            "notes": "Agent 3 — Print and JSON export."
        },
        {
            "id": 21,
            "name": "IV Curve Test Result Log",
            "category": "PV Field Tools",
            "status": "Active",
            "description": "Record and categorize IV curve test results consistently across field teams. Supports defect classification and CSV export.",
            "url": "iv-curve-log.html",
            "tags": ["PV", "Testing", "Report", "Field"],
            "notes": "Agent 3 — Multi-record log with status summary."
        },
        {
            "id": 22,
            "name": "Firmware Version Tracker",
            "category": "PV Field Tools",
            "status": "Active",
            "description": "Track firmware versions across inverters, dataloggers, routers, and other field equipment. Flags devices requiring updates.",
            "url": "firmware-tracker.html",
            "tags": ["PV", "BESS", "Commissioning", "Report"],
            "notes": "Agent 3 — Auto-derives update required status."
        },
        {
            "id": 18,
            "name": "BESS Capacity / Energy Test Form",
            "category": "BESS Field Tools",
            "status": "Active",
            "description": "Record utility-scale BESS charge and discharge tests, and calculate duration, delivered energy, and round-trip efficiency.",
            "url": "bess-capacity-test.html",
            "tags": ["BESS", "Testing", "Commissioning", "Report"],
            "notes": "Fully functional energy test logger."
        },
        {
            "id": 19,
            "name": "Battery Rack / Container Inspection Checklist",
            "category": "BESS Field Tools",
            "status": "Active",
            "description": "Structured digital inspection checklist for container seals, HVAC, fire suppression, grounding, and cell temperature spread.",
            "url": "bess-rack-inspection.html",
            "tags": ["BESS", "Commissioning", "Testing"],
            "notes": "Mobile-ready inspection tool with failed highlights."
        },
        {
            "id": 20,
            "name": "BESS Pre-Energization Checklist",
            "category": "BESS Field Tools",
            "status": "Active",
            "description": "Comprehensive pre-energization safety checklist tracking isolation, grounding, communications, and safety signage.",
            "url": "bess-pre-energization.html",
            "tags": ["BESS", "Commissioning", "Safety"],
            "notes": "Ensures all prerequisite tests are complete before powering up."
        },
        {
            "id": 21,
            "name": "Spare Parts Cross-Reference Tool",
            "category": "BESS Field Tools",
            "status": "Active",
            "description": "Searchable local registry of BESS spare parts compatibility, criticality, stock requirements, and lead times.",
            "url": "bess-spare-parts.html",
            "tags": ["BESS", "Reference", "Database"],
            "notes": "Supports adding/editing entries and CSV import/export."
        }
    ];
    
    console.log('Fallback data loaded with', allTools.length, 'tools');
    renderTools(allTools);
    initializeFilters();
}

/**
 * Render tools as cards
 */
function renderTools(tools) {
    console.log('Rendering', tools.length, 'tool tiles');
    
    if (!toolsGrid) {
        console.warn('Tools grid element not found');
        return;
    }
    
    // Clear the grid
    toolsGrid.innerHTML = '';
    
    // Show empty state if no tools
    if (tools.length === 0) {
        if (emptyState) {
            emptyState.style.display = 'block';
        }
        toolsGrid.style.display = 'none';
        return;
    } else {
        if (emptyState) {
            emptyState.style.display = 'none';
        }
        toolsGrid.style.display = 'grid';
    }
    
    // Sort tools so that legacy tools always go last
    const sortedTools = [...tools].sort((a, b) => {
        const aLegacy = (a.status || '').toLowerCase() === 'legacy';
        const bLegacy = (b.status || '').toLowerCase() === 'legacy';
        if (aLegacy && !bLegacy) return 1;
        if (!aLegacy && bLegacy) return -1;
        return 0;
    });
    
    // Create card for each tool
    sortedTools.forEach(tool => {
        const card = createToolCard(tool);
        toolsGrid.appendChild(card);
    });
}

/**
 * Create a premium Tool Card Component
 */
function createToolCard(tool) {
    const card = document.createElement('div');
    card.className = 'tool-tile';
    card.setAttribute('data-id', tool.id);
    
    // Create structured class for category
    const cleanCategory = tool.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    card.setAttribute('data-category', cleanCategory);
    
    // Get appropriate icon for category
    const icon = getCategoryIcon(tool.category);
    
    // Generate Tags HTML
    const tagsHTML = (tool.tags || [])
        .map(tag => `<span class="tag-badge tag-${tag.toLowerCase()}">${tag}</span>`)
        .join('');
        
    // Get Status Badge details
    const statusText = tool.status || 'Active';
    const cleanStatus = statusText.toLowerCase().replace(/\s+/g, '-');
    
    // Create card HTML
    card.innerHTML = `
        <button class="tool-settings-btn" title="Configure Tool Settings" onclick="event.stopPropagation(); openToolSettings(${tool.id})">
            <i class="fas fa-cog"></i>
        </button>
        <div class="tile-content">
            <div class="tile-header">
                <span class="status-badge status-${cleanStatus}">${statusText}</span>
                <span class="tile-category">${tool.category}</span>
            </div>
            <div class="tile-main">
                <div class="tile-icon-wrapper">
                    <i class="${icon}"></i>
                </div>
                <div class="tile-info">
                    <h3 class="tile-title">${tool.name}</h3>
                    <p class="tile-description">${tool.description}</p>
                </div>
            </div>
            <div class="tile-footer">
                <div class="tile-tags">
                    ${tagsHTML}
                </div>
                <div class="tile-action-indicator">
                    <i class="fas fa-arrow-right"></i>
                </div>
            </div>
        </div>
    `;
    
    // Click action handler
    if (tool.url) {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Tool selected:', tool.name, '->', tool.url);
            window.location.href = tool.url;
        });
        card.style.cursor = 'pointer';
    } else {
        card.style.cursor = 'default';
        card.style.opacity = '0.6';
    }
    
    return card;
}

/**
 * Get FontAwesome icon class for category
 */
function getCategoryIcon(category) {
    const iconMap = {
        'calculators': 'fas fa-calculator',
        'pv-field-tools': 'fas fa-solar-panel',
        'bess-field-tools': 'fas fa-battery-three-quarters',
        'electrical-test-forms': 'fas fa-file-invoice-dollar',
        'scada-diagnostics': 'fas fa-network-wired',
        'reports-templates': 'fas fa-file-medical-alt',
        'reference-guides': 'fas fa-book-open',
        'hse': 'fas fa-shield-alt',
        'legacy-archive': 'fas fa-archive'
    };
    
    const key = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return iconMap[key] || 'fas fa-wrench';
}

/**
 * Initialize filter functionality
 */
function initializeFilters() {
    // Select category radios/checkboxes
    const checkboxes = document.querySelectorAll('.filter-checkbox input[type="checkbox"], .filter-checkbox input[type="radio"]');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleFilterChange);
    });
}

/**
 * Handle filter and search combined change
 */
function handleFilterChange() {
    const checkboxes = document.querySelectorAll('.filter-checkbox input[type="checkbox"]');
    const allCheckbox = document.querySelector('.filter-checkbox input[value="all"]');
    const categoryCheckboxes = document.querySelectorAll('.filter-checkbox input[type="checkbox"]:not([value="all"])');
    
    // Handle All Tools logic
    if (this && this.value === 'all') {
        if (this.checked) {
            categoryCheckboxes.forEach(cb => cb.checked = false);
        }
    } else if (this && this.checked && allCheckbox) {
        allCheckbox.checked = false;
    }
    
    // Get checked categories
    const selectedCategories = [];
    checkboxes.forEach(checkbox => {
        if (checkbox.checked && checkbox.value !== 'all') {
            selectedCategories.push(checkbox.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
        }
    });
    
    // Get search term
    const searchVal = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    // Filter tools
    const filteredTools = allTools.filter(tool => {
        const matchesCategory = selectedCategories.length === 0 || 
                                (allCheckbox && allCheckbox.checked) ||
                                selectedCategories.includes(tool.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                                
        const matchesSearch = searchVal === '' || 
                              tool.name.toLowerCase().includes(searchVal) ||
                              tool.description.toLowerCase().includes(searchVal) ||
                              (tool.tags || []).some(t => t.toLowerCase().includes(searchVal));
                              
        return matchesCategory && matchesSearch;
    });
    
    console.log(`Filtered tools: ${filteredTools.length} of ${allTools.length}`);
    renderTools(filteredTools);
}

/**
 * Show or hide loading state
 */
function showLoadingState(isLoading) {
    if (!loadingIndicator || !toolsGrid || !emptyState) {
        console.warn('Missing DOM elements for loading state');
        return;
    }
    
    if (isLoading) {
        loadingIndicator.style.display = 'flex';
        toolsGrid.style.display = 'none';
        emptyState.style.display = 'none';
    } else {
        loadingIndicator.style.display = 'none';
    }
}

/**
 * Handle errors
 */
function handleError(message) {
    if (toolsGrid) {
        toolsGrid.innerHTML = `<div class="error-message" style="grid-column: 1 / -1; text-align: center; padding: 2rem; background: white; border-radius: 8px; border: 1px solid var(--border-color);">${message}</div>`;
        toolsGrid.style.display = 'grid';
    }
    if (emptyState) {
        emptyState.style.display = 'none';
    }
}

/**
 * PWA Service Worker loading
 */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(reg => {
    console.log('[PWA] Service Worker registered:', reg);
  }).catch(err => {
    console.warn('[PWA] SW registration failed:', err);
  });
}

/**
 * Dynamic Tool Settings Modal configuration
 */
let selectedToolIdForSettings = null;

function openToolSettings(toolId) {
    selectedToolIdForSettings = toolId;
    const tool = allTools.find(t => t.id === toolId);
    if (!tool) return;
    
    // Check if modal container already exists in DOM, if not create it
    let modal = document.getElementById('tool-settings-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'tool-settings-modal';
        modal.className = 'modal-overlay hidden';
        document.body.appendChild(modal);
    }
    
    // Categories options
    const categories = [
        "Calculators",
        "PV Field Tools",
        "BESS Field Tools",
        "Electrical Test Forms",
        "SCADA & Diagnostics",
        "Reports & Templates",
        "Reference Guides",
        "HSE",
        "Legacy / Archive"
    ];
    
    const catOptions = categories
        .map(cat => `<option value="${cat}" ${tool.category === cat ? 'selected' : ''}>${cat}</option>`)
        .join('');
        
    // Status options
    const statuses = ["Active", "In Progress", "Legacy", "Disabled", "Admin Only"];
    const statOptions = statuses
        .map(status => `<option value="${status}" ${tool.status === status ? 'selected' : ''}>${status}</option>`)
        .join('');
        
    modal.innerHTML = `
        <div class="modal-content fade-in" style="background:#ffffff; color:#1e293b; padding:2rem; border-radius:16px; border:1px solid #e2e8f0; max-width:550px; text-align:left;">
            <h3 style="font-family:'Outfit',sans-serif; font-size:1.3rem; font-weight:700; margin-top:0; margin-bottom:1.5rem; display:flex; align-items:center; gap:0.5rem; color:#0f172a; text-align:left;">
                <i class="fas fa-cog" style="color:var(--primary-color);"></i> Configure Tool: ${tool.name}
            </h3>
            
            <div class="form-group" style="margin-bottom:1rem; border:none; padding:0;">
                <label style="font-weight:600; font-size:0.9rem; margin-bottom:0.4rem; display:block; color:#475569;">Tool Name</label>
                <input type="text" id="settings-tool-name" value="${tool.name}" style="width:100%; padding:0.6rem; border:1px solid #cbd5e1; border-radius:6px; font-size:0.9rem; margin:0;">
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
                <div class="form-group" style="margin:0; border:none; padding:0;">
                    <label style="font-weight:600; font-size:0.9rem; margin-bottom:0.4rem; display:block; color:#475569;">Category</label>
                    <select id="settings-tool-category" style="width:100%; padding:0.6rem; border:1px solid #cbd5e1; border-radius:6px; font-size:0.9rem; margin:0; height:40px;">
                        ${catOptions}
                    </select>
                </div>
                <div class="form-group" style="margin:0; border:none; padding:0;">
                    <label style="font-weight:600; font-size:0.9rem; margin-bottom:0.4rem; display:block; color:#475569;">Status</label>
                    <select id="settings-tool-status" style="width:100%; padding:0.6rem; border:1px solid #cbd5e1; border-radius:6px; font-size:0.9rem; margin:0; height:40px;">
                        ${statOptions}
                    </select>
                </div>
            </div>
            
            <div class="form-group" style="margin-bottom:1rem; border:none; padding:0;">
                <label style="font-weight:600; font-size:0.9rem; margin-bottom:0.4rem; display:block; color:#475569;">Tags (comma-separated)</label>
                <input type="text" id="settings-tool-tags" value="${(tool.tags || []).join(', ')}" style="width:100%; padding:0.6rem; border:1px solid #cbd5e1; border-radius:6px; font-size:0.9rem; margin:0;">
            </div>
            
            <div class="form-group" style="margin-bottom:1.5rem; border:none; padding:0;">
                <label style="font-weight:600; font-size:0.9rem; margin-bottom:0.4rem; display:block; color:#475569;">Description</label>
                <textarea id="settings-tool-desc" style="width:100%; padding:0.6rem; border:1px solid #cbd5e1; border-radius:6px; font-size:0.9rem; min-height:80px; margin:0;">${tool.description}</textarea>
            </div>
            
            <div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:1.5rem;">
                <button onclick="closeToolSettings()" style="width:auto; min-height:auto; padding:0.5rem 1.25rem; background:#cbd5e1; color:#334155; border-radius:6px; margin:0;" class="button-secondary">Cancel</button>
                <button onclick="saveToolSettings()" style="width:auto; min-height:auto; padding:0.5rem 1.25rem; background:var(--primary-color); color:white; border-radius:6px; margin:0;">Save Settings</button>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

function closeToolSettings() {
    const modal = document.getElementById('tool-settings-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function saveToolSettings() {
    if (selectedToolIdForSettings === null) return;
    
    const tool = allTools.find(t => t.id === selectedToolIdForSettings);
    if (!tool) return;
    
    // Read input values
    const newName = document.getElementById('settings-tool-name').value.trim();
    const newCat = document.getElementById('settings-tool-category').value;
    const newStatus = document.getElementById('settings-tool-status').value;
    const newTagsStr = document.getElementById('settings-tool-tags').value;
    const newDesc = document.getElementById('settings-tool-desc').value.trim();
    
    if (!newName) {
        alert('Tool Name is required.');
        return;
    }
    
    // Parse tags array
    const newTags = newTagsStr
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean);
        
    // Update local registry
    tool.name = newName;
    tool.category = newCat;
    tool.status = newStatus;
    tool.tags = newTags;
    tool.description = newDesc;
    
    console.log('Updated tool settings for:', tool.name);
    
    // Close modal
    closeToolSettings();
    
    // Re-render tools grid to show the fresh settings immediately!
    handleFilterChange();
}