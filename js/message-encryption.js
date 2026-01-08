/**
 * Message Encoding Feature (Educational Demonstration)
 * 
 * IMPORTANT: This demonstrates Base64 encoding, NOT encryption.
 * Base64 is a text encoding scheme - it's easily reversible and provides NO security.
 * 
 * Real encryption requires:
 * - Backend server-side encryption (AES-256, RSA, etc.)
 * - Secure key management
 * - HTTPS/TLS for transport security
 * 
 * This feature is for educational purposes only to show encoding concepts.
 */

class MessageEncoding {
    constructor() {
        this.form = document.getElementById('contactForm');
        if (!this.form) return;

        this.init();
    }

    init() {
        // Add encoding toggle button
        const messageGroup = this.form.querySelector('#contactMessage')?.closest('.form-group');
        if (!messageGroup) return;

        const encodingControls = document.createElement('div');
        encodingControls.className = 'encoding-controls';
        encodingControls.innerHTML = `
            <label class="encoding-toggle">
                <input type="checkbox" id="encodingToggle">
                <span class="encoding-label">
                    <i class="fas fa-code"></i> Enable Base64 Encoding (Demo)
                </span>
                <span class="encoding-tooltip" title="Base64 is NOT encryption - it's easily reversible. This is for educational purposes only.">
                    <i class="fas fa-question-circle"></i>
                </span>
            </label>
            <div class="encoding-info" style="display: none;">
                <div class="encoding-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Educational Notice:</strong> Base64 is encoding, not encryption. 
                    It provides <strong>no security</strong> - anyone can decode it instantly.
                </div>
                <p><i class="fas fa-info-circle"></i> Your message will be converted to Base64 format before display.</p>
                <div class="encoded-preview">
                    <strong>Encoded Preview:</strong>
                    <code id="encodedPreview"></code>
                </div>
                <div class="encoding-explanation">
                    <details>
                        <summary>Why Base64 isn't encryption</summary>
                        <ul>
                            <li>No secret key required - anyone can decode</li>
                            <li>Deterministic - same input = same output</li>
                            <li>Reversible with standard tools (atob function)</li>
                            <li>Used for data transmission, not security</li>
                        </ul>
                        <p><strong>Real encryption requires:</strong> Backend server, secret keys, AES-256/RSA algorithms, and HTTPS.</p>
                    </details>
                </div>
            </div>
        `;

        messageGroup.appendChild(encodingControls);

        // Event listeners
        const toggle = document.getElementById('encodingToggle');
        const messageInput = document.getElementById('contactMessage');
        const encodingInfo = encodingControls.querySelector('.encoding-info');
        const encodedPreview = document.getElementById('encodedPreview');

        toggle.addEventListener('change', (e) => {
            encodingInfo.style.display = e.target.checked ? 'block' : 'none';
            if (e.target.checked && messageInput.value) {
                this.updatePreview(messageInput.value);
            }
        });

        messageInput.addEventListener('input', (e) => {
            if (toggle.checked) {
                this.updatePreview(e.target.value);
            }
        });

        // Intercept form submission for demonstration
        this.form.addEventListener('submit', (e) => {
            if (toggle.checked) {
                this.handleEncodedSubmission(e);
            }
        }, true);
    }

    updatePreview(message) {
        const preview = document.getElementById('encodedPreview');
        if (!preview) return;

        if (message.trim()) {
            const encoded = this.encode(message);
            preview.textContent = encoded.substring(0, 50) + (encoded.length > 50 ? '...' : '');
        } else {
            preview.textContent = 'Enter a message to see encoded preview';
        }
    }

    encode(message) {
        try {
            // Base64 encoding (NOT encryption)
            return btoa(unescape(encodeURIComponent(message)));
        } catch (e) {
            // Encoding failed - return original
            return message;
        }
    }

    decode(encoded) {
        try {
            // Base64 decoding (easily reversible)
            return decodeURIComponent(escape(atob(encoded)));
        } catch (e) {
            // Decoding failed - return original
            return encoded;
        }
    }

    handleEncodedSubmission(e) {
        const messageInput = document.getElementById('contactMessage');
        const originalMessage = messageInput.value;
        const encodedMessage = this.encode(originalMessage);

        // Show encoding notification
        const formMessage = document.getElementById('formMessage');
        if (formMessage) {
            formMessage.style.display = 'block';
            formMessage.className = 'form-message form-info';
            formMessage.innerHTML = `
                <i class="fas fa-info-circle"></i>
                <strong>Message Encoded (Educational Demo)</strong>
                <div class="encoding-warning-inline">
                    ⚠️ <strong>Note:</strong> This is Base64 encoding, NOT secure encryption.
                </div>
                <div class="encoding-details">
                    <p>Original Length: ${originalMessage.length} characters</p>
                    <p>Encoded Length: ${encodedMessage.length} characters</p>
                    <p>Method: Base64 (Reversible Encoding)</p>
                    <p>Security Level: <strong style="color: #ff4444;">NONE</strong> - Anyone can decode this</p>
                </div>
                <details class="encoding-technical">
                    <summary>View Technical Details</summary>
                    <pre>Original: ${originalMessage.substring(0, 30)}...
Encoded: ${encodedMessage.substring(0, 50)}...
Decoded Back: ${this.decode(encodedMessage).substring(0, 30)}...</pre>
                    <p style="margin-top: 10px; font-size: 12px; color: #ffaa00;">
                        <strong>Try it yourself:</strong> Open browser console and type: <code>atob("${encodedMessage.substring(0, 40)}")</code>
                    </p>
                </details>
            `;

            setTimeout(() => {
                formMessage.style.display = 'none';
            }, 12000);
        }

        // Educational console output (part of the demo feature)
        // These logs teach users about Base64 encoding
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('%c📝 Base64 Encoding Demo (NOT Encryption)', 'color: #ffaa00; font-weight: bold; font-size: 14px;');
            console.log('Original Message:', originalMessage);
            console.log('Encoded (Base64):', encodedMessage);
            console.log('Decoded Back:', this.decode(encodedMessage));
            console.log('%c⚠️ Security Notice: Base64 provides NO protection. Use HTTPS + backend encryption for real security.', 'color: #ff4444; font-weight: bold;');
        }
    }
}

// Initialize message encoding demo
document.addEventListener('DOMContentLoaded', () => {
    new MessageEncoding();
});
