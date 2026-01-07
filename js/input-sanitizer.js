/**
 * Input Sanitization Utility
 * Prevents XSS attacks by encoding HTML entities
 */

const InputSanitizer = {
    /**
     * Sanitize string input by encoding HTML entities
     * @param {string} input - User input to sanitize
     * @returns {string} - Sanitized string
     */
    sanitize(input) {
        if (typeof input !== 'string') return '';
        
        const temp = document.createElement('div');
        temp.textContent = input;
        return temp.innerHTML;
    },
    
    /**
     * Sanitize email format
     * @param {string} email - Email to validate and sanitize
     * @returns {string|null} - Sanitized email or null if invalid
     */
    sanitizeEmail(email) {
        const sanitized = this.sanitize(email);
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(sanitized) ? sanitized : null;
    },
    
    /**
     * Remove all HTML tags from input
     * @param {string} input - Input to strip
     * @returns {string} - Plain text only
     */
    stripHtml(input) {
        const temp = document.createElement('div');
        temp.innerHTML = input;
        return temp.textContent || temp.innerText || '';
    },
    
    /**
     * Sanitize and limit length
     * @param {string} input - Input to sanitize
     * @param {number} maxLength - Maximum allowed length
     * @returns {string} - Sanitized and trimmed string
     */
    sanitizeWithLimit(input, maxLength = 1000) {
        const sanitized = this.sanitize(input);
        return sanitized.slice(0, maxLength);
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InputSanitizer;
}
