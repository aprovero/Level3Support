/**
 * CoE Level 3 Support Portal - Index Page JavaScript
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

// Form sections
const FORM_SECTIONS = {
    common: 'common-fields',
    training: 'training-fields',
    supportRca: 'support-rca-fields',
    other: 'other-fields',
    fileUpload: 'file-upload-section'
};

/**
 * 2. Page Initialization
 * --------------------
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize modals
    initializeWelcomeModal();
    initializeSuccessModal();
    
    // Initialize file upload
    initializeFileUpload();
    
    // Initialize form handlers
    initializeFormHandlers();
    
    // Hide loading spinner on initial load
    hideLoadingSpinner();
});

/**
 * Initialize the welcome modal
 */
function initializeWelcomeModal() {
    initializeModal('welcome-modal', 'understand-btn');
}

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
 * Initialize form handlers and event listeners
 */
function initializeFormHandlers() {
    const requestSelect = document.getElementById('request');
    const esrCheckbox = document.getElementById('esr-completed');
    const form = document.getElementById('support-form');
    
    // Request type change handler
    if (requestSelect) {
        requestSelect.addEventListener('change', handleRequestTypeChange);
    }
    
    // ESR checkbox handler
    if (esrCheckbox) {
        esrCheckbox.addEventListener('change', handleEsrCheckboxChange);
    }
    
    // Form submission
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

/**
 * Initialize the success modal
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
    
    // Add event listener to close button if it hasn't been set up yet
    const closeButton = document.getElementById('success-close-btn');
    if (closeButton) {
        // Remove existing event listeners to prevent duplicates
        const newCloseBtn = closeButton.cloneNode(true);
        closeButton.parentNode.replaceChild(newCloseBtn, closeButton);
        
        newCloseBtn.addEventListener('click', function() {
            successModal.style.display = 'none';
            successModal.classList.add('hidden');
            resetFormToInitial(); // Reset form when modal is closed
        });
    }
}

/**
 * 3. Form Field Management
 * ----------------------
 */

/**
 * Handle changes to the request type dropdown
 */
function handleRequestTypeChange() {
    const selectedValue = this.value;
    
    // Reset visibility
    hideAllFormSections();
    
    // Reset required attributes
    resetRequiredAttributes();
    
    if (selectedValue) {
        showCommonFields();
        
        // Add required attributes to common fields
        setCommonFieldsRequired(true);
        
        // Show specific fields based on request type
        if (selectedValue === 'TRAINING') {
            showTrainingFields();
        } else if (['SUPPORT', 'RCA'].includes(selectedValue)) {
            showSupportRcaFields();
        } else if (selectedValue === 'OTHER') {
            showOtherFields();
        }
    }
}

/**
 * Hide all form sections
 */
function hideAllFormSections() {
    Object.values(FORM_SECTIONS).forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'none';
        }
    });
    
    // Also hide submit button
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        submitBtn.style.display = 'none';
    }
}

/**
 * Reset all required attributes on form fields
 */
function resetRequiredAttributes() {
    document.querySelectorAll('input, select, textarea').forEach(element => {
        if (element.hasAttribute('required')) {
            element.removeAttribute('required');
        }
    });
}

/**
 * Show common fields that appear in all form types
 */
function showCommonFields() {
    const commonFields = document.getElementById(FORM_SECTIONS.common);
    const fileUploadSection = document.getElementById(FORM_SECTIONS.fileUpload);
    const submitBtn = document.getElementById('submit-btn');
    
    if (commonFields) commonFields.style.display = 'block';
    if (fileUploadSection) fileUploadSection.style.display = 'block';
    if (submitBtn) submitBtn.style.display = 'block';
}

/**
 * Set required attributes on common fields
 * @param {boolean} isRequired - Whether the fields should be required
 */
function setCommonFieldsRequired(isRequired) {
    const requiredCommonFields = ['location', 'product-type', 'project-name'];
    
    requiredCommonFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            if (isRequired) {
                field.setAttribute('required', '');
            } else {
                field.removeAttribute('required');
            }
        }
    });
}

/**
 * Show training specific fields
 */
function showTrainingFields() {
    const trainingFields = document.getElementById(FORM_SECTIONS.training);
    
    if (trainingFields) {
        trainingFields.style.display = 'block';
        
        // Set required fields for training
        const requiredFields = ['training-description', 'expected-date', 'trainees-number'];
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.setAttribute('required', '');
            }
        });
        
        // Initialize minimum date for expected date
        setMinimumDate('expected-date', 30);
    }
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
 * Show support/RCA specific fields
 */
function showSupportRcaFields() {
    const supportRcaFields = document.getElementById(FORM_SECTIONS.supportRca);
    
    if (supportRcaFields) {
        supportRcaFields.style.display = 'block';
        
        // Set description as required
        const descriptionField = document.getElementById('description');
        if (descriptionField) {
            descriptionField.setAttribute('required', '');
        }
    }
}

/**
 * Show "other" specific fields
 */
function showOtherFields() {
    const otherFields = document.getElementById(FORM_SECTIONS.other);
    
    if (otherFields) {
        otherFields.style.display = 'block';
        
        // Set description as required
        const descriptionField = document.getElementById('other-description');
        if (descriptionField) {
            descriptionField.setAttribute('required', '');
        }
    }
}

