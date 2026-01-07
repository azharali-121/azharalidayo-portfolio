/**
 * Enhanced Form Validation & Feedback
 * Provides real-time validation, success/error messages, and accessibility features
 */

(function() {
    'use strict';

    const form = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    const submitBtn = document.getElementById('submitBtn');
    
    if (!form) {
        console.warn('Form validation: Contact form not found');
        return;
    }

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
     * Submit form to backend API
     * TODO: Replace this mock with your actual backend endpoint
     */
    async function submitForm(formData) {
        // --- BACKEND INTEGRATION REQUIRED ---
        // Uncomment and configure this section when you have a backend:
        /*
        try {
            const response = await fetch('YOUR_BACKEND_URL/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            throw new Error(error.message || 'Failed to send message. Please try again.');
        }
        */

        // --- MOCK SUCCESS RESPONSE (Development Only) ---
        // This simulates a successful form submission
        // Remove this section when integrating with real backend
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log('📧 MOCK SUBMISSION - Form Data:', formData);
        console.warn('⚠️ This is a mock response. Configure your backend API above.');
        
        return {
            success: true,
            message: '✅ Message received! (Mock response - no email sent)\n\nTo enable real email sending, configure your backend API in form-validation.js'
        };
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
            // Log error for debugging
            console.error('❌ Form submission error:', error);
            
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

    console.log('✅ Form validation initialized');
})();
