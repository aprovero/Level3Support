/**
 * Level3Support — common.js
 * Lead Developer: Andres Provero (@aprovero)
 * © 2026 Level3Support
 * 
 * Table of Contents:
 * 1. Configuration and Constants
 * 2. Message System (success, error, info, warning)
 * 3. Modal Management
 * 4. Loading Indicators
 * 5. Form Validation
 * 6. Form Utilities
 * 7. AJAX Requests
 */

/**
 * 1. Configuration and Constants
 * ------------------------------
 * Global configuration values and constants used across the portal
 */

// API endpoints
const API_BASE_URL = 'https://level3support.onrender.com'; // Update this to your actual API URL
const API_ENDPOINTS = {
    submitRequest: '/submit',
    submitEvaluation: '/evaluation',
    getTrainings: '/api/trainings',
    getTrainingById: (id) => `/training/${id}`
};

// Message types and their corresponding CSS classes
const MESSAGE_TYPES = {
    success: 'success',
    error: 'error',
    info: 'info',
    warning: 'warning'
};

// Required field indicator
const REQUIRED_FIELD_INDICATOR = '<span class="required-asterisk">*</span>';

// File upload constants
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/zip', 'application/x-rar-compressed'
];

// Location abbreviation mapping (from server)
const LOCATION_MAP = {
    'MEXICO': 'MEX',
    'CENTRAL AMERICA': 'CENAM',
    'DOMINICAN REPUBLIC': 'DOR',
    'COLOMBIA': 'COL',
    'BRAZIL': 'BRA',
    'CHILE': 'CHL',
    'OTHER': 'OTH'
};

// System type mapping (from server)
const SYSTEM_TYPE_MAP = {
    'pv': 'PV',
    'bess': 'BESS',
    'other': 'Other'
};

// Valid options for form validation
const VALID_OPTIONS = {
    'TYPE OF REQUEST': ['SUPPORT', 'RCA', 'TRAINING', 'OTHER'],
    'Location': ['MEXICO', 'CENTRAL AMERICA', 'DOMINICAN REPUBLIC', 'COLOMBIA', 'BRAZIL', 'CHILE', 'OTHER'],
    'TYPE OF PRODUCT': ['STRING', 'CENTRAL', 'MVS', 'PVS', 'STORAGE', 'COMMUNICATION']
};

/**
 * 2. Message System
 * ----------------
 * Functions for displaying consistent messages across all pages
 */

/**
 * Display a message to the user with appropriate styling
 * @param {string} type - Message type: 'success', 'error', 'info', or 'warning'
 * @param {string} title - Main message title
 * @param {string} details - Optional details for the message
 * @param {Element|string} container - Container element or selector where the message will be displayed
 * @param {boolean} autoScroll - Whether to automatically scroll to the message
 * @returns {Element} The created message element
 */
function showMessage(type, title, details = '', container = '#message-container', autoScroll = true) {
    // Ensure the type is valid
    if (!Object.values(MESSAGE_TYPES).includes(type)) {
        type = MESSAGE_TYPES.info;
    }
    
    // Get the container element
    const messageContainer = typeof container === 'string' 
        ? document.querySelector(container) 
        : container;
    
    if (!messageContainer) {
        console.warn('Message container not found:', container);
        return null;
    }
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.innerHTML = `
        <strong>${title}</strong>
        ${details ? `<div class="message-details">${details}</div>` : ''}
    `;
    
    // Clear previous messages if container is a dedicated message area
    if (messageContainer.id && messageContainer.id.includes('message')) {
        messageContainer.innerHTML = '';
    }
    
    // Add the message to the container
    messageContainer.appendChild(messageElement);
    
    // Scroll to the message if needed
    if (autoScroll) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    return messageElement;
}

/**
 * Display a success message
 * @param {string} title - Main message title
 * @param {string} details - Optional details
 * @param {Element|string} container - Container element or selector
 */
function showSuccessMessage(title, details = '', container = '#message-container') {
    return showMessage(MESSAGE_TYPES.success, title, details, container);
}

/**
 * Display an error message
 * @param {string} title - Main message title
 * @param {string} details - Optional details
 * @param {Element|string} container - Container element or selector
 */
function showErrorMessage(title, details = '', container = '#message-container') {
    return showMessage(MESSAGE_TYPES.error, title, details, container);
}

/**
 * Display an info message
 * @param {string} title - Main message title
 * @param {string} details - Optional details
 * @param {Element|string} container - Container element or selector
 */
function showInfoMessage(title, details = '', container = '#message-container') {
    return showMessage(MESSAGE_TYPES.info, title, details, container);
}

/**
 * Display a warning message
 * @param {string} title - Main message title
 * @param {string} details - Optional details
 * @param {Element|string} container - Container element or selector
 */
function showWarningMessage(title, details = '', container = '#message-container') {
    return showMessage(MESSAGE_TYPES.warning, title, details, container);
}

/**
 * Show a success message in a modal dialog
 * @param {string} title - Modal title
 * @param {string} message - Modal message content
 * @param {Function} onClose - Optional callback function when modal is closed
 */
function showSuccessModal(title, message, onClose) {
    const successModal = document.getElementById('success-modal');
    const successMessage = document.getElementById('success-message');
    const requestIdSpan = document.getElementById('request-id');
    const closeBtn = document.getElementById('success-close-btn');
    
    if (!successModal) {
        console.warn('Success modal elements not found');
        return;
    }
    
    // Check if this is a request ID message
    if (requestIdSpan && message.includes('Issue ID:')) {
        // Extract issue ID from message
        const issueIdMatch = message.match(/Issue ID: (.*)/);
        if (issueIdMatch && issueIdMatch[1]) {
            requestIdSpan.textContent = issueIdMatch[1];
        }
    } else if (successMessage) {
        // For other success messages, use the standard approach
        successMessage.innerHTML = `<strong>${title}</strong><br>${message}`;
    }
    
    // Show the modal
    successModal.style.display = 'flex';
    
    // Handle close button click
    if (closeBtn) {
        // Remove existing event listeners to prevent duplicates
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        
        newCloseBtn.addEventListener('click', () => {
            successModal.style.display = 'none';
            if (typeof onClose === 'function') {
                onClose();
            }
        });
    }
}

