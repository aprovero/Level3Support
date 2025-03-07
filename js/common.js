/**
 * CoE Level 3 Support Portal - Common JavaScript Functions
 * 
 * Table of Contents:
 * 1. Configuration and Constants
 * 2. Message System (success, error, info, warning)
 * 3. Modal Management
 * 4. Loading Indicators
 * 5. Form Validation
 * 6. Form Utilities
 * 7. AJAX Requests
 * 8.
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
// Add these functions after your existing AJAX Requests section (section 7)
// Look for a comment like "7. AJAX Requests" or similar

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