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
    const headerSection = document.querySelector('.tool-header-section');
    if (!headerSection) return; // Only run on tool pages

    const pageFile = window.location.pathname.split('/').pop() || 'index.html';

    // Load tool registry and apply enrichment
    fetch('./tools-data.json')
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => {
            const tools = data.tools || [];
            const tool = tools.find(t => (t.url || '').split('?')[0] === pageFile);
            _enrichToolHeader(headerSection, pageFile, tool);
        })
        .catch(() => {
            // Even without JSON, inject workflow badges and gear if we have the page file
            _enrichToolHeader(headerSection, pageFile, null);
        });
});

function _enrichToolHeader(headerSection, pageFile, registryTool) {
    // Apply any localStorage overrides to the registry tool data
    const overrides = JSON.parse(localStorage.getItem(TOOL_META_OVERRIDES_KEY) || '{}');
    const override = overrides[pageFile];
    const effectiveTool = override ? { ...(registryTool || {}), ...override } : registryTool;

    // ── 1. Inject workflow pack badges ──────────────────────────────────────
    const packs = TOOL_WORKFLOW_MAP[pageFile] || [];
    if (packs.length > 0) {
        const wfRow = document.createElement('div');
        wfRow.id = 'tool-workflow-badges';
        wfRow.style.cssText = 'display:flex; flex-wrap:wrap; gap:6px; margin-top:0.85rem; align-items:center;';
        wfRow.innerHTML = `
            <span style="font-size:0.72rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.05em; margin-right:2px;">
                <i class="fas fa-sitemap" style="margin-right:3px;"></i>Part of:
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
        `;

        // Insert after the .tool-meta div (category/status badges row) or at end of header
        const metaDiv = headerSection.querySelector('.tool-meta') ||
                        headerSection.querySelector('.tool-title-row');
        if (metaDiv) {
            metaDiv.after ? metaDiv.after(wfRow) : metaDiv.parentNode.insertBefore(wfRow, metaDiv.nextSibling);
        } else {
            headerSection.appendChild(wfRow);
        }
    }

    // ── 2. Inject gear icon ─────────────────────────────────────────────────
    const titleRow = headerSection.querySelector('.tool-title-row');
    if (titleRow) {
        const gearBtn = document.createElement('button');
        gearBtn.id = 'tool-gear-btn';
        gearBtn.title = 'Edit tool status & tags';
        gearBtn.innerHTML = '<i class="fas fa-cog"></i>';
        gearBtn.style.cssText = `
            position:absolute; top:1.25rem; right:1.25rem;
            background:none; border:none; cursor:pointer;
            color:#94a3b8; font-size:1.15rem; padding:4px;
            transition:color 0.2s, transform 0.3s;
            line-height:1;
        `;
        gearBtn.onmouseenter = () => { gearBtn.style.color = '#2563eb'; gearBtn.style.transform = 'rotate(60deg)'; };
        gearBtn.onmouseleave = () => { gearBtn.style.color = '#94a3b8'; gearBtn.style.transform = 'rotate(0deg)'; };
        gearBtn.onclick = () => _openGearModal(pageFile, effectiveTool);

        // Make header position relative so absolute gear sits inside it
        if (getComputedStyle(headerSection).position === 'static') {
            headerSection.style.position = 'relative';
        }
        headerSection.appendChild(gearBtn);
    }

    // ── 3. Inject gear modal (once) ─────────────────────────────────────────
    if (!document.getElementById('tool-gear-modal')) {
        const modal = document.createElement('div');
        modal.id = 'tool-gear-modal';
        modal.style.cssText = `
            display:none; position:fixed; inset:0; z-index:9000;
            background:rgba(15,23,42,0.45); backdrop-filter:blur(3px);
            align-items:center; justify-content:center;
        `;
        modal.innerHTML = `
            <div id="tool-gear-panel" style="
                background:#fff; border-radius:16px; padding:2rem;
                width:min(440px, 92vw); box-shadow:0 20px 60px rgba(0,0,0,0.2);
                font-family:'Inter','Outfit',sans-serif;
            ">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                    <div>
                        <h3 style="margin:0; font-size:1.1rem; font-weight:700; color:#0f172a; font-family:'Outfit',sans-serif;">
                            <i class="fas fa-cog" style="color:#2563eb; margin-right:6px;"></i>Edit Tool Metadata
                        </h3>
                        <p style="margin:0.2rem 0 0; font-size:0.78rem; color:#64748b;">Saved locally — syncs to hub cards instantly.</p>
                    </div>
                    <button onclick="document.getElementById('tool-gear-modal').style.display='none'"
                        style="background:none; border:none; cursor:pointer; color:#94a3b8; font-size:1.2rem; padding:4px;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <!-- Status -->
                <label style="display:block; font-size:0.8rem; font-weight:700; color:#475569; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.05em;">
                    Status
                </label>
                <div id="gear-status-pills" style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:1.5rem;"></div>

                <!-- Tags -->
                <label style="display:block; font-size:0.8rem; font-weight:700; color:#475569; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.05em;">
                    Tags <span style="font-weight:400; text-transform:none; color:#94a3b8;">(comma-separated)</span>
                </label>
                <input id="gear-tags-input" type="text"
                    placeholder="e.g. PV, Inverter, Diagnostics"
                    style="width:100%; box-sizing:border-box; border:1.5px solid #e2e8f0; border-radius:8px;
                           padding:0.6rem 0.8rem; font-size:0.88rem; color:#1e293b; outline:none;
                           transition:border-color 0.2s; margin-bottom:1.5rem;"
                    onfocus="this.style.borderColor='#2563eb'"
                    onblur="this.style.borderColor='#e2e8f0'"
                >

                <!-- Note -->
                <div style="background:#fafafa; border:1px solid #e2e8f0; border-radius:8px; padding:0.65rem 0.85rem; margin-bottom:1.5rem; font-size:0.78rem; color:#64748b; display:flex; gap:8px; align-items:flex-start;">
                    <i class="fas fa-info-circle" style="color:#3b82f6; margin-top:1px;"></i>
                    <span>Changes are stored in your browser. A central database will persist these across devices in a future update.</span>
                </div>

                <!-- Actions -->
                <div style="display:flex; gap:10px; justify-content:flex-end;">
                    <button id="gear-reset-btn"
                        style="background:#f1f5f9; border:none; border-radius:8px; padding:0.6rem 1.1rem;
                               font-size:0.85rem; font-weight:600; color:#64748b; cursor:pointer; transition:background 0.2s;"
                        onmouseenter="this.style.background='#e2e8f0'"
                        onmouseleave="this.style.background='#f1f5f9'">
                        <i class="fas fa-undo" style="margin-right:4px;"></i>Reset
                    </button>
                    <button id="gear-save-btn"
                        style="background:#2563eb; border:none; border-radius:8px; padding:0.6rem 1.4rem;
                               font-size:0.85rem; font-weight:700; color:#fff; cursor:pointer; transition:background 0.2s;"
                        onmouseenter="this.style.background='#1d4ed8'"
                        onmouseleave="this.style.background='#2563eb'">
                        <i class="fas fa-save" style="margin-right:5px;"></i>Save Changes
                    </button>
                </div>

                <!-- Toast -->
                <div id="gear-toast" style="display:none; margin-top:1rem; background:#dcfce7; border:1px solid #86efac;
                    border-radius:8px; padding:0.55rem 0.85rem; font-size:0.82rem; color:#15803d; font-weight:600;">
                    <i class="fas fa-check-circle" style="margin-right:5px;"></i>Saved! Hub cards will reflect this change.
                </div>
            </div>
        `;
        // Close on backdrop click
        modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
        document.body.appendChild(modal);
    }
}

