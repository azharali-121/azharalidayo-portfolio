/* Accessibility improvements for portfolio website */

// Accessibility enhancements
class AccessibilityManager {
    constructor() {
        this.init();
    }
    
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.improveScreenReaderExperience();
            this.enhanceKeyboardNavigation();
            this.setupSkipToContent();
            this.addARIARoles();
        });
    }
    
    improveScreenReaderExperience() {
        // Add screen reader only text for icons
        document.querySelectorAll('a[aria-label], button[aria-label]').forEach(el => {
            const icons = el.querySelectorAll('i.fas, i.fab, i.far');
            
            // If element only contains icons, add screen reader text
            if (icons.length > 0 && el.textContent.trim() === '') {
                const srOnly = document.createElement('span');
                srOnly.className = 'sr-only';
                srOnly.textContent = el.getAttribute('aria-label');
                el.appendChild(srOnly);
            }
        });
        
        // Announce dynamic content changes
        const contentAreas = document.querySelectorAll('.project-card, .skill-item');
        contentAreas.forEach(area => {
            area.setAttribute('tabindex', '0');
        });
    }
    
    enhanceKeyboardNavigation() {
        // Add keyboard navigation for custom components
        // Note: Navigation toggle keyboard handling is done in mobile-nav.js
        
        // For project card links
        document.querySelectorAll('.project-card').forEach(card => {
            const links = card.querySelectorAll('.project-links a');
            
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    // Focus the first link when pressing Enter on the card
                    if (links.length > 0) {
                        links[0].focus();
                    }
                }
            });
        });
    }
    
    setupSkipToContent() {
        // Create skip to content link
        const skipLink = document.createElement('a');
        skipLink.className = 'skip-to-content';
        skipLink.href = '#main';
        skipLink.textContent = 'Skip to content';
        
        // Insert at the beginning of the body
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Add id to main content
        const mainContent = document.querySelector('section:first-of-type');
        if (mainContent) {
            mainContent.id = 'main';
        }
        
        // Add CSS for skip link in <head>
        const skipLinkStyle = document.createElement('style');
        skipLinkStyle.textContent = `
            .skip-to-content {
                position: absolute;
                top: -50px;
                left: 0;
                background: var(--primary-color);
                color: white;
                padding: 10px 15px;
                z-index: 9999;
                transition: top 0.3s ease;
                border-radius: 0 0 5px 0;
            }
            
            .skip-to-content:focus {
                top: 0;
                outline: none;
                box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
            }
            
            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                border: 0;
            }
        `;
        document.head.appendChild(skipLinkStyle);
    }
    
    addARIARoles() {
        // Add semantic ARIA roles
        const roleMap = {
            'nav': { role: 'navigation', ariaLabel: 'Main navigation' },
            '.hero': { role: 'banner' },
            '.footer': { role: 'contentinfo' },
            '.skills': { role: 'region', ariaLabel: 'Skills' },
            '.projects': { role: 'region', ariaLabel: 'Projects' },
            '.contact': { role: 'region', ariaLabel: 'Contact' },
            '.about': { role: 'region', ariaLabel: 'About' }
        };
        
        // Apply roles
        Object.entries(roleMap).forEach(([selector, attributes]) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (attributes.role) {
                    el.setAttribute('role', attributes.role);
                }
                if (attributes.ariaLabel) {
                    el.setAttribute('aria-label', attributes.ariaLabel);
                }
            });
        });
        
        // Enhance form accessibility
        const form = document.querySelector('.contact-form');
        if (form) {
            const formInputs = form.querySelectorAll('input, textarea');
            formInputs.forEach(input => {
                // Generate IDs for inputs if they don't have them
                if (!input.id) {
                    const inputId = `${input.name}-input`;
                    input.id = inputId;
                }
                
                // Add labels if they don't exist
                if (!document.querySelector(`label[for="${input.id}"]`)) {
                    const label = document.createElement('label');
                    label.htmlFor = input.id;
                    label.className = 'sr-only';
                    label.textContent = input.placeholder;
                    input.parentNode.insertBefore(label, input);
                }
            });
        }
    }
}

// Initialize accessibility enhancements
const accessibilityManager = new AccessibilityManager();