/**
 * 3. Modal Management
 * ------------------
 * Functions for creating and managing modal dialogs
 */

/**
 * Initialize a modal dialog
 * @param {string} modalId - ID of the modal element
 * @param {string} closeButtonId - ID of the close button element
 * @param {Function} onOpen - Optional callback when modal is opened
 * @param {Function} onClose - Optional callback when modal is closed
 */
function initializeModal(modalId, closeButtonId, onOpen, onClose) {
    const modal = document.getElementById(modalId);
    const closeButton = document.getElementById(closeButtonId);
    
    if (!modal || !closeButton) {
        console.warn(`Modal elements not found: ${modalId}, ${closeButtonId}`);
        return;
    }
    
    // Show modal function
    const showModal = () => {
        modal.style.display = 'flex';
        modal.classList.remove('hidden');
        if (typeof onOpen === 'function') {
            onOpen();
        }
    };
    
    // Hide modal function
    const hideModal = () => {
        modal.style.display = 'none';
        modal.classList.add('hidden');
        if (typeof onClose === 'function') {
            onClose();
        }
    };
    
    // Attach close button event
    closeButton.addEventListener('click', hideModal);
    
    // Return functions for external control
    return {
        show: showModal,
        hide: hideModal,
        modal: modal
    };
}

/**
 * 4. Loading Indicators
 * -------------------
 * Functions for showing and hiding loading spinners
 */

/**
 * Show a loading spinner
 * @param {string} containerId - ID of the spinner container element
 * @param {string} message - Optional loading message
 */
function showLoadingSpinner(containerId = 'loading-spinner', message = 'Loading...') {
    const spinnerContainer = document.getElementById(containerId);
    
    if (!spinnerContainer) {
        console.warn('Loading spinner container not found:', containerId);
        return;
    }
    
    // Set the message if there's a text element
    const messageElement = spinnerContainer.querySelector('p');
    if (messageElement && message) {
        messageElement.textContent = message;
    }
    
    // Show the spinner
    spinnerContainer.style.display = 'flex';
    
    // Add loading class to any parent form
    const parentForm = spinnerContainer.closest('form');
    if (parentForm) {
        parentForm.classList.add('loading');
    }
}

/**
 * Hide the loading spinner
 * @param {string} containerId - ID of the spinner container element
 */
function hideLoadingSpinner(containerId = 'loading-spinner') {
    const spinnerContainer = document.getElementById(containerId);
    
    if (!spinnerContainer) {
        console.warn('Loading spinner container not found:', containerId);
        return;
    }
    
    // Hide the spinner
    spinnerContainer.style.display = 'none';
    
    // Remove loading class from any parent form
    const parentForm = spinnerContainer.closest('form');
    if (parentForm) {
        parentForm.classList.remove('loading');
    }
}

/**
 * 5. Form Validation
 * ----------------
 * Functions for validating form inputs
 */

/**
 * Validate an email address format
 * @param {string} email - The email address to validate
 * @returns {boolean} True if the email is valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate a form input's value
 * @param {Element} inputElement - The input element to validate
 * @returns {Object} Validation result with isValid and message properties
 */
function validateInput(inputElement) {
    if (!inputElement) return { isValid: false, message: 'Input element not found' };
    
    const value = inputElement.value.trim();
    const inputType = inputElement.type;
    const isRequired = inputElement.hasAttribute('required');
    
    // Check if required field is empty
    if (isRequired && !value) {
        return { 
            isValid: false, 
            message: 'This field is required' 
        };
    }
    
    // Validation based on input type
    switch (inputType) {
        case 'email':
            if (value && !isValidEmail(value)) {
                return { 
                    isValid: false, 
                    message: 'Please enter a valid email address' 
                };
            }
            break;
            
        case 'number':
            if (value) {
                const min = inputElement.min ? parseFloat(inputElement.min) : null;
                const max = inputElement.max ? parseFloat(inputElement.max) : null;
                const numValue = parseFloat(value);
                
                if (isNaN(numValue)) {
                    return { 
                        isValid: false, 
                        message: 'Please enter a valid number' 
                    };
                }
                
                if (min !== null && numValue < min) {
                    return { 
                        isValid: false, 
                        message: `Value must be at least ${min}` 
                    };
                }
                
                if (max !== null && numValue > max) {
                    return { 
                        isValid: false, 
                        message: `Value must be at most ${max}` 
                    };
                }
            }
            break;
            
        case 'date':
            if (value) {
                const date = new Date(value);
                if (isNaN(date.getTime())) {
                    return { 
                        isValid: false, 
                        message: 'Please enter a valid date' 
                    };
                }
                
                // Check min date if specified
                if (inputElement.min) {
                    const minDate = new Date(inputElement.min);
                    if (date < minDate) {
                        return { 
                            isValid: false, 
                            message: `Date must be on or after ${formatDate(minDate)}` 
                        };
                    }
                }
                
                // Check max date if specified
                if (inputElement.max) {
                    const maxDate = new Date(inputElement.max);
                    if (date > maxDate) {
                        return { 
                            isValid: false, 
                            message: `Date must be on or before ${formatDate(maxDate)}` 
                        };
                    }
                }
            }
            break;
    }
    
    // If we got here, the input is valid
    return { isValid: true, message: '' };
}

/**
 * Validate an entire form
 * @param {Element} formElement - The form element to validate
 * @param {Object} options - Optional validation options
 * @returns {Object} Validation result with isValid and invalidFields properties
 */
