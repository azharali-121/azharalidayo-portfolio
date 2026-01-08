/**
 * Mobile-Optimized Particle Background
 * 
 * PERFORMANCE SAFEGUARDS:
 * - Disabled on screens < 768px (mobile devices) to reduce battery drain and improve performance
 * - Disabled when user enables "prefers-reduced-motion" for accessibility
 * - Desktop behavior (>= 768px) remains unchanged with full visual effects
 * 
 * Why these safeguards exist:
 * 1. Mobile devices have limited battery and GPU resources
 * 2. Vanta.js + Three.js animation is resource-intensive on smaller devices
 * 3. Respects user accessibility preferences for reduced motion
 */

(function() {
    'use strict';

    // Check if device is mobile or low-end
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSmallScreen = window.innerWidth < 768;
    
    // Check global config if available
    const config = window.PortfolioConfig || {};
    const particlesEnabled = config.particlesEnabled !== undefined ? 
                            config.particlesEnabled : 
                            (!isSmallScreen && !prefersReducedMotion);
    
    /**
     * Apply static gradient fallback when particles disabled
     */
    function applyStaticFallback() {
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            heroSection.style.background = 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1428 100%)';
            heroSection.classList.add('static-background');
        }
    }
    
    // SAFEGUARD: Don't initialize Vanta on mobile screens or if user prefers reduced motion
    if (!particlesEnabled || isSmallScreen || prefersReducedMotion) {
        applyStaticFallback();
        return;
    }

    /**
     * Initialize Vanta.js with mobile-optimized settings
     */
    function initializeParticles() {
        // Wait for Vanta and Three.js to load
        if (typeof VANTA === 'undefined' || typeof THREE === 'undefined') {
            // Vanta.js or Three.js not loaded
            return;
        }

        const heroSection = document.querySelector('.hero');
        if (!heroSection) {
            // Hero section not found - particles disabled
            return;
        }

        try {
            // Mobile settings: Lower particle count and simpler effect
            if (isMobile || isLowEnd) {
                VANTA.DOTS({
                    el: heroSection,
                    mouseControls: false, // Disable mouse interaction on mobile
                    touchControls: false, // Disable touch interaction for performance
                    gyroControls: false,
                    minHeight: 200.00,
                    minWidth: 200.00,
                    scale: 1.00,
                    scaleMobile: 0.5, // Reduce scale on mobile
                    color: 0x00eaff,
                    color2: 0x5effa1,
                    backgroundColor: 0x0a0f1f,
                    size: 3.0, // Smaller particles
                    spacing: 25.0, // More spacing = fewer particles
                    showLines: false // Disable lines for better performance
                });
                
                // Mobile-optimized particles initialized (DOTS)
            } else {
                // Desktop settings: Full effect
                VANTA.CUBES({
                    el: heroSection,
                    mouseControls: true,
                    touchControls: true,
                    gyroControls: false,
                    minHeight: 200.00,
                    minWidth: 200.00,
                    scale: 1.00,
                    scaleMobile: 1.00,
                    color: 0x00eaff,
                    backgroundColor: 0x0a0f1f,
                    size: 1.0,
                    spacing: 3.5
                });
                
                // Desktop particles initialized (CUBES)
            }
        } catch (error) {
            // Particle initialization error - silently fail
        }
    }

    // Initialize when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeParticles);
    } else {
        // DOM already loaded, wait for Vanta
        setTimeout(initializeParticles, 100);
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (window.vantaEffect) {
            window.vantaEffect.destroy();
        }
    });

    // SAFEGUARD: Destroy Vanta if window resized below 768px
    window.addEventListener('resize', () => {
        if (window.vantaEffect && window.innerWidth < 768) {
            // Vanta disabled: Window resized below 768px
            window.vantaEffect.destroy();
            window.vantaEffect = null;
        }
    });

    // Handle visibility change (pause when tab not visible)
    document.addEventListener('visibilitychange', () => {
        if (window.vantaEffect) {
            if (document.hidden) {
                // Pause rendering when tab hidden
                window.vantaEffect.pause && window.vantaEffect.pause();
            } else {
                // Resume when tab visible
                window.vantaEffect.play && window.vantaEffect.play();
            }
        }
    });
})();
