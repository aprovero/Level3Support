/**
 * CoE Level 3 Support Portal - Evaluation Page JavaScript
 * 
 * Table of Contents:
 * 1. Global Variables and Constants
 * 2. Page Initialization
 * 3. Training Information Lookup
 * 4. Form Field Management
 * 5. Form Validation
 * 6. Form Submission
 * 7. Success Handling
 * 8. Event Listeners
 */

/**
 * 1. Global Variables and Constants
 * --------------------------------
 */
// Current training data
let currentTrainingData = null;

// Form sections
const FORM_SECTIONS = {
    trainingInfo: 'trainingInfoSection',
    trainerEval: 'trainerEvaluationSection',
    contentEval: 'contentEvaluationSection',
    overallExp: 'overallExperienceSection'
};

/**
 * 2. Page Initialization
 * --------------------
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the form
    initializeEvaluationForm();
});

/**
 * Initialize the evaluation form and event listeners
 */
function initializeEvaluationForm() {
    const form = document.getElementById('evaluationForm');
    const fetchButton = document.getElementById('fetchTrainingBtn');
    const trainingIdInput = document.getElementById('trainingId');
    
    // Add event listener for lookup button
    if (fetchButton) {
        // Remove existing listeners by replacing with clone
        const newFetchButton = fetchButton.cloneNode(true);
        fetchButton.parentNode.replaceChild(newFetchButton, fetchButton);
        
        // Add new click handler
        newFetchButton.addEventListener('click', handleTrainingLookup);
        console.log('Added lookup button handler');
    }
    
    // Auto-uppercase training ID
    if (trainingIdInput) {
        trainingIdInput.addEventListener('input', function() {
            this.value = this.value.toUpperCase();
        });
        
        // Force uppercase on all interactions
        trainingIdInput.addEventListener('blur', function() {
            this.value = this.value.toUpperCase();
        });
        
        // Add placeholder to show example format
        trainingIdInput.placeholder = "Enter Training ID (e.g., TR25010001)";
    }
    
    // Add event listener for form submission
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Initialize radio button groups for better UX
    initializeRatingGroups();
}

/**
 * Initialize rating group UI enhancements
 */
function initializeRatingGroups() {
    // Add hover effects and label clicks for better usability
    const ratingGroups = document.querySelectorAll('.rating-group');
    
    ratingGroups.forEach(group => {
        const options = group.querySelectorAll('.rating-option');
        
        options.forEach(option => {
            const radio = option.querySelector('input[type="radio"]');
            const label = option.querySelector('label');
            
            // Make clicking on label select the radio
            if (label && radio) {
                label.addEventListener('click', function() {
                    radio.checked = true;
                });
            }
            
            // Add hover effect for better UX
            option.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#f0f7ff';
            });
            
            option.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '';
            });
        });
    });
}

/**
 * 3. Training Information Lookup
 * ----------------------------
 */

/**
 * Handle the training lookup button click
 */
function handleTrainingLookup() {
    console.log('Training lookup initiated');
    const trainingId = document.getElementById('trainingId').value.trim().toUpperCase();
    const fetchStatus = document.getElementById('fetchStatus');
    
    // Clear any previous status
    if (fetchStatus) {
        fetchStatus.textContent = '';
        fetchStatus.className = 'text-sm mt-2';
        fetchStatus.classList.remove('hidden');
    }
    
    // Validate training ID
    if (!trainingId) {
        showStatus('Please enter a Training ID', 'error');
        return;
    }
    
    // Show loading status
    showStatus('Looking up training information...', 'info');
    
    console.log('Fetching training with ID:', trainingId);
    
    // Fetch training information from the server
    fetchTrainingInfo(trainingId);
}

/**
 * Fetch training information from the server
 * @param {string} trainingId - The training ID to look up
 */
async function fetchTrainingInfo(trainingId) {
    try {
        console.log('Making request to:', API_BASE_URL + API_ENDPOINTS.getTrainingById(trainingId));
        
        // Use regular fetch to avoid potential issues
        const response = await fetch(API_BASE_URL + API_ENDPOINTS.getTrainingById(trainingId));
        const data = await response.json();
        
        console.log('Training data received:', data);
        
        // If successful, populate the training info
        if (response.ok && data) {
            populateTrainingInfo(data);
            showStatus('Training information found', 'success');
        } else {
            // Handle error responses
            const errorMessage = data.error || 'Training not found';
            const errorDetails = data.details || 'Please check the Training ID and try again';
            
            showStatus(errorMessage, 'error');
            console.error('Error fetching training info:', errorMessage);
        }
    } catch (error) {
        // Handle unexpected errors
        console.error('Error in fetchTrainingInfo:', error);
        showStatus('Error connecting to server. Please try again later.', 'error');
    }
}

