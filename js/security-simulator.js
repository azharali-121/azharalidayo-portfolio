/**
 * Security Breach Simulator
 * Educational demonstration of brute force attacks and defense mechanisms
 * 
 * @author Azhar Ali
 * @version 1.0.0
 * @description Simulates password brute force attacks to demonstrate
 *              cybersecurity concepts including rate limiting, account lockout,
 *              and progressive delays.
 */

class SecuritySimulator {
    constructor() {
        // Common passwords for simulation (real-world weak passwords)
        this.commonPasswords = [
            'password', '123456', '12345678', 'qwerty', 'abc123',
            'monkey', '1234567', 'letmein', 'trustno1', 'dragon',
            'baseball', 'iloveyou', 'master', 'sunshine', 'ashley',
            'bailey', 'passw0rd', 'shadow', '123123', '654321',
            'superman', 'qazwsx', 'michael', 'football', 'admin'
        ];
        
        // Simulation state
        this.isRunning = false;
        this.isPaused = false;
        this.attemptCount = 0;
        this.rateLimitCount = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.currentPasswordIndex = 0;
        
        // Security thresholds
        this.RATE_LIMIT_THRESHOLD = 5;  // attempts
        this.RATE_LIMIT_WINDOW = 10000; // 10 seconds
        this.LOCKOUT_THRESHOLD = 10;    // attempts
        this.BASE_DELAY = 500;          // ms
        
        // Rate limiting state
        this.recentAttempts = [];
        this.isLocked = false;
        this.progressiveDelay = this.BASE_DELAY;
        
        // DOM elements
        this.elements = {
            startBtn: document.getElementById('startAttackBtn'),
            stopBtn: document.getElementById('stopAttackBtn'),
            resetBtn: document.getElementById('resetBtn'),
            clearLogsBtn: document.getElementById('clearLogsBtn'),
            terminal: document.getElementById('terminalOutput'),
            systemStatus: document.getElementById('systemStatus'),
            attemptCount: document.getElementById('attemptCount'),
            rateLimitCount: document.getElementById('rateLimitCount'),
            timeElapsed: document.getElementById('timeElapsed'),
            progressFill: document.getElementById('progressFill'),
            progressText: document.getElementById('progressText'),
            explanationPanel: document.getElementById('explanationPanel'),
            explanationContent: document.getElementById('explanationContent')
        };
        
        this.init();
    }
    
