/* Performance Optimizations and Monitoring - Updated Oct 18, 2025 */

// Smart console for development-only logging
const isDevelopment = location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.hostname === '';

// Performance monitoring for the site
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            navigationStart: 0,
            domLoaded: 0,
            windowLoaded: 0,
            firstContentfulPaint: 0,
            largestContentfulPaint: 0
        };
        
        this.init();
    }
    
    init() {
        // Record navigation start time
        if (window.performance && window.performance.timing) {
            this.metrics.navigationStart = window.performance.timing.navigationStart;
        }
        
        // DOM Content Loaded
        document.addEventListener('DOMContentLoaded', () => {
            this.metrics.domLoaded = Date.now();
            this.initOptimizations();
        });
        
        // Window Loaded
        window.addEventListener('load', () => {
            this.metrics.windowLoaded = Date.now();
            this.logMetrics();
        });
        
        // First Contentful Paint & Largest Contentful Paint
        if (window.performance && window.performance.getEntriesByType) {
            const paintObserver = new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    if (entry.name === 'first-contentful-paint') {
                        this.metrics.firstContentfulPaint = entry.startTime;
                        // Production: Performance logging disabled
                    }
                }
            });
            
            paintObserver.observe({ type: 'paint', buffered: true });
            
            const lcpObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.largestContentfulPaint = lastEntry.startTime;
                // Production: Performance logging disabled
            });
            
            lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        }
    }
    
    logMetrics() {
        const navToDOM = this.metrics.domLoaded - this.metrics.navigationStart;
        const navToLoad = this.metrics.windowLoaded - this.metrics.navigationStart;
        
        // Production: Performance metrics logged to analytics only
        
        // Send metrics to analytics if available
        if (window.gtag) {
            gtag('event', 'performance_metrics', {
                'dom_loaded': navToDOM,
                'window_loaded': navToLoad,
                'first_contentful_paint': this.metrics.firstContentfulPaint,
                'largest_contentful_paint': this.metrics.largestContentfulPaint
            });
        }
    }
    
    initOptimizations() {
        // Initialize all performance optimizations
        this.setupLazyLoading();
        this.addResourceHints();
        this.setupAdaptiveRendering();
    }
    
    setupLazyLoading() {
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        
                        // If there's a data-src attribute, use it
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '100px', // Start loading before the image is in viewport
                threshold: 0.1
            });
            
            lazyImages.forEach(img => {
                // Add placeholder class for styling
                const parent = img.parentElement;
                if (parent.classList.contains('project-image') || parent.classList.contains('profile-card')) {
                    parent.classList.add('image-placeholder');
                    img.addEventListener('load', () => {
                        parent.classList.remove('image-placeholder');
                    });
                }
                
                imageObserver.observe(img);
            });
        } else {
            // Fallback for browsers without IntersectionObserver
            lazyImages.forEach(img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
            });
        }
    }
    
    addResourceHints() {
        // DNS prefetch for external domains
        const domains = [
            'fonts.googleapis.com',
            'fonts.gstatic.com',
            'cdnjs.cloudflare.com'
        ];
        
        domains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = `//${domain}`;
            document.head.appendChild(link);
        });
        
        // Preload critical resources
        const criticalResources = [
            { href: 'images/logo.jpg', as: 'image' },
            { href: 'css/base/variables.css', as: 'style' },
            { href: 'css/components/vanta-background.css', as: 'style' }
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            document.head.appendChild(link);
        });
    }
    
    setupAdaptiveRendering() {
        // Check for device capabilities
        this.checkDeviceCapabilities();
        
        // Check network conditions
        this.checkNetworkConditions();
        
        // Check battery status
        this.checkBatteryStatus();
    }
    
    isLowEndDevice() {
        return (
            (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) || 
            (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
        );
    }
    
    checkDeviceCapabilities() {
        if (this.isLowEndDevice()) {
            this.optimizeForLowEndDevice();
        }
    }
    
    optimizeForLowEndDevice() {
        // Use simpler background
        this.useSimplifiedBackground();
        
        // Disable some animations
        document.body.classList.add('reduce-animations');
        
        // Simplify header name animations
        this.simplifyHeaderAnimations();
    }
    
    simplifyHeaderAnimations() {
        // Reduce animation complexity for header name
        const nameAnimElements = document.querySelectorAll('.header-name-animate');
        nameAnimElements.forEach(el => {
            // Slower animations that are less intensive
            el.style.animationDuration = '8s';
            
            // Remove the more complex animation effects
            if (el.classList.contains('header-name-animate')) {
                // Still keep basic glow but remove animated lines
                el.classList.remove('header-name-animate');
                el.classList.add('header-name-simple');
            }
        });
    }
    
    useSimplifiedBackground() {
        if (typeof VANTA !== 'undefined') {
            if (window.vantaEffect) {
                window.vantaEffect.destroy();
            }
            
            // Use simpler DOTS effect instead of CUBES for low-end devices
            if (VANTA.DOTS) {
                window.vantaEffect = VANTA.DOTS({
                    el: "#vanta-bg",
                    mouseControls: false,
                    touchControls: false,
                    gyroControls: false,
                    minHeight: 200.00,
                    minWidth: 200.00,
                    scale: 1.00,
                    scaleMobile: 0.75,
                    color: 0x00eaff,
                    backgroundColor: 0x0a0f1f,
                    size: 3.80,
                    spacing: 33.00,
                    showLines: false
                });
            }
        }
    }
    
    checkNetworkConditions() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            
            // If on slow connection, optimize accordingly
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                this.optimizeForSlowConnection();
            }
            
            // Listen for changes in network conditions
            connection.addEventListener('change', () => {
                if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                    this.optimizeForSlowConnection();
                }
            });
        }
    }
    
    optimizeForSlowConnection() {
        // Use simplified background
        this.useSimplifiedBackground();
        
        // Downgrade image quality
        document.querySelectorAll('img').forEach(img => {
            // Add low quality version for slow connections
            // This would require having low-quality versions of images on server
            // Production: Network logging disabled
        });
    }
    
    checkBatteryStatus() {
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                // If battery is low, optimize for battery life
                if (battery.level < 0.2 && !battery.charging) {
                    this.optimizeForBattery();
                }
                
                // Listen for changes in battery status
                battery.addEventListener('levelchange', () => {
                    if (battery.level < 0.2 && !battery.charging) {
                        this.optimizeForBattery();
                    }
                });
            });
        }
    }
    
    optimizeForBattery() {
        // Use simplified background to save battery
        this.useSimplifiedBackground();
        
        // Reduce animation frequency
        document.body.classList.add('reduce-animations');
    }
}

// Initialize performance monitoring and optimizations
const performanceOptimizer = new PerformanceMonitor();