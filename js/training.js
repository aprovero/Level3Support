/**
 * CoE Level 3 Support Portal - Training Page JavaScript
 * 
 * Table of Contents:
 * 1. Global Variables and State
 * 2. Page Initialization
 * 3. Training Data Loading
 * 4. Filter Functionality
 * 5. Training Data Rendering
 * 6. Course Detail Management
 * 7. System Type Utilities
 * 8. Admin Controls
 * 9. Form Management
 * 10. Form Submission
 */

/**
 * 1. Global Variables and State
 * ----------------------------
 */
// Store all training data
let allTrainings = [];

// Map system types to match the server's expected values
const SYSTEM_TYPE_MAP = {
    'pv': 'PV',
    'bess': 'BESS',
    'other': 'Other'
};

// Track active filters
const activeFilters = {
    system: 'all',
    level: 'all',
    model: 'all'
};

// DOM elements
let trainingGrid;
let emptyState;
let loadingIndicator;
let modelFiltersContainer;

/**
 * 2. Page Initialization
 * --------------------
 */
document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    trainingGrid = document.getElementById('training-grid');
    emptyState = document.getElementById('empty-state');
    loadingIndicator = document.getElementById('loading-indicator');
    modelFiltersContainer = document.getElementById('model-filters');
    
    // Initialize filter functionality
    initializeFilters();
    
    // Initialize admin functionality
    initializeAdminControls();
    
    // Load training data
    fetchTrainingData();
});

/**
 * Initialize filter controls
 */
function initializeFilters() {
    const filterItems = document.querySelectorAll('.filter-item');
    
    filterItems.forEach(item => {
        item.addEventListener('click', handleFilterClick);
    });
}

/**
 * 3. Training Data Loading
 * ----------------------
 */

/**
 * Fetch training data from server
 */
function fetchTrainingData() {
    // Show loading indicator
    showLoadingState(true);
    
    const trainingEndpoint = API_BASE_URL + API_ENDPOINTS.getTrainings;
    console.log('Fetching training data from:', trainingEndpoint);
    
    // Direct fetch without using fetchWithRetry
    fetch(trainingEndpoint)
        .then(response => {
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Received training data:', data);
            
            if (data && data.trainings && data.trainings.length > 0) {
                // Store all trainings for later filtering
                allTrainings = data.trainings;
                
                // Apply current filters
                applyFilters();
                
                // Setup model filters based on all data
                setupModelFilters(allTrainings);
            } else {
                console.error('No training data found in response:', data);
                handleTrainingDataError('No training data available. Please try again later.');
            }
        })
        .catch(error => {
            console.error('Error fetching training data:', error);
            handleTrainingDataError(`Failed to load training data: ${error.message}`);
        })
        .finally(() => {
            showLoadingState(false);
        });
}

/**
 * Handle training data loading error
 * @param {string} message - Error message to display
 */
function handleTrainingDataError(message) {
    if (trainingGrid) {
        trainingGrid.innerHTML = `<div class="error-message">${message}</div>`;
        trainingGrid.style.display = 'block';
    }
}

/**
 * Show or hide loading state
 * @param {boolean} isLoading - Whether to show loading state
 */
function showLoadingState(isLoading) {
    if (!loadingIndicator || !trainingGrid || !emptyState) return;
    
    if (isLoading) {
        loadingIndicator.style.display = 'flex';
        trainingGrid.style.display = 'none';
        emptyState.style.display = 'none';
    } else {
        loadingIndicator.style.display = 'none';
    }
}

/**
 * 4. Filter Functionality
 * ---------------------
 */

/**
 * Handle filter item click
 * @param {Event} event - Click event
 */
function handleFilterClick(event) {
    const filterType = this.getAttribute('data-filter');
    const filterValue = this.getAttribute('data-value');
    
    // Update active filter
    activeFilters[filterType] = filterValue;
    
    // Update active class
    document.querySelectorAll(`.filter-item[data-filter="${filterType}"]`).forEach(el => {
        el.classList.remove('active');
    });
    this.classList.add('active');
    
    // Apply filters without fetching data again
    applyFilters();
}

/**
 * Apply current filters to training data
 */
