/**
 * Interactive Skill Demonstrations
 * Provides clickable demos for key technical skills
 */

const skillDemos = {
    'Python': {
        title: 'Python Demo',
        code: `# Flask API Example
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/skills')
def get_skills():
    return jsonify({
        'developer': 'Azhar Ali',
        'skills': ['Python', 'Flask', 'FastAPI'],
        'status': 'active'
    })

if __name__ == '__main__':
    app.run(debug=True)`,
        description: 'Backend API development with Flask'
    },
    'JavaScript/Node.js': {
        title: 'Node.js Demo',
        code: `// Express.js Server
const express = require('express');
const app = express();

app.get('/api/projects', (req, res) => {
    res.json({
        projects: [
            'Real-time Chat',
            'Task Manager',
            'E-commerce Platform'
        ],
        count: 3
    });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});`,
        description: 'Full-stack development with Express.js'
    },
    'MongoDB': {
        title: 'MongoDB Demo',
        code: `// MongoDB Query Example
db.users.aggregate([
    {
        $match: { status: 'active' }
    },
    {
        $group: {
            _id: '$role',
            count: { $sum: 1 }
        }
    },
    {
        $sort: { count: -1 }
    }
]);`,
        description: 'Database aggregation and queries'
    },
    'Socket.io': {
        title: 'Socket.io Demo',
        code: `// Real-time WebSocket
const io = require('socket.io')(3000);

io.on('connection', (socket) => {
    console.log('User connected');
    
    socket.on('message', (data) => {
        // Broadcast to all clients
        io.emit('message', {
            user: data.user,
            text: data.text,
            timestamp: Date.now()
        });
    });
    
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});`,
        description: 'Real-time bidirectional communication'
    },
    'Wireshark': {
        title: 'Wireshark Analysis',
        code: `# Network Traffic Analysis
# Display Filter Examples:

# HTTP traffic only
http

# Specific IP address
ip.addr == 192.168.1.100

# TCP packets with SYN flag
tcp.flags.syn == 1

# DNS queries
dns.flags.response == 0

# Follow TCP stream
tcp.stream eq 42`,
        description: 'Network protocol analysis and monitoring'
    },
    'Burp Suite': {
        title: 'Burp Suite Testing',
        code: `# Web Application Security Testing

1. Intercept Requests
   - Capture HTTP/HTTPS traffic
   - Modify requests in real-time
   
2. Scanner Features
   - Automated vulnerability detection
   - SQL Injection testing
   - XSS detection
   
3. Intruder Tool
   - Brute force attacks
   - Fuzzing parameters
   - Payload automation

4. Repeater
   - Manual request manipulation
   - Response analysis`,
        description: 'Web application penetration testing'
    }
};

class SkillDemoModal {
    constructor() {
        this.modal = null;
        this.init();
    }

    init() {
        // Create modal element
        this.modal = document.createElement('div');
        this.modal.className = 'skill-demo-modal';
        this.modal.innerHTML = `
            <div class="skill-demo-content">
                <button class="skill-demo-close" aria-label="Close demo">&times;</button>
                <h3 class="skill-demo-title"></h3>
                <p class="skill-demo-description"></p>
                <pre class="skill-demo-code"><code></code></pre>
                <button class="skill-demo-copy-btn">
                    <i class="fas fa-copy"></i> Copy Code
                </button>
            </div>
        `;
        document.body.appendChild(this.modal);

        // Event listeners
        this.modal.querySelector('.skill-demo-close').addEventListener('click', () => this.close());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });
        this.modal.querySelector('.skill-demo-copy-btn').addEventListener('click', () => this.copyCode());
        
        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.close();
            }
        });
    }

    show(skillName) {
        const demo = skillDemos[skillName];
        if (!demo) return;

        this.modal.querySelector('.skill-demo-title').textContent = demo.title;
        this.modal.querySelector('.skill-demo-description').textContent = demo.description;
        this.modal.querySelector('.skill-demo-code code').textContent = demo.code;
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    copyCode() {
        const code = this.modal.querySelector('.skill-demo-code code').textContent;
        navigator.clipboard.writeText(code).then(() => {
            const btn = this.modal.querySelector('.skill-demo-copy-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.remove('copied');
            }, 2000);
        });
    }
}

// Initialize skill demos
document.addEventListener('DOMContentLoaded', () => {
    const demoModal = new SkillDemoModal();

    // Add click handlers to skill items
    document.querySelectorAll('.skill-item').forEach(item => {
        const skillName = item.querySelector('.skill-name')?.textContent.trim();
        if (skillDemos[skillName]) {
            item.classList.add('has-demo');
            item.addEventListener('click', () => {
                demoModal.show(skillName);
            });
            item.style.cursor = 'pointer';
            item.title = 'Click to see code demo';
        }
    });
});
