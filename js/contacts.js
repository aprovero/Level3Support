/**
 * CoE Level 3 Support Portal - Contacts Page JavaScript
 * 
 * Table of Contents:
 * 1. Global Variables and Constants
 * 2. Page Initialization
 * 3. Contact Card Interactions
 * 4. Filter Functionality
 * 5. Email Handling
 * 6. Animation Effects
 */

/**
 * 1. Global Variables and Constants
 * --------------------------------
 */
// Contact categories for filtering
const CONTACT_CATEGORIES = {
    all: 'All',
    string: 'String',
    central: 'Central',
    bess: 'BeSS',
    distribution: 'Distribution',
    training: 'Training'
};

// Store contact elements for filtering
let contactCards = [];

// Current active filter
let activeFilter = 'all';

/**
 * 2. Page Initialization
 * --------------------
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize contact cards
    initializeContactCards();
    
    // Initialize filter buttons if they exist
    initializeFilters();
    
    // Add email tracking if needed
    initializeEmailTracking();
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
        
        // Add click handler for mobile devices (optional)
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
 * Initialize filter functionality if filter buttons exist
 */
function initializeFilters() {
    // Check if filter container exists
    const filterContainer = document.getElementById('contact-filters');
    if (!filterContainer) return;
    
    // Create filter buttons
    createFilterButtons(filterContainer);
    
    // Set initial state
    updateFilters('all');
}

/**
 * Create filter buttons in the specified container
 * @param {Element} container - The container element for filter buttons
 */
function createFilterButtons(container) {
    // Create buttons for each category
    Object.entries(CONTACT_CATEGORIES).forEach(([key, label]) => {
        const button = document.createElement('button');
        button.className = 'filter-item' + (key === 'all' ? ' active' : '');
        button.setAttribute('data-filter', key);
        button.textContent = label;
        
        // Add click event
        button.addEventListener('click', function() {
            updateFilters(key);
        });
        
        container.appendChild(button);
    });
}

/**
 * 3. Contact Card Interactions
 * --------------------------
 */

/**
 * Add an expand/collapse feature to contact cards
 * Note: Only needed if cards will have expandable content
 * @param {Element} card - The contact card element
 */
function makeCardExpandable(card) {
    const expandButton = document.createElement('button');
    expandButton.className = 'expand-button';
    expandButton.innerHTML = '<span class="icon">+</span>';
    expandButton.setAttribute('aria-label', 'Expand contact details');
    
    // Create collapsible content container
    const expandableContent = document.createElement('div');
    expandableContent.className = 'expandable-content hidden';
    
    // Get any additional content from data attributes or create default
    const additionalInfo = card.getAttribute('data-additional-info') || '';
    expandableContent.innerHTML = `
        <div class="additional-info">
            ${additionalInfo || 'No additional information available.'}
        </div>
    `;
    
    // Add elements to card
    card.appendChild(expandButton);
    card.appendChild(expandableContent);
    
    // Add click handler
    expandButton.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent card click
        
        const isExpanded = !expandableContent.classList.contains('hidden');
        
        if (isExpanded) {
            // Collapse
            expandableContent.classList.add('hidden');
            expandButton.innerHTML = '<span class="icon">+</span>';
            expandButton.setAttribute('aria-label', 'Expand contact details');
        } else {
            // Expand
            expandableContent.classList.remove('hidden');
            expandButton.innerHTML = '<span class="icon">-</span>';
            expandButton.setAttribute('aria-label', 'Collapse contact details');
        }
    });
}

/**
 * 4. Filter Functionality
 * ---------------------
 */

/**
 * Update filters and display based on selected filter
 * @param {string} filterValue - The filter to apply
 */
function updateFilters(filterValue) {
    // Update active filter
    activeFilter = filterValue;
    
    // Update filter buttons
    const filterButtons = document.querySelectorAll('.filter-item');
    filterButtons.forEach(button => {
        if (button.getAttribute('data-filter') === filterValue) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    // Apply filtering to contact cards
    filterContacts(filterValue);
}

/**
 * Filter contact cards based on expertise
 * @param {string} filter - The filter value to apply
 */
function filterContacts(filter) {
    // If filter is 'all', show all contacts
    if (filter === 'all') {
        contactCards.forEach(card => {
            card.style.display = 'block';
        });
        return;
    }
    
    // Otherwise, filter based on expertise
    contactCards.forEach(card => {
        const expertise = card.querySelector('.contact-expertise');
        if (!expertise) {
            // If no expertise found, always show the card
            card.style.display = 'block';
            return;
        }
        
        const expertiseText = expertise.textContent.toLowerCase();
        
        if (expertiseText.includes(filter.toLowerCase())) {
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
    });
}

/**
 * 5. Email Handling
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
 * 6. Animation Effects
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

// Initialize staggered animation on page load
document.addEventListener('DOMContentLoaded', function() {
    // Add a small delay to ensure DOM is fully ready
    setTimeout(addStaggeredAnimation, 100);
});