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