function applyFilters() {
    // Apply filters to training data - exact matches for everything
    const filteredTrainings = allTrainings.filter(item => {
        // System filter - case insensitive
        const matchesSystem = activeFilters.system === 'all' || 
                            item.system.toLowerCase() === activeFilters.system.toLowerCase();
        
        // Level filter - exact match with the actual values from Airtable
        const matchesLevel = activeFilters.level === 'all' || 
                            item.level === activeFilters.level;
        
        // Model filter - case insensitive
        const matchesModel = activeFilters.model === 'all' || 
                            item.model.toLowerCase() === activeFilters.model.toLowerCase();
        
        return matchesSystem && matchesLevel && matchesModel;
    });
    
    // Render the filtered data
    renderTrainingData(filteredTrainings);
}

/**
 * Set up model filters based on available data
 * @param {Array} trainings - Array of training objects
 */
function setupModelFilters(trainings) {
    if (!modelFiltersContainer) return;
    
    // Get unique models
    const uniqueModels = [...new Set(trainings.map(item => item.model))].sort();
    
    // Clear existing model filters (except "All Models")
    const allModelsFilter = modelFiltersContainer.querySelector('[data-value="all"]');
    modelFiltersContainer.innerHTML = '';
    if (allModelsFilter) {
        modelFiltersContainer.appendChild(allModelsFilter);
    }
    
    // Add model filters
    uniqueModels.forEach(model => {
        if (model && model.trim() !== '') {
            const filterItem = document.createElement('div');
            filterItem.className = 'filter-item';
            filterItem.setAttribute('data-filter', 'model');
            filterItem.setAttribute('data-value', model);
            filterItem.textContent = model;
            modelFiltersContainer.appendChild(filterItem);
        }
    });
    
    // Reattach filter click handlers
    initializeFilters();
}
/**
 * 5. Training Data Rendering
 * ------------------------
 */

/**
 * Render training data as cards
 * @param {Array} trainings - Array of training objects
 */
function renderTrainingData(trainings) {
    if (!trainingGrid) return;
    
    // Clear the grid
    trainingGrid.innerHTML = '';
    
    // Show empty state if no results
    if (trainings.length === 0) {
        if (emptyState) {
            emptyState.style.display = 'block';
        }
        trainingGrid.style.display = 'none';
        return;
    } else {
        if (emptyState) {
            emptyState.style.display = 'none';
        }
        trainingGrid.style.display = 'grid';
    }
    
    // Create card for each training item
    trainings.forEach(item => {
        const card = createTrainingCard(item);
        trainingGrid.appendChild(card);
    });
    
    // Add click handlers for view/hide buttons
    setupDetailButtons();
}

/**
 * Create a training card element
 * @param {Object} item - Training item data
 * @returns {Element} - The created card element
 */
function createTrainingCard(item) {
    const card = document.createElement('div');
    card.className = 'training-card';
    card.setAttribute('data-id', item.id);
    card.setAttribute('data-system', item.system);
    card.setAttribute('data-level', item.level);
    card.setAttribute('data-model', item.model);
    
    // Prepare content and requirements HTML
    const contentHTML = formatContentList(item.content);
    const requirementsHTML = formatContentList(item.requirements);
    
    // Get appropriate system tag class
    const systemTagClass = getSystemTagClass(item.system);
    
    // Create card HTML
    card.innerHTML = `
        <div class="card-header">
            <div class="card-system-tag ${systemTagClass}">[${item.system.toUpperCase()}]</div>
            <div class="card-title">${item.name}</div>
            <div class="card-level">${item.level}</div>
            <div class="card-duration">Duration: ${item.duration}</div>
        </div>
        <div class="card-content">
            <button class="view-details-btn" data-id="${item.id}">VIEW DETAILS</button>
            <div class="card-details" id="details-${item.id}">
                <h4>Covers:</h4>
                <ul class="content-list">
                    ${contentHTML}
                </ul>
                <h4>Requirements:</h4>
                <ul class="requirements-list">
                    ${requirementsHTML}
                </ul>
                <button class="hide-details-btn" data-id="${item.id}">HIDE DETAILS</button>
            </div>
        </div>
    `;
    
    return card;
}

/**
 * Format a content list (content or requirements)
 * @param {Array|string} content - The content to format
 * @returns {string} - Formatted HTML list items
 */
function formatContentList(content) {
    // Default for empty content
    let defaultHTML = '<li>No information available</li>';
    
    // Check if content exists
    if (!content) return defaultHTML;
    
    // Handle array or string
    const contentArray = Array.isArray(content) ? content : [content];
    
    // If array is empty, return default
    if (contentArray.length === 0) return defaultHTML;
    
    // Create HTML items
    return contentArray.map(point => {
        // Sanitize the point
        const safePoint = String(point).replace(/</g, '&lt;').replace(/>/g, '&gt;');
        // Replace newlines with <br>
        return `<li>${safePoint.replace(/\n/g, '<br>')}</li>`;
    }).join('');
}

