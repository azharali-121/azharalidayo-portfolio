/* Header Animations Initializer 
   Ensures animations are GPU-accelerated and performance optimized */

document.addEventListener('DOMContentLoaded', () => {
    // Get all animated header elements
    const animatedElements = document.querySelectorAll('.header-name-animate');
    
    // Apply performance optimizations
    animatedElements.forEach(el => {
        // Force GPU acceleration
        el.style.transform = 'translateZ(0)';
        el.style.backfaceVisibility = 'hidden';
        
        // Ensure GPU acceleration is applied to pseudo-elements
        const style = document.createElement('style');
        const className = `header-name-optimize-${Math.floor(Math.random() * 10000)}`;
        el.classList.add(className);
        
        style.textContent = `
            .${className}::before,
            .${className}::after {
                transform: translateZ(0);
                backface-visibility: hidden;
                will-change: transform, opacity;
            }
        `;
        
        document.head.appendChild(style);
    });
    
    // Check device capability
    function isLowEndDevice() {
        return (
            (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) || 
            (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
        );
    }
    
    // Apply simpler animations for low-end devices
    if (isLowEndDevice()) {
        animatedElements.forEach(el => {
            el.classList.remove('header-name-animate');
            el.classList.add('header-name-simple');
        });
        document.body.classList.add('reduce-animations');
    }
    
    // Check battery status for further optimizations
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            if (battery.level < 0.15 && !battery.charging) {
                animatedElements.forEach(el => {
                    el.classList.remove('header-name-animate');
                    el.classList.add('header-name-simple');
                });
                document.body.classList.add('reduce-animations');
            }
        });
    }
});