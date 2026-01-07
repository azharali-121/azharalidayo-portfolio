/**
 * Hacker Terminal Animation
 * Simulates a terminal boot sequence with typing effect
 */

class HackerTerminal {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.options = {
            typingSpeed: 50,
            messageDelay: 300,
            messages: [
                'booting portfolio system...',
                'initializing secure connection...',
                'scanning skills database...',
                'loading projects archive...',
                'establishing secure channel...',
                'connection established: Azhar Ali',
                'system ready. welcome.'
            ],
            ...options
        };

        this.currentMessageIndex = 0;
        this.init();
    }

    init() {
        this.container.innerHTML = '';
        this.runTerminal();
    }

    async typeMessage(message) {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        this.container.appendChild(line);

        const prefix = document.createElement('span');
        prefix.className = 'terminal-prefix';
        prefix.textContent = '$ ';
        line.appendChild(prefix);

        const text = document.createElement('span');
        line.appendChild(text);

        for (let i = 0; i < message.length; i++) {
            text.textContent += message[i];
            await new Promise(resolve => setTimeout(resolve, this.options.typingSpeed));
        }

        this.container.scrollTop = this.container.scrollHeight;
        await new Promise(resolve => setTimeout(resolve, this.options.messageDelay));
    }

    async runTerminal() {
        for (const message of this.options.messages) {
            await this.typeMessage(message);
        }
        
        // Add blinking cursor at the end
        const cursorLine = document.createElement('div');
        cursorLine.className = 'terminal-line';
        cursorLine.innerHTML = '<span class="terminal-prefix">$ </span><span class="terminal-cursor">_</span>';
        this.container.appendChild(cursorLine);
    }
}

// Auto-initialize if terminal element exists
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('hacker-terminal')) {
        new HackerTerminal('hacker-terminal');
    }
});
