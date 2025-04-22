/**
 * CoE Level 3 Support Portal - Training Request Page JavaScript
 * 
 * Table of Contents:
 * 1. Global Variables and Constants
 * 2. Page Initialization
 * 3. Form Field Management
 * 4. File Upload Handling
 * 5. Form Submission
 * 6. Event Listeners
 */

/**
 * 1. Global Variables and Constants
 * --------------------------------
 */
// File related
let uploadedFiles = [];

/**
 * 2. Page Initialization
 * --------------------
 */
document.addEventListener('DOMContentLoaded', function() {
    // Wake up the server
    wakeUpServer();

    // Initialize modals
    initializeSuccessModal();
    
    // Initialize file upload
    initializeFileUpload();
    
    // Set minimum date for expected date (30 days from today)
    setMinimumDate('expected-date', 30);
    
    // Initialize form handlers and submission
    const form = document.getElementById('support-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Hide loading spinner on initial load
    hideLoadingSpinner();
});

/**
 * Initialize the success modal
 */
function initializeSuccessModal() {
    const modal = document.getElementById('success-modal');
    const closeButton = document.getElementById('success-close-btn');
    
    if (!modal || !closeButton) {
        console.warn('Success modal elements not found');
        return;
    }
    
    // Close button event
    closeButton.addEventListener('click', function() {
        modal.style.display = 'none';
        modal.classList.add('hidden');
        resetFormToInitial(); // Make sure form is reset when modal is closed
    });
}

/**
 * Set strict minimum date for a date input
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
    
    // Set current value to minimum date as a default
    if (!dateInput.value) {
        dateInput.value = formattedDate;
    }
    
    // Force disable past dates with a validation function
    dateInput.addEventListener('change', function() {
        const selectedDate = new Date(this.value);
        if (selectedDate < minDate) {
            showErrorMessage(
                'Invalid Date', 
                `Please select a date at least ${daysFromNow} days from today.`,
                '#message-container'
            );
            this.value = formattedDate; // Set to minimum valid date
        }
    });
    
    // Also intercept on blur to catch manual entry
    dateInput.addEventListener('blur', function() {
        const selectedDate = new Date(this.value);
        if (selectedDate < minDate || isNaN(selectedDate.getTime())) {
            this.value = formattedDate; // Reset to minimum date if invalid
        }
    });
}

/**
 * 3. File Upload Handling
 * ---------------------
 */

/**
 * Initialize file upload functionality
 */
function initializeFileUpload() {
    const fileUpload = document.getElementById('file-upload');
    const fileInput = document.getElementById('file-input');
    
    if (!fileUpload || !fileInput) return;
    
    // Prevent default behaviors for drag events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileUpload.addEventListener(eventName, preventDefaults, false);
    });
    
    // Add highlighting for drag events
    ['dragenter', 'dragover'].forEach(eventName => {
        fileUpload.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        fileUpload.addEventListener(eventName, unhighlight, false);
    });
    
    // Handle file drop and selection
    fileUpload.addEventListener('drop', handleDrop, false);
    fileInput.addEventListener('change', handleFiles, false);
    
    // Open file picker when clicking on the upload area
    fileUpload.addEventListener('click', () => {
        fileInput.click();
    });
}

/**
 * Prevent default behaviors for drag events
 * @param {Event} e - The event object
 */
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

/**
 * Add highlight class to the file upload area
 */
function highlight() {
    const fileUpload = document.getElementById('file-upload');
    if (fileUpload) {
        fileUpload.classList.add('dragover');
    }
}

/**
 * Remove highlight class from the file upload area
 */
function unhighlight() {
    const fileUpload = document.getElementById('file-upload');
    if (fileUpload) {
        fileUpload.classList.remove('dragover');
    }
}

/**
 * Handle dropped files
 * @param {DragEvent} e - The drag event
 */
function handleDrop(e) {
    const dt = e.dataTransfer;
    handleFiles({ target: { files: dt.files } });
}

/**
 * Handle selected files
 * @param {Event} e - The change event
 */
function handleFiles(e) {
    const newFiles = [...e.target.files];
    const validFiles = newFiles.filter(file => validateFileType(file));
    const invalidFiles = newFiles.filter(file => !validateFileType(file));
    
    // Show error for invalid files
    if (invalidFiles.length > 0) {
        const invalidFileNames = invalidFiles.map(file => file.name).join(', ');
        showErrorMessage(
            'Invalid file type(s)', 
            `The following files are not allowed: ${invalidFileNames}. Please upload only txt, zip, rar, pictures, PDFs, or MS Office files.`
        );
    }
    
    // Add valid files to the list
    uploadedFiles = [...uploadedFiles, ...validFiles];
    updateFileList();
}

/**
 * Validate file type
 * @param {File} file - The file to validate
 * @returns {boolean} True if the file type is allowed
 */
function validateFileType(file) {
    return ALLOWED_FILE_TYPES.includes(file.type);
}

/**
 * Update the file list display
 */
