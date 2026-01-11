/**
 * ============================================================================
 * SKILL EXPLORER MINI-GAME SYSTEM
 * ============================================================================
 * 
 * Interactive animations triggered by clicking skill chips
 * 
 * Features:
 * - Confetti particle burst on every click
 * - Skill-specific animations (Python snake, JavaScript bounce, etc.)
 * - Canvas-based rendering for smooth performance
 * - Physics simulation (gravity, momentum, rotation)
 * - Fully responsive and accessible
 * 
 * HOW TO ADD NEW SKILL ANIMATIONS:
 * ============================================================================
 * 
 * 1. Add your skill to the skillAnimations object (line ~140):
 *    'Your Skill Name': this.yourSkillAnimation.bind(this),
 * 
 * 2. Define your animation function:
 *    yourSkillAnimation(centerX, centerY) {
 *        let progress = 0;
 *        const animate = () => {
 *            progress += 0.08;
 *            if (progress > 1) return;
 *            
 *            this.currentAnimation = {
 *                type: 'yourType',
 *                x: centerX,
 *                y: centerY,
 *                progress: progress
 *            };
 *        };
 *        
 *        const interval = setInterval(animate, 20);
 *        setTimeout(() => clearInterval(interval), 1500);
 *    }
 * 
 * 3. Add a drawing function in drawAnimation() switch statement:
 *    case 'yourType':
 *        this.drawYourType(this.currentAnimation);
 *        break;
 * 
 * 4. Implement drawYourType():
 *    drawYourType(anim) {
 *        this.ctx.save();
 *        this.ctx.translate(anim.x, anim.y);
 *        // Draw your animation here
 *        this.ctx.restore();
 *    }
 * 
 * ============================================================================
 */

