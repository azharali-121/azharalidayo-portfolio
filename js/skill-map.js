/**
 * ============================================================================
 * INTERACTIVE SKILL MAP VISUALIZATION
 * ============================================================================
 * 
 * A compact, interactive node-based visualization of skills and their relationships.
 * 
 * Features:
 * - SVG-based nodes (circles) representing skills
 * - Connecting lines showing relationships between skills
 * - Hover effects: node grows, connections highlight
 * - Click effects: tooltip, mini info, optional confetti
 * - Force-directed layout for organic spacing
 * - Fully responsive and touch-friendly
 * 
 * HOW TO ADD MORE SKILLS:
 * ============================================================================
 * 
 * 1. Add skill to the SKILLS array (line ~80):
 *    {
 *        id: 'skill-id',
 *        label: 'Skill Name',
 *        category: 'Backend', // for styling
 *        description: 'Short description'
 *    }
 * 
 * 2. Add connections in CONNECTIONS array (line ~120):
 *    {
 *        source: 'skill1-id',
 *        target: 'skill2-id',
 *        strength: 0.8 // 0-1, how strong the connection is
 *    }
 * 
 * 3. Add category colors in CATEGORY_COLORS object (line ~145):
 *    'YourCategory': '#color-here'
 * 
 * ============================================================================
 */

class SkillMap {
    /**
     * Skill definitions - add more skills here
     * Each skill is a node in the visualization
     */
    static SKILLS = [
        // Core Programming
        { id: 'python', label: 'Python', category: 'Programming', description: 'Scripting & automation' },
        { id: 'javascript', label: 'JavaScript', category: 'Programming', description: 'Web & Node.js development' },
        { id: 'java', label: 'Java', category: 'Programming', description: 'OOP & Chess AI' },
        { id: 'cpp', label: 'C++', category: 'Programming', description: 'Systems programming' },
        
        // Mobile Development
        { id: 'flutter', label: 'Flutter', category: 'Mobile', description: 'Cross-platform mobile' },
        { id: 'kotlin', label: 'Kotlin', category: 'Mobile', description: 'Android development' },
        
        // Backend
        { id: 'nodejs', label: 'Node.js', category: 'Backend', description: 'Server-side JS' },
        { id: 'express', label: 'Express.js', category: 'Backend', description: 'REST APIs' },
        { id: 'mongodb', label: 'MongoDB', category: 'Backend', description: 'NoSQL databases' },
        
        // Security
        { id: 'cybersecurity', label: 'Cybersecurity', category: 'Security', description: 'Web security' },
        { id: 'encryption', label: 'Encryption', category: 'Security', description: 'Cryptography' },
        { id: 'owasp', label: 'OWASP', category: 'Security', description: 'Security standards' },
        
        // Tools
        { id: 'git', label: 'Git', category: 'Tools', description: 'Version control' },
        { id: 'react', label: 'React', category: 'Frontend', description: 'UI framework' },
    ];

    /**
     * Skill relationships - define connections between skills
     * Connections will be drawn as lines between nodes
     * strength: 0-1 (line thickness and opacity)
     */
    static CONNECTIONS = [
        // Programming connections
        { source: 'python', target: 'javascript', strength: 0.6 },
        { source: 'java', target: 'cpp', strength: 0.5 },
        { source: 'javascript', target: 'nodejs', strength: 0.9 },
        
        // Backend connections
        { source: 'nodejs', target: 'express', strength: 0.9 },
        { source: 'express', target: 'mongodb', strength: 0.85 },
        { source: 'nodejs', target: 'mongodb', strength: 0.8 },
        
        // Mobile connections
        { source: 'kotlin', target: 'java', strength: 0.85 },
        { source: 'flutter', target: 'react', strength: 0.7 },
        
        // Security connections
        { source: 'cybersecurity', target: 'encryption', strength: 0.85 },
        { source: 'cybersecurity', target: 'owasp', strength: 0.9 },
        { source: 'encryption', target: 'nodejs', strength: 0.6 },
        
        // Tools connections
        { source: 'git', target: 'nodejs', strength: 0.7 },
        { source: 'git', target: 'javascript', strength: 0.7 },
        { source: 'react', target: 'javascript', strength: 0.95 },
        
        // Cross-domain connections
        { source: 'express', target: 'cybersecurity', strength: 0.75 },
        { source: 'python', target: 'encryption', strength: 0.6 },
    ];

