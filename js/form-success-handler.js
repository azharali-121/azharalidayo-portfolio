/**
 * Form Success Handler
 * Provides visual feedback for form submissions
 */

class FormSuccessHandler {
    constructor() {
        this.ANIMATION_DURATION = 3000; // 3 seconds
        this.setupEventListeners();
    }

    /**
     * Setup form submission listeners
     */
    setupEventListeners() {
        // Contact form
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactFormSubmit(e));
        }

        // Newsletter form
        const newsletterForm = document.getElementById('newsletterForm');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => this.handleNewsletterSubmit(e));
        }
    }

    /**
     * Handle contact form submission
     */
    handleContactFormSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Validate form
        if (!this.validateContactForm(form)) {
            this.showError(submitBtn, originalText);
            return;
        }

        // Show submitting state
        this.showSubmitting(submitBtn);

        // Simulate submission (replace with actual AJAX call)
        setTimeout(() => {
            this.showSuccess(submitBtn, () => {
                // Reset form after animation
                form.reset();
                submitBtn.innerHTML = originalText;
            });
        }, 1000);
    }

    /**
     * Handle newsletter form submission
     */
    handleNewsletterSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Validate email with sanitization
        const emailInput = form.querySelector('input[type="email"]');
        const email = typeof InputSanitizer !== 'undefined'
            ? InputSanitizer.sanitizeEmail(emailInput.value)
            : emailInput.value.trim();
            
        if (!this.validateEmail(email)) {
            this.showError(submitBtn, originalText);
            return;
        }

        // Show submitting state
        this.showSubmitting(submitBtn);

        // Simulate submission
        setTimeout(() => {
            this.showSuccess(submitBtn, () => {
                form.reset();
                submitBtn.innerHTML = originalText;
            });
        }, 1000);
    }

    /**
     * Validate contact form
     */
    validateContactForm(form) {
        const nameInput = form.querySelector('input[name="name"]');
        const emailInput = form.querySelector('input[name="email"]');
        const subjectInput = form.querySelector('input[name="subject"]');
        const messageInput = form.querySelector('textarea[name="message"]');

        // Get and sanitize values using InputSanitizer if available
        const name = typeof InputSanitizer !== 'undefined' 
            ? InputSanitizer.sanitizeWithLimit(nameInput?.value, 100)
            : nameInput?.value.trim();
            
        const email = typeof InputSanitizer !== 'undefined'
            ? InputSanitizer.sanitizeEmail(emailInput?.value)
            : emailInput?.value.trim();
            
        const subject = typeof InputSanitizer !== 'undefined'
            ? InputSanitizer.sanitizeWithLimit(subjectInput?.value, 200)
            : subjectInput?.value.trim();
            
        const message = typeof InputSanitizer !== 'undefined'
            ? InputSanitizer.sanitizeWithLimit(messageInput?.value, 2000)
            : messageInput?.value.trim();

        if (!name || !email || !subject || !message) {
            return false;
        }

        return this.validateEmail(email);
    }

    /**
     * Validate email format
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Show submitting state
     */
    showSubmitting(button) {
        button.classList.add('btn-submitting');
        button.disabled = true;
    }

    /**
     * Show success state
     */
    showSuccess(button, callback) {
        // Remove submitting state
        button.classList.remove('btn-submitting');
        
        // Add success state
        button.classList.add('btn-success-animation');
        button.innerHTML = '<i class="fas fa-check"></i> Sent ✓';
        
        // Reset after duration
        setTimeout(() => {
            button.classList.remove('btn-success-animation');
            button.disabled = false;
            if (callback) callback();
        }, this.ANIMATION_DURATION);
    }

    /**
     * Show error state
     */
    showError(button, originalText) {
        button.classList.add('btn-error-animation');
        button.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error';
        
        setTimeout(() => {
            button.classList.remove('btn-error-animation');
            button.innerHTML = originalText;
        }, 2000);
    }
}

// Initialize on DOM load
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        new FormSuccessHandler();
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormSuccessHandler;
}
