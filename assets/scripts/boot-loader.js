/**
 * C-Matrix Loading Screen
 * Premium professional matrix animation with CS/security terminology
 * Guaranteed exit with multiple fallback mechanisms
 */

(function() {
    'use strict';

    // Configuration
    const STORAGE_KEY = 'matrixLoaderShown';
    const TOTAL_DURATION = 2500; // 2.5 seconds
    const MAX_DURATION = 3000; // Hard timeout failsafe
    const SKIP_BUTTON_DELAY = 2000; // Show skip button after 2 seconds
    const FADE_OUT_DURATION = 600; // Fade out transition duration
    
    // CS/Security terms for matrix animation (cybersecurity focused)
    const MATRIX_TERMS = [
        'AUTH', 'NODE', 'TCP', 'ENCRYPT', 'FIREWALL', 'HASH', 'API', 'ROOT',
        'SSH', 'TLS', 'SSL', 'PORT', 'DNS', 'HTTPS', 'TOKEN', 'KEY',
        'CERT', 'VPN', 'PROXY', 'SYNC', 'PING', 'ACK', 'SYN', 'FIN'
    ];
    
    // Status messages
    const STATUS_MESSAGES = [
        { progress: 0, text: 'Initializing systems…' },
        { progress: 25, text: 'Loading core modules…' },
        { progress: 50, text: 'Verifying security layers…' },
        { progress: 75, text: 'Establishing connection…' }
    ];
    
    // Matrix animation configuration (refined for subtle background)
    const MATRIX_CONFIG = {
        columnCount: 40,
        minSpeed: 15,  // Slower
        maxSpeed: 35,  // Slower
        minOpacity: 0.12,  // Lower
        maxOpacity: 0.25,  // Lower max opacity
        minFontSize: 11,
        maxFontSize: 16,
        tailLength: 10
    };

    // State management
    let isLoaderExiting = false;
    let matrixAnimationId = null;
    let progressAnimationId = null;
    let skipButtonTimeout = null;
    let hardTimeoutId = null;
    let typingTimeout = null;
    let currentTypingIndex = 0;
    let isCurrentlyTyping = false;
    let lastTypedMessage = '';

    // Check if user has visited before (session-based)
    function hasVisitedBefore() {
        try {
            // Migration: Check old key and migrate to new key
            const oldKey = sessionStorage.getItem('azhar_portfolio_visited');
            const newKey = sessionStorage.getItem(STORAGE_KEY);
            
            if (oldKey && !newKey) {
                sessionStorage.setItem(STORAGE_KEY, 'true');
                // Clean up old key
                sessionStorage.removeItem('azhar_portfolio_visited');
            }
            
            return sessionStorage.getItem(STORAGE_KEY) === 'true';
        } catch (e) {
            return false;
        }
    }

    // Mark site as visited
    function markAsVisited() {
        try {
            sessionStorage.setItem(STORAGE_KEY, 'true');
        } catch (e) {
            console.warn('sessionStorage not available');
        }
    }

    // Matrix Column class
    class MatrixColumn {
        constructor(canvas, x) {
            this.canvas = canvas;
            this.x = x;
            this.y = -Math.random() * canvas.height;
            this.speed = MATRIX_CONFIG.minSpeed + Math.random() * (MATRIX_CONFIG.maxSpeed - MATRIX_CONFIG.minSpeed);
            this.opacity = MATRIX_CONFIG.minOpacity + Math.random() * (MATRIX_CONFIG.maxOpacity - MATRIX_CONFIG.minOpacity);
            this.fontSize = MATRIX_CONFIG.minFontSize + Math.random() * (MATRIX_CONFIG.maxFontSize - MATRIX_CONFIG.minFontSize);
            this.chars = this.generateChars();
        }
        
        generateChars() {
            const chars = [];
            for (let i = 0; i < MATRIX_CONFIG.tailLength; i++) {
                chars.push(MATRIX_TERMS[Math.floor(Math.random() * MATRIX_TERMS.length)]);
            }
            return chars;
        }
        
        update() {
            this.y += this.speed;
            if (this.y > this.canvas.height + this.fontSize * MATRIX_CONFIG.tailLength) {
                this.y = -this.fontSize * MATRIX_CONFIG.tailLength;
                this.chars = this.generateChars();
            }
        }
        
        draw(ctx) {
            ctx.font = `${this.fontSize}px "Courier New", Consolas, Monaco, monospace`;
            ctx.textAlign = 'center';
            
            this.chars.forEach((char, index) => {
                const charY = this.y + index * this.fontSize;
                const fadeOpacity = this.opacity * (1 - index / MATRIX_CONFIG.tailLength);
                ctx.fillStyle = `rgba(0, 234, 255, ${fadeOpacity})`;
                ctx.fillText(char, this.x, charY);
            });
        }
    }

    // Initialize matrix animation
    function initMatrixAnimation() {
        try {
            const canvas = document.getElementById('matrix-canvas');
            if (!canvas) return null;
            
            const ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            const columns = [];
            const columnWidth = canvas.width / MATRIX_CONFIG.columnCount;
            
            for (let i = 0; i < MATRIX_CONFIG.columnCount; i++) {
                const x = i * columnWidth + columnWidth / 2;
                columns.push(new MatrixColumn(canvas, x));
            }
            
            let stopped = false;
            
            function animate() {
                if (stopped) return;
                
                ctx.fillStyle = 'rgba(10, 15, 30, 0.15)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                columns.forEach(column => {
                    column.update();
                    column.draw(ctx);
                });
                
                matrixAnimationId = requestAnimationFrame(animate);
            }
            
            animate();
            
            const handleResize = () => {
                if (!stopped) {
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                }
            };
            window.addEventListener('resize', handleResize);
            
            return {
                stop: () => {
                    stopped = true;
                    if (matrixAnimationId) {
                        cancelAnimationFrame(matrixAnimationId);
                        matrixAnimationId = null;
                    }
                    window.removeEventListener('resize', handleResize);
                }
            };
        } catch (e) {
            console.error('Matrix animation error:', e);
            return null;
        }
    }

    // Type text with animation
    function typeText(text, element, callback) {
        if (!element || !text) return;
        
        // Clear any existing typing timeout
        if (typingTimeout) {
            clearTimeout(typingTimeout);
            typingTimeout = null;
        }
        
        // Mark as typing
        isCurrentlyTyping = true;
        element.textContent = '';
        currentTypingIndex = 0;
        
        function typeChar() {
            if (currentTypingIndex < text.length && !isLoaderExiting) {
                element.textContent += text.charAt(currentTypingIndex);
                currentTypingIndex++;
                const delay = 80 + Math.random() * 40; // 80-120ms per character
                typingTimeout = setTimeout(typeChar, delay);
            } else {
                isCurrentlyTyping = false;
                if (callback) callback();
            }
        }
        
        typeChar();
    }

    // Update status text with typing effect
    function updateStatus(progress) {
        try {
            const statusText = document.querySelector('#status-text');
            const cursor = document.querySelector('#typing-cursor');
            
            if (!statusText) return;
            
            // Find the message for current progress
            let message = STATUS_MESSAGES[0].text;
            for (let i = STATUS_MESSAGES.length - 1; i >= 0; i--) {
                if (progress >= STATUS_MESSAGES[i].progress) {
                    message = STATUS_MESSAGES[i].text;
                    break;
                }
            }
            
            // Only type if message changed AND not currently typing
            if (message !== lastTypedMessage && !isCurrentlyTyping && !isLoaderExiting) {
                lastTypedMessage = message;
                
                // Show cursor during typing
                if (cursor) cursor.style.display = 'inline-block';
                
                typeText(message, statusText, () => {
                    // Hide cursor after typing
                    if (cursor) {
                        setTimeout(() => {
                            if (cursor) cursor.style.display = 'none';
                        }, 500);
                    }
                });
            }
        } catch (e) {
            console.error('Status update error:', e);
        }
    }
    
    // Show ACCESS GRANTED message
    function showAccessGranted(callback) {
        try {
            const terminalLine = document.querySelector('.terminal-line');
            const statusText = document.querySelector('#status-text');
            const cursor = document.querySelector('#typing-cursor');
            
            if (terminalLine && statusText) {
                terminalLine.classList.add('access-granted');
                if (cursor) cursor.style.display = 'inline-block';
                
                // Clear previous message and typing state
                lastTypedMessage = 'ACCESS GRANTED';
                
                typeText('ACCESS GRANTED', statusText, () => {
                    if (cursor) cursor.style.display = 'none';
                    if (callback) {
                        setTimeout(callback, 300);
                    }
                });
            } else {
                if (callback) callback();
            }
        } catch (e) {
            console.error('Access granted error:', e);
            if (callback) callback();
        }
    }

    // Clean up all timers and animations
    function cleanupAnimations() {
        if (matrixAnimationId) {
            cancelAnimationFrame(matrixAnimationId);
            matrixAnimationId = null;
        }
        if (progressAnimationId) {
            cancelAnimationFrame(progressAnimationId);
            progressAnimationId = null;
        }
        if (skipButtonTimeout) {
            clearTimeout(skipButtonTimeout);
            skipButtonTimeout = null;
        }
        if (hardTimeoutId) {
            clearTimeout(hardTimeoutId);
            hardTimeoutId = null;
        }
        if (typingTimeout) {
            clearTimeout(typingTimeout);
            typingTimeout = null;
        }
        isCurrentlyTyping = false;
    }

    // Restore page interactivity
    function restorePageState() {
        try {
            // Restore body scroll
            document.body.style.overflow = '';
            document.body.style.position = '';
            
            // Remove aria-busy
            document.body.removeAttribute('aria-busy');
            
            // Return focus to main content
            const mainContent = document.querySelector('main') || document.querySelector('#home');
            if (mainContent) {
                mainContent.focus({ preventScroll: true });
            }
        } catch (e) {
            console.error('Restore page state error:', e);
        }
    }

    // Hide loader with guaranteed exit
    function hideLoader(matrixAnimation, showAccessGrantedMsg = true) {
        // Prevent multiple calls
        if (isLoaderExiting) return;
        isLoaderExiting = true;
        
        try {
            const loader = document.querySelector('.boot-loader');
            
            // Show ACCESS GRANTED if at 100% completion
            if (showAccessGrantedMsg && loader) {
                showAccessGranted(() => {
                    proceedWithExit(loader, matrixAnimation);
                });
            } else {
                proceedWithExit(loader, matrixAnimation);
            }
        } catch (e) {
            console.error('Hide loader error:', e);
            emergencyCleanup();
        }
    }
    
    // Proceed with loader exit
    function proceedWithExit(loader, matrixAnimation) {
        try {
            // Mark as visited IMMEDIATELY
            markAsVisited();
            
            // Clean up all animations and timers
            cleanupAnimations();
            
            // Stop matrix animation
            if (matrixAnimation && matrixAnimation.stop) {
                matrixAnimation.stop();
            }
            
            const skipBtn = document.querySelector('.skip-loader-btn');
            
            if (loader) {
                // Add glow effect briefly before exit
                loader.classList.add('exiting');
                
                // Disable pointer events immediately
                loader.style.pointerEvents = 'none';
                
                // Add hidden class for fade out
                setTimeout(() => {
                    loader.classList.add('hidden');
                }, 100);
                
                // Remove from DOM after fade
                setTimeout(() => {
                    try {
                        if (loader && loader.parentNode) {
                            loader.remove();
                        }
                        if (skipBtn && skipBtn.parentNode) {
                            skipBtn.remove();
                        }
                        restorePageState();
                    } catch (e) {
                        console.error('Loader removal error:', e);
                    }
                }, FADE_OUT_DURATION + 100);
            } else {
                // Loader already gone, just restore state
                restorePageState();
            }
        } catch (e) {
            console.error('Exit procedure error:', e);
            emergencyCleanup();
        }
    }
    
    // Emergency cleanup function
    function emergencyCleanup() {
        const loader = document.querySelector('.boot-loader');
        const skipBtn = document.querySelector('.skip-loader-btn');
        if (loader) loader.remove();
        if (skipBtn) skipBtn.remove();
        restorePageState();
    }

    // Animate progress bar
    function animateProgress(duration, onComplete, matrixAnimation) {
        const progressFill = document.querySelector('.progress-fill');
        const progressBar = document.querySelector('.progress-bar');
        const progressPercentage = document.querySelector('#progress-percentage');
        
        if (!progressFill || !progressBar) {
            if (onComplete) onComplete();
            return;
        }
        
        const startTime = Date.now();
        let completed = false;
        let wasPulsing = false;
        
        function updateProgress() {
            if (completed || isLoaderExiting) return;
            
            try {
                const elapsed = Date.now() - startTime;
                const progress = Math.min((elapsed / duration) * 100, 100);
                
                progressFill.style.width = progress + '%';
                progressBar.setAttribute('aria-valuenow', Math.floor(progress));
                
                // Update percentage display
                if (progressPercentage) {
                    progressPercentage.textContent = Math.floor(progress) + '%';
                }
                
                // Add pulse effect at 80%
                if (progress >= 80 && !wasPulsing) {
                    progressFill.classList.add('pulsing');
                    wasPulsing = true;
                }
                
                updateStatus(progress);
                
                if (progress >= 100) {
                    completed = true;
                    if (onComplete) {
                        setTimeout(() => onComplete(matrixAnimation, true), 100);
                    }
                } else {
                    progressAnimationId = requestAnimationFrame(updateProgress);
                }
            } catch (e) {
                console.error('Progress animation error:', e);
                if (onComplete) onComplete(matrixAnimation, false);
            }
        }
        
        updateProgress();
    }

    // Show skip button
    function showSkipButton() {
        if (isLoaderExiting) return;
        
        try {
            const skipBtn = document.querySelector('.skip-loader-btn');
            if (skipBtn) {
                skipBtn.style.display = 'block';
                skipBtn.disabled = true;
                skipBtn.setAttribute('aria-label', 'Skip loading animation (available in 2 seconds)');
                
                // Enable after delay for better UX
                skipButtonTimeout = setTimeout(() => {
                    skipBtn.disabled = false;
                    skipBtn.setAttribute('aria-label', 'Skip loading animation');
                }, SKIP_BUTTON_DELAY);
            }
        } catch (e) {
            console.error('Skip button error:', e);
        }
    }

    // Initialize loader
    function initLoader() {
        try {
            const loader = document.querySelector('.boot-loader');
            if (!loader) return;

            // Ensure a skip button exists on all pages (injected if missing)
            (function ensureSkipButton() {
                let skipBtn = document.getElementById('skip-loader-btn') || document.querySelector('.skip-loader-btn');
                if (!skipBtn) {
                    skipBtn = document.createElement('button');
                    skipBtn.id = 'skip-loader-btn';
                    skipBtn.className = 'skip-loader-btn';
                    skipBtn.type = 'button';
                    skipBtn.setAttribute('aria-label', 'Skip loading animation (available in 2 seconds)');
                    skipBtn.setAttribute('tabindex', '0');
                    skipBtn.innerHTML = 'Skip <i class="fas fa-forward" aria-hidden="true"></i>';
                    // Insert near the end of body to avoid stacking issues
                    document.body.appendChild(skipBtn);
                }
            })();
            
            // Set aria-busy on body
            document.body.setAttribute('aria-busy', 'true');
            
            // Prevent scroll
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            
            // Check if user prefers reduced motion
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            
            let matrixAnimation = null;
            
            // Initialize matrix animation if motion is allowed
            if (!prefersReducedMotion) {
                matrixAnimation = initMatrixAnimation();
            }
            
            // Setup skip button
            const skipBtn = document.querySelector('.skip-loader-btn');
            if (skipBtn) {
                const handleSkip = () => hideLoader(matrixAnimation, false); // No ACCESS GRANTED on skip
                
                skipBtn.addEventListener('click', handleSkip);
                skipBtn.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSkip();
                    }
                });
                
                // Show skip button after delay
                skipButtonTimeout = setTimeout(showSkipButton, SKIP_BUTTON_DELAY);
            }
            
            // CRITICAL: Hard timeout failsafe - ALWAYS exit after MAX_DURATION
            hardTimeoutId = setTimeout(() => {
                if (!isLoaderExiting) {
                    console.warn('Loader hard timeout triggered');
                    hideLoader(matrixAnimation);
                }
            }, MAX_DURATION);
            
            // Start progress animation
            animateProgress(TOTAL_DURATION, hideLoader, matrixAnimation);
            
        } catch (e) {
            console.error('Loader initialization error:', e);
            // Emergency exit
            const loader = document.querySelector('.boot-loader');
            const skipBtn = document.querySelector('.skip-loader-btn');
            if (loader) loader.remove();
            if (skipBtn) skipBtn.remove();
            restorePageState();
        }
    }

    // Main initialization
    try {
        if (hasVisitedBefore()) {
            // Skip loader if already visited in this session
            const loader = document.querySelector('.boot-loader');
            const skipBtn = document.querySelector('.skip-loader-btn');
            if (loader) loader.remove();
            if (skipBtn) skipBtn.remove();
        } else {
            // Show loader
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initLoader);
            } else {
                initLoader();
            }
        }
    } catch (e) {
        console.error('Boot loader fatal error:', e);
        // Emergency cleanup
        const loader = document.querySelector('.boot-loader');
        const skipBtn = document.querySelector('.skip-loader-btn');
        if (loader) loader.remove();
        if (skipBtn) skipBtn.remove();
        restorePageState();
    }

})();
