/**
 * Force Dark Cyber Theme Script
 * This script ensures that the website always uses the dark cyber theme
 * and removes any theme switching functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Force dark theme on HTML and body
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
    
    // Remove any theme toggle buttons that might be created by other scripts
    const themeToggles = document.querySelectorAll('.theme-toggle, .theme-switcher, .mode-toggle, [data-theme-toggle]');
    themeToggles.forEach(toggle => {
        toggle.remove();
    });
    
    // Override Vanta background colors if initialized
    if (window.vantaEffect) {
        window.vantaEffect.setOptions({
            backgroundColor: 0x0a0f1f,
            color: 0x00eaff
        });
    }
    
    // Ensure all theme-related CSS variables are set to dark mode values
    document.documentElement.style.setProperty('--bg-color', '#0a0f1f');
    document.documentElement.style.setProperty('--text-color', '#e2e8f0');
    document.documentElement.style.setProperty('--primary-color', '#00eaff');
    document.documentElement.style.setProperty('--secondary-bg', '#0c1020');
    document.documentElement.style.setProperty('--card-bg', 'rgba(12, 16, 32, 0.7)');
    document.documentElement.style.setProperty('--border-color', 'rgba(0, 234, 255, 0.1)');
    document.documentElement.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.3)');
    
    // Force dark mode meta tags
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#0a0f1f');
    }
    
    const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
    if (metaColorScheme) {
        metaColorScheme.setAttribute('content', 'dark');
    }
    
    // Override any system preference detection
    window.matchMedia('(prefers-color-scheme: light)').addListener = function() {};
    window.matchMedia('(prefers-color-scheme: light)').removeEventListener = function() {};
    
    // Clear any theme from localStorage
    localStorage.removeItem('portfolio-theme-preference');
    localStorage.removeItem('theme');
    localStorage.removeItem('color-scheme');
    
    // Set dark theme in localStorage to prevent any script from changing it
    localStorage.setItem('forced-dark-theme', 'true');
    
    // Override any future attempts to change theme
    const originalSetAttribute = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function(name, value) {
        if (name === 'data-theme' || name === 'class' && (value.includes('light') || value.includes('theme'))) {
            // Do nothing for theme-related attributes
            return;
        }
        originalSetAttribute.call(this, name, value);
    };
    
    // Disable theme changes via classList
    const originalClassListAdd = DOMTokenList.prototype.add;
    DOMTokenList.prototype.add = function(...tokens) {
        const filteredTokens = tokens.filter(token => 
            !token.includes('light-theme') && 
            !token.includes('light-mode') && 
            token !== 'light'
        );
        if (filteredTokens.length > 0) {
            originalClassListAdd.apply(this, filteredTokens);
        }
    };
    
    // Console message for debugging (development only)
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        console.log('Dark cyber theme enforced');
    }
});

// Force the proper Vanta effect configuration when it initializes
const originalVantaInit = window.VANTA && window.VANTA.CUBES;
if (originalVantaInit) {
    window.VANTA.CUBES = function(options) {
        // Force dark theme colors
        options.backgroundColor = 0x0a0f1f;
        options.color = 0x00eaff;
        
        // Call the original function
        return originalVantaInit(options);
    };
}

// Do the same for VANTA.DOTS if it exists
const originalVantaDotsInit = window.VANTA && window.VANTA.DOTS;
if (originalVantaDotsInit) {
    window.VANTA.DOTS = function(options) {
        // Force dark theme colors
        options.backgroundColor = 0x0a0f1f;
        options.color = 0x00eaff;
        options.showLines = true;
        
        // Call the original function
        return originalVantaDotsInit(options);
    };
}

// Observer to make sure dark theme stays enforced
const bodyObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes') {
            if (mutation.attributeName === 'class' || mutation.attributeName === 'data-theme') {
                // Re-enforce dark theme if someone tries to change it
                document.documentElement.classList.remove('light');
                document.documentElement.classList.add('dark');
                document.documentElement.removeAttribute('data-theme');
            }
        }
    });
});

// Start observing once DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    bodyObserver.observe(document.documentElement, { 
        attributes: true,
        attributeFilter: ['class', 'data-theme'] 
    });
});