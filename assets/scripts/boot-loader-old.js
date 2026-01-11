/**
 * C-Matrix Loading Screen
 * Premium professional matrix animation with CS/security terminology
 * 2.5 second duration with smooth status updates
 */

(function() {
    'use strict';

    // Configuration
    const STORAGE_KEY = 'azhar_portfolio_visited';
    const TOTAL_DURATION = 2500; // 2.5 seconds
    const SKIP_BUTTON_DELAY = 2000; // Show skip button after 2 seconds
    
    // CS/Security terms for matrix animation
    const MATRIX_TERMS = [
        'C', 'C++', 'Java', 'Python', 'Kernel', 'Memory', 'Threads',
        'Stack', 'Heap', 'Compiler', 'Encryption', 'Firewall', 'Hash',
        'Auth', 'Access', 'Secure', 'Process', 'System', 'Logic',
        'Binary', 'Root', 'Port', 'Packet', 'Signal'
    ];
    
    // Status messages
    const STATUS_MESSAGES = [
        { progress: 0, text: 'Initializing systems…' },
        { progress: 25, text: 'Loading core modules…' },
        { progress: 50, text: 'Verifying security layers…' },
        { progress: 75, text: 'System ready' }
    ];
    
    // Matrix animation configuration
    const MATRIX_CONFIG = {
        columnCount: 40, // Number of falling columns
        minSpeed: 20, // Pixels per frame (slow)
        maxSpeed: 50, // Pixels per frame (fast)
        minOpacity: 0.15,
        maxOpacity: 0.35,
        minFontSize: 12,
        maxFontSize: 18,
        tailLength: 10 // How many characters in each falling tail
    };

    // Check if user has visited before (session-based)
    function hasVisitedBefore() {
        try {
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
            this.y = -Math.random() * canvas.height; // Start above screen
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
            
            // Reset when column goes off screen
            if (this.y > this.canvas.height + this.fontSize * MATRIX_CONFIG.tailLength) {
                this.y = -this.fontSize * MATRIX_CONFIG.tailLength;
                this.chars = this.generateChars();
            }
        }
        
        draw(ctx) {
            ctx.font = `${this.fontSize}px "Courier New", Consolas, Monaco, monospace`;
            ctx.textAlign = 'center';
            
            // Draw each character in the tail with decreasing opacity
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
        const canvas = document.getElementById('matrix-canvas');
        if (!canvas) return null;
        
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Create columns
        const columns = [];
        const columnWidth = canvas.width / MATRIX_CONFIG.columnCount;
        
        for (let i = 0; i < MATRIX_CONFIG.columnCount; i++) {
            const x = i * columnWidth + columnWidth / 2;
            columns.push(new MatrixColumn(canvas, x));
        }
        
        // Animation loop
        let animationId;
        function animate() {
            // Clear canvas with slight fade for trail effect
            ctx.fillStyle = 'rgba(10, 15, 30, 0.15)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Update and draw all columns
            columns.forEach(column => {
                column.update();
                column.draw(ctx);
            });
            
            animationId = requestAnimationFrame(animate);
        }
        
        animate();
        
        // Handle window resize
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);
        
        return {
            stop: () => {
                cancelAnimationFrame(animationId);
                window.removeEventListener('resize', handleResize);
            }
        };
    }

    // Update status text
    function updateStatus(progress) {
        const statusText = document.querySelector('.status-text');
        if (!statusText) return;
        
        // Find appropriate status message
        let message = STATUS_MESSAGES[0].text;
        for (let i = STATUS_MESSAGES.length - 1; i >= 0; i--) {
            if (progress >= STATUS_MESSAGES[i].progress) {
                message = STATUS_MESSAGES[i].text;
                break;
            }
        }
        
        if (statusText.textContent !== message) {
            statusText.textContent = message;
        }
    }

    // Animate progress bar
    function animateProgress(duration, onComplete) {
        const progressFill = document.querySelector('.progress-fill');
        const progressBar = document.querySelector('.progress-bar');
        
        if (!progressFill || !progressBar) {
            if (onComplete) onComplete();
            return;
        }
        
        const startTime = Date.now();
        
        function updateProgress() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min((elapsed / duration) * 100, 100);
            
            progressFill.style.width = progress + '%';
            progressBar.setAttribute('aria-valuenow', Math.floor(progress));
            
            updateStatus(progress);
            
            if (progress < 100) {
                requestAnimationFrame(updateProgress);
            } else {
                if (onComplete) onComplete();
            }
        }
        
        updateProgress();
    }

    // Hide loader
    function hideLoader(matrixAnimation) {
        const loader = document.querySelector('.boot-loader');
        if (!loader) return;
        
        loader.classList.add('hidden');
        
        // Stop matrix animation
        if (matrixAnimation) {
            matrixAnimation.stop();
        }
        
        // Mark as visited
        markAsVisited();
        
        // Remove from DOM after transition
        setTimeout(() => {
            if (loader.parentNode) {
                loader.parentNode.removeChild(loader);
            }
        }, 600);
    }

    // Show skip button
    function showSkipButton() {
        const skipBtn = document.querySelector('.skip-loader-btn');
        if (skipBtn) {
            skipBtn.style.display = 'block';
        }
    }

    // Initialize loader
    function initLoader() {
        const loader = document.querySelector('.boot-loader');
        if (!loader) return;
        
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
            const handleSkip = () => {
                hideLoader(matrixAnimation);
            };
            
            skipBtn.addEventListener('click', handleSkip);
            skipBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSkip();
                }
            });
            
            // Show skip button after delay
            setTimeout(showSkipButton, SKIP_BUTTON_DELAY);
        }
        
        // Start progress animation
        animateProgress(TOTAL_DURATION, () => {
            // Auto-hide after completion
            setTimeout(() => {
                hideLoader(matrixAnimation);
            }, 300);
        });
    }

    // Main initialization
    if (hasVisitedBefore()) {
        // Skip loader if already visited in this session
        const loader = document.querySelector('.boot-loader');
        if (loader) {
            loader.classList.add('hidden');
            setTimeout(() => {
                if (loader.parentNode) {
                    loader.parentNode.removeChild(loader);
                }
            }, 100);
        }
    } else {
        // Show loader
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initLoader);
        } else {
            initLoader();
        }
    }

})();

    }

    // Initialize boot loader
    function initBootLoader() {
        // Check if user has visited before in this session
        if (hasVisitedBefore()) {
            const loader = document.getElementById('boot-loader');
            const skipBtn = document.getElementById('skip-loader-btn');
            if (loader) loader.remove();
            if (skipBtn) skipBtn.remove();
            return;
        }

        // Show loader for first-time visitors
        const loader = document.getElementById('boot-loader');
        const skipBtn = document.getElementById('skip-loader-btn');
        if (!loader) return;

        const lines = Array.from(loader.querySelectorAll('.boot-line'));
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Prevent scroll while loader is visible
        document.body.classList.add('loader-active');
        document.body.style.overflow = 'hidden';

        function hideLoader() {
            loader.classList.add('hidden');
            if (skipBtn) skipBtn.style.display = 'none';
            setTimeout(() => {
                loader.remove();
                if (skipBtn) skipBtn.remove();
                document.body.classList.remove('loader-active');
                document.body.style.overflow = '';
            }, FADE_OUT_DURATION);
            markAsVisited();
        }

        // Show skip button after 3 seconds
        if (skipBtn) {
            setTimeout(() => {
                if (loader && !loader.classList.contains('hidden')) {
                    skipBtn.style.display = 'block';
                }
            }, 3000);
            
            // Skip button click handler
            skipBtn.addEventListener('click', hideLoader);
        }

        if (prefersReducedMotion) {
            // Reduced motion: show all lines immediately, quick exit
            showAllLines(lines);
            setTimeout(hideLoader, 800); // Faster exit for reduced motion (was 1200ms)
        } else {
            // Normal: slow typewriter animation with sync'd progress
            const totalDuration = calculateTotalDuration(lines);
            animateLines(lines, totalDuration, hideLoader);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBootLoader);
    } else {
        initBootLoader();
    }
})();