/**
 * Populate the training information section with data
 * @param {Object} data - The training data object
 */
function populateTrainingInfo(data) {
    // Store the current training data
    currentTrainingData = data;
    
    // Display training information
    document.getElementById('displayTrainingTitle').textContent = data.title || '-';
    document.getElementById('displayTrainingDate').textContent = formatDate(new Date(data.date)) || '-';
    document.getElementById('displayTrainer').textContent = data.trainer || '-';
    
    // Set hidden form fields
    document.getElementById('trainingTitle').value = data.title || '';
    document.getElementById('trainingDate').value = data.date || '';
    document.getElementById('trainer').value = data.trainer || '';
    
    // Show the training section
    const trainingInfoSection = document.getElementById(FORM_SECTIONS.trainingInfo);
    if (trainingInfoSection) {
        trainingInfoSection.classList.remove('hidden');
    }
}

/**
 * Show status message
 * @param {string} message - The message to show
 * @param {string} type - The message type: 'success', 'error', or 'info'
 */
function showStatus(message, type) {
    const fetchStatus = document.getElementById('fetchStatus');
    if (!fetchStatus) return;
    
    fetchStatus.textContent = message;
    fetchStatus.classList.remove('hidden', 'text-green-600', 'text-red-600', 'text-blue-600');
    
    switch (type) {
        case 'success':
            fetchStatus.classList.add('text-green-600');
            break;
        case 'error':
            fetchStatus.classList.add('text-red-600');
            break;
        case 'info':
            fetchStatus.classList.add('text-blue-600');
            break;
    }
}

/**
 * 4. Form Field Management
 * ----------------------
 */

/**
 * Reset form fields to their initial state
 */
function resetForm() {
    const form = document.getElementById('evaluationForm');
    if (!form) return;
    
    // Reset form fields
    form.reset();
    
    // Hide training info section
    const trainingInfoSection = document.getElementById(FORM_SECTIONS.trainingInfo);
    if (trainingInfoSection) {
        trainingInfoSection.classList.add('hidden');
    }
    
    // Clear status message
    const fetchStatus = document.getElementById('fetchStatus');
    if (fetchStatus) {
        fetchStatus.textContent = '';
        fetchStatus.classList.add('hidden');
    }
    
    // Clear training data
    currentTrainingData = null;
    
    // Clear display fields
    document.getElementById('displayTrainingTitle').textContent = '-';
    document.getElementById('displayTrainingDate').textContent = '-';
    document.getElementById('displayTrainer').textContent = '-';
    
    // Clear hidden form fields
    document.getElementById('trainingTitle').value = '';
    document.getElementById('trainingDate').value = '';
    document.getElementById('trainer').value = '';
}

/**
 * 5. Form Validation
 * ----------------
 */

/**
 * Validate the evaluation form before submission
 * @returns {boolean} True if the form is valid
 */
function validateEvaluationForm() {
    const form = document.getElementById('evaluationForm');
    if (!form) return false;
    
    // Check if training info has been retrieved
    if (!currentTrainingData) {
        showErrorMessage(
            'Missing Training Information', 
            'Please lookup a valid Training ID first',
            '#submit-message-container'
        );
        return false;
    }
    
    // Validate training type selection
    const locationType = document.getElementById('location');
    if (!locationType || !locationType.value) {
        showErrorMessage(
            'Missing Training Type', 
            'Please select the training type (Online or In Person)',
            '#submit-message-container'
        );
        locationType.focus();
        return false;
    }
    
    // Check all required radio button groups
    const requiredRadioGroups = [
        'trainerKnowledge', 'trainerClarity', 'trainerResponsiveness', 'trainerEngagement',
        'contentRelevance', 'contentDepth', 'contentMaterials', 'contentBalance',
        'overallSatisfaction', 'recommend'
    ];
    
    for (const groupName of requiredRadioGroups) {
        const selectedOption = form.querySelector(`input[name="${groupName}"]:checked`);
        
        if (!selectedOption) {
            // Find the section containing this group
            const radioGroup = form.querySelector(`input[name="${groupName}"]`).closest('.form-section');
            const groupTitle = radioGroup.querySelector('.form-section-title').textContent;
            
            showErrorMessage(
                'Incomplete Evaluation', 
                `Please complete all ratings in the "${groupTitle}" section`,
                '#submit-message-container'
            );
            
            // Scroll to the section
            radioGroup.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return false;
        }
    }
    
    return true;
}