/**
 * 6. Course Detail Management
 * -------------------------
 */

/**
 * Set up detail view/hide buttons
 */
function setupDetailButtons() {
    // View details buttons
    document.querySelectorAll('.view-details-btn').forEach(button => {
        button.addEventListener('click', showCourseDetails);
    });
    
    // Hide details buttons
    document.querySelectorAll('.hide-details-btn').forEach(button => {
        button.addEventListener('click', hideCourseDetails);
    });
}

/**
 * Show course details
 * @param {Event} event - Click event
 */
function showCourseDetails(event) {
    const id = this.getAttribute('data-id');
    
    // Show details
    const detailsSection = document.getElementById(`details-${id}`);
    if (detailsSection) {
        detailsSection.style.display = 'block';
    }
    
    // Hide view button
    this.style.display = 'none';
    
    // Show hide button
    const hideButton = document.querySelector(`.hide-details-btn[data-id="${id}"]`);
    if (hideButton) {
        hideButton.style.display = 'block';
    }
}

/**
 * Hide course details
 * @param {Event} event - Click event
 */
function hideCourseDetails(event) {
    const id = this.getAttribute('data-id');
    
    // Hide details
    const detailsSection = document.getElementById(`details-${id}`);
    if (detailsSection) {
        detailsSection.style.display = 'none';
    }
    
    // Show view button
    const viewButton = document.querySelector(`.view-details-btn[data-id="${id}"]`);
    if (viewButton) {
        viewButton.style.display = 'block';
    }
    
    // Hide hide button
    this.style.display = 'none';
}

/**
 * 7. System Type Utilities
 * ----------------------
 */

/**
 * Get the appropriate CSS class for a system type
 * @param {string} system - System type
 * @returns {string} - CSS class
 */
function getSystemTagClass(system) {
    const systemLower = String(system).toLowerCase();
    
    if (systemLower === 'pv') {
        return 'system-pv';
    } else if (systemLower === 'bess') {
        return 'system-bess';
    } else {
        return 'system-other';
    }
}
/**
 * 8. Admin Controls
 * ---------------
 */

/**
 * Initialize admin controls
 */
function initializeAdminControls() {
    const adminButton = document.getElementById('admin-button');
    const adminFormContainer = document.getElementById('admin-form-container');
    
    console.log('Admin elements:', { adminButton, adminFormContainer });
    
    // Admin button click with direct onclick assignment
    if (adminButton && adminFormContainer) {
        // Replace event listener with direct onclick
        adminButton.onclick = function() {
            console.log('Admin button clicked');
            if (adminFormContainer.classList.contains('visible')) {
                adminFormContainer.classList.remove('visible');
            } else {
                adminFormContainer.classList.add('visible');
            }
        };
    }
    
    const adminForm = document.getElementById('admin-form');
    const cancelButton = document.getElementById('cancel-button');
    const addContentBtn = document.getElementById('add-content-btn');
    const addRequirementBtn = document.getElementById('add-requirement-btn');
    
    // Cancel button click
    if (cancelButton && adminFormContainer) {
        cancelButton.onclick = function() {
            adminFormContainer.classList.remove('visible');
            
            // Reset form
            if (adminForm) {
                adminForm.reset();
                resetFormItems();
            }
        };
    }
    
    // Add content button click
    if (addContentBtn) {
        addContentBtn.onclick = function() {
            addFormItem('content');
        };
    }
    
    // Add requirement button click
    if (addRequirementBtn) {
        addRequirementBtn.onclick = function() {
            addFormItem('requirement');
        };
    }
    
    // Form submission
    if (adminForm) {
        adminForm.addEventListener('submit', handleAdminFormSubmit);
    }
    
    // Remove item buttons (delegated event)
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-content')) {
            removeFormItem(e.target, 'content');
        }
        
        if (e.target.classList.contains('remove-requirement')) {
            removeFormItem(e.target, 'requirement');
        }
    });
}

/**
 * 9. Form Management
 * ----------------
 */

/**
 * Add a new form item (content or requirement)
 * @param {string} type - 'content' or 'requirement'
 */