/**
 * Handle changes to the ESR checkbox
 */
function handleEsrCheckboxChange() {
    const attachmentRequired = document.getElementById('attachment-required');
    
    if (attachmentRequired) {
        if (this.checked) {
            attachmentRequired.classList.remove('hidden');
            attachmentRequired.style.color = 'var(--error-color)'; // Ensure color is red
        } else {
            attachmentRequired.classList.add('hidden');
        }
    }
}

/**
 * 4. File Upload Handling
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
 * 5. Form Submission
 * ----------------
 */

/**
 * Handle form submission
 * @param {Event} e - The submit event
 */
// Handle form submission
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
    
    // Check ESR attachment requirement
    const esrCheckbox = document.getElementById('esr-completed');
    if (esrCheckbox && esrCheckbox.checked && uploadedFiles.length === 0) {
        showErrorMessage(
            'Attachment Required', 
            'Please attach files as FIELD REPORT has been completed.'
        );
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
        // Create FormData object, but don't include the form directly
        // This avoids the issue with multiple description fields
        const formData = new FormData();
        
        // Manually add each form field we need
        formData.append('requesterName', document.getElementById('requester-name').value);
        formData.append('requesterEmail', document.getElementById('requester-email').value);
        formData.append('request', document.getElementById('request').value);
        formData.append('location', document.getElementById('location').value);
        formData.append('projectName', document.getElementById('project-name').value);
        formData.append('productType', document.getElementById('product-type').value);
        formData.append('model', document.getElementById('model').value);
        
        // Handle the description field differently based on request type
        const requestType = document.getElementById('request').value;
        

        if (['SUPPORT', 'RCA'].includes(requestType)) {
            formData.append('description', document.getElementById('description').value);
            
            // Add Support/RCA specific fields
            const gspTicket = document.getElementById('gsp-ticket').value;
            if (gspTicket) formData.append('gspTicket', gspTicket);
            
            const serialNumbers = document.getElementById('serial-numbers').value;
            if (serialNumbers) formData.append('serialNumbers', serialNumbers);
            
            // Add ESR checkbox value as boolean - ensure it gets sent even if false
            const esrCompleted = document.getElementById('esr-completed').checked;
            formData.append('esrCompleted', esrCompleted.toString());
        }
        else if (requestType === 'TRAINING') {
            const description = document.getElementById('training-description').value;
            const expectedDate = document.getElementById('expected-date').value;
            const traineesNumber = document.getElementById('trainees-number').value;
            
            // Combine training fields into description
            const combinedDescription = `${description}\nNumber of Trainees: ${traineesNumber}\nExpected Date: ${expectedDate}`;
            formData.append('description', combinedDescription);
            
            // Also add the original fields separately in case server needs them
            formData.append('expectedDate', expectedDate);
            formData.append('traineesNumber', traineesNumber);
        } 
        else if (requestType === 'OTHER') {
            formData.append('description', document.getElementById('other-description').value);
        }
        
        // Add files to FormData
        uploadedFiles.forEach(file => {
            formData.append('attachments', file);
        });
        
        // Show info message during submission
        showInfoMessage(
            'Submitting form...', 
            'This may take a few moments. Please don\'t close the page.'
        );
        
        // Direct fetch instead of using the helper function
        console.log('Submitting to endpoint:', API_BASE_URL + API_ENDPOINTS.submitRequest);
        const response = await fetch(API_BASE_URL + API_ENDPOINTS.submitRequest, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        console.log('Submit response:', data);
        
        // Check if response is successful
        if (response.ok) {
            // Show success modal with the issue ID
            showSuccessModal(data.issueId);
            
            // Clear any info messages
            messageContainer.innerHTML = '';
        }
        
    } catch (error) {
        console.error('Submission error:', error);
        // Handle errors
        showErrorMessage(
            'Error submitting form', 
            error.message || 'Failed to submit the form. Please check your connection and try again.'
        );
    } finally {
        // Re-enable submit button and hide loading spinner
        if (submitBtn) {
            submitBtn.disabled = false;
        }
        
        hideLoadingSpinner();
    }
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
    
    // Hide form sections
    hideAllFormSections();
    
    // Reset the request type dropdown to empty state
    const requestSelect = document.getElementById('request');
    if (requestSelect) {
        requestSelect.value = '';
    }
    
    // Clear messages
    const messageContainer = document.getElementById('message-container');
    if (messageContainer) {
        messageContainer.innerHTML = '';
    }
    
    // Hide required attachment indicator
    const attachmentRequired = document.getElementById('attachment-required');
    if (attachmentRequired) {
        attachmentRequired.classList.add('hidden');
    }
    
    // Reset ESR checkbox if present
    const esrCheckbox = document.getElementById('esr-completed');
    if (esrCheckbox) {
        esrCheckbox.checked = false;
    }
    
    // Ensure the submit button is hidden until a request type is selected
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        submitBtn.style.display = 'none';
    }
    
    console.log('Form has been reset to initial state');
}

/**
 * 6. Event Listeners
 * ----------------
 */
// Define a global removeFile function for compatibility with inline HTML handlers
window.removeFile = removeFile;