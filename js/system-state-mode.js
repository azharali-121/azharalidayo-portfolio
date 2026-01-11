/**
 * System State Mode
 * 
 * Purpose: Makes the portfolio feel like a running system, not a static website.
 * Provides real-time observability into page state, interactions, and health.
 * 
 * Features:
 * - Live system monitoring (uptime, interactions, render status)
 * - Security audit (inline scripts, eval detection)
 * - Terminal-style UI with monospace fonts
 * - Zero performance impact (efficient observers)
 * - Fully responsive
 * 
 * Author: Azhar Ali
 */

(function() {
    'use strict';

    // System state tracking
    const systemState = {
        pageLoadTime: Date.now(),
        currentPage: getCurrentPage(),
        lastInteraction: { type: 'load', timestamp: Date.now(), target: 'document' },
        domNodeCount: 0,
        scriptCount: 0,
        hasInlineScripts: false,
        hasEval: false,
        renderStatus: 'healthy',
        updateInterval: null,
        panelVisible: false
    };

    // Configuration
    const CONFIG = {
        updateFrequency: 1000, // Update every 1 second
        interactionEvents: ['click', 'scroll', 'keydown', 'mousemove'],
        statusColors: {
            stable: '#00ff88',
            warning: '#ffaa00',
            critical: '#ff4444'
        }
    };

    // Elements
    const elements = {
        statusIndicator: null,
        panel: null
    };

    /**
     * Initialize System State Mode
     */
    function init() {
        // Create and inject status indicator
        createStatusIndicator();
        
        // Create system panel (hidden by default)
        createSystemPanel();
        
        // Set up interaction tracking
        setupInteractionTracking();
        
        // Perform initial security audit
        performSecurityAudit();
        
        // Inject styles
        injectStyles();
        
        // Start live updates
        startLiveUpdates();

        // Production: Console logging disabled
    }

    /**
     * Get current page identifier
     */
    function getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        return page.replace('.html', '') || 'index';
    }

    /**
     * Create status indicator - position depends on current page
     */
    function createStatusIndicator() {
        const indicator = document.createElement('button');
        indicator.type = 'button'; // Prevent form submission
        indicator.id = 'system-status-indicator';
        indicator.className = 'system-status-indicator';
        
        // Create icon and text structure for better styling
        const icon = document.createElement('i');
        icon.className = 'fas fa-terminal';
        icon.setAttribute('aria-hidden', 'true');
        
        const textSpan = document.createElement('span');
        textSpan.textContent = 'System State';
        
        indicator.appendChild(icon);
        indicator.appendChild(textSpan);
        indicator.setAttribute('aria-label', 'Toggle system state panel');
        
        // Add click handler
        indicator.addEventListener('click', togglePanel);
        indicator.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                togglePanel();
            }
        });

        // Check if we're on the contact page
        const isContactPage = systemState.currentPage === 'contact';
        
        if (isContactPage) {
            // Place in contact form, just before the submit button
            const submitBtn = document.querySelector('#submitBtn, .contact-form button[type="submit"]');
            const form = document.querySelector('.contact-form, #contactForm');
            
            if (submitBtn && form) {
                form.insertBefore(indicator, submitBtn);
                elements.statusIndicator = indicator;
                // Add form-specific class for styling
                indicator.classList.add('in-form');
            } else {
                // Fallback to footer if form not found
                insertIntoFooter(indicator);
            }
        } else {
            // Insert into footer for all other pages
            insertIntoFooter(indicator);
        }
    }

    /**
     * Helper function to insert indicator into footer
     */
    function insertIntoFooter(indicator) {
        // Find footer actions container
        const footerActions = document.querySelector('.footer__actions');
        
        if (footerActions) {
            // Add system state toggle as a separate button in actions container
            indicator.classList.add('footer-action-btn');
            footerActions.appendChild(indicator);
            elements.statusIndicator = indicator;
        } else {
            // Fallback: add to copyright text if actions container not found
            const footerCopyright = document.querySelector('.footer__copyright-text');
            if (footerCopyright) {
                const separator = document.createTextNode(' | ');
                footerCopyright.appendChild(separator);
                footerCopyright.appendChild(indicator);
                elements.statusIndicator = indicator;
                indicator.classList.add('in-footer');
            }
        }
    }

    /**
     * Create system panel
     */
    function createSystemPanel() {
        const panel = document.createElement('div');
        panel.id = 'system-state-panel';
        panel.className = 'system-state-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-label', 'System state information');
        panel.setAttribute('aria-hidden', 'true');
        
        panel.innerHTML = `
            <div class="panel-header">
                <div class="panel-title">
                    <span class="title-icon">⚙️</span>
                    <span>SYSTEM STATE</span>
                </div>
                <button class="panel-close" aria-label="Close panel">
                    <span>×</span>
                </button>
            </div>
            <div class="panel-body">
                <div class="state-section">
                    <div class="state-label">UPTIME</div>
                    <div class="state-value" id="state-uptime">00:00:00</div>
                </div>
                <div class="state-section">
                    <div class="state-label">MODULE</div>
                    <div class="state-value" id="state-module">index</div>
                </div>
                <div class="state-section">
                    <div class="state-label">LAST INTERACTION</div>
                    <div class="state-value" id="state-interaction">load @ document</div>
                </div>
                <div class="state-section">
                    <div class="state-label">RENDER STATUS</div>
                    <div class="state-value" id="state-render">
                        <span class="status-badge status-ok">HEALTHY</span>
                        <span class="state-detail" id="state-dom-count">0 nodes</span>
                    </div>
                </div>
                <div class="state-section">
                    <div class="state-label">SECURITY AUDIT</div>
                    <div class="state-value" id="state-security">
                        <span class="status-badge status-ok">SECURE</span>
                        <span class="state-detail" id="state-security-detail">No inline eval detected</span>
                    </div>
                </div>
                <div class="state-section philosophy">
                    <div class="state-label">BUILD PHILOSOPHY</div>
                    <div class="state-value philosophy-text">"Performance is a feature, not an afterthought."</div>
                </div>
            </div>
            <div class="panel-footer">
                <div class="footer-text">Real-time monitoring • Zero overhead • Vanilla JS</div>
            </div>
        `;

        document.body.appendChild(panel);
        elements.panel = panel;

        // Set up close button
        const closeBtn = panel.querySelector('.panel-close');
        closeBtn.addEventListener('click', togglePanel);

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && systemState.panelVisible) {
                togglePanel();
            }
        });

        // Close on outside click
        panel.addEventListener('click', (e) => {
            if (e.target === panel) {
                togglePanel();
            }
        });
    }

    /**
     * Toggle panel visibility
     */
    function togglePanel() {
        systemState.panelVisible = !systemState.panelVisible;
        
        if (systemState.panelVisible) {
            elements.panel.classList.add('visible');
            elements.panel.setAttribute('aria-hidden', 'false');
            elements.statusIndicator.classList.add('active');
            updatePanelData(); // Immediate update when opening
        } else {
            elements.panel.classList.remove('visible');
            elements.panel.setAttribute('aria-hidden', 'true');
            elements.statusIndicator.classList.remove('active');
        }
    }

    /**
     * Set up interaction tracking
     */
    function setupInteractionTracking() {
        let throttleTimeout = null;
        
        CONFIG.interactionEvents.forEach(eventType => {
            document.addEventListener(eventType, (e) => {
                // Throttle to avoid excessive updates
                if (throttleTimeout) return;
                
                throttleTimeout = setTimeout(() => {
                    throttleTimeout = null;
                }, 100);

                // Update last interaction
                systemState.lastInteraction = {
                    type: eventType,
                    timestamp: Date.now(),
                    target: getTargetDescription(e.target)
                };
            }, { passive: true });
        });
    }

    /**
     * Get human-readable target description
     */
    function getTargetDescription(element) {
        if (!element) return 'unknown';
        if (element === document) return 'document';
        if (element === window) return 'window';
        
        // Try to get meaningful identifier
        if (element.id) return `#${element.id}`;
        if (element.className) {
            const classes = element.className.toString().split(' ');
            return `.${classes[0]}`;
        }
        return element.tagName.toLowerCase();
    }

    /**
     * Perform security audit
     */
    function performSecurityAudit() {
        // Check for inline scripts
        const inlineScripts = document.querySelectorAll('script:not([src])');
        systemState.hasInlineScripts = inlineScripts.length > 0;
        
        // Count total scripts
        const allScripts = document.querySelectorAll('script');
        systemState.scriptCount = allScripts.length;
        
        // Check for eval usage (basic detection)
        systemState.hasEval = checkForEvalUsage();
        
        // Update security status
        updateSecurityStatus();
    }

    /**
     * Check for eval usage in scripts
     */
    function checkForEvalUsage() {
        try {
            // Check if eval is being used by examining script content
            const scripts = document.querySelectorAll('script:not([src])');
            for (let script of scripts) {
                if (script.textContent.includes('eval(')) {
                    return true;
                }
            }
            return false;
        } catch (e) {
            return false;
        }
    }

    /**
     * Update security status display
     */
    function updateSecurityStatus() {
        const securityEl = document.getElementById('state-security');
        const securityDetailEl = document.getElementById('state-security-detail');
        
        if (!securityEl || !securityDetailEl) return;

        const badge = securityEl.querySelector('.status-badge');
        
        if (systemState.hasEval) {
            badge.className = 'status-badge status-warning';
            badge.textContent = 'WARNING';
            securityDetailEl.textContent = 'eval() usage detected';
        } else if (systemState.hasInlineScripts) {
            badge.className = 'status-badge status-ok';
            badge.textContent = 'SECURE';
            securityDetailEl.textContent = `${systemState.scriptCount} scripts loaded`;
        } else {
            badge.className = 'status-badge status-ok';
            badge.textContent = 'SECURE';
            securityDetailEl.textContent = 'External scripts only';
        }
    }

    /**
     * Start live updates
     */
    function startLiveUpdates() {
        systemState.updateInterval = setInterval(() => {
            updatePanelData();
            updateRenderStatus();
        }, CONFIG.updateFrequency);
    }

    /**
     * Update panel data
     */
    function updatePanelData() {
        // Update uptime
        const uptimeEl = document.getElementById('state-uptime');
        if (uptimeEl) {
            uptimeEl.textContent = formatUptime(Date.now() - systemState.pageLoadTime);
        }

        // Update module
        const moduleEl = document.getElementById('state-module');
        if (moduleEl) {
            moduleEl.textContent = systemState.currentPage;
        }

        // Update last interaction
        const interactionEl = document.getElementById('state-interaction');
        if (interactionEl) {
            const timeSince = Date.now() - systemState.lastInteraction.timestamp;
            const timeStr = timeSince < 1000 ? 'just now' : `${Math.floor(timeSince / 1000)}s ago`;
            interactionEl.textContent = `${systemState.lastInteraction.type} @ ${systemState.lastInteraction.target} (${timeStr})`;
        }

        // Update DOM count
        const domCountEl = document.getElementById('state-dom-count');
        if (domCountEl) {
            domCountEl.textContent = `${systemState.domNodeCount} nodes`;
        }
    }

    /**
     * Update render status
     */
    function updateRenderStatus() {
        // Count DOM nodes
        systemState.domNodeCount = document.getElementsByTagName('*').length;
        
        // Check render health
        const renderEl = document.getElementById('state-render');
        if (!renderEl) return;

        const badge = renderEl.querySelector('.status-badge');
        
        if (systemState.domNodeCount > 5000) {
            systemState.renderStatus = 'warning';
            badge.className = 'status-badge status-warning';
            badge.textContent = 'HEAVY';
        } else if (systemState.domNodeCount > 10000) {
            systemState.renderStatus = 'critical';
            badge.className = 'status-badge status-error';
            badge.textContent = 'CRITICAL';
        } else {
            systemState.renderStatus = 'healthy';
            badge.className = 'status-badge status-ok';
            badge.textContent = 'HEALTHY';
        }
    }

    /**
     * Format uptime display
     */
    function formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        const s = String(seconds % 60).padStart(2, '0');
        const m = String(minutes % 60).padStart(2, '0');
        const h = String(hours).padStart(2, '0');
        
        return `${h}:${m}:${s}`;
    }

    /**
     * Inject CSS styles
     */
    function injectStyles() {
        if (document.getElementById('system-state-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'system-state-styles';
        styles.textContent = `
            /* System Status Indicator */
            .system-status-indicator {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                background: rgba(0, 255, 136, 0.1);
                border: 1px solid rgba(0, 255, 136, 0.3);
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                font-size: 11px;
                color: #00ff88;
                cursor: pointer;
                transition: all 0.2s ease;
                user-select: none;
                vertical-align: middle;
            }

            .system-status-indicator:hover {
                background: rgba(0, 255, 136, 0.2);
                border-color: #00ff88;
                transform: translateY(-1px);
            }

            .system-status-indicator.active {
                background: rgba(0, 255, 136, 0.25);
                border-color: #00ff88;
            }

            .status-dot {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: #00ff88;
                animation: pulse 2s ease-in-out infinite;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }

            .status-text {
                text-transform: uppercase;
                letter-spacing: 0.5px;
                font-weight: 600;
            }

            /* System Status Indicator in Footer */
            .system-status-indicator.in-footer {
                font-size: 12px;
                padding: 4px 8px;
                margin: 0;
            }

            /* System Status Indicator in Form */
            .system-status-indicator.in-form {
                margin: 0 0 20px 0;
                width: 100%;
                justify-content: center;
                padding: 12px;
                font-size: 12px;
            }

            .system-status-indicator.in-form .status-text {
                display: inline;
            }

            /* System State Panel */
            .system-state-panel {
                position: fixed;
                top: 80px;
                right: 20px;
                width: 420px;
                max-width: calc(100vw - 40px);
                background: linear-gradient(135deg, #0a0e1a 0%, #1a1a2e 100%);
                border: 1px solid rgba(0, 255, 136, 0.3);
                border-radius: 8px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8),
                            0 0 0 1px rgba(0, 255, 136, 0.1);
                z-index: 9999;
                font-family: 'Courier New', monospace;
                opacity: 0;
                transform: translateY(-20px) scale(0.95);
                pointer-events: none;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .system-state-panel.visible {
                opacity: 1;
                transform: translateY(0) scale(1);
                pointer-events: auto;
            }

            /* Panel Header */
            .panel-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 16px;
                background: rgba(0, 255, 136, 0.05);
                border-bottom: 1px solid rgba(0, 255, 136, 0.2);
            }

            .panel-title {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 12px;
                font-weight: 700;
                color: #00ff88;
                letter-spacing: 1px;
            }

            .title-icon {
                font-size: 14px;
            }

            .panel-close {
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.5);
                font-size: 24px;
                line-height: 1;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: color 0.2s ease;
            }

            .panel-close:hover {
                color: #ff4444;
            }

            /* Panel Body */
            .panel-body {
                padding: 16px;
                max-height: calc(100vh - 200px);
                overflow-y: auto;
            }

            .state-section {
                margin-bottom: 16px;
                padding-bottom: 16px;
                border-bottom: 1px solid rgba(0, 255, 136, 0.1);
            }

            .state-section:last-child {
                margin-bottom: 0;
                padding-bottom: 0;
                border-bottom: none;
            }

            .state-section.philosophy {
                border-top: 2px solid rgba(0, 255, 136, 0.2);
                padding-top: 16px;
                margin-top: 8px;
            }

            .state-label {
                font-size: 10px;
                color: rgba(255, 255, 255, 0.5);
                letter-spacing: 1px;
                margin-bottom: 6px;
                font-weight: 600;
            }

            .state-value {
                font-size: 13px;
                color: #ffffff;
                line-height: 1.6;
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                gap: 8px;
            }

            .state-detail {
                font-size: 11px;
                color: rgba(255, 255, 255, 0.6);
            }

            /* Status Badges */
            .status-badge {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 3px;
                font-size: 10px;
                font-weight: 700;
                letter-spacing: 0.5px;
            }

            .status-badge.status-ok {
                background: rgba(0, 255, 136, 0.2);
                color: #00ff88;
                border: 1px solid rgba(0, 255, 136, 0.4);
            }

            .status-badge.status-warning {
                background: rgba(255, 170, 0, 0.2);
                color: #ffaa00;
                border: 1px solid rgba(255, 170, 0, 0.4);
            }

            .status-badge.status-error {
                background: rgba(255, 68, 68, 0.2);
                color: #ff4444;
                border: 1px solid rgba(255, 68, 68, 0.4);
            }

            /* Philosophy Section */
            .philosophy-text {
                font-style: italic;
                color: rgba(0, 255, 136, 0.8);
                font-size: 12px;
                line-height: 1.6;
            }

            /* Panel Footer */
            .panel-footer {
                padding: 10px 16px;
                background: rgba(0, 0, 0, 0.3);
                border-top: 1px solid rgba(0, 255, 136, 0.1);
                text-align: center;
            }

            .footer-text {
                font-size: 10px;
                color: rgba(255, 255, 255, 0.4);
                letter-spacing: 0.5px;
            }

            /* Mobile Responsive */
            @media (max-width: 768px) {
                .system-status-indicator.in-footer {
                    padding: 4px 8px;
                    font-size: 10px;
                }

                .system-status-indicator.in-footer .status-text {
                    display: none;
                }

                .system-state-panel {
                    top: 70px;
                    right: 10px;
                    left: 10px;
                    width: auto;
                    max-width: none;
                }

                .panel-body {
                    max-height: calc(100vh - 180px);
                }
            }

            /* Reduced Motion */
            @media (prefers-reduced-motion: reduce) {
                .system-status-indicator,
                .system-state-panel {
                    transition: none;
                }

                .status-dot {
                    animation: none;
                }
            }

            /* Focus Styles */
            .system-status-indicator:focus-visible,
            .panel-close:focus-visible {
                outline: 2px solid #00ff88;
                outline-offset: 2px;
            }

            /* Scrollbar Styling */
            .panel-body::-webkit-scrollbar {
                width: 6px;
            }

            .panel-body::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.2);
            }

            .panel-body::-webkit-scrollbar-thumb {
                background: rgba(0, 255, 136, 0.3);
                border-radius: 3px;
            }

            .panel-body::-webkit-scrollbar-thumb:hover {
                background: rgba(0, 255, 136, 0.5);
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

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (systemState.updateInterval) {
            clearInterval(systemState.updateInterval);
        }
    });

})();