function addFormItem(type) {
    const isContent = type === 'content';
    
    const container = document.getElementById(
        isContent ? 'content-container' : 'requirements-container'
    );
    
    if (!container) return;
    
    const className = isContent ? 'content-item' : 'requirement-item';
    const nameAttr = isContent ? 'content[]' : 'requirements[]';
    const removeBtnClass = isContent ? 'remove-content' : 'remove-requirement';
    
    const newItem = document.createElement('div');
    newItem.className = className;
    newItem.innerHTML = `
        <input type="text" name="${nameAttr}" class="form-control" required>
        <button type="button" class="btn btn-danger ${removeBtnClass}">×</button>
    `;
    
    container.appendChild(newItem);
}

/**
 * Remove a form item
 * @param {Element} button - The remove button element
 * @param {string} type - 'content' or 'requirement'
 */
function removeFormItem(button, type) {
    const isContent = type === 'content';
    
    // Get the parent item
    const item = button.closest(isContent ? '.content-item' : '.requirement-item');
    
    // Get the container
    const container = document.getElementById(
        isContent ? 'content-container' : 'requirements-container'
    );
    
    if (!item || !container) return;
    
    // Only remove if there's more than one item
    if (container.children.length > 1) {
        container.removeChild(item);
    }
}

/**
 * Reset form items to default state
 */
function resetFormItems() {
    const contentContainer = document.getElementById('content-container');
    const requirementsContainer = document.getElementById('requirements-container');
    
    if (contentContainer) {
        contentContainer.innerHTML = `
            <div class="content-item">
                <input type="text" name="content[]" class="form-control" required>
                <button type="button" class="btn btn-danger remove-content">×</button>
            </div>
            <div class="content-item">
                <input type="text" name="content[]" class="form-control" required>
                <button type="button" class="btn btn-danger remove-content">×</button>
            </div>
        `;
    }
    
    if (requirementsContainer) {
        requirementsContainer.innerHTML = `
            <div class="requirement-item">
                <input type="text" name="requirements[]" class="form-control" required>
                <button type="button" class="btn btn-danger remove-requirement">×</button>
            </div>
        `;
    }
}

/**
 * 10. Form Submission
 * ----------------
 */

/**
 * Handle admin form submission
 * @param {Event} e - Submit event
 */
async function handleAdminFormSubmit(e) {
    e.preventDefault();
    
    // Get form and submit button
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Store original button text
    const originalText = submitBtn.textContent;
    
    // Show loading state
    submitBtn.textContent = 'Adding...';
    submitBtn.disabled = true;
    
    try {
        // Validate form
        const { isValid, invalidFields } = validateForm(form);
        
        if (!isValid) {
            // Form validation failed, error messages are already displayed
            return;
        }
        
        // Collect form data
        const contentInputs = Array.from(form.querySelectorAll('input[name="content[]"]'));
        const requirementInputs = Array.from(form.querySelectorAll('input[name="requirements[]"]'));
        
        // Get array values
        const contentValues = contentInputs
            .map(input => input.value.trim())
            .filter(val => val !== '');
            
        const requirementValues = requirementInputs
            .map(input => input.value.trim())
            .filter(val => val !== '');
        
        // Validate required arrays
        if (contentValues.length === 0) {
            showErrorMessage('Content items are required', 'Please add at least one content item.', '#message-container');
            return;
        }
        
        if (requirementValues.length === 0) {
            showErrorMessage('Requirement items are required', 'Please add at least one requirement item.', '#message-container');
            return;
        }
        
        // Build the JSON data
        const systemValue = form.querySelector('#training-system').value;
        const jsonData = {
            name: form.querySelector('#training-name').value,
            system: SYSTEM_TYPE_MAP[systemValue.toLowerCase()] || systemValue,
            level: form.querySelector('#training-level').value,
            model: form.querySelector('#training-model').value,
            duration: form.querySelector('#training-duration').value,
            content: contentValues,
            requirements: requirementValues
        };
        
        // Send data to server
        await postRequest(
            API_BASE_URL + API_ENDPOINTS.getTrainings, 
            jsonData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        // Reset form and hide it
        form.reset();
        resetFormItems();
        
        const adminFormContainer = document.getElementById('admin-form-container');
        if (adminFormContainer) {
            adminFormContainer.classList.remove('visible');
        }
        
        // Reload training data
        fetchTrainingData();
        
        // Show success message
        showSuccessMessage('Training course added successfully!', '', '#message-container');
        
    } catch (error) {
        // Handle errors
        const errorMessage = error.data?.message || 'Failed to add training course';
        const errorDetails = error.data?.details || error.message || 'An unexpected error occurred';
        
        showErrorMessage(errorMessage, errorDetails, '#message-container');
    } finally {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Expose necessary functions globally for HTML event handlers
window.addFormItem = addFormItem;
window.removeFormItem = removeFormItem;