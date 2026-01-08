/**
 * Error Tracking Integration (Sentry)
 * Captures JavaScript errors and performance metrics in production
 * 
 * Setup Instructions:
 * 1. Sign up for free Sentry account: https://sentry.io/signup/
 * 2. Create new project (select "JavaScript" as platform)
 * 3. Copy your DSN (Data Source Name)
 * 4. Replace 'YOUR_SENTRY_DSN_HERE' below with your actual DSN
 * 5. Deploy to production
 * 
 * Privacy Notice:
 * - No personally identifiable information (PII) is captured
 * - Form data is automatically scrubbed
 * - IP addresses are anonymized
 * - User tracking is disabled
 */

(function() {
    'use strict';

    // Only initialize in production
    const isProduction = window.PortfolioConfig?.isProduction || 
                        (!location.hostname.includes('localhost') && 
                         !location.hostname.includes('127.0.0.1'));

    if (!isProduction) {
        return;
    }

    // Sentry Configuration
    const SENTRY_CONFIG = {
        // Replace with your Sentry DSN
        dsn: 'YOUR_SENTRY_DSN_HERE', // e.g., 'https://abc123@o123456.ingest.sentry.io/123456'
        
        // Environment
        environment: 'production',
        
        // Release version (update with each deployment)
        release: 'portfolio@1.0.0',
        
        // Sample rate for performance monitoring (10% of transactions)
        tracesSampleRate: 0.1,
        
        // Don't capture user IP addresses
        sendDefaultPii: false,
        
        // Ignore specific errors
        ignoreErrors: [
            // Browser extensions
            'top.GLOBALS',
            'originalCreateNotification',
            'canvas.contentDocument',
            'MyApp_RemoveAllHighlights',
            'atomicFindClose',
            // Network errors that are expected
            'NetworkError',
            'Network request failed',
            // Random plugins/extensions
            'window.webkit',
            'webkit',
            // Facebook related errors
            '_fb_',
            'fb_',
            // Google Analytics
            'gtag',
            'ga(',
        ],
        
        // Filter out certain URLs
        denyUrls: [
            // Browser extensions
            /extensions\//i,
            /^chrome:\/\//i,
            /^chrome-extension:\/\//i,
            /^moz-extension:\/\//i,
        ],
        
        // Callbacks
        beforeSend(event, hint) {
            // Filter out non-critical errors in production
            if (event.exception) {
                const error = hint.originalException;
                
                // Don't send if error message contains certain keywords
                if (error && error.message) {
                    const message = error.message.toLowerCase();
                    
                    // Skip 404 errors
                    if (message.includes('404') || message.includes('not found')) {
                        return null;
                    }
                    
                    // Skip CORS errors (expected for external resources)
                    if (message.includes('cors')) {
                        return null;
                    }
                }
            }
            
            // Scrub sensitive data from breadcrumbs
            if (event.breadcrumbs) {
                event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
                    if (breadcrumb.category === 'xhr' || breadcrumb.category === 'fetch') {
                        // Remove request/response data
                        if (breadcrumb.data) {
                            delete breadcrumb.data.body;
                            delete breadcrumb.data.response;
                        }
                    }
                    return breadcrumb;
                });
            }
            
            // Remove form data from event
            if (event.request?.data) {
                event.request.data = '[Filtered]';
            }
            
            return event;
        },
        
        // Integration configuration
        integrations: function(integrations) {
            // Filter out breadcrumbs integration if you want less data
            return integrations.filter(integration => {
                return integration.name !== 'Breadcrumbs';
            });
        }
    };

    /**
     * Load Sentry SDK
     */
    function loadSentry() {
        // Check if DSN is configured
        if (SENTRY_CONFIG.dsn === 'YOUR_SENTRY_DSN_HERE') {
            return;
        }

        // Load Sentry SDK from CDN
        const script = document.createElement('script');
        script.src = 'https://browser.sentry-cdn.com/7.91.0/bundle.tracing.min.js';
        script.crossOrigin = 'anonymous';
        script.integrity = 'sha384-jZyxLaLgPNAyJPXB2vEEI5SkmjN3dCk1pYBhP9BUqXVwmRnZQgRlNpZE2oDDmMzm';
        
        script.onload = function() {
            if (window.Sentry) {
                window.Sentry.init(SENTRY_CONFIG);
                
                // Set user context (anonymous)
                window.Sentry.setUser({
                    id: 'anonymous'
                });
                
                // Set custom tags
                window.Sentry.setTag('portfolio_version', '1.0.0');
                window.Sentry.setTag('features', 'csrf,rate-limiting,a11y');
            }
        };
        
        script.onerror = function() {
            // Sentry failed to load - continue without error tracking
        };
        
        document.head.appendChild(script);
    }

    /**
     * Alternative: LogRocket Integration
     * Uncomment if you prefer LogRocket over Sentry
     */
    /*
    function loadLogRocket() {
        const LOGROCKET_APP_ID = 'YOUR_LOGROCKET_APP_ID';
        
        if (LOGROCKET_APP_ID === 'YOUR_LOGROCKET_APP_ID') {
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.lr-ingest.io/LogRocket.min.js';
        script.crossOrigin = 'anonymous';
        
        script.onload = function() {
            if (window.LogRocket) {
                window.LogRocket.init(LOGROCKET_APP_ID, {
                    // Privacy settings
                    shouldCaptureIP: false,
                    shouldParseXHRBlob: false,
                    
                    // Don't capture sensitive inputs
                    dom: {
                        inputSanitizer: true
                    },
                    
                    // Network request sanitization
                    network: {
                        requestSanitizer: request => {
                            // Remove sensitive headers
                            if (request.headers['X-CSRF-Token']) {
                                request.headers['X-CSRF-Token'] = '[Filtered]';
                            }
                            
                            // Remove request body for POST requests
                            if (request.body) {
                                request.body = '[Filtered]';
                            }
                            
                            return request;
                        },
                        
                        responseSanitizer: response => {
                            // Remove response data
                            if (response.body) {
                                response.body = '[Filtered]';
                            }
                            return response;
                        }
                    }
                });
                
                // Identify user (anonymous)
                window.LogRocket.identify('anonymous-user', {
                    portfolio: 'azhar-ali'
                });
            }
        };
        
        document.head.appendChild(script);
    }
    */

    /**
     * Custom Error Tracking Fallback
     * If you don't want to use Sentry/LogRocket, you can send errors to your own endpoint
     */
    function setupCustomErrorTracking() {
        window.addEventListener('error', (event) => {
            const errorData = {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            };
            
            // Send to your backend endpoint
            fetch('/api/log-error', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(errorData)
            }).catch(() => {
                // Silently fail if logging endpoint is unavailable
            });
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            const errorData = {
                message: event.reason?.message || 'Unhandled Promise Rejection',
                stack: event.reason?.stack,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            };
            
            fetch('/api/log-error', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(errorData)
            }).catch(() => {
                // Silently fail
            });
        });
    }

    /**
     * Initialize error tracking
     * Choose one: Sentry, LogRocket, or Custom
     */
    if (SENTRY_CONFIG.dsn !== 'YOUR_SENTRY_DSN_HERE') {
        loadSentry();
    } else {
        // Fallback to custom error tracking
        // Uncomment if you have a backend endpoint for errors
        // setupCustomErrorTracking();
    }

})();
