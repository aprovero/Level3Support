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
    initializeModal('success-modal', 'success-close-btn', null, resetFormToInitial);
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
    dateInput.setAttribute('min', formattedDate); // Ensure attribute is set
    
    // Force disable past dates with a validation function
    dateInput.addEventListener('input', function() {
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
        // Create FormData object
        const formData = new FormData(form);
        
        // Add files to FormData
        uploadedFiles.forEach(file => {
            formData.append('attachments', file);
        });
        
        // Add training specific data if needed
        const requestType = document.getElementById('request').value;
        if (requestType === 'TRAINING') {
            const description = document.getElementById('training-description').value;
            const expectedDate = document.getElementById('expected-date').value;
            const traineesNumber = document.getElementById('trainees-number').value;
            
            // Combine training fields into description
            const combinedDescription = `${description}\nNumber of Trainees: ${traineesNumber}\nExpected Date: ${expectedDate}`;
            formData.set('description', combinedDescription);
        }
        
        // Show info message during submission
        showInfoMessage(
            'Submitting form...', 
            'This may take a few moments. Please don\'t close the page.'
        );
        
        // Make API request
        const response = await postRequest(
            API_BASE_URL + API_ENDPOINTS.submitRequest, 
            formData,
            {
                timeout: 60000 // 60 second timeout
            }
        );
        
        // Handle successful submission
        const successMessage = 'Form submitted successfully!';
        const successDetails = response.issueId ? 
            `Issue ID: ${response.issueId}` : 
            'Your request has been processed.';
        
        // Show success modal
        showSuccessModal(successMessage, successDetails);
        
    } catch (error) {
        // Handle errors
        if (error.message === 'Request timed out') {
            showInfoMessage(
                'Form Submitted', 
                'Your form was submitted but is taking longer than expected to process. You\'ll receive an email confirmation shortly.'
            );
        } else {
            const errorMessage = error.data?.error || 'Network error';
            const errorDetails = error.data?.details || 'Failed to submit the form. Please check your connection and try again.';
            showErrorMessage(errorMessage, errorDetails);
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
}

/**
 * 6. Event Listeners
 * ----------------
 */
// Define a global removeFile function for compatibility with inline HTML handlers
window.removeFile = removeFile;