function validateForm(formElement, options = {}) {
    if (!formElement) return { isValid: false, invalidFields: [] };
    
    // Default options
    const defaultOptions = {
        showErrors: true,
        scrollToError: true,
        errorClass: 'input-error',
        errorMessageClass: 'error-message'
    };
    
    const settings = { ...defaultOptions, ...options };
    
    // Get all form controls that need validation
    const inputs = formElement.querySelectorAll('input, select, textarea');
    
    let isValid = true;
    const invalidFields = [];
    
    // Remove previous error messages if needed
    if (settings.showErrors) {
        formElement.querySelectorAll('.' + settings.errorMessageClass).forEach(el => el.remove());
        formElement.querySelectorAll('.' + settings.errorClass).forEach(el => {
            el.classList.remove(settings.errorClass);
        });
    }
    
    // Validate each input
    inputs.forEach(input => {
        // Skip elements that don't need validation
        if (input.type === 'button' || input.type === 'submit' || input.type === 'reset' || 
            input.disabled || input.readOnly) {
            return;
        }
        
        const result = validateInput(input);
        
        if (!result.isValid) {
            isValid = false;
            invalidFields.push({ element: input, message: result.message });
            
            if (settings.showErrors) {
                // Add error class to the input
                input.classList.add(settings.errorClass);
                
                // Create and show error message
                const errorMsg = document.createElement('div');
                errorMsg.className = settings.errorMessageClass;
                errorMsg.textContent = result.message;
                
                // Insert after the input
                const parent = input.parentElement;
                parent.insertBefore(errorMsg, input.nextSibling);
            }
        }
    });
    
    // Scroll to the first error if needed
    if (!isValid && settings.scrollToError && invalidFields.length > 0) {
        invalidFields[0].element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        invalidFields[0].element.focus();
    }
    
    return { isValid, invalidFields };
}

/**
 * 6. Form Utilities
 * ---------------
 * Utility functions for working with forms
 */

/**
 * Reset a form to its initial state
 * @param {Element} formElement - The form element to reset
 * @param {Array} hiddenSections - Array of section IDs to hide after reset
 */
function resetForm(formElement, hiddenSections = []) {
    if (!formElement) return;
    
    // Reset the form fields
    formElement.reset();
    
    // Clear any error messages
    formElement.querySelectorAll('.error-message').forEach(el => el.remove());
    formElement.querySelectorAll('.input-error').forEach(el => {
        el.classList.remove('input-error');
    });
    
    // Clear any success messages
    const messageContainer = document.getElementById('message-container');
    if (messageContainer) {
        messageContainer.innerHTML = '';
    }
    
    // Hide specified sections
    hiddenSections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'none';
        }
    });
}

/**
 * Set minimum date for a date input
 * @param {string} inputId - ID of the date input element
 * @param {number} daysFromNow - Number of days from today
 */
function setMinimumDate(inputId, daysFromNow = 0) {
    const dateInput = document.getElementById(inputId);
    if (!dateInput) return;
    
    // Calculate minimum date
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + daysFromNow);
    
    // Format as YYYY-MM-DD for the input
    const formattedDate = formatDate(minDate, 'yyyy-MM-dd');
    
    // Set the minimum date
    dateInput.min = formattedDate;
    
    // Add validation on change
    dateInput.addEventListener('change', function() {
        const selectedDate = new Date(this.value);
        if (selectedDate < minDate) {
            showErrorMessage(
                'Invalid Date', 
                `Please select a date at least ${daysFromNow} days from today.`,
                '#message-container'
            );
            this.value = ''; // Clear invalid date
        }
    });
}

/**
 * Format a date to a specified pattern
 * @param {Date} date - The date to format
 * @param {string} format - The format pattern (default: 'MM/dd/yyyy')
 * @returns {string} The formatted date string
 */
function formatDate(date, format = 'MM/dd/yyyy') {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return '';
    }
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    // Replace pattern components with actual values
    let formatted = format;
    formatted = formatted.replace('dd', day);
    formatted = formatted.replace('MM', month);
    formatted = formatted.replace('yyyy', year);
    
    return formatted;
}

/**
 * 7. AJAX Requests
 * --------------
 * Functions for making API requests
 */

/**
 * Make an AJAX request with fetch API
 * @param {string} url - The URL to request
 * @param {Object} options - Fetch options
 * @param {number} timeout - Request timeout in milliseconds
 * @returns {Promise} Promise resolving to the response data
 */
async function makeRequest(url, options = {}, timeout = 30000) {
    try {
        // Create an AbortController for timeout handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        // Add the signal to the options
        const fetchOptions = {
            ...options,
            signal: controller.signal
        };
        
        // Make the request
        const response = await fetch(url, fetchOptions);
        
        // Clear the timeout
        clearTimeout(timeoutId);
        
        // Parse the response based on content type
        let data;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }
        
        // Handle non-OK responses
        if (!response.ok) {
            const error = new Error(data.error || data.message || 'Request failed');
            error.status = response.status;
            error.data = data;
            throw error;
        }
        
        return data;
    } catch (error) {
        // Handle timeout
        if (error.name === 'AbortError') {
            throw new Error('Request timed out');
        }
        
        // Re-throw other errors
        throw error;
    }
}

/**
 * Make a GET request
 * @param {string} url - The URL to request
 * @param {Object} options - Additional fetch options
 * @returns {Promise} Promise resolving to the response data
 */
function getRequest(url, options = {}) {
    return makeRequest(url, {
        method: 'GET',
        ...options
    });
}

/**
 * Make a POST request
 * @param {string} url - The URL to request
 * @param {Object|FormData} data - The data to send
 * @param {Object} options - Additional fetch options
 * @returns {Promise} Promise resolving to the response data
 */
function postRequest(url, data, options = {}) {
    const fetchOptions = {
        method: 'POST',
        ...options
    };
    
    // Handle different data types
    if (data instanceof FormData) {
        fetchOptions.body = data;
    } else {
        fetchOptions.headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        fetchOptions.body = JSON.stringify(data);
    }
    
    return makeRequest(url, fetchOptions);
}

