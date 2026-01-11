/**
 * Explain This Site Mode
 * 
 * Purpose: Provides a guided walkthrough of the portfolio with design reasoning.
 * This feature explains WHY each section exists, showcasing intentional design
 * decisions rather than just describing what's visible.
 * 
 * Features:
 * - Sequential spotlight highlighting of key sections
 * - Contextual tooltips with design rationale
 * - Keyboard navigation (Esc, Arrow keys)
 * - Fully responsive (mobile-first)
 * - Accessible and non-intrusive
 * 
 * Author: Azhar Ali
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        tooltipWidth: 400,
        tooltipMaxWidthMobile: 'calc(100vw - 40px)',
        animationDuration: 300,
        overlayColor: 'rgba(0, 0, 0, 0.85)',
        highlightPadding: 20,
        zIndexOverlay: 9998,
        zIndexHighlight: 9999,
        zIndexTooltip: 10000
    };

    // State management
    const state = {
        active: false,
        currentStep: 0,
        totalSteps: 0,
        elements: {
            overlay: null,
            highlight: null,
            tooltip: null,
            trigger: null
        }
    };

    /**
     * Walkthrough steps - defines sections to highlight and their explanations
     * Each step contains:
     * - selector: CSS selector for the element to highlight
     * - title: Short title for the explanation
     * - explanation: WHY this section exists (design reasoning)
     * - position: preferred tooltip position (top, bottom, left, right, auto)
     */
    const WALKTHROUGH_STEPS = [
        {
            selector: '.hero, #home',
            title: 'Hero Section: First Impression Protocol',
            explanation: 'First 8 seconds matter. This section is engineered for rapid assessment by recruiters and technical leads. Clear role definition, immediate credibility signals, and zero cognitive overhead. No fluff, just signal.',
            position: 'bottom'
        },
        {
            selector: '.hero-description, .hero-text p',
            title: 'Value Proposition: Signal Over Noise',
            explanation: 'One sentence to convey technical focus. Studies show recruiters spend 6-7 seconds per resume. This applies to portfolios too. "Secure, scalable systems" immediately signals systems thinking and security awareness.',
            position: 'bottom'
        },
        {
            selector: '.hero-buttons, .btn-primary',
            title: 'Call-to-Action: Friction Reduction',
            explanation: 'Primary action is "View Projects" - not "Contact". Why? Evidence first, conversation second. Technical roles require proof of competence. The action button removes one decision layer from the recruiter\'s cognitive load.',
            position: 'top'
        },
        {
            selector: '.profile-card, .hero-image',
            title: 'Professional Image: Visual Credibility',
            explanation: 'Clean, professional photo. No gimmicks, no casual selfies. In tech hiring, first visual impression matters. This signals professionalism before code is evaluated. Image optimization: proper sizing, lazy loading where needed.',
            position: 'left'
        },
        {
            selector: '.hacker-terminal-container',
            title: 'Terminal Animation: Technical Identity',
            explanation: 'Animated terminal shows comfort with command-line interfaces - a subtle signal of technical depth. Not just decoration; it communicates "I work in terminals daily." Respects performance: pauses when not visible.',
            position: 'top'
        },
        {
            selector: 'nav, .navbar',
            title: 'Navigation: Information Architecture',
            explanation: 'Order matters: Projects before Skills before About. Why? Evidence → Capabilities → Story. This matches the recruiter\'s evaluation sequence. Each click should move them closer to a hiring decision.',
            position: 'bottom'
        },
        {
            selector: 'footer, .footer',
            title: 'Footer: Minimal by Design',
            explanation: 'Every link serves a purpose. No social media clutter (unless professional). No unnecessary widgets. Footer navigation mirrors header structure for consistency. Design principle: if it doesn\'t help hiring decisions, it\'s removed.',
            position: 'top'
        },
        {
            selector: 'body',
            title: 'Overall Architecture: Performance as Feature',
            explanation: 'Dark theme by default (dev preference + accessibility). Minimal animations (CPU efficiency). Vanilla JS where possible (no framework bloat). Fast load time signals technical competence before a single line of code is reviewed.',
            position: 'center'
        }
    ];

    /**
     * Initialize the Explain Mode system
     */
    function init() {
        // Find or create trigger button
        const trigger = document.getElementById('explain-mode-trigger');
        if (!trigger) {
            // Trigger button not found - feature disabled
            return;
        }

        state.elements.trigger = trigger;
        state.totalSteps = WALKTHROUGH_STEPS.length;

        // Set up event listeners
        trigger.addEventListener('click', handleTriggerClick);
        
        // Inject styles
        injectStyles();

        // Production: Console logging disabled
    }

    /**
     * Handle trigger button click
     */
    function handleTriggerClick(e) {
        e.preventDefault();
        if (!state.active) {
            startWalkthrough();
        } else {
            endWalkthrough();
        }
    }

    /**
     * Start the walkthrough
     */
    function startWalkthrough() {
        state.active = true;
        state.currentStep = 0;

        // Create overlay elements
        createOverlay();
        createHighlight();
        createTooltip();

        // Set up keyboard navigation
        document.addEventListener('keydown', handleKeydown);

        // Show first step
        showStep(state.currentStep);

        // Update trigger button text
        if (state.elements.trigger) {
            state.elements.trigger.textContent = 'Exit Explain Mode';
            state.elements.trigger.classList.add('active');
        }

        // Production: Console logging disabled
    }

    /**
     * End the walkthrough
     */
    function endWalkthrough() {
        state.active = false;

        // Remove event listeners
        document.removeEventListener('keydown', handleKeydown);

        // Remove overlay elements
        removeElement(state.elements.overlay);
        removeElement(state.elements.highlight);
        removeElement(state.elements.tooltip);

        // Reset state
        state.elements.overlay = null;
        state.elements.highlight = null;
        state.elements.tooltip = null;

        // Update trigger button
        if (state.elements.trigger) {
            state.elements.trigger.textContent = 'Explain this site';
            state.elements.trigger.classList.remove('active');
        }

        // Production: Console logging disabled
    }

    /**
     * Handle keyboard navigation
     */
    function handleKeydown(e) {
        if (!state.active) return;

        switch(e.key) {
            case 'Escape':
                endWalkthrough();
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                e.preventDefault();
                nextStep();
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                previousStep();
                break;
        }
    }

    /**
     * Navigate to next step
     */
    function nextStep() {
        if (state.currentStep < state.totalSteps - 1) {
            state.currentStep++;
            showStep(state.currentStep);
        } else {
            endWalkthrough();
        }
    }

    /**
     * Navigate to previous step
     */
    function previousStep() {
        if (state.currentStep > 0) {
            state.currentStep--;
            showStep(state.currentStep);
        }
    }

    /**
     * Show a specific step
     */
    function showStep(stepIndex) {
        const step = WALKTHROUGH_STEPS[stepIndex];
        if (!step) return;

        // Find target element
        const targetElement = document.querySelector(step.selector);
        if (!targetElement) {
            // Element not found - skip to next step
            // Skip to next step if element not found
            if (stepIndex < state.totalSteps - 1) {
                setTimeout(() => nextStep(), 100);
            } else {
                endWalkthrough();
            }
            return;
        }

        // Update highlight
        updateHighlight(targetElement);

        // Update tooltip
        updateTooltip(step, targetElement);

        // Scroll element into view if needed
        scrollToElement(targetElement);
    }

    /**
     * Create overlay element
     */
    function createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'explain-mode-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-label', 'Site explanation walkthrough');
        document.body.appendChild(overlay);
        state.elements.overlay = overlay;

        // Fade in
        setTimeout(() => overlay.classList.add('visible'), 10);
    }

    /**
     * Create highlight box
     */
    function createHighlight() {
        const highlight = document.createElement('div');
        highlight.className = 'explain-mode-highlight';
        highlight.setAttribute('aria-hidden', 'true');
        document.body.appendChild(highlight);
        state.elements.highlight = highlight;
    }

    /**
     * Create tooltip element
     */
    function createTooltip() {
        const tooltip = document.createElement('div');
        tooltip.className = 'explain-mode-tooltip';
        tooltip.setAttribute('role', 'article');
        
        tooltip.innerHTML = `
            <div class="tooltip-header">
                <h3 class="tooltip-title"></h3>
                <button class="tooltip-close" aria-label="Close explanation">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>
            <div class="tooltip-content">
                <p class="tooltip-explanation"></p>
            </div>
            <div class="tooltip-footer">
                <div class="tooltip-progress">
                    <span class="progress-text"></span>
                </div>
                <div class="tooltip-navigation">
                    <button class="nav-btn nav-prev" aria-label="Previous">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 15L7 10L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="nav-btn nav-next" aria-label="Next">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 5L13 10L8 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(tooltip);
        state.elements.tooltip = tooltip;

        // Set up navigation button listeners
        const prevBtn = tooltip.querySelector('.nav-prev');
        const nextBtn = tooltip.querySelector('.nav-next');
        const closeBtn = tooltip.querySelector('.tooltip-close');

        prevBtn.addEventListener('click', previousStep);
        nextBtn.addEventListener('click', nextStep);
        closeBtn.addEventListener('click', endWalkthrough);
    }

    /**
     * Update highlight position and size
     */
    function updateHighlight(targetElement) {
        const highlight = state.elements.highlight;
        if (!highlight) return;

        const rect = targetElement.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        const padding = CONFIG.highlightPadding;

        highlight.style.top = `${rect.top + scrollTop - padding}px`;
        highlight.style.left = `${rect.left + scrollLeft - padding}px`;
        highlight.style.width = `${rect.width + padding * 2}px`;
        highlight.style.height = `${rect.height + padding * 2}px`;

        // Add visible class for animation
        highlight.classList.add('visible');
    }

    /**
     * Update tooltip content and position
     */
    function updateTooltip(step, targetElement) {
        const tooltip = state.elements.tooltip;
        if (!tooltip) return;

        // Update content
        tooltip.querySelector('.tooltip-title').textContent = step.title;
        tooltip.querySelector('.tooltip-explanation').textContent = step.explanation;
        tooltip.querySelector('.progress-text').textContent = 
            `${state.currentStep + 1} / ${state.totalSteps}`;

        // Update navigation buttons
        const prevBtn = tooltip.querySelector('.nav-prev');
        const nextBtn = tooltip.querySelector('.nav-next');
        
        prevBtn.disabled = state.currentStep === 0;
        
        // Update next button text and icon
        const isLastStep = state.currentStep === state.totalSteps - 1;
        nextBtn.innerHTML = isLastStep 
            ? `Finish <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5L13 10L8 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`
            : `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5L13 10L8 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`;

        // Position tooltip
        positionTooltip(tooltip, targetElement, step.position);

        // Show tooltip
        tooltip.classList.add('visible');
    }

    /**
     * Position tooltip relative to target element
     */
    function positionTooltip(tooltip, targetElement, preferredPosition) {
        const rect = targetElement.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        let top, left;
        let position = preferredPosition;

        // For mobile, always position at bottom of viewport
        if (viewportWidth < 768) {
            tooltip.style.position = 'fixed';
            tooltip.style.bottom = '20px';
            tooltip.style.left = '20px';
            tooltip.style.right = '20px';
            tooltip.style.top = 'auto';
            tooltip.style.transform = 'none';
            return;
        }

        // For desktop, position relative to element
        tooltip.style.position = 'absolute';

        if (position === 'center' || targetElement.tagName === 'BODY') {
            // Center in viewport
            tooltip.style.position = 'fixed';
            tooltip.style.top = '50%';
            tooltip.style.left = '50%';
            tooltip.style.transform = 'translate(-50%, -50%)';
            tooltip.style.bottom = 'auto';
            tooltip.style.right = 'auto';
            return;
        }

        const gap = 20; // Gap between highlight and tooltip

        // Calculate positions based on preferred position
        switch(position) {
            case 'bottom':
                top = rect.bottom + scrollTop + gap;
                left = rect.left + scrollLeft + (rect.width / 2);
                tooltip.style.transform = 'translateX(-50%)';
                break;
            case 'top':
                top = rect.top + scrollTop - tooltipRect.height - gap;
                left = rect.left + scrollLeft + (rect.width / 2);
                tooltip.style.transform = 'translateX(-50%)';
                break;
            case 'left':
                top = rect.top + scrollTop + (rect.height / 2);
                left = rect.left + scrollLeft - tooltipRect.width - gap;
                tooltip.style.transform = 'translateY(-50%)';
                break;
            case 'right':
                top = rect.top + scrollTop + (rect.height / 2);
                left = rect.right + scrollLeft + gap;
                tooltip.style.transform = 'translateY(-50%)';
                break;
            default:
                // Auto position
                top = rect.bottom + scrollTop + gap;
                left = rect.left + scrollLeft + (rect.width / 2);
                tooltip.style.transform = 'translateX(-50%)';
        }

        // Adjust if tooltip goes off screen
        if (top + tooltipRect.height > scrollTop + viewportHeight) {
            top = rect.top + scrollTop - tooltipRect.height - gap;
        }
        if (left + tooltipRect.width > viewportWidth) {
            left = viewportWidth - tooltipRect.width - 20;
            tooltip.style.transform = 'none';
        }
        if (left < 0) {
            left = 20;
            tooltip.style.transform = 'none';
        }

        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
        tooltip.style.bottom = 'auto';
        tooltip.style.right = 'auto';
    }

    /**
     * Scroll element into view smoothly
     */
    function scrollToElement(element) {
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const elementTop = rect.top;
        const elementHeight = rect.height;

        // Check if element is not fully visible
        if (elementTop < 100 || elementTop + elementHeight > viewportHeight - 100) {
            element.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'nearest'
            });
        }
    }

    /**
     * Remove element with fade out
     */
    function removeElement(element) {
        if (!element) return;
        
        element.classList.remove('visible');
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, CONFIG.animationDuration);
    }

    /**
     * Inject CSS styles
     */
    function injectStyles() {
        if (document.getElementById('explain-mode-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'explain-mode-styles';
        styles.textContent = `
            /* Explain Mode Overlay */
            .explain-mode-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: ${CONFIG.overlayColor};
                z-index: ${CONFIG.zIndexOverlay};
                opacity: 0;
                transition: opacity ${CONFIG.animationDuration}ms ease-out;
                pointer-events: none;
            }

            .explain-mode-overlay.visible {
                opacity: 1;
            }

            /* Highlight Box */
            .explain-mode-highlight {
                position: absolute;
                border: 2px solid #00ff88;
                border-radius: 8px;
                box-shadow: 
                    0 0 0 4px rgba(0, 255, 136, 0.2),
                    0 0 20px rgba(0, 255, 136, 0.4),
                    inset 0 0 20px rgba(0, 255, 136, 0.1);
                z-index: ${CONFIG.zIndexHighlight};
                pointer-events: none;
                opacity: 0;
                transform: scale(0.95);
                transition: all ${CONFIG.animationDuration}ms ease-out;
            }

            .explain-mode-highlight.visible {
                opacity: 1;
                transform: scale(1);
            }

            /* Tooltip */
            .explain-mode-tooltip {
                position: absolute;
                width: ${CONFIG.tooltipWidth}px;
                max-width: 90vw;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 1px solid rgba(0, 255, 136, 0.3);
                border-radius: 12px;
                padding: 0;
                z-index: ${CONFIG.zIndexTooltip};
                box-shadow: 
                    0 8px 32px rgba(0, 0, 0, 0.6),
                    0 0 0 1px rgba(0, 255, 136, 0.2);
                opacity: 0;
                transform: translateY(-10px);
                transition: opacity ${CONFIG.animationDuration}ms ease-out,
                            transform ${CONFIG.animationDuration}ms ease-out;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            }

            .explain-mode-tooltip.visible {
                opacity: 1;
                transform: translateY(0);
            }

            /* Tooltip Header */
            .tooltip-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 20px;
                border-bottom: 1px solid rgba(0, 255, 136, 0.2);
                background: rgba(0, 255, 136, 0.05);
            }

            .tooltip-title {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                color: #00ff88;
                line-height: 1.4;
                flex: 1;
                padding-right: 12px;
            }

            .tooltip-close {
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.6);
                cursor: pointer;
                padding: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: color 0.2s ease;
                flex-shrink: 0;
            }

            .tooltip-close:hover {
                color: #00ff88;
            }

            /* Tooltip Content */
            .tooltip-content {
                padding: 20px;
            }

            .tooltip-explanation {
                margin: 0;
                font-size: 14px;
                line-height: 1.7;
                color: rgba(255, 255, 255, 0.9);
            }

            /* Tooltip Footer */
            .tooltip-footer {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 20px;
                border-top: 1px solid rgba(0, 255, 136, 0.2);
                background: rgba(0, 0, 0, 0.2);
            }

            .tooltip-progress {
                font-size: 13px;
                color: rgba(255, 255, 255, 0.6);
                font-weight: 500;
            }

            .tooltip-navigation {
                display: flex;
                gap: 8px;
            }

            .nav-btn {
                background: rgba(0, 255, 136, 0.1);
                border: 1px solid rgba(0, 255, 136, 0.3);
                border-radius: 6px;
                color: #00ff88;
                cursor: pointer;
                padding: 8px 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                font-size: 13px;
                font-weight: 500;
            }

            .nav-btn:hover:not(:disabled) {
                background: rgba(0, 255, 136, 0.2);
                border-color: #00ff88;
                transform: translateY(-1px);
            }

            .nav-btn:disabled {
                opacity: 0.3;
                cursor: not-allowed;
            }

            .nav-btn svg {
                width: 16px;
                height: 16px;
            }

            /* Trigger Button Styling */
            #explain-mode-trigger {
                color: rgba(255, 255, 255, 0.5);
                font-size: 12px;
                text-decoration: none;
                border: none;
                background: none;
                cursor: pointer;
                padding: 4px 8px;
                transition: color 0.3s ease;
                font-family: 'Courier New', monospace;
            }

            #explain-mode-trigger:hover {
                color: #00ff88;
                text-decoration: underline;
            }

            #explain-mode-trigger.active {
                color: #00ff88;
                font-weight: bold;
            }

            /* Mobile Responsive */
            @media (max-width: 768px) {
                .explain-mode-tooltip {
                    width: auto;
                    max-width: calc(100vw - 40px);
                }

                .tooltip-title {
                    font-size: 14px;
                }

                .tooltip-explanation {
                    font-size: 13px;
                }

                .tooltip-header,
                .tooltip-content,
                .tooltip-footer {
                    padding: 12px 16px;
                }

                .nav-btn {
                    padding: 6px 10px;
                }
            }

            /* Reduced Motion Support */
            @media (prefers-reduced-motion: reduce) {
                .explain-mode-overlay,
                .explain-mode-highlight,
                .explain-mode-tooltip {
                    transition: none;
                }
            }

            /* Keyboard Focus Styles */
            .nav-btn:focus-visible,
            .tooltip-close:focus-visible {
                outline: 2px solid #00ff88;
                outline-offset: 2px;
            }
        `;

        document.head.appendChild(styles);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
