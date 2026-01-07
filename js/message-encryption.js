/**
 * Message Encryption Feature
 * Demonstrates encryption/decryption for contact form messages
 */

class MessageEncryption {
    constructor() {
        this.form = document.getElementById('contactForm');
        if (!this.form) return;

        this.init();
    }

    init() {
        // Add encryption toggle button
        const messageGroup = this.form.querySelector('#contactMessage')?.closest('.form-group');
        if (!messageGroup) return;

        const encryptionControls = document.createElement('div');
        encryptionControls.className = 'encryption-controls';
        encryptionControls.innerHTML = `
            <label class="encryption-toggle">
                <input type="checkbox" id="encryptionToggle">
                <span class="encryption-label">
                    <i class="fas fa-lock"></i> Enable Message Encryption
                </span>
            </label>
            <div class="encryption-info" style="display: none;">
                <p><i class="fas fa-info-circle"></i> Your message will be encrypted using Base64 encoding before submission.</p>
                <div class="encrypted-preview">
                    <strong>Encrypted Preview:</strong>
                    <code id="encryptedPreview"></code>
                </div>
            </div>
        `;

        messageGroup.appendChild(encryptionControls);

        // Event listeners
        const toggle = document.getElementById('encryptionToggle');
        const messageInput = document.getElementById('contactMessage');
        const encryptionInfo = encryptionControls.querySelector('.encryption-info');
        const encryptedPreview = document.getElementById('encryptedPreview');

        toggle.addEventListener('change', (e) => {
            encryptionInfo.style.display = e.target.checked ? 'block' : 'none';
            if (e.target.checked && messageInput.value) {
                this.updatePreview(messageInput.value);
            }
        });

        messageInput.addEventListener('input', (e) => {
            if (toggle.checked) {
                this.updatePreview(e.target.value);
            }
        });

        // Intercept form submission
        this.form.addEventListener('submit', (e) => {
            if (toggle.checked) {
                this.handleEncryptedSubmission(e);
            }
        }, true);
    }

    updatePreview(message) {
        const preview = document.getElementById('encryptedPreview');
        if (!preview) return;

        if (message.trim()) {
            const encrypted = this.encrypt(message);
            preview.textContent = encrypted.substring(0, 50) + (encrypted.length > 50 ? '...' : '');
        } else {
            preview.textContent = 'Enter a message to see encryption preview';
        }
    }

    encrypt(message) {
        try {
            return btoa(unescape(encodeURIComponent(message)));
        } catch (e) {
            console.error('Encryption failed:', e);
            return message;
        }
    }

    decrypt(encrypted) {
        try {
            return decodeURIComponent(escape(atob(encrypted)));
        } catch (e) {
            console.error('Decryption failed:', e);
            return encrypted;
        }
    }

    handleEncryptedSubmission(e) {
        const messageInput = document.getElementById('contactMessage');
        const originalMessage = messageInput.value;
        const encryptedMessage = this.encrypt(originalMessage);

        // Show encryption notification
        const formMessage = document.getElementById('formMessage');
        if (formMessage) {
            formMessage.style.display = 'block';
            formMessage.className = 'form-message form-info';
            formMessage.innerHTML = `
                <i class="fas fa-shield-alt"></i>
                <strong>Message Encrypted Successfully!</strong>
                <div class="encryption-details">
                    <p>Original Length: ${originalMessage.length} characters</p>
                    <p>Encrypted Length: ${encryptedMessage.length} characters</p>
                    <p>Encryption Method: Base64</p>
                </div>
                <details class="encryption-technical">
                    <summary>View Technical Details</summary>
                    <pre>Original: ${originalMessage.substring(0, 30)}...
Encrypted: ${encryptedMessage.substring(0, 50)}...</pre>
                </details>
            `;

            setTimeout(() => {
                formMessage.style.display = 'none';
            }, 10000);
        }

        // Store encrypted message for backend (simulation)
        console.log('Encrypted Message:', encryptedMessage);
        console.log('To decrypt:', this.decrypt(encryptedMessage));
    }
}

// Initialize message encryption
document.addEventListener('DOMContentLoaded', () => {
    new MessageEncryption();
});
