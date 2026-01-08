/**
 * Azhar Ali Portfolio - Main JavaScript File
 * This file organizes the loading and initialization of all script components
 */

// Force dark theme settings
document.addEventListener('DOMContentLoaded', () => {
    // Load essential scripts
    loadScript('assets/scripts/force-dark-theme.js');
    loadScript('assets/scripts/header-animations.js');
    loadScript('assets/scripts/accessibility.js');
    loadScript('assets/scripts/seo-enhancements.js');
    loadScript('assets/scripts/skill-tooltips.js');
    loadScript('assets/scripts/testimonials.js');
    
    // Performance optimizations loaded at the end
    loadScript('assets/scripts/performance.js');
    
    // Initialize Vanta.js background
    initializeVantaBackground();
    
    // Initialize other UI components
    initializeUI();
});

/**
 * Load script dynamically
 * @param {string} src - Script source path
 */
function loadScript(src) {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    document.body.appendChild(script);
}

/**
 * Initialize Vanta.js background effect
 */
function initializeVantaBackground() {
    // This is now handled directly in the HTML for better performance
    // Production: Console logging disabled
}

/**
 * Initialize UI components
 */
function initializeUI() {
    // Initialize intersection observers for animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.reveal, .fade-in, .slide-in').forEach(el => {
        observer.observe(el);
    });
}

