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
            name: "Power System Calculator",
            category: "Calculator",
            description: "Calculate power ratings, efficiency, and performance metrics for PV systems",
            url: "https://example.com/calculator",
            notes: "Most used tool by service team"
        },
        {
            id: 2,
            name: "Error Code Database",
            category: "Reference", 
            description: "Searchable database of all system error codes and troubleshooting steps",
            url: "https://support.sungrowpower.com/errorcode",
            notes: "Updated weekly with new codes"
        },
        {
            id: 3,
            name: "Service Report Template",
            category: "Template",
            description: "Standardized service report template for customer documentation",
            url: "/downloads/service-report-template.docx",
            notes: "Download and fill out for each service call"
        },
        {
            id: 4,
            name: "SUNGROW Resource Center",
            category: "External Link",
            description: "Official SUNGROW technical documentation and resources",
            url: "https://support.sungrowpower.com/home",
            notes: "Official support portal"
        }
    ];
    
    renderTools(allTools);
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
                `<a href="${tool.url}" target="${isExternal ? '_blank' : '_self'}" class="access-button ${buttonClass}">${buttonText}</a>` : 
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