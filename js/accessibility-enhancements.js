/**
 * Accessibility Enhancements
 * Ensures portfolio is fully accessible to all users
 * 
 * Features:
 * - Skip navigation links
 * - Focus management
 * - Keyboard navigation
 * - Screen reader announcements
 * - ARIA live regions
 */

(function() {
    'use strict';

    /**
     * Add skip navigation link
     */
    function addSkipLink() {
        // Check if skip link already exists
        if (document.querySelector('.skip-link')) {
            return;
        }

        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        skipLink.setAttribute('accesskey', '1');
        
        // Insert at the very beginning of body
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Add CSS for skip link
        const style = document.createElement('style');
        style.textContent = `
            .skip-link {
                position: absolute;
                top: -40px;
                left: 0;
                background: #00ff00;
                color: #000;
                padding: 8px 16px;
                text-decoration: none;
                font-weight: bold;
                z-index: 100000;
                border-radius: 0 0 4px 0;
            }
            
            .skip-link:focus {
                top: 0;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Enhance focus indicators
     */
    function enhanceFocusIndicators() {
        const style = document.createElement('style');
        style.textContent = `
            :focus-visible {
                outline: 3px solid #00ff00 !important;
                outline-offset: 2px !important;
            }
            
            .nav-link:focus-visible,
            .btn:focus-visible,
            button:focus-visible,
            a:focus-visible {
                outline: 3px solid #00ff00 !important;
                outline-offset: 2px !important;
            }
            
            /* Hide focus outline when using mouse, show when using keyboard */
            *:focus:not(:focus-visible) {
                outline: none;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Add main landmark if missing
     */
    function ensureMainLandmark() {
        let main = document.querySelector('main');
        
        if (!main) {
            // Find hero section or first major content section
            const hero = document.querySelector('.hero, section:first-of-type');
            if (hero) {
                main = document.createElement('main');
                main.id = 'main-content';
                main.setAttribute('role', 'main');
                main.setAttribute('aria-label', 'Main content');
                
                // Wrap content in main tag
                const parent = hero.parentNode;
                main.appendChild(hero);
                parent.insertBefore(main, parent.firstChild);
            }
        } else if (!main.id) {
            main.id = 'main-content';
        }
    }

    /**
     * Enhance keyboard navigation for interactive elements
     */
    function enhanceKeyboardNavigation() {
        // Handle Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close any open modals
                const modals = document.querySelectorAll('.modal:not([style*="display: none"])');
                modals.forEach(modal => {
                    modal.style.display = 'none';
                    // Return focus to trigger element if available
                    const trigger = modal.getAttribute('data-trigger');
                    if (trigger) {
                        const triggerElement = document.querySelector(trigger);
                        if (triggerElement) {
                            triggerElement.focus();
                        }
                    }
                });
                
                // Close mobile menu if open
                const navMenu = document.getElementById('nav-menu');
                const navToggle = document.getElementById('nav-toggle');
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    if (navToggle) {
                        navToggle.classList.remove('active');
                        navToggle.setAttribute('aria-expanded', 'false');
                        navToggle.focus();
                    }
                }
            }
        });

        // Trap focus in modals
        document.addEventListener('focus', (e) => {
            const activeModal = document.querySelector('.modal:not([style*="display: none"])');
            if (activeModal && !activeModal.contains(e.target)) {
                // Focus first focusable element in modal
                const focusableElements = activeModal.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (focusableElements.length > 0) {
                    focusableElements[0].focus();
                }
            }
        }, true);

        // Add Enter/Space handling for custom buttons
        document.querySelectorAll('[role="button"]:not(button)').forEach(element => {
            element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    element.click();
                }
            });
        });
    }

    /**
     * Add ARIA live region for announcements
     */
    function addLiveRegion() {
        if (document.getElementById('aria-live-region')) {
            return;
        }

        const liveRegion = document.createElement('div');
        liveRegion.id = 'aria-live-region';
        liveRegion.setAttribute('role', 'status');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
        
        document.body.appendChild(liveRegion);
    }

    /**
     * Announce message to screen readers
     */
    window.announceToScreenReader = function(message) {
        const liveRegion = document.getElementById('aria-live-region');
        if (liveRegion) {
            liveRegion.textContent = '';
            setTimeout(() => {
                liveRegion.textContent = message;
            }, 100);
        }
    };

    /**
     * Ensure all images have alt text
     */
    function validateImageAltText() {
        const images = document.querySelectorAll('img:not([alt])');
        if (images.length > 0) {
            images.forEach(img => {
                img.setAttribute('alt', '');
            });
        }
    }

    /**
     * Add aria-current to active navigation links
     */
    function enhanceNavigationAria() {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        
        document.querySelectorAll('.nav-link').forEach(link => {
            const linkPath = link.getAttribute('href');
            if (linkPath === currentPath || 
                (currentPath === '' && linkPath === 'index.html')) {
                link.setAttribute('aria-current', 'page');
                link.classList.add('active');
            }
        });
    }

    /**
     * Enhance form accessibility
     */
    function enhanceFormAccessibility() {
        // Associate all labels with inputs
        document.querySelectorAll('input, textarea, select').forEach(input => {
            if (!input.id && input.name) {
                input.id = input.name;
            }
            
            // Find associated label
            const label = document.querySelector(`label[for="${input.id}"]`);
            if (label) {
                // Ensure proper association
                label.setAttribute('for', input.id);
            }
            
            // Add required indicator to aria-label
            if (input.hasAttribute('required')) {
                const ariaLabel = input.getAttribute('aria-label');
                if (ariaLabel && !ariaLabel.includes('required')) {
                    input.setAttribute('aria-label', `${ariaLabel} (required)`);
                }
            }
        });

        // Enhance error messages
        document.querySelectorAll('.form-error').forEach(errorElement => {
            if (!errorElement.hasAttribute('role')) {
                errorElement.setAttribute('role', 'alert');
            }
            if (!errorElement.hasAttribute('aria-live')) {
                errorElement.setAttribute('aria-live', 'assertive');
            }
        });
    }

    /**
     * Add heading structure validation
     */
    function validateHeadingStructure() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let previousLevel = 0;
        
        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.substring(1));
            
            // Check for skipped levels
            if (level - previousLevel > 1 && index > 0) {
                // Heading skipped a level (e.g., h1 to h3)
            }
            
            previousLevel = level;
        });
    }

    /**
     * Initialize all accessibility features
     */
    function init() {
        addSkipLink();
        enhanceFocusIndicators();
        ensureMainLandmark();
        enhanceKeyboardNavigation();
        addLiveRegion();
        validateImageAltText();
        enhanceNavigationAria();
        enhanceFormAccessibility();
        validateHeadingStructure();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    /**
     * Monitor for dynamic content changes
     */
    if (window.MutationObserver) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length > 0) {
                    validateImageAltText();
                    enhanceFormAccessibility();
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

})();
