/**
 * CoE Level 3 Support Portal - Contacts Page JavaScript
 * 
 * Table of Contents:
 * 1. Global Variables and Constants
 * 2. Page Initialization
 * 3. Contact Card Interactions
 * 4. Filter Functionality (for future use)
 * 5. Email Tracking
 * 6. Animation Effects
 */

/**
 * 1. Global Variables and Constants
 * --------------------------------
 */
// Contact categories for filtering (if needed in the future)
const CONTACT_CATEGORIES = {
    all: 'All',
    string: 'String',
    central: 'Central',
    bess: 'BeSS',
    distribution: 'Distribution',
    training: 'Training'
};

// Store contact elements
let contactCards = [];

/**
 * 2. Page Initialization
 * --------------------
 */
document.addEventListener('DOMContentLoaded', function() {
    // Wake up the server
    wakeUpServer();

    // Initialize contact cards
    initializeContactCards();
    
    // Add email tracking if needed
    initializeEmailTracking();
    
    // Add staggered animation for card appearance
    addStaggeredAnimation();
});

/**
 * Initialize contact cards with interactive features
 */
function initializeContactCards() {
    // Get all contact cards
    contactCards = document.querySelectorAll('.contact-card');
    
    // Add hover animations and click handlers
    contactCards.forEach(card => {
        // Add hover animation
        card.addEventListener('mouseenter', function() {
            this.classList.add('hover');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('hover');
        });
        
        // Add click handler for mobile devices
        card.addEventListener('click', function(e) {
            // Only handle card clicks, not email link clicks
            if (e.target.tagName.toLowerCase() !== 'a') {
                const emailLink = this.querySelector('.contact-email');
                if (emailLink) {
                    // Highlight the email button on mobile
                    emailLink.classList.add('highlight');
                    
                    // Remove highlight after a short delay
                    setTimeout(() => {
                        emailLink.classList.remove('highlight');
                    }, 500);
                }
            }
        });
    });
}

/**
 * 3. Email Tracking
 * --------------
 */

/**
 * Initialize email tracking (if needed for analytics)
 */
function initializeEmailTracking() {
    const emailLinks = document.querySelectorAll('.contact-email');
    
    emailLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Add analytics tracking if needed
            const contactName = this.closest('.contact-card').querySelector('.contact-name').textContent;
            
            // Log click for analytics (if needed)
            console.log(`Email click: ${contactName}`);
            
            // You can implement actual analytics here if needed
            // Example: sendAnalyticsEvent('contact_email_click', { name: contactName });
        });
    });
}

/**
 * 4. Filter Functionality (not currently used but prepared for future)
 * -------------------------------------------------------------------
 */

/**
 * Filter contacts by expertise (could be added in future updates)
 * @param {string} filterType - The type of filter to apply (e.g., 'expertise')
 * @param {string} filterValue - The value to filter by
 */
function filterContacts(filterType, filterValue) {
    // Don't do anything if no contacts
    if (!contactCards.length) return;
    
    // Show all cards if filter is 'all'
    if (filterValue === 'all') {
        contactCards.forEach(card => {
            card.style.display = 'block';
        });
        return;
    }
    
    // Otherwise apply specific filter
    contactCards.forEach(card => {
        // For expertise filtering
        if (filterType === 'expertise') {
            const expertise = card.querySelector('.contact-expertise');
            if (!expertise) {
                card.style.display = 'block'; // Always show if no expertise found
                return;
            }
            
            const expertiseText = expertise.textContent.toLowerCase();
            
            if (expertiseText.includes(filterValue.toLowerCase())) {
                // Show cards matching the filter
                card.style.display = 'block';
                
                // Add subtle highlight animation
                card.classList.add('filtered-in');
                setTimeout(() => {
                    card.classList.remove('filtered-in');
                }, 500);
            } else {
                // Hide non-matching cards
                card.style.display = 'none';
            }
        }
    });
}

/**
 * 5. Animation Effects
 * -----------------
 */

/**
 * Add staggered appearance animation to contact cards
 */
function addStaggeredAnimation() {
    contactCards.forEach((card, index) => {
        // Set initial state
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        // Add animation with delay based on index
        setTimeout(() => {
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 + (index * 50)); // Stagger by 50ms per card
    });
}

/**
 * 6. Utility Functions
 * -----------------
 */

/**
 * Copy email address to clipboard (for future use)
 * @param {string} email - The email address to copy
 */
function copyEmailToClipboard(email) {
    navigator.clipboard.writeText(email).then(
        function() {
            // Show success message
            showSuccessMessage('Email copied to clipboard!');
        },
        function(err) {
            console.error('Could not copy email: ', err);
        }
    );
}

// Expose necessary functions to global scope if needed for inline handlers
window.filterContacts = filterContacts;