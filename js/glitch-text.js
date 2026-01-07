/**
 * Glitch Text Effect for Hero Name
 * High-performance scramble animation with no layout shifts
 */

class GlitchText {
    constructor(element, options = {}) {
        this.element = element;
        this.originalText = element.textContent;
        this.chars = '!<>-_\\/[]{}—=+*^?#________ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        
        // Configuration
        this.iterations = options.iterations || 15;
        this.speed = options.speed || 30; // milliseconds per frame
        this.isAnimating = false;
        
        // Store original width to prevent layout shifts
        this.fixWidth();
        
        // Initialize events
        this.init();
    }
    
    fixWidth() {
        // Force width to prevent layout shifts during animation
        const width = this.element.offsetWidth;
        this.element.style.display = 'inline-block';
        this.element.style.minWidth = `${width}px`;
    }
    
    init() {
        // Trigger on page load after a brief delay
        setTimeout(() => this.animate(), 500);
        
        // Trigger on hover
        this.element.addEventListener('mouseenter', () => {
            if (!this.isAnimating) {
                this.animate();
            }
        });
    }
    
    animate() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        let iteration = 0;
        
        const interval = setInterval(() => {
            // Generate glitched text
            this.element.textContent = this.originalText
                .split('')
                .map((char, index) => {
                    if (index < iteration) {
                        // Reveal original character
                        return this.originalText[index];
                    }
                    // Random character
                    return this.chars[Math.floor(Math.random() * this.chars.length)];
                })
                .join('');
            
            iteration += 1 / 3; // Slow reveal
            
            if (iteration >= this.originalText.length) {
                clearInterval(interval);
                this.element.textContent = this.originalText;
                this.isAnimating = false;
            }
        }, this.speed);
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const heroName = document.querySelector('.hero-name-glitch');
    if (heroName) {
        new GlitchText(heroName, {
            iterations: 15,
            speed: 30
        });
    }
});