let _gearCurrentFile = null;

function _openGearModal(pageFile, tool) {
    _gearCurrentFile = pageFile;
    const modal = document.getElementById('tool-gear-modal');
    if (!modal) return;

    const overrides = JSON.parse(localStorage.getItem(TOOL_META_OVERRIDES_KEY) || '{}');
    const current = overrides[pageFile] || {};
    const currentStatus = current.status || (tool && tool.status) || 'Active';
    const currentTags  = current.tags  || (tool && tool.tags)  || [];

    // Render status pills
    const pillContainer = document.getElementById('gear-status-pills');
    pillContainer.innerHTML = '';
    const statusColors = {
        'Active':      { bg: '#dcfce7', color: '#15803d', border: '#86efac' },
        'In Progress': { bg: '#fef9c3', color: '#854d0e', border: '#fde047' },
        'Planned':     { bg: '#eff6ff', color: '#1d4ed8', border: '#93c5fd' },
        'Legacy':      { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
    };
    STATUS_OPTIONS.forEach(s => {
        const c = statusColors[s] || statusColors['Active'];
        const selected = s === currentStatus;
        const pill = document.createElement('button');
        pill.textContent = s;
        pill.dataset.status = s;
        pill.style.cssText = `
            padding:5px 14px; border-radius:20px; font-size:0.8rem; font-weight:700; cursor:pointer;
            transition:all 0.15s; outline:none;
            background:${selected ? c.bg : '#f8fafc'};
            color:${selected ? c.color : '#94a3b8'};
            border:2px solid ${selected ? c.border : '#e2e8f0'};
        `;
        pill.onclick = () => {
            pillContainer.querySelectorAll('button').forEach(b => {
                const bc = statusColors[b.dataset.status] || statusColors['Active'];
                b.style.background = '#f8fafc'; b.style.color = '#94a3b8'; b.style.border = '2px solid #e2e8f0';
            });
            const cc = statusColors[s] || statusColors['Active'];
            pill.style.background = cc.bg; pill.style.color = cc.color; pill.style.border = `2px solid ${cc.border}`;
        };
        pillContainer.appendChild(pill);
    });

    // Pre-fill tags
    const tagsInput = document.getElementById('gear-tags-input');
    tagsInput.value = Array.isArray(currentTags) ? currentTags.join(', ') : currentTags;

    // Hide toast
    document.getElementById('gear-toast').style.display = 'none';

    // Save handler
    const saveBtn = document.getElementById('gear-save-btn');
    const resetBtn = document.getElementById('gear-reset-btn');

    // Rebind to avoid duplicate listeners
    const newSave = saveBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newSave, saveBtn);
    newSave.onmouseenter = () => newSave.style.background = '#1d4ed8';
    newSave.onmouseleave = () => newSave.style.background = '#2563eb';
    newSave.onclick = () => _saveGearChanges(pageFile);

    const newReset = resetBtn.cloneNode(true);
    resetBtn.parentNode.replaceChild(newReset, resetBtn);
    newReset.onmouseenter = () => newReset.style.background = '#e2e8f0';
    newReset.onmouseleave = () => newReset.style.background = '#f1f5f9';
    newReset.onclick = () => _resetGearChanges(pageFile);

    modal.style.display = 'flex';
}