    /**
     * Category colors for visual grouping
     * One primary accent color: cyan
     */
    static CATEGORY_COLORS = {
        'Programming': '#00eaff',
        'Backend': '#0099ff',
        'Mobile': '#00cc88',
        'Security': '#ff6b6b',
        'Frontend': '#61dafb',
        'Tools': '#f97316'
    };

    constructor() {
        this.container = document.getElementById('skill-map-container');
        if (!this.container) {
            console.warn('Skill map container not found');
            return;
        }

        this.svg = null;
        this.nodes = [];
        this.nodeMap = new Map();
        this.hoveredNode = null;
        this.selectedNode = null;
        this.tooltip = null;
        this.linesGroup = null;
        this.nodesGroup = null;
        
        this.init();
    }

    /**
     * Initialize the skill map
     */
    init() {
        try {
            this.createSVG();
            this.createNodes();
            this.drawConnections();
            this.drawNodes();
            this.attachEventListeners();
            this.applyForceLayout();
        } catch (error) {
            console.error('Error during skill map initialization:', error);
        }
    }

    /**
     * Create SVG canvas
     */
    createSVG() {
        const width = Math.max(400, Math.min(800, window.innerWidth - 60));
        const height = 500;

        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute('width', '100%');
        this.svg.setAttribute('height', 'auto');
        this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        this.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        this.svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        this.svg.style.display = 'block';
        this.svg.style.margin = '0 auto';
        this.svg.style.maxWidth = '100%';
        this.svg.style.background = 'rgba(10, 14, 22, 0.5)';
        this.svg.style.borderRadius = '12px';
        this.svg.style.border = '1px solid rgba(0, 234, 255, 0.3)';
        this.svg.style.minHeight = '500px';

        this.container.appendChild(this.svg);
        this.svgWidth = width;
        this.svgHeight = height;
    }

    /**
     * Create node objects with initial positions
     */
    createNodes() {
        SkillMap.SKILLS.forEach((skill, index) => {
            // Spread nodes evenly around center with some randomness
            const angle = (index / SkillMap.SKILLS.length) * Math.PI * 2;
            const radius = 120 + Math.random() * 40;

            const node = {
                ...skill,
                x: this.svgWidth / 2 + Math.cos(angle) * radius,
                y: this.svgHeight / 2 + Math.sin(angle) * radius,
                vx: 0,
                vy: 0,
                radius: 35,
                isHovered: false,
                isSelected: false,
                connections: []
            };

            this.nodes.push(node);
            this.nodeMap.set(skill.id, node);
        });

        // Build connection references
        SkillMap.CONNECTIONS.forEach(conn => {
            const source = this.nodeMap.get(conn.source);
            const target = this.nodeMap.get(conn.target);
            if (source && target) {
                source.connections.push({ node: target, strength: conn.strength });
                target.connections.push({ node: source, strength: conn.strength });
            }
        });
    }

    /**
     * Draw connection lines between related skills
     */
    drawConnections() {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('class', 'skill-map-lines');

        SkillMap.CONNECTIONS.forEach(conn => {
            const source = this.nodeMap.get(conn.source);
            const target = this.nodeMap.get(conn.target);

            if (source && target) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', source.x);
                line.setAttribute('y1', source.y);
                line.setAttribute('x2', target.x);
                line.setAttribute('y2', target.y);
                line.setAttribute('stroke', `rgba(0, 234, 255, ${0.2 * conn.strength})`);
                line.setAttribute('stroke-width', 1.5 * conn.strength);
                line.setAttribute('class', 'skill-map-line');
                line.setAttribute('data-source', conn.source);
                line.setAttribute('data-target', conn.target);
                line.style.transition = 'stroke 0.3s ease, stroke-width 0.3s ease';

                group.appendChild(line);
            }
        });

