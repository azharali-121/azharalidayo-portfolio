/**
 * Enhanced Form Validation & Feedback
 * Provides real-time validation, success/error messages, and accessibility features
 * INCLUDES: CSRF token protection for security
 */

(function() {
    'use strict';

    const form = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    const submitBtn = document.getElementById('submitBtn');

    /**
     * CSRF Token Manager
     * Generates cryptographically secure tokens and manages session storage
     */
    const CSRFTokenManager = {
        TOKEN_KEY: 'csrf_token',
        TOKEN_TIMESTAMP: 'csrf_token_timestamp',
        TOKEN_EXPIRY: 3600000, // 1 hour in milliseconds

        /**
         * Generate cryptographically secure CSRF token
         */
        generateToken() {
            const array = new Uint8Array(32);
            crypto.getRandomValues(array);
            return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        },

        /**
         * Get valid token from session or generate new one
         */
        getToken() {
            const token = sessionStorage.getItem(this.TOKEN_KEY);
            const timestamp = sessionStorage.getItem(this.TOKEN_TIMESTAMP);
            const now = Date.now();

            // Check if token exists and hasn't expired
            if (token && timestamp && (now - parseInt(timestamp)) < this.TOKEN_EXPIRY) {
                return token;
            }

            // Generate new token
            const newToken = this.generateToken();
            sessionStorage.setItem(this.TOKEN_KEY, newToken);
            sessionStorage.setItem(this.TOKEN_TIMESTAMP, now.toString());
            return newToken;
        },

        /**
         * Validate token (client-side check before sending to backend)
         */
        validateToken(token) {
            const storedToken = sessionStorage.getItem(this.TOKEN_KEY);
            const timestamp = sessionStorage.getItem(this.TOKEN_TIMESTAMP);
            const now = Date.now();

            // Check token exists, matches, and hasn't expired
            return token === storedToken && 
                   timestamp && 
                   (now - parseInt(timestamp)) < this.TOKEN_EXPIRY;
        },

        /**
         * Rotate token (generate new one after successful submission)
         */
        rotateToken() {
            const newToken = this.generateToken();
            sessionStorage.setItem(this.TOKEN_KEY, newToken);
            sessionStorage.setItem(this.TOKEN_TIMESTAMP, Date.now().toString());
            return newToken;
        }
    };
    
    if (!form) {
        // Form not found - validation disabled
        return;
    }

    /**
     * Inject CSRF token as hidden field
     */
    function injectCSRFToken() {
        // Remove existing CSRF field if present
        const existingToken = form.querySelector('input[name="csrf_token"]');
        if (existingToken) {
            existingToken.remove();
        }

        // Create hidden input with CSRF token
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = 'csrf_token';
        csrfInput.value = CSRFTokenManager.getToken();
        csrfInput.setAttribute('data-security', 'csrf-protection');
        
        // Insert at beginning of form
        form.insertBefore(csrfInput, form.firstChild);
    }

    // Inject CSRF token on page load
    injectCSRFToken();

    // Validation rules
    const validationRules = {
        contactName: {
            minLength: 2,
            maxLength: 50,
            pattern: /^[a-zA-Z\s'-]+$/,
            errorMsg: 'Please enter a valid name (2-50 characters, letters only)'
        },
        contactEmail: {
            pattern: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i,
            errorMsg: 'Please enter a valid email address'
        },
        contactSubject: {
            minLength: 3,
            maxLength: 100,
            errorMsg: 'Subject must be between 3-100 characters'
        },
        contactMessage: {
            minLength: 10,
            maxLength: 1000,
            errorMsg: 'Message must be between 10-1000 characters'
        }
    };

    /**
     * Validate individual field
     */
    function validateField(field) {
        const fieldId = field.id;
        const value = field.value.trim();
        const rules = validationRules[fieldId];
        const errorSpan = document.getElementById(fieldId.replace('contact', '').toLowerCase() + 'Error');

        // Clear previous error
        field.classList.remove('error', 'success');
        if (errorSpan) errorSpan.textContent = '';

        // Empty check
        if (!value) {
            if (field.hasAttribute('required')) {
                showFieldError(field, errorSpan, 'This field is required');
                return false;
            }
            return true;
        }

        // Pattern validation
        if (rules.pattern && !rules.pattern.test(value)) {
            showFieldError(field, errorSpan, rules.errorMsg);
            return false;
        }

        // Length validation
        if (rules.minLength && value.length < rules.minLength) {
            showFieldError(field, errorSpan, rules.errorMsg);
            return false;
        }

        if (rules.maxLength && value.length > rules.maxLength) {
            showFieldError(field, errorSpan, rules.errorMsg);
            return false;
        }

        // Success state
        field.classList.add('success');
        field.setAttribute('aria-invalid', 'false');
        return true;
    }

    /**
     * Show field error
     */
    function showFieldError(field, errorSpan, message) {
        field.classList.add('error');
        field.setAttribute('aria-invalid', 'true');
        if (errorSpan) {
            errorSpan.textContent = message;
            errorSpan.setAttribute('role', 'alert');
        }
    }

    /**
     * Show form message (success/error)
     */
    function showFormMessage(message, type = 'success') {
        if (!formMessage) return;

        formMessage.innerHTML = message.replace(/\n/g, '<br>');
        formMessage.className = `form-message form-message-${type}`;
        formMessage.style.display = 'block';
        formMessage.setAttribute('role', 'alert');
        formMessage.setAttribute('aria-live', 'assertive');

        // Scroll to message with offset for fixed header
        setTimeout(() => {
            const messageRect = formMessage.getBoundingClientRect();
            const offset = 100; // Account for fixed header
            
            if (messageRect.top < 0 || messageRect.bottom > window.innerHeight) {
                window.scrollTo({
                    top: formMessage.offsetTop - offset,
                    behavior: 'smooth'
                });
            }
        }, 100);

        // Auto-hide success messages after 8 seconds
        if (type === 'success') {
            setTimeout(() => {
                formMessage.style.display = 'none';
            }, 8000);
        }
        // Error messages stay visible until dismissed
    }

    /**
     * Reset form to initial state
     */
    function resetForm() {
        form.reset();
        
        // Clear all validation states
        const fields = form.querySelectorAll('input, textarea');
        fields.forEach(field => {
            field.classList.remove('error', 'success');
            field.removeAttribute('aria-invalid');
        });

        // Clear error messages
        document.querySelectorAll('.form-error').forEach(error => {
            error.textContent = '';
        });

        // Hide form message
        if (formMessage) {
            formMessage.style.display = 'none';
        }
    }

    /**
     * Submit form to backend API with rate limiting and CSRF validation
     * Backend endpoint should validate both rate limits and CSRF token
     */
    async function submitForm(formData) {
        // --- CLIENT-SIDE RATE LIMIT CHECK ---
        const rateCheck = RateLimitManager.checkLimit();
        if (!rateCheck.allowed) {
            throw new Error(RateLimitManager.getLimitMessage(rateCheck.resetTime));
        }

        // --- CLIENT-SIDE CSRF VALIDATION ---
        const csrfToken = formData.csrf_token;
        if (!csrfToken || !CSRFTokenManager.validateToken(csrfToken)) {
            throw new Error('Security validation failed. Please refresh the page and try again.');
        }

        // --- BACKEND INTEGRATION ---
        // Set your backend API endpoint URL here
        const BACKEND_API_URL = process.env.CONTACT_API_URL || null;
        
        if (BACKEND_API_URL) {
            // PRODUCTION: Real backend endpoint
            try {
                const response = await fetch(BACKEND_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': csrfToken, // Send token in custom header
                    },
                    body: JSON.stringify(formData),
                    credentials: 'same-origin' // Include cookies for session validation
                });

                if (!response.ok) {
                    // Handle specific error codes
                    if (response.status === 403) {
                        throw new Error('Security validation failed. Please refresh and try again.');
                    }
                    if (response.status === 429) {
                        throw new Error('Too many requests. Please wait a moment and try again.');
                    }
                    throw new Error(`Server error: ${response.status}`);
                }

                const result = await response.json();
                
                // Record successful submission for rate limiting
                RateLimitManager.recordSubmission();
                
                // Rotate CSRF token after successful submission
                CSRFTokenManager.rotateToken();
                injectCSRFToken(); // Update hidden field with new token
                
                return result;
            } catch (error) {
                throw new Error(error.message || 'Failed to send message. Please try again.');
            }
        } else {
            // --- MOCK RESPONSE (Development Only) ---
            // This simulates a successful form submission
            // To enable real backend:
            // 1. Set BACKEND_API_URL above or set CONTACT_API_URL environment variable
            // 2. Implement backend CSRF validation (see backend-example.js)
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Simulate CSRF validation on mock backend
            if (!csrfToken || !CSRFTokenManager.validateToken(csrfToken)) {
                throw new Error('Mock CSRF validation failed');
            }
            
            // Record successful submission for rate limiting
            RateLimitManager.recordSubmission();
            
            // Rotate token even in mock mode
            CSRFTokenManager.rotateToken();
            injectCSRFToken();
            
            const remainingSubmissions = RateLimitManager.checkLimit();
            
            return {
                success: true,
                message: `✅ Message received! (Mock response - no email sent)\n\n🛡️ Security Features Active:\n• CSRF Protection\n• Rate Limiting (${remainingSubmissions.remaining}/${RateLimitManager.MAX_SUBMISSIONS} remaining)\n\nTo enable real email sending:\n1. Set BACKEND_API_URL in form-validation.js\n2. Implement backend CSRF validation`
            };
        }
    }

    // Real-time validation on blur
    const fields = form.querySelectorAll('input, textarea');
    fields.forEach(field => {
        field.addEventListener('blur', () => validateField(field));
        
        // Also validate on input for immediate feedback after first blur
        field.addEventListener('input', () => {
            if (field.classList.contains('error') || field.classList.contains('success')) {
                validateField(field);
            }
        });
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate all fields
        let isValid = true;
        fields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });

        if (!isValid) {
            showFormMessage('❌ Please fix the errors above before submitting.', 'error');
            // Focus first error field
            const firstError = form.querySelector('.error');
            if (firstError) firstError.focus();
            return;
        }

        // Disable submit button during submission
        const originalBtnContent = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Sending...</span><i class="fas fa-spinner fa-spin"></i>';

        try {
            // Get form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Submit form
            const result = await submitForm(data);

            // Show success message
            showFormMessage(result.message, 'success');

            // Reset form after short delay
            setTimeout(resetForm, 2000);

        } catch (error) {
            // Silently fail - show user-friendly message below
            
            // Show user-friendly error message
            const errorMessage = error.message || 'An unexpected error occurred';
            showFormMessage(
                `❌ Failed to send message\n\n${errorMessage}\n\nPlease try again or contact me directly via email.`,
                'error'
            );
            
            // Keep form data so user doesn't lose their message
        } finally {
            // Always re-enable submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnContent;
        }
    });

    // Prevent double submission
    form.addEventListener('submit', (e) => {
        if (submitBtn.disabled) {
            e.preventDefault();
        }
    });

    // Production: Console logging disabled
})();
