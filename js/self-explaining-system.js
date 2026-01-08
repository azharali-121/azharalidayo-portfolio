/**
 * Self-Explaining Portfolio System
 * 
 * Purpose: Observes user behavior and provides contextual micro-explanations
 * about design and implementation decisions across the portfolio.
 * 
 * Features:
 * - Tracks time spent, scroll depth, and key element interactions
 * - Displays subtle, auto-dismissing tooltips with technical insights
 * - Respects user preferences (reduced motion, session persistence)
 * - Non-intrusive, performance-conscious implementation
 * 
 * Author: Azhar Ali
 */

(function() {
    'use strict';

    // Session storage key for tracking shown explanations
    const STORAGE_KEY = 'self_explaining_shown';
    
    // Configuration
    const CONFIG = {
        tooltipDuration: 4500,        // How long tooltips stay visible (ms)
        fadeInDuration: 400,          // Fade-in animation duration (ms)
        fadeOutDuration: 300,         // Fade-out animation duration (ms)
        scrollThreshold: 0.5,         // Scroll depth to trigger (50%)
        timeThreshold: 8000,          // Time on page to trigger (8 seconds)
        idleThreshold: 3000           // Idle time before showing tips (3 seconds)
    };

    // Tracking state
    const state = {
        pageLoadTime: Date.now(),
        maxScrollDepth: 0,
        interactionCount: 0,
        shownExplanations: new Set(),
        lastActivityTime: Date.now(),
        idleTimer: null,
        initialized: false
    };

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /**
     * Explanations database - organized by trigger type and context
     * Each explanation has:
     * - id: unique identifier
     * - text: the explanation message
     * - trigger: condition for showing (scroll, time, click, idle)
     * - selector: element to attach to (optional)
     * - page: which page(s) to show on (or 'all')
     */
    const EXPLANATIONS = [
        // === HOME PAGE EXPLANATIONS ===
        {
            id: 'hero_scan_optimization',
            text: '⚡ This section is optimized for recruiters scanning in <15 seconds.',
            trigger: 'time',
            threshold: 10000,
            page: 'index',
            selector: '.hero, .home-hero, #hero'
        },
        {
            id: 'animation_performance',
            text: '🎯 Animation disabled here to reduce CPU load and cognitive fatigue.',
            trigger: 'scroll',
            threshold: 0.3,
            page: 'index',
            selector: '.about-section, #about'
        },
        {
            id: 'dark_theme_choice',
            text: '🌑 Dark theme enforced by default — studies show 70% dev preference + eye strain reduction.',
            trigger: 'idle',
            page: 'index',
            selector: 'body'
        },

        // === PROJECTS PAGE EXPLANATIONS ===
        {
            id: 'project_performance_tradeoff',
            text: '⚙️ This project favors performance over visual complexity — deliberate tradeoff.',
            trigger: 'click',
            page: 'projects',
            selector: '.project-card, .card'
        },
        {
            id: 'static_images',
            text: '🖼️ Static images used instead of animations to improve load time by ~40%.',
            trigger: 'scroll',
            threshold: 0.4,
            page: 'projects',
            selector: '.projects-grid, .projects-container'
        },
        {
            id: 'github_links',
            text: '🔗 Direct GitHub links prioritize transparency and code verification over polish.',
            trigger: 'time',
            threshold: 12000,
            page: 'projects',
            selector: '.projects-section'
        },

        // === SKILLS PAGE EXPLANATIONS ===
        {
            id: 'skill_tooltips',
            text: '💡 Hover tooltips provide context without cluttering the interface.',
            trigger: 'scroll',
            threshold: 0.25,
            page: 'skills',
            selector: '.skills-container, .skills-grid'
        },
        {
            id: 'no_progress_bars',
            text: '📊 No arbitrary skill % bars — they mislead more than inform. Categories matter more.',
            trigger: 'time',
            threshold: 10000,
            page: 'skills',
            selector: '.skills-section'
        },
        {
            id: 'skill_categorization',
            text: '🏷️ Skills grouped by domain (Frontend, Backend, Security) for quick recruiter filtering.',
            trigger: 'idle',
            page: 'skills',
            selector: '.skills-section'
        },

        // === UNIVERSAL EXPLANATIONS ===
        {
            id: 'footer_minimal',
            text: '🎨 Minimal footer design — every pixel serves a purpose, no bloat.',
            trigger: 'scroll',
            threshold: 0.85,
            page: 'all',
            selector: 'footer, .footer'
        },
        {
            id: 'accessibility_first',
            text: '♿ Keyboard navigation fully supported — accessibility isn\'t optional.',
            trigger: 'time',
            threshold: 15000,
            page: 'all',
            selector: 'body'
        }
    ];

    /**
     * Initialize the self-explaining system
     */
    function init() {
        if (state.initialized) return;

        // Production: Console logging disabled
        // console.log('%c✨ Self-Explaining Portfolio System: ACTIVE', 'color: #00ff00; font-weight: bold; font-size: 14px;');
        
        // Load previously shown explanations from session storage
        loadShownExplanations();

        // Set up observers and listeners
        setupScrollObserver();
        setupTimeObserver();
        setupClickObserver();
        setupIdleObserver();

        state.initialized = true;
    }

    /**
     * Load shown explanations from session storage
     */
    function loadShownExplanations() {
        try {
            const stored = sessionStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                state.shownExplanations = new Set(parsed);
            }
        } catch (e) {
            // Silently fail - non-critical
        }
    }

    /**
     * Save shown explanations to session storage
     */
    function saveShownExplanations() {
        try {
            const arr = Array.from(state.shownExplanations);
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
        } catch (e) {
            // Silently fail - non-critical
        }
    }

    /**
     * Get current page identifier
     */
    function getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('index.html') || path === '/' || path.endsWith('/')) return 'index';
        if (path.includes('projects.html')) return 'projects';
        if (path.includes('skills.html')) return 'skills';
        if (path.includes('about.html')) return 'about';
        if (path.includes('contact.html')) return 'contact';
        return 'index'; // default
    }

    /**
     * Check if an explanation should be shown
     */
    function shouldShowExplanation(explanation) {
        // Already shown in this session
        if (state.shownExplanations.has(explanation.id)) {
            return false;
        }

        // Check page match
        const currentPage = getCurrentPage();
        if (explanation.page !== 'all' && explanation.page !== currentPage) {
            return false;
        }

        // Check if target element exists
        if (explanation.selector) {
            const element = document.querySelector(explanation.selector);
            if (!element) return false;
        }

        return true;
    }

    /**
     * Show an explanation tooltip
     */
    function showExplanation(explanation) {
        if (!shouldShowExplanation(explanation)) return;

        // Mark as shown
        state.shownExplanations.add(explanation.id);
        saveShownExplanations();

        // Find target element
        let targetElement = document.body;
        if (explanation.selector) {
            const element = document.querySelector(explanation.selector);
            if (element) targetElement = element;
        }

        // Create tooltip
        const tooltip = createTooltip(explanation.text);
        document.body.appendChild(tooltip);

        // Position tooltip
        positionTooltip(tooltip, targetElement);

        // Show tooltip with animation
        setTimeout(() => {
            tooltip.classList.add('ses-visible');
        }, 10);

        // Auto-dismiss
        setTimeout(() => {
            hideTooltip(tooltip);
        }, CONFIG.tooltipDuration);
    }

    /**
     * Create tooltip element
     */
    function createTooltip(text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'ses-tooltip';
        tooltip.setAttribute('role', 'status');
        tooltip.setAttribute('aria-live', 'polite');
        
        // Add icon and text
        const content = document.createElement('div');
        content.className = 'ses-content';
        content.textContent = text;
        
        tooltip.appendChild(content);
        
        return tooltip;
    }

    /**
     * Position tooltip relative to target element
     */
    function positionTooltip(tooltip, targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        // Position near bottom-right of viewport (fixed position)
        tooltip.style.position = 'fixed';
        tooltip.style.bottom = '30px';
        tooltip.style.right = '30px';
        tooltip.style.left = 'auto';
        tooltip.style.top = 'auto';

        // For mobile, position at bottom center
        if (window.innerWidth < 768) {
            tooltip.style.bottom = '20px';
            tooltip.style.right = '20px';
            tooltip.style.left = '20px';
        }
    }

    /**
     * Hide and remove tooltip
     */
    function hideTooltip(tooltip) {
        tooltip.classList.remove('ses-visible');
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        }, CONFIG.fadeOutDuration);
    }

    /**
     * Set up scroll depth observer
     */
    function setupScrollObserver() {
        let ticking = false;

        function onScroll() {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateScrollDepth();
                    checkScrollTriggers();
                    ticking = false;
                });
                ticking = true;
            }
        }

        function updateScrollDepth() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const depth = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
            
            if (depth > state.maxScrollDepth) {
                state.maxScrollDepth = depth;
            }
        }

        function checkScrollTriggers() {
            EXPLANATIONS.forEach(exp => {
                if (exp.trigger === 'scroll' && exp.threshold) {
                    if (state.maxScrollDepth >= exp.threshold) {
                        showExplanation(exp);
                    }
                }
            });
        }

        window.addEventListener('scroll', onScroll, { passive: true });
    }

    /**
     * Set up time-based observer
     */
    function setupTimeObserver() {
        function checkTimeTriggers() {
            const timeOnPage = Date.now() - state.pageLoadTime;
            
            EXPLANATIONS.forEach(exp => {
                if (exp.trigger === 'time' && exp.threshold) {
                    if (timeOnPage >= exp.threshold) {
                        showExplanation(exp);
                    }
                }
            });
        }

        // Check every 2 seconds
        setInterval(checkTimeTriggers, 2000);
    }

    /**
     * Set up click observer for interactive elements
     */
    function setupClickObserver() {
        document.addEventListener('click', (e) => {
            state.interactionCount++;
            resetIdleTimer();

            // Check if clicked element matches any explanation selector
            EXPLANATIONS.forEach(exp => {
                if (exp.trigger === 'click' && exp.selector) {
                    const target = e.target.closest(exp.selector);
                    if (target) {
                        showExplanation(exp);
                    }
                }
            });
        }, { passive: true });
    }

    /**
     * Set up idle detection observer
     */
    function setupIdleObserver() {
        function onActivity() {
            state.lastActivityTime = Date.now();
            resetIdleTimer();
        }

        function resetIdleTimer() {
            if (state.idleTimer) {
                clearTimeout(state.idleTimer);
            }

            state.idleTimer = setTimeout(() => {
                checkIdleTriggers();
            }, CONFIG.idleThreshold);
        }

        function checkIdleTriggers() {
            EXPLANATIONS.forEach(exp => {
                if (exp.trigger === 'idle') {
                    showExplanation(exp);
                }
            });
        }

        // Listen for user activity
        ['mousemove', 'keydown', 'scroll', 'touchstart'].forEach(eventType => {
            window.addEventListener(eventType, onActivity, { passive: true, once: false });
        });

        // Start idle timer
        resetIdleTimer();
    }

    /**
     * Inject minimal CSS for tooltips
     */
    function injectStyles() {
        if (document.getElementById('ses-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'ses-styles';
        styles.textContent = `
            .ses-tooltip {
                position: fixed;
                background: rgba(0, 255, 136, 0.15);
                border: 1px solid rgba(0, 255, 136, 0.4);
                border-radius: 8px;
                padding: 12px 16px;
                max-width: 360px;
                font-family: 'Courier New', monospace;
                font-size: 13px;
                line-height: 1.5;
                color: #00ff88;
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                box-shadow: 0 4px 20px rgba(0, 255, 136, 0.2);
                z-index: 10000;
                opacity: 0;
                transform: translateY(10px);
                transition: opacity ${CONFIG.fadeInDuration}ms ease-out, 
                            transform ${CONFIG.fadeInDuration}ms ease-out;
                pointer-events: none;
            }

            .ses-tooltip.ses-visible {
                opacity: 1;
                transform: translateY(0);
            }

            .ses-content {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            /* Respect reduced motion preference */
            @media (prefers-reduced-motion: reduce) {
                .ses-tooltip {
                    transition: opacity ${CONFIG.fadeInDuration / 2}ms ease-out;
                    transform: none !important;
                }
            }

            /* Mobile responsiveness */
            @media (max-width: 768px) {
                .ses-tooltip {
                    max-width: calc(100vw - 40px);
                    font-size: 12px;
                    padding: 10px 14px;
                }
            }

            /* High contrast mode support */
            @media (prefers-contrast: high) {
                .ses-tooltip {
                    background: rgba(0, 0, 0, 0.9);
                    border: 2px solid #00ff88;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            injectStyles();
            init();
        });
    } else {
        injectStyles();
        init();
    }

})();