        this.svg.appendChild(group);
        this.linesGroup = group;
    }

    /**
     * Draw skill nodes
     */
    drawNodes() {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('class', 'skill-map-nodes');

        const textGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        textGroup.setAttribute('class', 'skill-map-labels');

        this.nodes.forEach(node => {
            // Create circle node
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', node.x);
            circle.setAttribute('cy', node.y);
            circle.setAttribute('r', node.radius);
            circle.setAttribute('class', 'skill-map-node');
            circle.setAttribute('data-skill-id', node.id);
            circle.setAttribute('fill', SkillMap.CATEGORY_COLORS[node.category] || '#00eaff');
            circle.style.cursor = 'pointer';
            circle.style.transition = 'r 0.3s ease, filter 0.3s ease';
            circle.style.filter = 'drop-shadow(0 0 8px rgba(0, 234, 255, 0.3))';

            // Create label text
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', node.x);
            text.setAttribute('y', node.y);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('class', 'skill-map-label');
            text.setAttribute('data-skill-id', node.id);
            text.setAttribute('pointer-events', 'none');
            text.style.fontSize = '11px';
            text.style.fontWeight = '700';
            text.style.fill = '#fff';
            text.style.textShadow = '0 0 3px rgba(0,0,0,0.8)';
            text.style.transition = 'font-size 0.3s ease';

            // Set text content - use simple label for better compatibility
            text.textContent = node.label;

            node.element = circle;
            node.textElement = text;

            group.appendChild(circle);
            textGroup.appendChild(text);
        });

        this.svg.appendChild(group);
        this.nodesGroup = group;
        this.svg.appendChild(textGroup);
    }

    /**
     * Attach event listeners to nodes
     */
    attachEventListeners() {
        this.nodes.forEach(node => {
            const circle = node.element;

            circle.addEventListener('mouseenter', () => this.onNodeHover(node));
            circle.addEventListener('mouseleave', () => this.onNodeLeave(node));
            circle.addEventListener('click', (e) => this.onNodeClick(node, e));
        });
    }

    /**
     * Handle node hover
     */
    onNodeHover(node) {
        this.hoveredNode = node;
        node.isHovered = true;

        // Grow node
        node.element.setAttribute('r', node.radius * 1.3);
        node.textElement.style.fontSize = '14px';
        node.element.style.filter = 'drop-shadow(0 0 16px rgba(0, 234, 255, 0.6))';

        // Highlight connections
        Array.from(this.linesGroup.querySelectorAll('.skill-map-line')).forEach(line => {
            const source = line.getAttribute('data-source');
            const target = line.getAttribute('data-target');

            if (source === node.id || target === node.id) {
                line.setAttribute('stroke', `rgba(0, 234, 255, 0.7)`);
                line.setAttribute('stroke-width', 3);
            } else {
                line.setAttribute('stroke', `rgba(0, 234, 255, 0.05)`);
            }
        });

        // Dim other nodes
        this.nodes.forEach(n => {
            if (n !== node) {
                n.element.style.opacity = '0.5';
            }
        });

        // Show tooltip
        this.showTooltip(node);
    }

    /**
     * Handle node leave
     */
    onNodeLeave(node) {
        this.hoveredNode = null;
        node.isHovered = false;

        // Restore node size
        node.element.setAttribute('r', node.radius);
        node.textElement.style.fontSize = '12px';
        node.element.style.filter = 'drop-shadow(0 0 8px rgba(0, 234, 255, 0.3))';

        // Restore connections
        Array.from(this.linesGroup.querySelectorAll('.skill-map-line')).forEach(line => {
            const source = line.getAttribute('data-source');
            const target = line.getAttribute('data-target');
            const conn = SkillMap.CONNECTIONS.find(c => c.source === source && c.target === target);
            if (conn) {
                line.setAttribute('stroke', `rgba(0, 234, 255, ${0.2 * conn.strength})`);
                line.setAttribute('stroke-width', 1.5 * conn.strength);
            }
        });

        // Restore node visibility
        this.nodes.forEach(n => {
            n.element.style.opacity = '1';
        });

        // Hide tooltip
        this.hideTooltip();
    }

    /**
     * Handle node click
     */
    onNodeClick(node, e) {
        this.selectedNode = node;
        node.isSelected = !node.isSelected;

        if (node.isSelected) {
            // Add selected state styling
            node.element.style.stroke = '#00eaff';
            node.element.style.strokeWidth = '2';
            
            // Show expanded tooltip
            this.showExpandedTooltip(node);
            
            // Optional: trigger mini confetti
            this.triggerMiniConfetti(node);
        } else {
            node.element.style.stroke = 'none';
            this.hideTooltip();
        }

        e.stopPropagation();
    }

    /**
     * Show simple tooltip on hover
     */
    showTooltip(node) {
        if (this.tooltip) this.hideTooltip();

        this.tooltip = document.createElement('div');
        this.tooltip.className = 'skill-map-tooltip';
        this.tooltip.innerHTML = `
            <strong>${node.label}</strong>
            <p>${node.description}</p>
        `;
        this.tooltip.style.position = 'absolute';
        this.tooltip.style.background = 'rgba(10, 14, 22, 0.95)';
        this.tooltip.style.border = '1px solid rgba(0, 234, 255, 0.5)';
        this.tooltip.style.borderRadius = '8px';
        this.tooltip.style.padding = '8px 12px';
        this.tooltip.style.color = '#e6f8ff';
        this.tooltip.style.fontSize = '12px';
        this.tooltip.style.zIndex = '1000';
        this.tooltip.style.pointerEvents = 'none';
        this.tooltip.style.animation = 'tooltipFadeIn 0.3s ease';

        document.body.appendChild(this.tooltip);
    }

    /**
     * Show expanded tooltip on click
     */
    showExpandedTooltip(node) {
        if (this.tooltip) this.hideTooltip();

        const connections = node.connections.length;
        
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'skill-map-tooltip skill-map-tooltip-expanded';
        this.tooltip.innerHTML = `
            <div style="border-bottom: 1px solid rgba(0, 234, 255, 0.3); padding-bottom: 6px; margin-bottom: 6px;">
                <strong style="color: #00eaff;">${node.label}</strong>
                <p style="margin: 4px 0 0 0; font-size: 11px; opacity: 0.8;">${node.category}</p>
            </div>
            <p style="margin: 0; font-size: 12px;">${node.description}</p>
            <p style="margin: 6px 0 0 0; font-size: 11px; color: #0099ff;">🔗 ${connections} related skill${connections !== 1 ? 's' : ''}</p>
        `;
        this.tooltip.style.position = 'absolute';
        this.tooltip.style.background = 'rgba(10, 14, 22, 0.98)';
        this.tooltip.style.border = '2px solid rgba(0, 234, 255, 0.7)';
        this.tooltip.style.borderRadius = '12px';
        this.tooltip.style.padding = '12px';
        this.tooltip.style.color = '#e6f8ff';
        this.tooltip.style.fontSize = '12px';
        this.tooltip.style.zIndex = '1000';
        this.tooltip.style.pointerEvents = 'none';
        this.tooltip.style.maxWidth = '200px';
        this.tooltip.style.animation = 'tooltipFadeIn 0.3s ease';
        this.tooltip.style.boxShadow = '0 8px 24px rgba(0, 234, 255, 0.2)';

        document.body.appendChild(this.tooltip);
    }

    /**
     * Hide tooltip
     */
    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.style.animation = 'tooltipFadeOut 0.2s ease';
            setTimeout(() => {
                if (this.tooltip && this.tooltip.parentNode) {
                    this.tooltip.parentNode.removeChild(this.tooltip);
                    this.tooltip = null;
                }
            }, 200);
        }
    }

    /**
     * Trigger mini confetti on click
     */
    triggerMiniConfetti(node) {
        const rect = node.element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            particle.style.width = '6px';
            particle.style.height = '6px';
            particle.style.borderRadius = '50%';
            particle.style.background = SkillMap.CATEGORY_COLORS[node.category] || '#00eaff';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '2000';
            particle.style.boxShadow = `0 0 8px ${SkillMap.CATEGORY_COLORS[node.category] || '#00eaff'}`;
            document.body.appendChild(particle);

            const vx = Math.cos(angle) * 4;
            const vy = Math.sin(angle) * 4;
            let x = centerX;
            let y = centerY;
            let life = 1;

            const animate = () => {
                x += vx;
                y += vy;
                life -= 0.05;

                particle.style.left = x + 'px';
                particle.style.top = y + 'px';
                particle.style.opacity = life;

                if (life > 0) {
                    requestAnimationFrame(animate);
                } else {
                    particle.parentNode.removeChild(particle);
                }
            };

            animate();
        }
    }

    /**
     * Simple force-directed layout to avoid overlapping
     * Applies gentle repulsive and attractive forces
     */
    applyForceLayout() {
        const iterations = 20;
        const k = 1; // repulsive force strength
        const c = 0.1; // attractive force strength

        for (let iter = 0; iter < iterations; iter++) {
            // Repulsive forces (node-to-node)
            for (let i = 0; i < this.nodes.length; i++) {
                const node = this.nodes[i];
                node.fx = 0;
                node.fy = 0;

                for (let j = 0; j < this.nodes.length; j++) {
                    if (i === j) continue;

                    const other = this.nodes[j];
                    const dx = node.x - other.x;
                    const dy = node.y - other.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) + 1;

                    const force = k / (dist * dist);
                    node.fx += (dx / dist) * force;
                    node.fy += (dy / dist) * force;
                }

                // Attractive forces (connections)
                node.connections.forEach(conn => {
                    const other = conn.node;
                    const dx = other.x - node.x;
                    const dy = other.y - node.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) + 1;

                    const force = (dist * dist) * c * conn.strength;
                    node.fx += (dx / dist) * force;
                    node.fy += (dy / dist) * force;
                });

                // Keep nodes within bounds with damping
                node.x += node.fx * 0.5;
                node.y += node.fy * 0.5;

                // Boundary constraints
                node.x = Math.max(50, Math.min(this.svgWidth - 50, node.x));
                node.y = Math.max(50, Math.min(this.svgHeight - 50, node.y));
            }
        }

        // Update positions in SVG
        this.nodes.forEach(node => {
            node.element.setAttribute('cx', node.x);
            node.element.setAttribute('cy', node.y);
            node.textElement.setAttribute('x', node.x);
            node.textElement.setAttribute('y', node.y);
        });

        // Update connection lines
        Array.from(this.linesGroup.querySelectorAll('.skill-map-line')).forEach(line => {
            const source = this.nodeMap.get(line.getAttribute('data-source'));
            const target = this.nodeMap.get(line.getAttribute('data-target'));
            if (source && target) {
                line.setAttribute('x1', source.x);
                line.setAttribute('y1', source.y);
                line.setAttribute('x2', target.x);
                line.setAttribute('y2', target.y);
            }
        });
    }
}

// Initialize skill map when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        try {
            const container = document.getElementById('skill-map-container');
            if (container) {
                new SkillMap();
                console.log('✓ Skill Map initialized successfully');
            } else {
                console.error('Skill map container element not found');
            }
        } catch (error) {
            console.error('Error initializing Skill Map:', error);
        }
    });
} else {
    try {
        const container = document.getElementById('skill-map-container');
        if (container) {
            new SkillMap();
            console.log('✓ Skill Map initialized successfully');
        } else {
            console.error('Skill map container element not found');
        }
    } catch (error) {
        console.error('Error initializing Skill Map:', error);
    }
}
