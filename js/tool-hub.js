/**
 * CoE Level 3 Support Portal - Tools Hub JavaScript
 * Simple version that loads from JSON file
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
            name: "CoE Support Request from BU",
            category: "Form",
            description: "Request form for: Support, RCA, Training and other CoE services",
            url: "index.html",
            notes: "Use for all CoE-related requests"
        },
        {
            id: 2,
            name: "CoE Technical Documentation Database",
            category: "Reference", 
            description: "Searchable database of technical documents, manuals, and troubleshooting guides verified by CoE LATAM",
            url: "https://support.sungrowpower.com/errorcode",
            notes: "Updated monthly"
        },
        {
            id: 3,
            name: "CoE LATAM Training Catalog",
            category: "Catalog",
            description: "Available training courses and resources provided by CoE LATAM",
            url: "training.html",
            notes: ""
        },
        {
            id: 4,
            name: "Training Evaluation Form",
            category: "Form",
            description: "Official CoE LATAM training evaluation form",
            url: "evaluation.html",
            notes: "Available in English, Spanish and Portuguese"
        }
    ];
    
    renderTools(allTools);
    initializeFilters();
}

/**
 * Render tools as cards
 */
function renderTools(tools) {
    console.log('Rendering', tools.length, 'tool cards');
    
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
    
    // Create card for each tool
    tools.forEach(tool => {
        const card = createToolCard(tool);
        toolsGrid.appendChild(card);
    });
}

/**
 * Create a tool card element
 */
function createToolCard(tool) {
    const card = document.createElement('div');
    card.className = 'tool-card';
    card.setAttribute('data-id', tool.id);
    
    // Get appropriate category class
    const categoryClass = getCategoryClass(tool.category);
    
    // Determine button text and class
    const isExternal = tool.category === 'External Link' || (tool.url && tool.url.startsWith('http'));
    const buttonText = isExternal ? 'OPEN LINK' : 'ACCESS TOOL';
    const buttonClass = isExternal ? 'external-link' : '';
    
    // Create card HTML
    card.innerHTML = `
        <div class="card-header">
            <div class="tool-category ${categoryClass}">[${tool.category.toUpperCase()}]</div>
            <div class="tool-title">${tool.name}</div>
            <div class="tool-description">${tool.description}</div>
        </div>
        <div class="card-content">
            ${tool.url ? 
                `<a href="${tool.url}" target="_blank" class="access-button ${buttonClass}">${buttonText}</a>` : 
                '<button class="access-button" disabled style="background-color: #6c757d;">No Link Available</button>'
            }
            ${tool.notes ? `<div class="tool-notes">${tool.notes}</div>` : ''}
        </div>
    `;
    
    return card;
}

/**
 * Get CSS class for category
 */
function getCategoryClass(category) {
    return 'category-' + category.toLowerCase().replace(/\s+/g, '-');
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
        toolsGrid.innerHTML = `<div class="error-message">${message}</div>`;
        toolsGrid.style.display = 'block';
    }
    if (emptyState) {
        emptyState.style.display = 'none';
    }
}