function _saveGearChanges(pageFile) {
    const selectedPill = document.querySelector('#gear-status-pills button[style*="dcfce7"], #gear-status-pills button[style*="fef9c3"], #gear-status-pills button[style*="eff6ff"], #gear-status-pills button[style*="f1f5f9"]:not([style*="f8fafc"])');
    
    // Find the actually-selected pill (the one with color != #94a3b8)
    let selectedStatus = 'Active';
    document.querySelectorAll('#gear-status-pills button').forEach(b => {
        if (b.style.color !== 'rgb(148, 163, 184)' && b.style.color !== '#94a3b8') {
            selectedStatus = b.dataset.status;
        }
    });

    const rawTags = document.getElementById('gear-tags-input').value;
    const tags = rawTags.split(',').map(t => t.trim()).filter(Boolean);

    const overrides = JSON.parse(localStorage.getItem(TOOL_META_OVERRIDES_KEY) || '{}');
    overrides[pageFile] = { status: selectedStatus, tags };
    localStorage.setItem(TOOL_META_OVERRIDES_KEY, JSON.stringify(overrides));

    // Show toast
    const toast = document.getElementById('gear-toast');
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2500);

    console.log(`[ToolMeta] Override saved for ${pageFile}:`, overrides[pageFile]);
}

function _resetGearChanges(pageFile) {
    const overrides = JSON.parse(localStorage.getItem(TOOL_META_OVERRIDES_KEY) || '{}');
    delete overrides[pageFile];
    localStorage.setItem(TOOL_META_OVERRIDES_KEY, JSON.stringify(overrides));

    // Close modal
    document.getElementById('tool-gear-modal').style.display = 'none';
    console.log(`[ToolMeta] Override reset for ${pageFile}.`);
}