function updateFileList() {
    const fileList = document.getElementById('file-list');
    if (!fileList) return;
    
    fileList.innerHTML = '';
    
    uploadedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <span>${file.name}</span>
            <span class="remove-file" data-index="${index}">×</span>
        `;
        fileList.appendChild(fileItem);
    });
    
    // Add click event listeners to remove buttons
    document.querySelectorAll('.remove-file').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            removeFile(index);
        });
    });
}

/**
 * Remove a file from the list
 * @param {number} index - The index of the file to remove
 */
function removeFile(index) {
    uploadedFiles.splice(index, 1);
    updateFileList();
}

/**
 * 4. Form Submission
 * ----------------
 */

/**
 * Handle form submission
 * @param {Event} e - The submit event
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Clear previous messages
    const messageContainer = document.getElementById('message-container');
    if (messageContainer) {
        messageContainer.innerHTML = '';
    }
    
    // Perform validation
    const form = e.target;
    const { isValid, invalidFields } = validateForm(form);
    
    if (!isValid) {
        // Form validation failed, error messages are already displayed
        return;
    }
    
    // Validate total file size
    const totalSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > MAX_FILE_SIZE) {
        showErrorMessage(
            'Total file size exceeds 50MB limit', 
            'Please reduce the number or size of your attachments.'
        );
        return;
    }
    
    // Disable submit button and show loading spinner
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        submitBtn.disabled = true;
    }
    
    showLoadingSpinner('loading-spinner', 'Submitting your request...');
    
    try {
        // Create FormData object
        const formData = new FormData();
        
        // Add common fields
        formData.append('requesterName', document.getElementById('requester-name').value);
        formData.append('requesterEmail', document.getElementById('requester-email').value);
        formData.append('request', document.getElementById('request').value);
        
        // Add training specific fields
        const location = document.getElementById('location');
        if (location && location.value) {
            formData.append('location', location.value);
        }
        
        const projectName = document.getElementById('project-name');
        if (projectName && projectName.value) {
            formData.append('projectName', projectName.value);
        }
        
        const productType = document.getElementById('product-type');
        if (productType && productType.value) {
            formData.append('productType', productType.value);
        }
        
        const model = document.getElementById('model');
        if (model && model.value) {
            formData.append('model', model.value);
        }
        
        const trainingDesc = document.getElementById('training-description');
        if (trainingDesc && trainingDesc.value) {
            formData.append('description', trainingDesc.value);
        }
        
        const expectedDate = document.getElementById('expected-date');
        if (expectedDate && expectedDate.value) {
            formData.append('expectedDate', expectedDate.value);
        }
        
        const traineesNumber = document.getElementById('trainees-number');
        if (traineesNumber && traineesNumber.value) {
            formData.append('traineesNumber', traineesNumber.value);
        }
        
        // Add files to FormData
        uploadedFiles.forEach(file => {
            formData.append('attachments', file);
        });
        
        // Show info message during submission
        showInfoMessage(
            'Submitting training request...', 
            'This may take a few moments. Please don\'t close the page.'
        );
        
        // Log what we're sending for debugging
        console.log('Submitting to endpoint:', API_BASE_URL + API_ENDPOINTS.submitRequest);
        console.log('Form type: TRAINING');
        
        // Use fetch with timeout to ensure we don't hang forever
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const response = await fetch(API_BASE_URL + API_ENDPOINTS.submitRequest, {
            method: 'POST',
            body: formData,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Parse response
        const data = await response.json();
        console.log('Submit response:', data);
        
        // Check if response is successful
        if (response.ok) {
            // Show success modal with the issue ID
            showSuccessModal(data.issueId);
            
            // Clear any info messages
            if (messageContainer) {
                messageContainer.innerHTML = '';
            }
        } else {
            // Handle server error with error message from server
            const errorMsg = data.error || 'Server error';
            const errorDetails = data.details || 'Please try again later';
            
            showErrorMessage(errorMsg, errorDetails);
        }
    } catch (error) {
        console.error('Submission error:', error);
        
        // Check for abort error (timeout)
        if (error.name === 'AbortError') {
            showErrorMessage(
                'Request timed out', 
                'The server is taking too long to respond. Please try again later.'
            );
        } else {
            // Handle other errors
            showErrorMessage(
                'Error submitting form', 
                error.message || 'Failed to submit the form. Please check your connection and try again.'
            );
        }
    } finally {
        // Re-enable submit button and hide loading spinner
        if (submitBtn) {
            submitBtn.disabled = false;
        }
        
        hideLoadingSpinner();
    }
}

/**
 * Initialize a modal with a success message
 * @param {string} issueId - The issue ID to display
 */
function showSuccessModal(issueId) {
    const successModal = document.getElementById('success-modal');
    const requestIdSpan = document.getElementById('request-id');
    
    if (!successModal || !requestIdSpan) {
        console.warn('Success modal elements not found');
        return;
    }
    
    // Set the issue ID
    requestIdSpan.textContent = issueId || 'N/A';
    
    // Show the modal
    successModal.style.display = 'flex';
    successModal.classList.remove('hidden');
}

/**
 * Reset form to initial state
 */
function resetFormToInitial() {
    const form = document.getElementById('support-form');
    if (!form) return;
    
    // Reset form fields
    form.reset();
    
    // Clear uploaded files
    uploadedFiles = [];
    updateFileList();
    
    // Reset minimum date for expected date
    setMinimumDate('expected-date', 30);
    
    // Clear messages
    const messageContainer = document.getElementById('message-container');
    if (messageContainer) {
        messageContainer.innerHTML = '';
    }
    
    console.log('Form has been reset to initial state');
}

/**
 * 5. Global functions
 * ----------------
 */
// Define a global removeFile function for compatibility with inline HTML handlers
window.removeFile = removeFile;