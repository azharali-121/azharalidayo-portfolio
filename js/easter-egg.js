/**
 * Easter Egg Console Message
 * 
 * Purpose: Provide subtle hint for curious developers exploring the site.
 * This is intentionally vague to act as the first clue in a multi-layer puzzle.
 * 
 * Not a security vulnerability - purely educational/recruitment tool.
 */

(function() {
    'use strict';
    
    // Only show in development/inspection context
    if (typeof console !== 'undefined' && console.log) {
        // Use setTimeout to ensure console is ready and to avoid blocking
        setTimeout(() => {
            const styles = [
                'color: #0ff',
                'font-family: monospace',
                'font-size: 14px',
                'text-shadow: 0 0 5px rgba(0, 255, 255, 0.5)'
            ].join(';');
            
            console.log('%c[SYSTEM]', styles, 'Portfolio loaded successfully.');
            console.log('%c[HINT]', styles, 'Not everything here is visible to the casual observer...');
            console.log('%c[?]', styles, 'Some things require... curiosity.');
            
            // Hidden breadcrumb - only visible if user explores console
            // This is intentionally not obvious
            if (window.location.pathname === '/index.html' || window.location.pathname === '/') {
                console.log('%c[...]', 'color: #333; font-size: 10px;', 'window.__secrets');
            }
        }, 1000);
    }
    
    /**
     * Hidden object for curious developers
     * Not executed automatically - requires manual inspection
     * 
     * Intention: Provide next clue without being obvious
     * Usage: Type window.__secrets in console
     */
    window.__secrets = {
        version: '1.0.0',
        author: 'Azhar Ali',
        note: 'If you found this, you know how to look deeper.',
        hint: 'The answer lies in the questions we ask.',
        path: function() {
            // Rot13 encoding for subtle obfuscation (not security, just puzzle layer)
            // Decodes to: "/flag.html?key=curiosity"
            return this.decode('_synт.ugzy?xrl=phevbfvgl');
        },
        decode: function(str) {
            return str.replace(/[a-zA-Z]/g, char => {
                const start = char <= 'Z' ? 65 : 97;
                return String.fromCharCode(start + (char.charCodeAt(0) - start + 13) % 26);
            }).replace(/_/g, '/');
        }
    };
    
    // Freeze object to prevent tampering
    Object.freeze(window.__secrets);
})();
