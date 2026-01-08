/**
 * Production Environment Configuration
 * Handles production-specific settings, console management, and error tracking
 */

(function() {
    'use strict';

    // Detect environment
    const isDevelopment = location.hostname === 'localhost' || 
                         location.hostname === '127.0.0.1' || 
                         location.hostname === '' ||
                         location.search.includes('debug=true');

    const isProduction = !isDevelopment;

    /**
     * Console Management for Production
     * Disables all console methods in production except errors sent to tracking
     */
    if (isProduction) {
        const noop = function() {};
        const consoleBackup = {
            log: console.log,
            warn: console.warn,
            info: console.info,
            debug: console.debug
        };

        // Disable all console methods except error
        console.log = noop;
        console.warn = noop;
        console.info = noop;
        console.debug = noop;

        // Keep errors but send to error tracking
        const originalError = console.error;
        console.error = function(...args) {
            // Send to error tracking if available
            if (window.Sentry) {
                Sentry.captureException(new Error(args.join(' ')));
            }
            // Still log in production for debugging
            if (isDevelopment) {
                originalError.apply(console, args);
            }
        };

        // Expose method to re-enable console for debugging
        window.enableDebugMode = function() {
            console.log = consoleBackup.log;
            console.warn = consoleBackup.warn;
            console.info = consoleBackup.info;
            console.debug = consoleBackup.debug;
            console.log('%c Debug Mode Enabled', 'color: #00ff00; font-weight: bold;');
        };
    }

    /**
     * Detect prefers-reduced-motion
     */
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /**
     * Global configuration object
     */
    window.PortfolioConfig = {
        isDevelopment,
        isProduction,
        prefersReducedMotion,
        animationsEnabled: !prefersReducedMotion,
        particlesEnabled: !prefersReducedMotion && window.innerWidth >= 768,
        typingAnimationsEnabled: !prefersReducedMotion,
        
        // Error tracking
        errorTrackingEnabled: isProduction,
        
        // Performance monitoring
        performanceMonitoringEnabled: isProduction,
        
        // Security
        csrfEnabled: true,
        rateLimitEnabled: true
    };

    /**
     * Static Fallback for Reduced Motion
     * Applies when user has prefers-reduced-motion enabled
     */
    if (prefersReducedMotion) {
        document.documentElement.classList.add('reduce-motion');
        
        // Add CSS for static background fallback
        const style = document.createElement('style');
        style.textContent = `
            .reduce-motion * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
            
            .reduce-motion .hero {
                background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%) !important;
            }
            
            .reduce-motion .terminal-line {
                animation: none !important;
                opacity: 1 !important;
            }
            
            .reduce-motion .typing-effect {
                animation: none !important;
            }
            
            .reduce-motion [data-aos] {
                opacity: 1 !important;
                transform: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Listen for changes to prefers-reduced-motion
     */
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', (e) => {
        window.PortfolioConfig.animationsEnabled = !e.matches;
        window.PortfolioConfig.particlesEnabled = !e.matches && window.innerWidth >= 768;
        window.PortfolioConfig.typingAnimationsEnabled = !e.matches;
        
        if (e.matches) {
            document.documentElement.classList.add('reduce-motion');
            // Disable Vanta if running
            if (window.vantaEffect) {
                window.vantaEffect.destroy();
                window.vantaEffect = null;
            }
        } else {
            document.documentElement.classList.remove('reduce-motion');
            // Optionally re-enable animations
            if (window.reinitializeAnimations) {
                window.reinitializeAnimations();
            }
        }
    });

    /**
     * Global Error Handler
     * Catches unhandled errors and sends to tracking service
     */
    window.addEventListener('error', (event) => {
        if (window.Sentry && isProduction) {
            Sentry.captureException(event.error);
        }
    });

    window.addEventListener('unhandledrejection', (event) => {
        if (window.Sentry && isProduction) {
            Sentry.captureException(event.reason);
        }
    });

    /**
     * Performance Observer for Core Web Vitals
     */
    if (isProduction && 'PerformanceObserver' in window) {
        try {
            // Largest Contentful Paint (LCP)
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                
                if (window.gtag) {
                    gtag('event', 'web_vitals', {
                        event_category: 'performance',
                        event_label: 'LCP',
                        value: Math.round(lastEntry.startTime),
                        non_interaction: true
                    });
                }
            });
            lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

            // First Input Delay (FID)
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (window.gtag) {
                        gtag('event', 'web_vitals', {
                            event_category: 'performance',
                            event_label: 'FID',
                            value: Math.round(entry.processingStart - entry.startTime),
                            non_interaction: true
                        });
                    }
                });
            });
            fidObserver.observe({ type: 'first-input', buffered: true });

            // Cumulative Layout Shift (CLS)
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
            });
            clsObserver.observe({ type: 'layout-shift', buffered: true });

            // Send CLS on page unload
            window.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'hidden' && window.gtag) {
                    gtag('event', 'web_vitals', {
                        event_category: 'performance',
                        event_label: 'CLS',
                        value: Math.round(clsValue * 1000),
                        non_interaction: true
                    });
                }
            });
        } catch (error) {
            // Performance observer not supported
        }
    }

    /**
     * Expose config for debugging
     */
    if (isDevelopment) {
        window.debugConfig = () => {
            return window.PortfolioConfig;
        };
    }

})();