/**
 * Fetch with retry functionality
 * @param {string} url - URL to fetch
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise} - Promise resolving to the response data
 */
function fetchWithRetry(url, maxRetries) {
    return new Promise((resolve, reject) => {
        const attemptFetch = (retriesLeft) => {
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Server error: ' + response.status);
                    }
                    return response.json();
                })
                .then(data => {
                    resolve(data);
                })
                .catch(error => {
                    if (retriesLeft > 0) {
                        // Wait 1 second before retrying
                        setTimeout(() => attemptFetch(retriesLeft - 1), 1000);
                    } else {
                        reject(error);
                    }
                });
        };
        
        attemptFetch(maxRetries);
    });
}

/**
 * Make a fetch request with timeout and retry functionality
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds (default: 15000)
 * @param {number} retries - Number of retries (default: 2)
 * @returns {Promise} - Promise resolving to the response
 */
async function fetchWithTimeout(url, options = {}, timeout = 15000, retries = 2) {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    // Add signal to options
    const fetchOptions = {
        ...options,
        mode: 'cors',
        credentials: 'include',
        signal: controller.signal
    };
    
    // Log request details
    console.log(`Fetching ${options.method || 'GET'} ${url}`);
    
    try {
        const response = await fetch(url, fetchOptions);
        clearTimeout(timeoutId);
        
        // Log response details
        console.log(`Response from ${url}: ${response.status}`);
        
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }
        
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        
        // Check if we have retries left
        if (error.name === 'AbortError') {
            console.warn(`Request to ${url} timed out after ${timeout}ms`);
        } else {
            console.error(`Error fetching ${url}:`, error);
        }
        
        if (retries > 0) {
            console.log(`Retrying... (${retries} left)`);
            // Exponential backoff: wait longer for each retry
            const delay = 1000 * (Math.pow(2, 3 - retries) - 1);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithTimeout(url, options, timeout, retries - 1);
        }
        
        throw error;
    }
}

/**
 * Make a GET request with timeout and retry
 * @param {string} url - The URL to request
 * @param {Object} options - Additional fetch options
 * @returns {Promise} Promise resolving to the response data
 */
async function getRequestWithRetry(url, options = {}) {
    const response = await fetchWithTimeout(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        ...options
    });
    
    return response.json();
}

/**
 * Make a POST request with timeout and retry
 * @param {string} url - The URL to request
 * @param {Object|FormData} data - The data to send
 * @param {Object} options - Additional fetch options
 * @returns {Promise} Promise resolving to the response data
 */
async function postRequestWithRetry(url, data, options = {}) {
    const fetchOptions = {
        method: 'POST',
        ...options
    };
    
    // Handle different data types
    if (data instanceof FormData) {
        fetchOptions.body = data;
    } else {
        fetchOptions.headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        fetchOptions.body = JSON.stringify(data);
    }
    
    const response = await fetchWithTimeout(url, fetchOptions);
    return response.json();
}

/**
 * Check if the server is up and attempt to wake it up if it's not
 * Call this function when the page loads
 */
function wakeUpServer() {
    console.log('Checking server status and attempting wake-up if needed...');
    
    // Make a request to the health endpoint
    fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        // 5 second timeout for the initial check
        signal: AbortSignal.timeout(5000)
    })
    .then(response => {
        if (response.ok) {
            console.log('Server is already up and running');
            return true;
        } else {
            console.warn('Server returned an error:', response.status);
            return false;
        }
    })
    .catch(error => {
        console.log('Server appears to be down or sleeping, initiating wake-up request');
        
        // Make a second request to force server wake-up
        // This will happen in the background while the user fills out the form
        fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            // Longer timeout for the wake-up request
            signal: AbortSignal.timeout(30000)
        })
        .then(response => {
            if (response.ok) {
                console.log('Server wake-up successful');
            } else {
                console.warn('Server wake-up request received response but with error:', response.status);
            }
        })
        .catch(e => {
            console.error('Server wake-up request failed:', e);
        });
    });
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 8. Tool Meta Enricher
 * Runs on every tool page that has a .tool-header-section.
 * • Fetches tools-data.json to find the registry entry for this page
 * • Injects workflow pack membership badges into the header
 * • Adds a ⚙ gear icon that opens a slim status/tags editor
 * • Saves edits to localStorage so hub cards reflect changes immediately
 * ─────────────────────────────────────────────────────────────────────────────
 */
const TOOL_META_OVERRIDES_KEY = 'toolhub_meta_overrides';

