/**
 * CoE Level 3 Support Portal - Tools Hub JavaScript
 * Updated for Windows 10 style tiles
 */

// Store all tools data
let allTools = [];

// DOM elements
let toolsGrid;
let emptyState;
let loadingIndicator;

/**
 * Page Initialization
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Tools hub initialization started');
    
    // Cache DOM elements
    toolsGrid = document.getElementById('tools-grid');
    emptyState = document.getElementById('empty-state');
    loadingIndicator = document.getElementById('loading-indicator');
    
    console.log('DOM elements cached:', { 
        toolsGrid: !!toolsGrid, 
        emptyState: !!emptyState, 
        loadingIndicator: !!loadingIndicator 
    });
    
    // Load tools data
    loadToolsData();
    
    console.log('Tools hub initialization completed');
});

/**
 * Load tools data from JSON file
 */
function loadToolsData() {
    console.log('Loading tools data from JSON...');
    showLoadingState(true);
    
    // Try to load from JSON file
    fetch('tools-data.json')
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
                renderTools(allTools);
                initializeFilters();
            } else {
                console.warn('No tools data found in JSON file');
                handleError('No tools data available.');
            }
        })
        .catch(error => {
            console.error('Error loading tools data:', error);
            // Fallback to sample data if JSON file is not available
            console.log('Using fallback sample data');
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
    allTools = [
        {
            id: 1,
            name: "CoE Support Request",
            category: "Form",
            description: "Request form for: Support, RCA, Training and other CoE services",
            url: "https://coelatam.onrender.com/",
            notes: "Use for all CoE-related requests"
        },
        {
            id: 2,
            name: "CoE Technical Documentation Database",
            category: "Reference", 
            description: "Searchable database of technical documents, manuals, and troubleshooting guides verified by CoE LATAM",
            url: "https://coelatam.onrender.com/documentation.html",
            notes: "Updated monthly"
        },
        {
            id: 3,
            name: "CoE LATAM Training Catalog",
            category: "Catalog",
            description: "Available training courses and resources provided by CoE LATAM",
            url: "https://coelatam.onrender.com/training.html",
            notes: ""
        },
        {
            id: 4,
            name: "Training Evaluation Form",
            category: "Form",
            description: "Official CoE LATAM training evaluation form",
            url: "https://coelatam.onrender.com/evaluation.html",
            notes: "Available in English, Spanish and Portuguese"
        },
        {
            id: 5,
            name: "ABB REJ603 Relay Configuration Tool",
            category: "Tool",
            description: "Interactive tool for configuring ABB REJ603 relays",
            url: "https://coelatam.onrender.com/rej603-configurator.html",
            notes: ""
        },
        {
            id: 6,
            name: "SG1+x Parameter Comparison Tool",
            category: "Tool",
            description: "Used for comparing SG1+x parameters between different units",
            url: "https://coelatam.onrender.com/parameter-comparison.html",
            notes: "Troubleshooting"
        },
        {
            id: 7,
            name: "UMCG Data Analysis Tool",
            category: "Tool",
            description: "Used for Analyzing data extracted from UMCG devices",
            url: "https://coelatam.onrender.com/data-analyzer.html",
            notes: "Troubleshooting"
        },  
        {
            id: 8,
            name: "UMCG&SG1+x PDP Module Fault Code Interpreter",
            category: "Tool",
            description: "Used for decoding PDP fault codes",
            url: "https://coelatam.onrender.com/PDP-fault.html",
            notes: "Troubleshooting"
        }
    ];
    
    renderTools(allTools);
    initializeFilters();
}

/**
 * Render tools as tiles
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
    
    // Create tile for each tool
    tools.forEach(tool => {
        const tile = createToolTile(tool);
        toolsGrid.appendChild(tile);
    });
}

/**
 * Create a tool tile element (Windows 10 style)
 */
function createToolTile(tool) {
    const tile = document.createElement('div');
    tile.className = 'tool-tile';
    tile.setAttribute('data-id', tool.id);
    tile.setAttribute('data-category', tool.category.toLowerCase().replace(/\s+/g, '-'));
    
    // Get appropriate icon for category
    const icon = getCategoryIcon(tool.category);
    
    // Determine if external link
    const isExternal = tool.category === 'External Link' || (tool.url && tool.url.startsWith('http'));
    
    // Create tile HTML
    tile.innerHTML = `
        <div class="tile-content">
            <div class="tile-icon">
                <i class="${icon}"></i>
            </div>
            <div class="tile-info">
                <h3 class="tile-title">${tool.name}</h3>
                <p class="tile-description">${tool.description}</p>
                <div class="tile-category">${tool.category.toUpperCase()}</div>
            </div>
        </div>
    `;
    
    // Add click handler
    if (tool.url) {
        tile.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Tile clicked:', tool.name, 'URL:', tool.url);
            
            if (isExternal) {
                window.open(tool.url, '_blank', 'noopener,noreferrer');
            } else {
                window.location.href = tool.url;
            }
        });
        
        // Add cursor pointer
        tile.style.cursor = 'pointer';
        
        // Add subtle hover effect
        tile.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        tile.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    } else {
        tile.style.cursor = 'default';
        tile.style.opacity = '0.6';
        console.log('No URL available for:', tool.name);
    }
    
    return tile;
}

/**
 * Get FontAwesome icon class for category
 */
function getCategoryIcon(category) {
    const iconMap = {
        'form': 'fas fa-file-alt',
        'reference': 'fas fa-book',
        'catalog': 'fas fa-list',
        'tool': 'fas fa-wrench',
        'calculator': 'fas fa-calculator',
        'template': 'fas fa-file-template',
        'external link': 'fas fa-external-link-alt',
        'external-link': 'fas fa-external-link-alt'
    };
    
    const key = category.toLowerCase().replace(/\s+/g, '-');
    return iconMap[key] || 'fas fa-cog'; // default icon
}

/**
 * Initialize filter functionality
 */
function initializeFilters() {
    const checkboxes = document.querySelectorAll('.filter-checkbox input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleFilterChange);
    });
}

/**
 * Handle filter changes
 */
function handleFilterChange() {
    const checkboxes = document.querySelectorAll('.filter-checkbox input[type="checkbox"]');
    const allCheckbox = document.querySelector('.filter-checkbox input[value="all"]');
    const categoryCheckboxes = document.querySelectorAll('.filter-checkbox input[type="checkbox"]:not([value="all"])');
    
    // If "all" checkbox was clicked
    if (this.value === 'all') {
        if (this.checked) {
            // Uncheck all category checkboxes
            categoryCheckboxes.forEach(cb => cb.checked = false);
        }
    } else {
        // If a category checkbox was clicked, uncheck "all"
        if (this.checked && allCheckbox) {
            allCheckbox.checked = false;
        }
    }
    
    // Get selected filters
    const selectedFilters = [];
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedFilters.push(checkbox.value);
        }
    });
    
    // If "all" is selected or no filters, show all tools
    if (selectedFilters.includes('all') || selectedFilters.length === 0) {
        renderTools(allTools);
        return;
    }
    
    // Filter tools based on selected categories
    const filteredTools = allTools.filter(tool => {
        const toolCategory = tool.category.toLowerCase().replace(/\s+/g, '-');
        return selectedFilters.includes(toolCategory);
    });
    
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
        toolsGrid.innerHTML = `<div class="error-message" style="grid-column: 1 / -1; text-align: center; padding: 2rem; background: white; border-radius: 4px; border: 1px solid #e9ecef;">${message}</div>`;
        toolsGrid.style.display = 'grid';
    }
    if (emptyState) {
        emptyState.style.display = 'none';
    }
}