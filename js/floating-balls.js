/**
 * FLOATING BALLS - Interactive Skill Visualization
 * 
 * This script creates an interactive physics-based visualization where skills/projects
 * appear as floating balls that can be dragged, clicked, and bounce within a container.
 * 
 * Features:
 * - Physics-based movement with bouncing
 * - Drag and drop interaction
 * - Click animations with confetti effect
 * - Collision detection
 * - Touch support for mobile devices
 * - Responsive to container resizing
 * 
 * HOW TO ADD MORE SKILLS:
 * Add items to the 'skills' array below with format:
 * { name: "Skill Name", category: "category", size: 60-120 }
 */

(function() {
    'use strict';

    // Configuration: Add your skills here
    const skills = [
        { name: "JavaScript", category: "Frontend", size: 90 },
        { name: "React", category: "Frontend", size: 80 },
        { name: "Node.js", category: "Backend", size: 85 },
        { name: "Python", category: "Backend", size: 95 },
        { name: "MongoDB", category: "Database", size: 75 },
        { name: "Socket.io", category: "Real-time", size: 70 },
        { name: "Java", category: "Backend", size: 85 },
        { name: "Git", category: "Tools", size: 65 },
        { name: "Cybersecurity", category: "Security", size: 100 },
        { name: "Flutter", category: "Mobile", size: 80 },
        { name: "Express.js", category: "Backend", size: 75 },
        { name: "REST APIs", category: "Backend", size: 70 }
    ];

    // Ball physics configuration
    const config = {
        gravity: 0.18,
        damping: 0.985,
        maxVelocity: 10,
        bounceDecay: 0.88,
        collisionForce: 0.85,
        smoothing: 0.15
    };

    let container, balls = [];
    let animationId;
    let isDragging = false;
    let draggedBall = null;

    /**
     * Initialize the floating balls system
     */
    function init() {
        container = document.querySelector('.floating-balls-container');
        if (!container) {
            console.warn('Floating balls container not found');
            return;
        }

        createBalls();
        attachEventListeners();
        startAnimation();

        // Handle window resize
        window.addEventListener('resize', handleResize);
    }

    /**
     * Create ball elements and initialize their physics
     */
    function createBalls() {
        const containerRect = container.getBoundingClientRect();
        
        skills.forEach((skill, index) => {
            const ball = {
                element: createBallElement(skill),
                x: Math.random() * (containerRect.width - skill.size),
                y: Math.random() * (containerRect.height - skill.size),
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: skill.size,
                name: skill.name,
                category: skill.category,
                isDragging: false,
                // Smoothing properties
                displayX: 0,
                displayY: 0
            };
            
            // Initialize display position
            ball.displayX = ball.x;
            ball.displayY = ball.y;

            container.appendChild(ball.element);
            balls.push(ball);
            updateBallPosition(ball);
        });
    }

    /**
     * Create a ball DOM element
     */
    function createBallElement(skill) {
        const ball = document.createElement('div');
        ball.className = 'skill-ball';
        ball.style.width = `${skill.size}px`;
        ball.style.height = `${skill.size}px`;
        ball.textContent = skill.name;
        ball.setAttribute('tabindex', '0');
        ball.setAttribute('role', 'button');
        ball.setAttribute('aria-label', `${skill.name} - ${skill.category}`);
        
        // Add tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'skill-ball-tooltip';
        tooltip.textContent = skill.category;
        ball.appendChild(tooltip);
        
        return ball;
    }

    /**
     * Update ball position on the DOM with smooth interpolation
     */
    function updateBallPosition(ball) {
        // Smooth interpolation for position
        ball.displayX += (ball.x - ball.displayX) * config.smoothing;
        ball.displayY += (ball.y - ball.displayY) * config.smoothing;
        
        // Use transform with hardware acceleration and sub-pixel precision
        ball.element.style.transform = `translate3d(${ball.displayX.toFixed(2)}px, ${ball.displayY.toFixed(2)}px, 0)`;
    }

    /**
     * Main animation loop
     */
    function animate() {
        balls.forEach(ball => {
            if (!ball.isDragging) {
                // Apply physics
                ball.vy += config.gravity;
                ball.vx *= config.damping;
                ball.vy *= config.damping;

                // Limit velocity
                ball.vx = Math.max(-config.maxVelocity, Math.min(config.maxVelocity, ball.vx));
                ball.vy = Math.max(-config.maxVelocity, Math.min(config.maxVelocity, ball.vy));

                // Update position
                ball.x += ball.vx;
                ball.y += ball.vy;

                // Collision detection with container walls
                handleWallCollision(ball);

                // Update DOM
                updateBallPosition(ball);
            }
        });

        // Check ball-to-ball collisions
        checkBallCollisions();

        animationId = requestAnimationFrame(animate);
    }

    /**
     * Handle collision with container walls
     */
    function handleWallCollision(ball) {
        const containerRect = container.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
        const buffer = 0.5; // Small buffer to prevent jitter

        // Right wall
        if (ball.x + ball.size > containerWidth - buffer) {
            ball.x = containerWidth - ball.size;
            ball.vx = -Math.abs(ball.vx) * config.bounceDecay;
            // Clamp small velocities to reduce jitter
            if (Math.abs(ball.vx) < 0.5) ball.vx = 0;
        }

        // Left wall
        if (ball.x < buffer) {
            ball.x = buffer;
            ball.vx = Math.abs(ball.vx) * config.bounceDecay;
            if (Math.abs(ball.vx) < 0.5) ball.vx = 0;
        }

        // Bottom wall
        if (ball.y + ball.size > containerHeight - buffer) {
            ball.y = containerHeight - ball.size;
            ball.vy = -Math.abs(ball.vy) * config.bounceDecay;
            if (Math.abs(ball.vy) < 0.5) ball.vy = 0;
        }

        // Top wall
        if (ball.y < buffer) {
            ball.y = buffer;
            ball.vy = Math.abs(ball.vy) * config.bounceDecay;
            if (Math.abs(ball.vy) < 0.5) ball.vy = 0;
        }
    }

    /**
     * Check and handle ball-to-ball collisions
     */
    function checkBallCollisions() {
        for (let i = 0; i < balls.length; i++) {
            for (let j = i + 1; j < balls.length; j++) {
                const ball1 = balls[i];
                const ball2 = balls[j];

                if (ball1.isDragging || ball2.isDragging) continue;

                const dx = (ball2.x + ball2.size / 2) - (ball1.x + ball1.size / 2);
                const dy = (ball2.y + ball2.size / 2) - (ball1.y + ball1.size / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = (ball1.size + ball2.size) / 2;

                if (distance < minDistance) {
                    // Smoother elastic collision response
                    const angle = Math.atan2(dy, dx);
                    const sin = Math.sin(angle);
                    const cos = Math.cos(angle);

                    // Separate balls with less force for smoothness
                    const overlap = minDistance - distance;
                    const separationForce = 0.5;
                    ball1.x -= overlap * cos * separationForce;
                    ball1.y -= overlap * sin * separationForce;
                    ball2.x += overlap * cos * separationForce;
                    ball2.y += overlap * sin * separationForce;

                    // Calculate collision response with reduced energy
                    const relativeVx = ball2.vx - ball1.vx;
                    const relativeVy = ball2.vy - ball1.vy;
                    const impactSpeed = relativeVx * cos + relativeVy * sin;

                    // Apply collision force (reduced for smoothness)
                    const force = impactSpeed * config.collisionForce;
                    ball1.vx += force * cos * 0.7;
                    ball1.vy += force * sin * 0.7;
                    ball2.vx -= force * cos * 0.7;
                    ball2.vy -= force * sin * 0.7;

                    // Reduce small velocities to prevent jitter
                    if (Math.abs(ball1.vx) < 0.3) ball1.vx *= 0.5;
                    if (Math.abs(ball1.vy) < 0.3) ball1.vy *= 0.5;
                    if (Math.abs(ball2.vx) < 0.3) ball2.vx *= 0.5;
                    if (Math.abs(ball2.vy) < 0.3) ball2.vy *= 0.5;
                }
            }
        }
    }

    /**
     * Attach event listeners for interactions
     */
    function attachEventListeners() {
        balls.forEach(ball => {
            // Mouse events
            ball.element.addEventListener('mousedown', (e) => startDrag(e, ball));
            ball.element.addEventListener('click', (e) => handleBallClick(e, ball));
            
            // Touch events
            ball.element.addEventListener('touchstart', (e) => startDrag(e, ball), { passive: false });
            
            // Keyboard accessibility
            ball.element.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleBallClick(e, ball);
                }
            });
        });

        // Global mouse/touch move and release events
        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchmove', onDragMove, { passive: false });
        document.addEventListener('touchend', stopDrag);

        // Control buttons
        const resetBtn = document.getElementById('floating-balls-reset');
        const shuffleBtn = document.getElementById('floating-balls-shuffle');

        if (resetBtn) {
            resetBtn.addEventListener('click', resetBalls);
        }

        if (shuffleBtn) {
            shuffleBtn.addEventListener('click', shuffleBalls);
        }
    }

    /**
     * Start dragging a ball
     */
    function startDrag(e, ball) {
        e.preventDefault();
        isDragging = true;
        draggedBall = ball;
        ball.isDragging = true;
        ball.element.classList.add('dragging');

        // Stop velocity
        ball.vx = 0;
        ball.vy = 0;
    }

    /**
     * Handle drag movement
     */
    function onDragMove(e) {
        if (!isDragging || !draggedBall) return;

        e.preventDefault();

        const containerRect = container.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);

        if (!clientX || !clientY) return;

        // Calculate new position relative to container
        let newX = clientX - containerRect.left - draggedBall.size / 2;
        let newY = clientY - containerRect.top - draggedBall.size / 2;

        // Constrain to container bounds
        newX = Math.max(0, Math.min(newX, containerRect.width - draggedBall.size));
        newY = Math.max(0, Math.min(newY, containerRect.height - draggedBall.size));

        draggedBall.x = newX;
        draggedBall.y = newY;

        updateBallPosition(draggedBall);
    }

    /**
     * Stop dragging
     */
    function stopDrag(e) {
        if (!isDragging || !draggedBall) return;

        isDragging = false;
        draggedBall.isDragging = false;
        draggedBall.element.classList.remove('dragging');

        // Apply some random velocity
        draggedBall.vx = (Math.random() - 0.5) * 3;
        draggedBall.vy = (Math.random() - 0.5) * 3;

        draggedBall = null;
    }

    /**
     * Handle ball click for animation effect
     */
    function handleBallClick(e, ball) {
        if (ball.isDragging) return;

        // Ripple animation
        ball.element.classList.add('clicked');
        setTimeout(() => ball.element.classList.remove('clicked'), 600);

        // Create confetti effect
        createConfetti(ball);

        // Add some impulse
        ball.vx += (Math.random() - 0.5) * 4;
        ball.vy += (Math.random() - 0.5) * 4 - 2;
    }

    /**
     * Create confetti particles on click
     */
    function createConfetti(ball) {
        const particleCount = 12;
        const ballRect = ball.element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'confetti-particle';
            
            const angle = (Math.PI * 2 * i) / particleCount;
            const distance = 40 + Math.random() * 40;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);
            particle.style.left = `${ball.x + ball.size / 2}px`;
            particle.style.top = `${ball.y + ball.size / 2}px`;
            
            container.appendChild(particle);
            
            setTimeout(() => particle.remove(), 1000);
        }
    }

    /**
     * Reset all balls to initial positions
     */
    function resetBalls() {
        const containerRect = container.getBoundingClientRect();
        
        balls.forEach(ball => {
            ball.x = Math.random() * (containerRect.width - ball.size);
            ball.y = Math.random() * (containerRect.height - ball.size);
            ball.vx = (Math.random() - 0.5) * 2;
            ball.vy = (Math.random() - 0.5) * 2;
            updateBallPosition(ball);
        });
    }

    /**
     * Shuffle balls with random velocities
     */
    function shuffleBalls() {
        balls.forEach(ball => {
            // Much more aggressive shuffle with higher velocities
            const angle = Math.random() * Math.PI * 2;
            const speed = 8 + Math.random() * 8; // 8-16 speed
            ball.vx = Math.cos(angle) * speed;
            ball.vy = Math.sin(angle) * speed;
            
            // Add visual feedback
            ball.element.style.transition = 'transform 0.1s';
            ball.element.style.transform = `translate(${ball.x}px, ${ball.y}px) scale(1.1)`;
            setTimeout(() => {
                ball.element.style.transition = '';
                ball.element.style.transform = `translate(${ball.x}px, ${ball.y}px)`;
            }, 100);
        });
    }

    /**
     * Handle window resize
     */
    function handleResize() {
        const containerRect = container.getBoundingClientRect();
        
        balls.forEach(ball => {
            // Keep balls within new container bounds
            ball.x = Math.min(ball.x, containerRect.width - ball.size);
            ball.y = Math.min(ball.y, containerRect.height - ball.size);
            updateBallPosition(ball);
        });
    }

    /**
     * Start the animation loop
     */
    function startAnimation() {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        animate();
    }

    /**
     * Clean up
     */
    function destroy() {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        window.removeEventListener('resize', handleResize);
        balls.forEach(ball => ball.element.remove());
        balls = [];
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose for potential external control
    window.FloatingBalls = {
        reset: resetBalls,
        shuffle: shuffleBalls,
        destroy: destroy
    };

})();