// Compact workflow membership map: filename → array of pack names
// Kept here so common.js stays standalone (no dependency on tools-hub.js)
const TOOL_WORKFLOW_MAP = {
    'inverter-startup.html':              ['PV Commissioning Sequence'],
    'dc-voltage-sanity.html':             ['PV Commissioning Sequence'],
    'string-imbalance.html':              ['PV Commissioning Sequence'],
    'iv-curve-log.html':                  ['PV Commissioning Sequence'],
    'parameter-comparison.html':          ['PV Commissioning Sequence'],
    'scada-tag-qaqc.html':               ['PV Commissioning Sequence', 'Grid / PPC & Reactive Power Testing', 'SCADA & Comms Troubleshooting'],
    'commissioning-punchlist.html':       ['PV Commissioning Sequence', 'Reporting / Field Closeout'],
    'site-visit-report.html':            ['PV Commissioning Sequence', 'Reporting / Field Closeout'],
    'bess-pre-energization.html':         ['BESS Commissioning Sequence'],
    'bess-rack-inspection.html':          ['BESS Commissioning Sequence', 'BESS Container Troubleshooting'],
    'bess-capacity-test.html':            ['BESS Commissioning Sequence'],
    'battery-soc-imbalance-analyzer.html':['BESS Commissioning Sequence', 'BESS Container Troubleshooting'],
    'battery-temperature-spread.html':    ['BESS Commissioning Sequence', 'BESS Container Troubleshooting'],
    'hvac-delta-t.html':                  ['BESS Commissioning Sequence', 'BESS Container Troubleshooting'],
    'alarm-timeline.html':               ['BESS Commissioning Sequence', 'PV Underperformance Troubleshooting', 'SCADA & Comms Troubleshooting'],
    'rca-template-builder.html':         ['BESS Commissioning Sequence', 'BESS Container Troubleshooting', 'Reporting / Field Closeout'],
    'pv-performance-ratio.html':         ['PV Underperformance Troubleshooting'],
    'pv-weather-correction.html':        ['PV Underperformance Troubleshooting'],
    'weather-correction.html':           ['PV Underperformance Troubleshooting'],
    'soiling-loss-estimator.html':       ['PV Underperformance Troubleshooting', 'Soiling Analysis Workflow'],
    'clean-vs-soiled-strings.html':      ['PV Underperformance Troubleshooting', 'Soiling Analysis Workflow'],
    'irradiance-sensor-check.html':      ['PV Underperformance Troubleshooting'],
    'clipping-curtailment-check.html':   ['PV Underperformance Troubleshooting'],
    'inverter-derating-analyzer.html':   ['PV Underperformance Troubleshooting'],
    'tracker-angle-qaqc.html':           ['PV Underperformance Troubleshooting'],
    'soiling-lost-energy.html':          ['Soiling Analysis Workflow'],
    'cleaning-roi.html':                 ['Soiling Analysis Workflow'],
    'soiling-customer-report.html':      ['Soiling Analysis Workflow', 'Reporting / Field Closeout'],
    'bess-availability.html':            ['BESS Container Troubleshooting'],
    'modbus-decoder.html':               ['BESS Container Troubleshooting', 'Grid / PPC & Reactive Power Testing', 'SCADA & Comms Troubleshooting'],
    'number-base-converter.html':        ['BESS Container Troubleshooting', 'Grid / PPC & Reactive Power Testing', 'SCADA & Comms Troubleshooting'],
    'power-triangle.html':               ['Grid / PPC & Reactive Power Testing'],
    'inverter-capability-curve-check.html':['Grid / PPC & Reactive Power Testing'],
    'grid-event-excursion-log.html':     ['Grid / PPC & Reactive Power Testing'],
    'rej603-configurator.html':          ['Grid / PPC & Reactive Power Testing'],
    'capa-tracker.html':                 ['Reporting / Field Closeout'],
    'technical-reference-search.html':   ['Reporting / Field Closeout'],
    'analyzer.html':                     ['SCADA & Comms Troubleshooting'],
    'fault-interpreter.html':            ['SCADA & Comms Troubleshooting'],
};

const STATUS_OPTIONS = ['Active', 'In Progress', 'Planned', 'Legacy'];

document.addEventListener('DOMContentLoaded', () => {
    const pageFile = window.location.pathname.split('/').pop() || 'index.html';
    if (pageFile === 'index.html' || pageFile === '404.html' || pageFile === 'offline.html') return;

    // Inside iframe: hide footers, back-links, and other non-embeddable page sections dynamically
    if (window.self !== window.top) {
        const selectors = ['.footer', 'footer', '.main-footer', '.back-link', '.btn-back', '.header', '.tool-header-section', '.warning-box'];
        selectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                el.style.setProperty('display', 'none', 'important');
            });
        });
    }

    // Outside iframe (Parent page with tabs): skip resources card injection
    if (document.querySelector('#workspace-iframe')) {
        console.log('Parent workspace detected, skipping resources card injection.');
        return;
    }

    const headerSection = document.querySelector('.tool-header-section');

    if (headerSection) {
        // Load tool registry and apply enrichment
        fetch('./tools-data.json')
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(data => {
                const tools = data.tools || [];
                const tool = tools.find(t => (t.url || '').split('?')[0] === pageFile);
                _enrichToolHeader(headerSection, pageFile, tool);
            })
            .catch(() => {
                _enrichToolHeader(headerSection, pageFile, null);
            });
    }

    // Build the active tool page slug (with queries if present e.g. electrical test forms)
    let pageSlug = pageFile;
    // Map embed files back to their original resources configuration
    if (pageSlug.startsWith('embed-')) {
        pageSlug = pageSlug.replace(/^embed-/, '');
    }
    const urlParams = new URLSearchParams(window.location.search);
    const toolParam = urlParams.get('tool');
    if (toolParam) {
        pageSlug = `${pageSlug}?tool=${toolParam}`;
    }
    _injectToolResourcesCard(pageSlug);
});

