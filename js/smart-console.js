/**
 * Smart Console Logger for Development
 * Shows performance logs only in local development
 * Production builds show clean console for recruiters
 */

const SmartConsole = {
    isDevelopment: () => {
        return location.hostname === 'localhost' || 
               location.hostname === '127.0.0.1' || 
               location.hostname === '';
    },
    
    log: function(...args) {
        if (this.isDevelopment()) {
            console.log(...args);
        }
    },
    
    warn: function(...args) {
        if (this.isDevelopment()) {
            console.warn(...args);
        }
    },
    
    error: function(...args) {
        // Always show errors, even in production
        console.error(...args);
    },
    
    info: function(...args) {
        if (this.isDevelopment()) {
            console.info(...args);
        }
    },
    
    table: function(...args) {
        if (this.isDevelopment()) {
            console.table(...args);
        }
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmartConsole;
}