/**
 * 6. Form Submission
 * ----------------
 */

/**
 * Handle form submission
 * @param {Event} e - The submit event
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Clear previous messages
    const messageContainer = document.getElementById('submit-message-container');
    if (messageContainer) {
        messageContainer.innerHTML = '';
    }
    
    // Validate the form
    if (!validateEvaluationForm()) {
        return;
    }
    
    // Get form data
    const form = e.target;
    const formData = new FormData(form);
    const formValues = Object.fromEntries(formData.entries());
    
    // Disable submit button
    const submitButton = document.querySelector('.submit-button');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
    }
    
    try {
        // Calculate average score including recommendation
        formValues.averageScore = calculateAverageScore(formValues);
        
        // Submit to server
        const result = await submitEvaluation(formValues);
        
        if (result.success) {
            // Show success confirmation
            showSubmissionConfirmation();
        } else {
            // Show error message
            showErrorMessage(
                'Error submitting evaluation', 
                result.error || 'Unknown error occurred. Please try again.',
                '#submit-message-container'
            );
        }
    } catch (error) {
        // Handle submission error
        showErrorMessage(
            'Error submitting evaluation', 
            error.message || 'An unexpected error occurred. Please try again.',
            '#submit-message-container'
        );
    } finally {
        // Reset button state
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'SUBMIT EVALUATION';
        }
    }
}

/**
 * Calculate the average score from all ratings
 * @param {Object} formValues - The form values
 * @returns {number} The calculated average score
 */
function calculateAverageScore(formValues) {
    // Get all rating values
    const ratings = [
        parseInt(formValues.trainerKnowledge),
        parseInt(formValues.trainerClarity),
        parseInt(formValues.trainerResponsiveness),
        parseInt(formValues.trainerEngagement),
        parseInt(formValues.contentRelevance),
        parseInt(formValues.contentDepth),
        parseInt(formValues.contentMaterials),
        parseInt(formValues.contentBalance),
        parseInt(formValues.overallSatisfaction),
        // Add recommendation value (5 for Yes, 1 for No)
        formValues.recommend === 'Yes' ? 5 : 1
    ];
    
    // Calculate average (sum divided by number of ratings)
    const sum = ratings.reduce((total, rating) => total + rating, 0);
    return (sum / ratings.length).toFixed(2);
}

/**
 * Submit the evaluation to the server
 * @param {Object} formValues - The form values to submit
 * @returns {Object} The result of the submission
 */
async function submitEvaluation(formValues) {
    try {
        console.log('Submitting evaluation with values:', formValues);
        
        // Adjust the data format to match what the server expects
        // Make sure recommend is in the right format
        formValues.recommend = formValues.recommend === 'Yes';
        
        // Submit to server using regular fetch for simplicity
        const response = await fetch(API_BASE_URL + API_ENDPOINTS.submitEvaluation, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formValues)
        });
        
        const data = await response.json();
        console.log('Evaluation response:', data);
        
        if (!response.ok) {
            throw new Error(data.error || 'Server error');
        }
        
        return { success: true, recordId: data.recordId || data.id };
    } catch (error) {
        console.error('Error submitting evaluation:', error);
        return { 
            success: false, 
            error: error.message || 'Submission failed' 
        };
    }
}

/**
 * 7. Success Handling
 * ----------------
 */

/**
 * Show the submission confirmation
 */
function showSubmissionConfirmation() {
    // Hide form and header
    document.querySelector('h1').classList.add('hidden');
    document.querySelector('p.mb-6').classList.add('hidden');
    document.getElementById('evaluationForm').classList.add('hidden');
    
    // Show confirmation
    document.getElementById('submissionConfirmation').classList.remove('hidden');
}

/**
 * 8. Event Listeners
 * ----------------
 */
// No need for global window exports as there are no inline handlers in the HTML