    init() {
        // Bind event listeners
        this.elements.startBtn.addEventListener('click', () => this.startAttack());
        this.elements.stopBtn.addEventListener('click', () => this.stopAttack());
        this.elements.resetBtn.addEventListener('click', () => this.reset());
        this.elements.clearLogsBtn.addEventListener('click', () => this.clearLogs());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Reduced motion check
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (prefersReducedMotion && e.key === 'm') {
                this.stopAttack();
                this.logMessage('Simulation paused due to reduced motion preference', 'warning');
            }
        });
        
        this.logMessage('Security simulator initialized. Ready to demonstrate attack patterns.', 'system');
    }
    
    /**
     * Sanitize text to prevent XSS
     */
    sanitize(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Format timestamp
     */
    getTimestamp() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }
    
    /**
     * Log message to terminal
     */
    logMessage(message, type = 'info') {
        const line = document.createElement('div');
        line.className = `terminal-line ${type}`;
        
        const timestamp = document.createElement('span');
        timestamp.className = 'timestamp';
        timestamp.textContent = `[${this.getTimestamp()}]`;
        
        const messageSpan = document.createElement('span');
        messageSpan.className = 'message';
        messageSpan.textContent = this.sanitize(message);
        
        line.appendChild(timestamp);
        line.appendChild(messageSpan);
        
        this.elements.terminal.appendChild(line);
        this.elements.terminal.scrollTop = this.elements.terminal.scrollHeight;
    }
    
    /**
     * Clear terminal logs
     */
    clearLogs() {
        this.elements.terminal.innerHTML = '';
        this.logMessage('Terminal cleared.', 'system');
    }
    
    /**
     * Update UI stats
     */
    updateStats() {
        this.elements.attemptCount.textContent = this.attemptCount;
        this.elements.rateLimitCount.textContent = this.rateLimitCount;
        
        if (this.startTime) {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            this.elements.timeElapsed.textContent = `${elapsed}s`;
        }
        
        // Update progress
        const progress = Math.min((this.attemptCount / this.commonPasswords.length) * 100, 100);
        this.elements.progressFill.style.width = `${progress}%`;
        this.elements.progressText.textContent = `${Math.floor(progress)}%`;
    }
    
    /**
     * Update system status badge
     */
    updateSystemStatus(status) {
        this.elements.systemStatus.textContent = status;
        this.elements.systemStatus.className = 'status-badge';
        
        switch(status) {
            case 'SECURE':
                this.elements.systemStatus.classList.add('status-secure');
                break;
            case 'UNDER ATTACK':
                this.elements.systemStatus.classList.add('status-attack');
                break;
            case 'LOCKED':
                this.elements.systemStatus.classList.add('status-locked');
                break;
            case 'RATE LIMITED':
                this.elements.systemStatus.classList.add('status-limited');
                break;
        }
    }
    
    /**
     * Check if rate limit is exceeded
     */
    checkRateLimit() {
        const now = Date.now();
        
        // Remove attempts outside the time window
        this.recentAttempts = this.recentAttempts.filter(
            time => now - time < this.RATE_LIMIT_WINDOW
        );
        
        // Check if rate limit exceeded
        if (this.recentAttempts.length >= this.RATE_LIMIT_THRESHOLD) {
            return true;
        }
        
        // Add current attempt
        this.recentAttempts.push(now);
        return false;
    }
    
    /**
     * Calculate progressive delay
     */
    calculateDelay() {
        // Exponential backoff: delay increases with each attempt
        return this.BASE_DELAY * Math.pow(1.2, Math.min(this.attemptCount, 10));
    }
    
    /**
     * Simulate single password attempt
     */
    async attemptPassword(password) {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.attemptCount++;
                
                // Check for account lockout
                if (this.attemptCount >= this.LOCKOUT_THRESHOLD) {
                    this.isLocked = true;
                    this.updateSystemStatus('LOCKED');
                    this.logMessage(`⚠️ ACCOUNT LOCKED after ${this.attemptCount} failed attempts`, 'error');
                    this.logMessage('Defense mechanism triggered: Account lockout activated', 'warning');
                    resolve({ success: false, locked: true });
                    return;
                }
                
                // Check rate limiting
                if (this.checkRateLimit()) {
                    this.rateLimitCount++;
                    this.updateSystemStatus('RATE LIMITED');
                    this.logMessage(`⏸️ Rate limit exceeded. Waiting for cooldown period...`, 'warning');
                    
                    // Wait for rate limit cooldown
                    setTimeout(() => {
                        this.updateSystemStatus('UNDER ATTACK');
                        resolve({ success: false, rateLimited: true });
                    }, 2000);
                    return;
                }
                
                // Simulate failed login attempt
                this.logMessage(`❌ Failed: Attempting password "${this.sanitize(password)}"`, 'error');
                this.progressiveDelay = this.calculateDelay();
                
                resolve({ success: false, locked: false, rateLimited: false });
            }, this.progressiveDelay);
        });
    }
    
    /**
     * Start brute force attack simulation
     */
    async startAttack() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.startTime = Date.now();
        this.currentPasswordIndex = this.attemptCount;
        
        // Update UI
        this.elements.startBtn.style.display = 'none';
        this.elements.stopBtn.style.display = 'inline-flex';
        this.updateSystemStatus('UNDER ATTACK');
        
        this.logMessage('='.repeat(60), 'system');
        this.logMessage('🚨 BRUTE FORCE ATTACK INITIATED', 'attack');
        this.logMessage(`Target: admin@enterprise-portal.local`, 'attack');
        this.logMessage(`Password list: ${this.commonPasswords.length} common passwords`, 'attack');
        this.logMessage('='.repeat(60), 'system');
        
        // Start timer
        this.timerInterval = setInterval(() => this.updateStats(), 100);
        
        // Execute attack
        for (let i = this.currentPasswordIndex; i < this.commonPasswords.length; i++) {
            if (!this.isRunning) {
                this.logMessage('Attack stopped by user.', 'warning');
                break;
            }
            
            this.currentPasswordIndex = i;
            const password = this.commonPasswords[i];
            const result = await this.attemptPassword(password);
            
            this.updateStats();
            
            if (result.locked) {
                this.stopAttack();
                this.showExplanation('locked');
                break;
            }
            
            if (result.rateLimited) {
                this.logMessage('Resuming attack after rate limit cooldown...', 'info');
            }
            
            // Check if all passwords exhausted
            if (i === this.commonPasswords.length - 1) {
                this.stopAttack();
                this.showExplanation('exhausted');
            }
        }
    }
    
    /**
     * Stop attack simulation
     */
    stopAttack() {
        this.isRunning = false;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Update UI
        this.elements.startBtn.style.display = 'inline-flex';
        this.elements.stopBtn.style.display = 'none';
        
        if (!this.isLocked) {
            this.updateSystemStatus('SECURE');
        }
        
        this.logMessage('='.repeat(60), 'system');
        this.logMessage('Attack simulation ended.', 'system');
        this.logMessage('='.repeat(60), 'system');
    }
    
    /**
     * Reset simulation
     */
    reset() {
        this.stopAttack();
        
        // Reset state
        this.attemptCount = 0;
        this.rateLimitCount = 0;
        this.currentPasswordIndex = 0;
        this.startTime = null;
        this.recentAttempts = [];
        this.isLocked = false;
        this.progressiveDelay = this.BASE_DELAY;
        
        // Reset UI
        this.updateSystemStatus('SECURE');
        this.updateStats();
        this.elements.progressFill.style.width = '0%';
        this.elements.progressText.textContent = '0%';
        this.elements.explanationPanel.style.display = 'none';
        
        this.clearLogs();
        this.logMessage('System reset complete. Ready for new simulation.', 'system');
    }
    
    /**
     * Show educational explanation
     */
    showExplanation(reason) {
        const explanations = {
            locked: {
                title: '🔒 Account Lockout Triggered',
                why: 'The system detected too many failed login attempts and automatically locked the account to prevent unauthorized access.',
                defenses: [
                    '<strong>Account Lockout:</strong> After 10 failed attempts, the account is temporarily or permanently locked.',
                    '<strong>Rate Limiting:</strong> Only 5 attempts allowed per 10-second window, slowing down attackers.',
                    '<strong>Progressive Delays:</strong> Each failed attempt increases response time exponentially.',
                    '<strong>Security Logging:</strong> All attempts are recorded for forensic analysis.'
                ],
                takeaway: 'Brute force attacks become impractical when proper security measures are implemented. A strong, unique password combined with multi-factor authentication makes accounts virtually impossible to crack through brute force.'
            },
            exhausted: {
                title: '✅ Password List Exhausted',
                why: 'All common passwords were tested without success. The system remained secure throughout the attack.',
                defenses: [
                    '<strong>Strong Password Policy:</strong> User chose a password not in common wordlists.',
                    '<strong>Rate Limiting:</strong> Dramatically slowed down attack attempts.',
                    '<strong>Account Monitoring:</strong> Security team would be alerted to suspicious activity.',
                    '<strong>Progressive Delays:</strong> Made each attempt take longer, increasing attack duration.'
                ],
                takeaway: 'Even without lockout, rate limiting and progressive delays make brute force attacks time-prohibitive. A password not in common dictionaries, combined with rate limiting, can withstand automated attacks indefinitely.'
            }
        };
        
        const explanation = explanations[reason];
        if (!explanation) return;
        
        let html = `
            <div class="explanation-section">
                <h3>${explanation.title}</h3>
                <div class="explanation-text">
                    <h4>Why the attack failed:</h4>
                    <p>${explanation.why}</p>
                </div>
            </div>
            
            <div class="explanation-section">
                <h4>Security Measures That Protected the System:</h4>
                <ul class="defense-list-explanation">
                    ${explanation.defenses.map(def => `<li>${def}</li>`).join('')}
                </ul>
            </div>
            
            <div class="explanation-section takeaway">
                <h4>🎓 Key Takeaway:</h4>
                <p>${explanation.takeaway}</p>
            </div>
            
            <div class="explanation-section recommendations">
                <h4>🛡️ Best Practices for Secure Authentication:</h4>
                <ul>
                    <li><strong>Use Strong Passwords:</strong> Minimum 12 characters, mix of uppercase, lowercase, numbers, and symbols</li>
                    <li><strong>Enable MFA:</strong> Multi-factor authentication adds a critical second layer of security</li>
                    <li><strong>Avoid Common Passwords:</strong> Never use passwords from common dictionaries</li>
                    <li><strong>Use Password Managers:</strong> Generate and store unique passwords for each account</li>
                    <li><strong>Implement Rate Limiting:</strong> Limit login attempts per time window</li>
                    <li><strong>Monitor for Anomalies:</strong> Alert on suspicious login patterns</li>
                    <li><strong>Use CAPTCHA:</strong> Add human verification after failed attempts</li>
                </ul>
            </div>
            
            <div class="explanation-section stats">
                <h4>📊 Attack Statistics:</h4>
                <div class="stat-grid">
                    <div class="stat-box">
                        <div class="stat-number">${this.attemptCount}</div>
                        <div class="stat-label">Total Attempts</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-number">${this.rateLimitCount}</div>
                        <div class="stat-label">Rate Limited</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-number">${Math.floor((Date.now() - this.startTime) / 1000)}s</div>
                        <div class="stat-label">Duration</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-number">${Math.floor(this.progressiveDelay)}ms</div>
                        <div class="stat-label">Final Delay</div>
                    </div>
                </div>
            </div>
        `;
        
        this.elements.explanationContent.innerHTML = html;
        this.elements.explanationPanel.style.display = 'block';
        
        // Scroll to explanation
        this.elements.explanationPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Initialize simulator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SecuritySimulator();
});