function _enrichToolHeader(headerSection, pageFile, registryTool) {
    // Apply any localStorage overrides to the registry tool data
    const overrides = JSON.parse(localStorage.getItem(TOOL_META_OVERRIDES_KEY) || '{}');
    const override = overrides[pageFile];
    const effectiveTool = override ? { ...(registryTool || {}), ...override } : registryTool;

    // Find h1 (title) and p (description)
    const titleEl = headerSection.querySelector('h1');
    const descEl = headerSection.querySelector('p');

    if (!titleEl) return;

    const titleText = titleEl.innerHTML;
    const descText = descEl ? descEl.innerHTML : '';

    // Extract or build Category Badge HTML
    let categoryHtml = '';
    const existingCategory = headerSection.querySelector('.tile-category') || headerSection.querySelector('.category-badge');
    if (existingCategory) {
        categoryHtml = existingCategory.outerHTML;
    } else if (effectiveTool && effectiveTool.category) {
        categoryHtml = _getCategoryBadgeHtml(effectiveTool.category);
    }

    // Extract or build Status Badge HTML
    let statusHtml = '';
    const existingStatus = headerSection.querySelector('.status-badge');
    if (existingStatus) {
        statusHtml = existingStatus.outerHTML;
    } else if (effectiveTool && effectiveTool.status) {
        statusHtml = _getStatusBadgeHtml(effectiveTool.status);
    }

    // Extract workflow packs
    const packs = TOOL_WORKFLOW_MAP[pageFile] || [];
    let packsHtml = '';
    if (packs.length > 0) {
        packsHtml = `
            <div id="tool-workflow-badges" style="display:flex; align-items:center; gap:6px;">
                <span style="font-size:0.72rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.05em; margin-right:2px; display:inline-flex; align-items:center; gap:3px;">
                    <i class="fas fa-sitemap"></i>Part of:
                </span>
                ${packs.map(name => `
                    <span style="
                        display:inline-flex; align-items:center; gap:4px;
                        background:#eff6ff; color:#1d4ed8;
                        border:1px solid #bfdbfe; border-radius:20px;
                        padding:2px 10px; font-size:0.72rem; font-weight:600;
                        white-space:nowrap;
                    "><i class="fas fa-layer-group" style="font-size:0.65rem;"></i>${name}</span>
                `).join('')}
            </div>
        `;
    }

    // Build the fully standardized title card
    headerSection.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 0.75rem; text-align: left; position: relative;">
            <h1 style="text-align:left; margin:0; font-size:1.8rem; font-family:'Outfit',sans-serif; font-weight:700; color:#0f172a; line-height:1.2;">
                ${titleText}
            </h1>
            ${descText ? `<p style="color:var(--text-secondary, #475569); margin:0; font-size:0.95rem; line-height:1.5;">${descText}</p>` : ''}
            
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-top: 0.5rem; border-top: 1px solid var(--border-color, #e2e8f0); padding-top: 0.75rem;">
                <div class="tool-meta" style="display: flex; align-items: center; gap: 8px; margin: 0 !important; padding: 0 !important;">
                    ${categoryHtml}
                    ${statusHtml}
                </div>
                ${packsHtml}
            </div>
        </div>
    `;

    // Make header position relative if needed
    if (getComputedStyle(headerSection).position === 'static') {
        headerSection.style.position = 'relative';
    }
}

function _getCategoryBadgeHtml(category) {
    if (!category) return '';
    const norm = category.toLowerCase().trim();
    let bg = '#f1f5f9';
    let text = '#64748b';
    let emoji = '⚙️';
    
    if (norm.includes('calculator')) { bg = '#eff6ff'; text = '#3b82f6'; emoji = '🔋'; }
    else if (norm.includes('pv') || norm.includes('soiling')) { bg = '#fffbeb'; text = '#b45309'; emoji = '☀️'; }
    else if (norm.includes('bess') || norm.includes('battery')) { bg = '#ecfdf5'; text = '#047857'; emoji = '🔋'; }
    else if (norm.includes('electrical') || norm.includes('test')) { bg = '#fdf2f8'; text = '#db2777'; emoji = '⚡'; }
    else if (norm.includes('scada') || norm.includes('diagnostics') || norm.includes('grid')) { bg = '#f5f3ff'; text = '#7c3aed'; emoji = '🌐'; }
    else if (norm.includes('report') || norm.includes('template')) { bg = '#ecfeff'; text = '#0891b2'; emoji = '📋'; }
    else if (norm.includes('safety') || norm.includes('hse')) { bg = '#fef2f2'; text = '#dc2626'; emoji = '⚠️'; }
    else if (norm.includes('oem') || norm.includes('specific')) { bg = '#e0e7ff'; text = '#3730a3'; emoji = '📦'; }
    
    return `<span class="tile-category" style="background:${bg}; color:${text}; padding:4px 8px; border-radius:4px; font-size:0.75rem; font-weight:600; text-transform:uppercase;">${emoji} ${category}</span>`;
}

function _getStatusBadgeHtml(status) {
    if (!status) return '';
    const norm = status.toLowerCase().trim();
    let bg = '#e2e8f0';
    let text = '#475569';
    
    if (norm === 'active') { bg = '#dcfce7'; text = '#15803d'; }
    else if (norm === 'under review') { bg = '#fef3c7'; text = '#92400e'; }
    else if (norm === 'in progress') { bg = '#fef3c7'; text = '#b45309'; }
    else if (norm === 'legacy') { bg = '#e2e8f0'; text = '#475569'; }
    
    return `<span class="status-badge" style="background:${bg}; color:${text}; padding:4px 8px; border-radius:4px; font-size:0.75rem; font-weight:600; text-transform:uppercase;">${status}</span>`;
}

function _injectToolResourcesCard(pageSlug) {
    // If TOOL_RESOURCES is not loaded yet, dynamically load it first
    if (!window.TOOL_RESOURCES) {
        const script = document.createElement('script');
        script.src = 'js/tool-resources.js';
        script.onload = () => _renderResourcesCard(pageSlug);
        script.onerror = () => {
            console.error('Failed to load tool-resources.js');
            _renderFallbackCard(pageSlug);
        };
        document.body.appendChild(script);
    } else {
        _renderResourcesCard(pageSlug);
    }
}

function _renderResourcesCard(pageSlug) {
    let container = document.querySelector('.placeholder-container, .calc-container, .container, .container-tool, .page-wrap, .page-container');
    if (!container) container = document.body;

    // Check if card is already injected to avoid duplicates
    if (document.getElementById('tool-resources-card-section')) return;

    const resource = window.TOOL_RESOURCES[pageSlug];
    let htmlContent = '';
    const topColor = resource ? (resource.basisClass === 'basis-safety' ? '#dc2626' : (resource.basisClass === 'basis-standard' ? '#ef4444' : (resource.basisClass === 'basis-oem' ? '#6366f1' : '#f59e0b'))) : '#cbd5e1';

    if (!resource) {
        // Fallback card
        htmlContent = `
            <div id="tool-resources-card-section" class="tool-resources-card" style="border-top: 4px solid #cbd5e1;">
                <div class="resources-card-header">
                    <h3 class="resources-card-title"><i class="fas fa-book"></i> Resources</h3>
                    <span class="resources-basis-badge basis-field">Review Required</span>
                </div>
                <div class="resources-note-box">
                    <div class="resources-note-title">Caution / Verification Required</div>
                    Resources for this tool are being reviewed. Use this tool together with the applicable OEM manual, project specification, local electrical code, and approved site procedure.
                </div>
                <div class="resources-action-row">
                    <a href="index.html#resources" class="btn-view-hub-resources">View Hub Resources <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
        `;
    } else {
        const referencesHTML = resource.references.map(ref => `
            <li>
                ${ref.name}
                <span class="resources-ref-type">${ref.type}</span>
            </li>
        `).join('');

        htmlContent = `
            <div id="tool-resources-card-section" class="tool-resources-card" style="border-top: 4px solid ${topColor};">
                <div class="resources-card-header">
                    <h3 class="resources-card-title"><i class="fas fa-book"></i> Resources</h3>
                    <span class="resources-basis-badge ${resource.basisClass || 'basis-field'}">${resource.basis}</span>
                </div>
                <div style="font-size:0.88rem; font-weight:700; color:#334155; margin-bottom:0.5rem;"><i class="fas fa-bookmark" style="color:${topColor}; margin-right:4px;"></i> Key References:</div>
                <ul class="resources-list">
                    ${referencesHTML}
                </ul>
                <div class="resources-note-box">
                    <div class="resources-note-title">Caution &amp; Usage Note</div>
                    ${resource.note}
                </div>
                <div class="resources-action-row">
                    <a href="index.html#resources" class="btn-view-hub-resources">View Hub Resources <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
        `;
    }

    // Target right sidebar (second column of .tool-body-grid) first
    const grid = document.querySelector('.tool-body-grid');
    let target = null;
    if (grid && grid.children.length >= 2) {
        target = grid.children[1];
    }

    if (target) {
        target.insertAdjacentHTML('beforeend', htmlContent);
    } else {
        const footer = container.querySelector('.footer, .main-footer');
        if (footer) {
            footer.insertAdjacentHTML('beforebegin', htmlContent);
        } else {
            container.insertAdjacentHTML('beforeend', htmlContent);
        }
    }
    
    _relocateEngineeringModule();
}

function _renderFallbackCard(pageSlug) {
    let container = document.querySelector('.placeholder-container, .calc-container, .container, .container-tool, .page-wrap, .page-container');
    if (!container) container = document.body;
    if (document.getElementById('tool-resources-card-section')) return;

    const htmlContent = `
        <div id="tool-resources-card-section" class="tool-resources-card" style="border-top: 4px solid #cbd5e1;">
            <div class="resources-card-header">
                <h3 class="resources-card-title"><i class="fas fa-book"></i> Resources</h3>
                <span class="resources-basis-badge basis-field">Review Required</span>
            </div>
            <div class="resources-note-box">
                <div class="resources-note-title">Caution / Verification Required</div>
                Resources for this tool are being reviewed. Use this tool together with the applicable OEM manual, project specification, local electrical code, and approved site procedure.
            </div>
            <div class="resources-action-row">
                <a href="index.html#resources" class="btn-view-hub-resources">View Hub Resources <i class="fas fa-arrow-right"></i></a>
            </div>
        </div>
    `;

    const grid = document.querySelector('.tool-body-grid');
    let target = null;
    if (grid && grid.children.length >= 2) {
        target = grid.children[1];
    }

    if (target) {
        target.insertAdjacentHTML('beforeend', htmlContent);
    } else {
        const footer = container.querySelector('.footer, .main-footer');
        if (footer) {
            footer.insertAdjacentHTML('beforebegin', htmlContent);
        } else {
            container.insertAdjacentHTML('beforeend', htmlContent);
        }
    }
    
    _relocateEngineeringModule();
}

function _relocateEngineeringModule() {
    setTimeout(() => {
        let engModuleBox = null;
        const panels = document.querySelectorAll('.card-panel, div');
        for (const panel of panels) {
            const cardTitle = panel.querySelector('.card-title');
            if (cardTitle && cardTitle.textContent.includes('Engineering Module Info')) {
                engModuleBox = panel;
                break;
            }
        }
        if (engModuleBox) {
            const resourcesCard = document.getElementById('tool-resources-card-section');
            if (resourcesCard) {
                resourcesCard.parentNode.insertBefore(engModuleBox, resourcesCard.nextSibling);
                engModuleBox.style.marginTop = '24px';
                engModuleBox.style.marginBottom = '24px';
            }
        }
    }, 50);
}

// Preserve original window.print
const originalPrint = window.print;

window.triggerPdfExport = function() {
    // 1. Check what elements exist on the page
    const hasPhotos = !!(document.getElementById('photo-evidence-section') || document.getElementById('photos-thumbnail-grid'));
    const hasSigs = !!(document.getElementById('signatures-section') || document.getElementById('signatures-display-grid'));
    const hasRefs = !!(document.querySelector('.assumptions-box') || document.querySelector('.assumptions-list'));
    const hasOpen = !!(document.getElementById('open-actions-section') || document.getElementById('open-tbody'));

    // If none of these exist, just trigger native print directly (or show modal with default print)
    if (!hasPhotos && !hasSigs && !hasRefs && !hasOpen) {
        originalPrint();
        return;
    }

    // 2. Build print options modal
    let modal = document.getElementById('l3s-print-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'l3s-print-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(15, 23, 42, 0.6); display: flex; align-items: center;
            justify-content: center; z-index: 10000; font-family: 'Inter', sans-serif;
        `;
        document.body.appendChild(modal);
    }

    // Determine draft status from URL or page context
    const urlParams = new URLSearchParams(window.location.search);
    const draftId = urlParams.get('draftId') || (window.currentDraftId) || null;
    const isDraft = !!draftId;

    modal.innerHTML = `
        <div style="background: #ffffff; width: 90%; max-width: 440px; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); padding: 24px; box-sizing: border-box;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
                <h3 style="margin:0; font-family:'Outfit',sans-serif; font-size:1.25rem; color:#0f172a; display:flex; align-items:center; gap:6px;">
                    <i class="fas fa-file-pdf" style="color:#ef4444;"></i> PDF / Print Options
                </h3>
                <button id="l3s-print-close" style="background:none; border:none; font-size:1.2rem; cursor:pointer; color:#64748b;"><i class="fas fa-times"></i></button>
            </div>
            
            <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:20px; font-size:0.9rem; color:#475569;">
                ${hasPhotos ? `
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                    <input type="checkbox" id="l3s-print-opt-photos" checked style="width:16px; height:16px;"> Include Photo Evidence
                </label>` : ''}
                ${hasSigs ? `
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                    <input type="checkbox" id="l3s-print-opt-sigs" checked style="width:16px; height:16px;"> Include Digital Signatures
                </label>` : ''}
                ${hasRefs ? `
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                    <input type="checkbox" id="l3s-print-opt-refs" checked style="width:16px; height:16px;"> Include Methodology & References
                </label>` : ''}
                ${hasOpen ? `
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                    <input type="checkbox" id="l3s-print-opt-open" checked style="width:16px; height:16px;"> Include Open Actions Section
                </label>` : ''}
            </div>

            ${isDraft ? `
                <div style="background:#fffbeb; border:1px solid #fef3c7; border-left:4px solid #d97706; padding:10px 12px; border-radius:6px; font-size:0.78rem; color:#b45309; margin-bottom:20px; line-height:1.4;">
                    <i class="fas fa-info-circle"></i> <strong>Draft Watermark Active:</strong> This record is in-progress. The printed layout will include a non-final draft banner with the draft ID and generation date.
                </div>
            ` : ''}

            <div style="display:flex; gap:12px; justify-content:flex-end;">
                <button id="l3s-print-cancel" style="background:#f1f5f9; color:#475569; border:none; padding:8px 16px; border-radius:8px; font-weight:600; cursor:pointer; font-size:0.85rem;">Cancel</button>
                <button id="l3s-print-proceed" style="background:#2563eb; color:white; border:none; padding:8px 16px; border-radius:8px; font-weight:600; cursor:pointer; font-size:0.85rem;">Proceed to Print</button>
            </div>
        </div>
    `;

    modal.style.display = 'flex';

    const closeModal = () => {
        modal.style.display = 'none';
    };

    document.getElementById('l3s-print-close').addEventListener('click', closeModal);
    document.getElementById('l3s-print-cancel').addEventListener('click', closeModal);

    document.getElementById('l3s-print-proceed').addEventListener('click', () => {
        const showPhotos = hasPhotos ? document.getElementById('l3s-print-opt-photos').checked : true;
        const showSigs = hasSigs ? document.getElementById('l3s-print-opt-sigs').checked : true;
        const showRefs = hasRefs ? document.getElementById('l3s-print-opt-refs').checked : true;
        const showOpen = hasOpen ? document.getElementById('l3s-print-opt-open').checked : true;

        closeModal();

        // Inject print options style definitions dynamically
        const printStyles = document.createElement('style');
        printStyles.id = 'l3s-print-style-rules';
        printStyles.innerHTML = `
            @media print {
                /* Show all tabs/subsections sequentially */
                .tab-content, .tab-pane { display: block !important; opacity: 1 !important; visibility: visible !important; margin-bottom: 2rem; }
                .tab-container, .tab-bar, .back-link, .btn-back, .btn-row, .btn-add-row, td button, .btn-remove, #print-btn, #print-report-btn, #print-form-btn, #reset-btn { display: none !important; }
                
                body { background: white !important; color: black !important; }
                .placeholder-container, .workspace-container { padding: 0 !important; margin: 0 !important; box-shadow: none !important; max-width: 100% !important; }
                input, select, textarea {
                    border: none !important;
                    background: transparent !important;
                    color: black !important;
                    padding: 0 !important;
                    box-sizing: border-box !important;
                    pointer-events: none !important;
                    resize: none !important;
                }
                
                /* Toggles */
                ${!showPhotos ? '#photo-evidence-section, #photos-thumbnail-grid { display: none !important; }' : ''}
                ${!showSigs ? '#signatures-section, #signatures-display-grid { display: none !important; }' : ''}
                ${!showRefs ? '.assumptions-box { display: none !important; }' : ''}
                ${!showOpen ? '#open-actions-section, #open-tbody { display: none !important; }' : ''}

                .draft-watermark-print {
                    display: block !important;
                    border: 2px solid #ef4444;
                    background: #fef2f2;
                    color: #b91c1c;
                    padding: 10px 14px;
                    border-radius: 6px;
                    text-align: center;
                    font-weight: 700;
                    font-size: 0.85rem;
                    margin-bottom: 20px;
                    line-height: 1.4;
                }
            }
            .draft-watermark-print { display: none; }
        `;
        document.head.appendChild(printStyles);

        let watermarkBanner = null;
        if (isDraft) {
            watermarkBanner = document.createElement('div');
            watermarkBanner.className = 'draft-watermark-print';
            watermarkBanner.innerHTML = `
                <div>⚠️ DRAFT - NOT FINAL</div>
                <div style="font-size: 0.7rem; font-weight: normal; margin-top: 2px; color: #7f1d1d;">
                    Draft ID: ${draftId} | Generated: ${new Date().toLocaleString()}
                </div>
            `;
            const container = document.querySelector('.placeholder-container') || document.querySelector('.workspace-container') || document.body;
            if (container) {
                container.insertBefore(watermarkBanner, container.firstChild);
            }
        }

        setTimeout(() => {
            originalPrint();
            if (printStyles) printStyles.remove();
            if (watermarkBanner) watermarkBanner.remove();
        }, 150);
    });
};

// Global redirect for any standard print triggers
window.print = function() {
    window.triggerPdfExport();
};