class SkillAnimationSystem {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animationActive = false;
        this.currentAnimation = null;
        this.init();
    }

    /**
     * Initialize the animation system
     */
    init() {
        this.createCanvas();
        this.bindSkillChips();
        this.startAnimationLoop();
    }

    /**
     * Create full-screen canvas overlay for animations
     * Uses pointer-events: none so it doesn't interfere with page interactions
     */
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'skill-animation-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '5000';
        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d', { alpha: true });
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    /**
     * Resize canvas to match viewport
     */
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    /**
     * Attach click handlers to all skill chips
     */
    bindSkillChips() {
        const skillChips = document.querySelectorAll('.skill-chip');
        skillChips.forEach(chip => {
            chip.addEventListener('click', (e) => this.triggerAnimation(e, chip));
        });
    }

    /**
     * Trigger animation when a skill chip is clicked
     */
    triggerAnimation(event, chip) {
        if (this.animationActive) return;

        const skillName = chip.textContent.trim();
        const rect = chip.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Always create confetti burst from chip location
        this.createConfetti(centerX, centerY, 15);

        // Trigger skill-specific animation if available
        const animationFn = this.skillAnimations[skillName];
        if (animationFn) {
            this.animationActive = true;
            animationFn.call(this, centerX, centerY);

            // Reset animation flag after duration
            setTimeout(() => {
                this.animationActive = false;
                this.currentAnimation = null;
            }, 1500);
        }
    }

    /**
     * Create confetti particle burst
     * @param {number} x - Center X position
     * @param {number} y - Center Y position
     * @param {number} count - Number of particles
     */
    createConfetti(x, y, count = 15) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const velocity = 3 + Math.random() * 3;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                life: 1.0,
                size: 4 + Math.random() * 4,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                color: this.getRandomColor(),
                shape: Math.random() > 0.5 ? 'circle' : 'square'
            });
        }
    }

    /**
     * Get random confetti color from cyan palette
     */
    getRandomColor() {
        const colors = [
            'rgba(0, 234, 255, 0.8)',   // Cyan
            'rgba(0, 200, 255, 0.8)',   // Blue-cyan
            'rgba(100, 200, 255, 0.8)', // Light blue
            'rgba(0, 255, 200, 0.8)',   // Cyan-green
            'rgba(150, 230, 255, 0.8)'  // Light cyan
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * Map of skill names to animation functions
     * ADD NEW SKILLS HERE to trigger custom animations
     */
    get skillAnimations() {
        return {
            'Python': this.pythonSnakeAnimation.bind(this),
            'JavaScript': this.javascriptBouncingAnimation.bind(this),
            'Flutter': this.flutterBirdAnimation.bind(this),
            'Dart': this.dartProjectileAnimation.bind(this),
            'Kotlin': this.kotlinJumpingAnimation.bind(this),
            'Cybersecurity': this.cybersecurityShieldAnimation.bind(this),
            'Ethical Hacking': this.cybersecurityShieldAnimation.bind(this),
            'Penetration Testing': this.cybersecurityShieldAnimation.bind(this),
            'OWASP Top 10': this.cybersecurityShieldAnimation.bind(this),
            'Encryption': this.encryptionLockAnimation.bind(this),
            'Kali Linux': this.cybersecurityShieldAnimation.bind(this),
            'Nmap': this.networkScanAnimation.bind(this),
            'Git': this.gitBranchAnimation.bind(this),
            'GitHub': this.gitBranchAnimation.bind(this),
            'React/React Native': this.reactBallAnimation.bind(this),
            'Android Development (Java/Kotlin)': this.kotlinJumpingAnimation.bind(this)
        };
    }

    // ========================================================================
    // ANIMATION IMPLEMENTATIONS
    // ========================================================================

    /**
     * Python: Green snake moving across screen with sinusoidal motion
     */
    pythonSnakeAnimation(centerX, centerY) {
        const snakeLength = 20;
        const segments = [];
        for (let i = 0; i < snakeLength; i++) {
            segments.push({ x: centerX - i * 8, y: centerY });
        }

        let progress = 0;
        const animate = () => {
            progress += 0.05;
            if (progress > 1) return;

            segments[0].x += 8;
            segments[0].y += Math.sin(segments[0].x * 0.1) * 2;

            for (let i = segments.length - 1; i > 0; i--) {
                segments[i].x = segments[i - 1].x;
                segments[i].y = segments[i - 1].y;
            }

            this.currentAnimation = { type: 'snake', segments, color: '#22c55e' };
        };

        const interval = setInterval(animate, 20);
        setTimeout(() => clearInterval(interval), 1500);
    }

    /**
     * JavaScript: Bouncing yellow block with gravity physics
     */
    javascriptBouncingAnimation(centerX, centerY) {
        let bounceY = centerY;
        let bounceVY = -10;
        const gravity = 0.3;

        const animate = () => {
            bounceVY += gravity;
            bounceY += bounceVY;

            if (bounceY > centerY) {
                bounceY = centerY;
                bounceVY *= -0.85;
                if (Math.abs(bounceVY) < 1) bounceVY = 0;
            }

            this.currentAnimation = {
                type: 'bounce',
                x: centerX,
                y: bounceY,
                size: 20,
                color: '#eab308'
            };
        };

        const interval = setInterval(animate, 20);
        setTimeout(() => clearInterval(interval), 1500);
    }

    /**
     * Flutter: Fluttering bird animation
     */
    flutterBirdAnimation(centerX, centerY) {
        let birdX = centerX;
        let birdY = centerY;
        let time = 0;

        const animate = () => {
            time += 0.1;
            birdX += 3;
            birdY += Math.sin(time) * 1.5;

            if (birdX > window.innerWidth + 50) return;

            this.currentAnimation = {
                type: 'bird',
                x: birdX,
                y: birdY,
                wingFlap: Math.sin(time * 0.3),
                color: '#3b82f6'
            };
        };

        const interval = setInterval(animate, 20);
        setTimeout(() => clearInterval(interval), 1500);
    }

    /**
     * Dart: Spinning projectile with physics
     */
    dartProjectileAnimation(centerX, centerY) {
        let dartX = centerX;
        let dartY = centerY;
        let dartVX = 5;
        let dartVY = -3;
        let rotation = 0;

        const animate = () => {
            dartVY += 0.2;
            dartX += dartVX;
            dartY += dartVY;
            rotation += 0.15;

            if (dartX > window.innerWidth + 50 || dartY > window.innerHeight + 50) return;

            this.currentAnimation = {
                type: 'dart',
                x: dartX,
                y: dartY,
                rotation: rotation,
                color: '#8b5cf6'
            };
        };

        const interval = setInterval(animate, 20);
        setTimeout(() => clearInterval(interval), 1500);
    }

    /**
     * Kotlin: Jumping cube with sequential jumps
     */
    kotlinJumpingAnimation(centerX, centerY) {
        let cubeX = centerX;
        let cubeY = centerY;
        let cubeVY = -12;
        const gravity = 0.4;
        let jumpCount = 0;

        const animate = () => {
            cubeVY += gravity;
            cubeY += cubeVY;

            if (cubeY >= centerY) {
                cubeY = centerY;
                cubeVY = -12;
                jumpCount++;

                if (jumpCount > 3) return;
            }

            cubeX += 2;
            this.currentAnimation = {
                type: 'cube',
                x: cubeX,
                y: cubeY,
                size: 16,
                color: '#7c3aed'
            };
        };

        const interval = setInterval(animate, 20);
        setTimeout(() => clearInterval(interval), 1500);
    }

    /**
     * Cybersecurity: Shield pop animation with glow
     */
    cybersecurityShieldAnimation(centerX, centerY) {
        let shieldSize = 20;
        let progress = 0;

        const animate = () => {
            progress += 0.08;
            if (progress > 1) return;

            if (progress < 0.5) {
                shieldSize = 20 + progress * 2 * 40;
            } else {
                shieldSize = 60 - (progress - 0.5) * 2 * 60;
            }

            this.currentAnimation = {
                type: 'shield',
                x: centerX,
                y: centerY,
                size: shieldSize,
                progress: progress,
                color: '#ef4444'
            };
        };

        const interval = setInterval(animate, 20);
        setTimeout(() => clearInterval(interval), 1500);
    }

    /**
     * Encryption: Lock rotating open
     */
    encryptionLockAnimation(centerX, centerY) {
        let lockRotation = 0;
        let progress = 0;

        const animate = () => {
            progress += 0.08;
            if (progress > 1) return;

            lockRotation = progress * (Math.PI / 2);

            this.currentAnimation = {
                type: 'lock',
                x: centerX,
                y: centerY,
                rotation: lockRotation,
                progress: progress,
                color: '#f59e0b'
            };
        };

        const interval = setInterval(animate, 20);
        setTimeout(() => clearInterval(interval), 1500);
    }

    /**
     * Network (Nmap): Expanding radar scan
     */
    networkScanAnimation(centerX, centerY) {
        let scanRadius = 10;
        let progress = 0;

        const animate = () => {
            progress += 0.08;
            if (progress > 1) return;

            scanRadius = 10 + progress * 50;

            this.currentAnimation = {
                type: 'radar',
                x: centerX,
                y: centerY,
                radius: scanRadius,
                progress: progress,
                color: '#06b6d4'
            };
        };

        const interval = setInterval(animate, 20);
        setTimeout(() => clearInterval(interval), 1500);
    }

    /**
     * Git: Branch splitting animation
     */
    gitBranchAnimation(centerX, centerY) {
        let progress = 0;

        const animate = () => {
            progress += 0.08;
            if (progress > 1) return;

            this.currentAnimation = {
                type: 'branch',
                x: centerX,
                y: centerY,
                progress: progress,
                color: '#f97316'
            };
        };

        const interval = setInterval(animate, 20);
        setTimeout(() => clearInterval(interval), 1500);
    }

    /**
     * React: Orbiting electron atoms
     */
    reactBallAnimation(centerX, centerY) {
        let time = 0;
        let progress = 0;

        const animate = () => {
            time += 0.1;
            progress += 0.08;
            if (progress > 1) return;

            this.currentAnimation = {
                type: 'electron',
                x: centerX,
                y: centerY,
                time: time,
                progress: progress,
                color: '#61dafb'
            };
        };

        const interval = setInterval(animate, 20);
        setTimeout(() => clearInterval(interval), 1500);
    }

    // ========================================================================
    // ANIMATION LOOP & RENDERING
    // ========================================================================

    /**
     * Main animation loop using requestAnimationFrame
     */
    startAnimationLoop() {
        const animate = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Update and draw particles
            this.particles = this.particles.filter(p => p.life > 0);
            this.particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.2; // gravity
                p.life -= 0.02;
                p.rotation += p.rotationSpeed;

                this.ctx.save();
                this.ctx.globalAlpha = p.life;
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(p.rotation);

                if (p.shape === 'circle') {
                    this.ctx.fillStyle = p.color;
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    this.ctx.fill();
                } else {
                    this.ctx.fillStyle = p.color;
                    this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                }

                this.ctx.restore();
            });

            // Draw current skill animation
            if (this.currentAnimation) {
                this.drawAnimation(this.currentAnimation);
            }

            requestAnimationFrame(animate);
        };

        animate();
    }

    /**
     * Route animation drawing to appropriate function
     */
    drawAnimation(anim) {
        this.ctx.save();

        switch (anim.type) {
            case 'snake':
                this.drawSnake(anim);
                break;
            case 'bounce':
                this.drawBounce(anim);
                break;
            case 'bird':
                this.drawBird(anim);
                break;
            case 'dart':
                this.drawDart(anim);
                break;
            case 'cube':
                this.drawCube(anim);
                break;
            case 'shield':
                this.drawShield(anim);
                break;
            case 'lock':
                this.drawLock(anim);
                break;
            case 'radar':
                this.drawRadar(anim);
                break;
            case 'branch':
                this.drawBranch(anim);
                break;
            case 'electron':
                this.drawElectron(anim);
                break;
        }

        this.ctx.restore();
    }

    /**
     * Draw snake animation with gradient coloring
     */
    drawSnake(anim) {
        anim.segments.forEach((segment, i) => {
            const hue = (i / anim.segments.length) * 120;
            this.ctx.fillStyle = `hsl(${hue}, 100%, 45%)`;
            this.ctx.fillRect(segment.x - 4, segment.y - 4, 8, 8);
        });
    }

    /**
     * Draw bouncing block with glow effect
     */
    drawBounce(anim) {
        this.ctx.fillStyle = anim.color;
        this.ctx.fillRect(anim.x - anim.size / 2, anim.y - anim.size / 2, anim.size, anim.size);

        this.ctx.strokeStyle = anim.color;
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = 0.5;
        this.ctx.strokeRect(anim.x - anim.size, anim.y - anim.size, anim.size * 2, anim.size * 2);
    }

    /**
     * Draw fluttering bird
     */
    drawBird(anim) {
        this.ctx.translate(anim.x, anim.y);
        this.ctx.fillStyle = anim.color;

        // Body
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 12, 8, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Head
        this.ctx.beginPath();
        this.ctx.arc(8, -2, 6, 0, Math.PI * 2);
        this.ctx.fill();

        // Wings flapping
        const wingDip = anim.wingFlap * 8;
        this.ctx.globalAlpha = 0.7;
        this.ctx.beginPath();
        this.ctx.ellipse(-8, -5 + wingDip, 8, 4, 0.2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    /**
     * Draw spinning dart projectile
     */
    drawDart(anim) {
        this.ctx.translate(anim.x, anim.y);
        this.ctx.rotate(anim.rotation);
        this.ctx.fillStyle = anim.color;
        this.ctx.fillRect(-2, -8, 4, 16);
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.beginPath();
        this.ctx.moveTo(0, 8);
        this.ctx.lineTo(-6, 6);
        this.ctx.lineTo(6, 6);
        this.ctx.closePath();
        this.ctx.fill();
    }

    /**
     * Draw jumping cube
     */
    drawCube(anim) {
        this.ctx.translate(anim.x, anim.y);
        this.ctx.fillStyle = anim.color;
        this.ctx.fillRect(-anim.size / 2, -anim.size / 2, anim.size, anim.size);

        this.ctx.strokeStyle = anim.color;
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = 0.6;
        this.ctx.strokeRect(-anim.size / 2, -anim.size / 2, anim.size, anim.size);
    }

    /**
     * Draw shield with glow and pop effect
     */
    drawShield(anim) {
        const { x, y, size, progress, color } = anim;
        this.ctx.translate(x, y);

        // Outer glow
        this.ctx.globalAlpha = 0.3 * (1 - progress);
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -size * 1.2);
        this.ctx.lineTo(size * 0.8, -size * 0.4);
        this.ctx.lineTo(size * 0.8, size * 0.6);
        this.ctx.bezierCurveTo(size * 0.8, size, 0, size * 1.2, -size * 0.8, size * 0.6);
        this.ctx.lineTo(-size * 0.8, -size * 0.4);
        this.ctx.closePath();
        this.ctx.fill();

        // Main shield
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -size);
        this.ctx.lineTo(size * 0.7, -size * 0.3);
        this.ctx.lineTo(size * 0.7, size * 0.5);
        this.ctx.bezierCurveTo(size * 0.7, size * 0.8, 0, size, -size * 0.7, size * 0.5);
        this.ctx.lineTo(-size * 0.7, -size * 0.3);
        this.ctx.closePath();
        this.ctx.fill();
    }

    /**
     * Draw lock opening animation
     */
    drawLock(anim) {
        const { x, y, rotation, color } = anim;
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation);

        // Lock shackle
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(0, -4, 8, Math.PI * 0.7, Math.PI * 2.3);
        this.ctx.stroke();

        // Lock body
        this.ctx.fillStyle = color;
        this.ctx.fillRect(-6, 2, 12, 10);

        // Lock hole
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(0, 7, 2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    /**
     * Draw network scan radar
     */
    drawRadar(anim) {
        const { x, y, radius, progress, color } = anim;
        this.ctx.translate(x, y);

        // Center dot
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 3, 0, Math.PI * 2);
        this.ctx.fill();

        // Scanning circle
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = 1 - progress;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
        this.ctx.stroke();

        // Scan lines
        this.ctx.globalAlpha = 0.6;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
            this.ctx.stroke();
        }
    }

    /**
     * Draw Git branch splitting animation
     */
    drawBranch(anim) {
        const { x, y, progress, color } = anim;
        this.ctx.translate(x, y);

        // Main branch
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(0, -40 * progress);
        this.ctx.stroke();

        // Left branch
        if (progress > 0.3) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, -15);
            this.ctx.lineTo(-30 * (progress - 0.3) / 0.7, -15 - 30 * (progress - 0.3) / 0.7);
            this.ctx.stroke();
        }

        // Right branch
        if (progress > 0.6) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, -25);
            this.ctx.lineTo(30 * (progress - 0.6) / 0.4, -25 - 30 * (progress - 0.6) / 0.4);
            this.ctx.stroke();
        }
    }

    /**
     * Draw orbiting electrons (React atom)
     */
    drawElectron(anim) {
        const { x, y, time, progress, color } = anim;
        this.ctx.translate(x, y);

        // Nucleus
        this.ctx.fillStyle = color;
        this.ctx.globalAlpha = 0.5;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 6, 0, Math.PI * 2);
        this.ctx.fill();

        // Orbits
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.3;
        for (let i = 0; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 15 + i * 10, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        // Electrons
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = color;
        for (let i = 0; i < 3; i++) {
            const angle = time + (i / 3) * Math.PI * 2;
            const orbitRadius = 15 + i * 10;
            const ex = Math.cos(angle) * orbitRadius;
            const ey = Math.sin(angle) * orbitRadius;

            this.ctx.beginPath();
            this.ctx.arc(ex, ey, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new SkillAnimationSystem();
    });
} else {
    new SkillAnimationSystem();
}
