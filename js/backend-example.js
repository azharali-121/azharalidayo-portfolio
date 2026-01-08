/**
 * Backend CSRF Validation Example
 * 
 * This file demonstrates how to implement CSRF token validation
 * on your backend API endpoint.
 * 
 * IMPORTANT: This is example code showing the pattern.
 * Adapt this to your backend framework (Express, Flask, Django, etc.)
 */

// ============================================================================
// EXAMPLE 1: Node.js + Express.js Backend
// ============================================================================

/**
 * Express.js implementation with CSRF validation
 * Install: npm install express express-session cookie-parser
 */

const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

const app = express();

// Rate limiting storage (use Redis in production)
const rateLimitStore = new Map();
const RATE_LIMIT_MAX = 5; // Maximum requests
const RATE_LIMIT_WINDOW = 600000; // 10 minutes in milliseconds

// Middleware setup
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-here',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 3600000 // 1 hour
    }
}));

/**
 * CSRF Token Validation Middleware
 * Verifies token from request header matches session token
 */
function validateCSRFToken(req, res, next) {
    const tokenFromHeader = req.headers['x-csrf-token'];
    const tokenFromBody = req.body.csrf_token;
    
    // Accept token from either header or body
    const clientToken = tokenFromHeader || tokenFromBody;
    
    if (!clientToken) {
        return res.status(403).json({
            success: false,
            error: 'CSRF token missing'
        });
    }
    
    // In a real implementation, validate against server-side stored token
    // This example uses constant-time comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
        Buffer.from(clientToken),
        Buffer.from(req.session.csrfToken || '')
    );
    
    if (!isValid) {
        return res.status(403).json({
            success: false,
            error: 'Invalid CSRF token'
        });
    }
    
    next();
}

/**
 * IP-Based Rate Limiting Middleware
 * Limits requests per IP address to prevent spam and DOS attacks
 * Current limit: 5 requests per 10 minutes per IP
 */
function rateLimitByIP(req, res, next) {
    // Get client IP (consider proxy headers in production)
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
                     req.headers['x-real-ip'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress;
    
    const now = Date.now();
    
    // Get or create rate limit entry for this IP
    let ipData = rateLimitStore.get(clientIP) || { requests: [], blocked: false };
    
    // Clean old requests outside time window
    ipData.requests = ipData.requests.filter(timestamp => 
        (now - timestamp) < RATE_LIMIT_WINDOW
    );
    
    // Check if rate limit exceeded
    if (ipData.requests.length >= RATE_LIMIT_MAX) {
        const oldestRequest = ipData.requests[0];
        const resetTime = oldestRequest + RATE_LIMIT_WINDOW;
        const minutesUntilReset = Math.ceil((resetTime - now) / 60000);
        
        // Update store
        ipData.blocked = true;
        rateLimitStore.set(clientIP, ipData);
        
        // Log excessive requests
        console.warn(`[RATE LIMIT] IP ${clientIP} exceeded limit. Blocked for ${minutesUntilReset} minutes.`);
        
        return res.status(429).json({
            success: false,
            error: 'Rate limit exceeded',
            message: `Too many requests. Please wait ${minutesUntilReset} minute${minutesUntilReset !== 1 ? 's' : ''} before trying again.`,
            retryAfter: Math.ceil((resetTime - now) / 1000), // seconds
            limit: RATE_LIMIT_MAX,
            window: RATE_LIMIT_WINDOW / 60000 // minutes
        });
    }
    
    // Record this request
    ipData.requests.push(now);
    ipData.blocked = false;
    rateLimitStore.set(clientIP, ipData);
    
    // Add rate limit headers to response
    res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX);
    res.setHeader('X-RateLimit-Remaining', RATE_LIMIT_MAX - ipData.requests.length);
    res.setHeader('X-RateLimit-Reset', Math.ceil((ipData.requests[0] + RATE_LIMIT_WINDOW) / 1000));
    
    next();
}

// Clean up rate limit store periodically (every 15 minutes)
setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of rateLimitStore.entries()) {
        // Remove entries with no recent requests
        const recentRequests = data.requests.filter(timestamp => 
            (now - timestamp) < RATE_LIMIT_WINDOW
        );
        if (recentRequests.length === 0) {
            rateLimitStore.delete(ip);
        }
    }
    console.log(`[CLEANUP] Rate limit store size: ${rateLimitStore.size} IPs`);
}, 900000); // 15 minutes

/**
 * Generate and send CSRF token endpoint
 * Client should call this to get initial token
 */
app.get('/api/csrf-token', (req, res) => {
    const token = crypto.randomBytes(32).toString('hex');
    req.session.csrfToken = token;
    
    res.json({
        success: true,
        csrf_token: token
    });
});

/**
 * Contact form endpoint with CSRF protection and IP-based rate limiting
 * Rate limit: 5 requests per 10 minutes per IP
 */
app.post('/api/contact', rateLimitByIP, validateCSRFToken, async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        // Session-based rate limiting (additional protection)
        // This complements IP-based rate limiting
        const lastSubmission = req.session.lastSubmissionTime || 0;
        const now = Date.now();
        const MIN_INTERVAL = 60000; // 1 minute minimum between submissions from same session
        
        if (now - lastSubmission < MIN_INTERVAL) {
            return res.status(429).json({
                success: false,
                error: 'Please wait before submitting again'
            });
        }
        
        // Validate input
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required'
            });
        }
        
        // Sanitize inputs (basic example - use proper sanitization library)
        const sanitizedData = {
            name: name.trim().substring(0, 50),
            email: email.trim().toLowerCase().substring(0, 100),
            subject: subject.trim().substring(0, 100),
            message: message.trim().substring(0, 1000)
        };
        
        // Email validation
        const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
        if (!emailRegex.test(sanitizedData.email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email address'
            });
        }
        
        // TODO: Send email using your email service
        // Example with nodemailer:
        /*
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        
        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: process.env.CONTACT_EMAIL,
            subject: `Portfolio Contact: ${sanitizedData.subject}`,
            text: `
                Name: ${sanitizedData.name}
                Email: ${sanitizedData.email}
                Subject: ${sanitizedData.subject}
                
                Message:
                ${sanitizedData.message}
            `
        });
        */
        
        // Update session
        req.session.lastSubmissionTime = now;
        
        // Generate new CSRF token for next request
        const newToken = crypto.randomBytes(32).toString('hex');
        req.session.csrfToken = newToken;
        
        res.json({
            success: true,
            message: 'Message sent successfully!',
            csrf_token: newToken // Send new token for rotation
        });
        
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send message. Please try again.'
        });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


// ============================================================================
// EXAMPLE 2: Python + Flask Backend
// ============================================================================

/**
 * Flask implementation with CSRF validation
 * Install: pip install flask flask-wtf
 * 
 * Python code (save as app.py):
 */

/*
from flask import Flask, request, jsonify, session
from flask_wtf.csrf import CSRFProtect, generate_csrf
import os
import time
import re
from collections import defaultdict
from functools import wraps

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')
app.config['SESSION_COOKIE_SECURE'] = True  # HTTPS only
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Strict'

csrf = CSRFProtect(app)

# Email validation regex
EMAIL_REGEX = re.compile(r'^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$', re.IGNORECASE)

# IP-based rate limiting storage
rate_limit_store = defaultdict(list)
RATE_LIMIT_MAX = 5  # Maximum requests
RATE_LIMIT_WINDOW = 600  # 10 minutes in seconds

def rate_limit_by_ip(f):
    """
    Decorator for IP-based rate limiting
    Limits: 5 requests per 10 minutes per IP
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get client IP
        client_ip = request.headers.get('X-Forwarded-For', '').split(',')[0].strip() or \
                    request.headers.get('X-Real-IP') or \
                    request.remote_addr
        
        now = time.time()
        
        # Clean old requests
        rate_limit_store[client_ip] = [
            timestamp for timestamp in rate_limit_store[client_ip]
            if (now - timestamp) < RATE_LIMIT_WINDOW
        ]
        
        # Check rate limit
        if len(rate_limit_store[client_ip]) >= RATE_LIMIT_MAX:
            oldest_request = rate_limit_store[client_ip][0]
            reset_time = oldest_request + RATE_LIMIT_WINDOW
            minutes_until_reset = int((reset_time - now) / 60) + 1
            
            app.logger.warning(f'[RATE LIMIT] IP {client_ip} exceeded limit. Blocked for {minutes_until_reset} minutes.')
            
            return jsonify({
                'success': False,
                'error': 'Rate limit exceeded',
                'message': f'Too many requests. Please wait {minutes_until_reset} minute{"s" if minutes_until_reset != 1 else ""} before trying again.',
                'retryAfter': int(reset_time - now),
                'limit': RATE_LIMIT_MAX,
                'window': RATE_LIMIT_WINDOW / 60
            }), 429
        
        # Record request
        rate_limit_store[client_ip].append(now)
        
        return f(*args, **kwargs)
    return decorated_function

@app.route('/api/csrf-token', methods=['GET'])
def get_csrf_token():
    """Generate and return CSRF token"""
    token = generate_csrf()
    return jsonify({
        'success': True,
        'csrf_token': token
    })

@app.route('/api/contact', methods=['POST'])
@rate_limit_by_ip
def contact():
    """Contact form endpoint with CSRF protection and IP-based rate limiting"""
    try:
        # CSRF validation is automatic with flask-wtf
        # Token should be in X-CSRFToken header or csrf_token field
        
        data = request.get_json()
        
        # Session-based rate limiting (additional protection)
        last_submission = session.get('last_submission_time', 0)
        now = time.time()
        MIN_INTERVAL = 60  # 1 minute minimum between submissions
        
        if now - last_submission < MIN_INTERVAL:
            return jsonify({
                'success': False,
                'error': 'Please wait before submitting again'
            }), 429
        
        # Validate required fields
        name = data.get('name', '').strip()[:50]
        email = data.get('email', '').strip().lower()[:100]
        subject = data.get('subject', '').strip()[:100]
        message = data.get('message', '').strip()[:1000]
        
        if not all([name, email, subject, message]):
            return jsonify({
                'success': False,
                'error': 'All fields are required'
            }), 400
        
        # Email validation
        if not EMAIL_REGEX.match(email):
            return jsonify({
                'success': False,
                'error': 'Invalid email address'
            }), 400
        
        # TODO: Send email using your email service
        # Example with smtplib or SendGrid
        
        # Update session
        session['last_submission_time'] = now
        
        return jsonify({
            'success': True,
            'message': 'Message sent successfully!',
            'csrf_token': generate_csrf()  # New token for rotation
        })
        
    except Exception as e:
        app.logger.error(f'Contact form error: {e}')
        return jsonify({
            'success': False,
            'error': 'Failed to send message. Please try again.'
        }), 500

if __name__ == '__main__':
    app.run(debug=False, port=5000)
*/


// ============================================================================
// EXAMPLE 3: PHP Backend
// ============================================================================

/*
<?php
// csrf_contact.php

// Start session
session_start();

// Rate limiting configuration
define('RATE_LIMIT_MAX', 5);
define('RATE_LIMIT_WINDOW', 600); // 10 minutes in seconds

// Security headers
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

// CORS (adjust origin for your domain)
header('Access-Control-Allow-Origin: https://your-domain.com');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
header('Access-Control-Allow-Credentials: true');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

/**
 * Get client IP address
 */
function getClientIP() {
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        return trim($ips[0]);
    }
    if (!empty($_SERVER['HTTP_X_REAL_IP'])) {
        return $_SERVER['HTTP_X_REAL_IP'];
    }
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

/**
 * Check IP-based rate limit
 * Returns: ['allowed' => bool, 'message' => string]
 */
function checkRateLimit() {
    $clientIP = getClientIP();
    $now = time();
    
    // Initialize rate limit storage file
    $storageFile = sys_get_temp_dir() . '/rate_limit_store.json';
    $store = [];
    
    if (file_exists($storageFile)) {
        $store = json_decode(file_get_contents($storageFile), true) ?: [];
    }
    
    // Clean old entries
    if (isset($store[$clientIP])) {
        $store[$clientIP] = array_filter($store[$clientIP], function($timestamp) use ($now) {
            return ($now - $timestamp) < RATE_LIMIT_WINDOW;
        });
    } else {
        $store[$clientIP] = [];
    }
    
    // Check limit
    if (count($store[$clientIP]) >= RATE_LIMIT_MAX) {
        $oldestRequest = min($store[$clientIP]);
        $resetTime = $oldestRequest + RATE_LIMIT_WINDOW;
        $minutesUntilReset = ceil(($resetTime - $now) / 60);
        
        error_log("[RATE LIMIT] IP $clientIP exceeded limit. Blocked for $minutesUntilReset minutes.");
        
        return [
            'allowed' => false,
            'message' => "Too many requests. Please wait $minutesUntilReset minute" . 
                        ($minutesUntilReset != 1 ? 's' : '') . " before trying again.",
            'retryAfter' => $resetTime - $now
        ];
    }
    
    // Record request
    $store[$clientIP][] = $now;
    
    // Save updated store
    file_put_contents($storageFile, json_encode($store));
    
    return ['allowed' => true];
}

/**
 * Generate CSRF token
 */
function generateCSRFToken() {
    return bin2hex(random_bytes(32));
}

/**
 * Validate CSRF token
 */
function validateCSRFToken($token) {
    if (!isset($_SESSION['csrf_token'])) {
        return false;
    }
    return hash_equals($_SESSION['csrf_token'], $token);
}

// GET: Return CSRF token
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $token = generateCSRFToken();
    $_SESSION['csrf_token'] = $token;
    
    echo json_encode([
        'success' => true,
        'csrf_token' => $token
    ]);
    exit;
}

// POST: Handle contact form
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check IP-based rate limit
    $rateLimitCheck = checkRateLimit();
    if (!$rateLimitCheck['allowed']) {
        http_response_code(429);
        echo json_encode([
            'success' => false,
            'error' => 'Rate limit exceeded',
            'message' => $rateLimitCheck['message'],
            'retryAfter' => $rateLimitCheck['retryAfter']
        ]);
        exit;
    }
    
    // Get JSON data
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Get CSRF token from header or body
    $csrfToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? $data['csrf_token'] ?? null;
    
    // Validate CSRF token
    if (!$csrfToken || !validateCSRFToken($csrfToken)) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid CSRF token'
        ]);
        exit;
    }
    
    // Rate limiting
    $lastSubmission = $_SESSION['last_submission_time'] ?? 0;
    $now = time();
    $minInterval = 60; // 1 minute
    
    if ($now - $lastSubmission < $minInterval) {
        http_response_code(429);
        echo json_encode([
            'success' => false,
            'error' => 'Please wait before submitting again'
        ]);
        exit;
    }
    
    // Sanitize and validate input
    $name = htmlspecialchars(trim($data['name'] ?? ''), ENT_QUOTES, 'UTF-8');
    $email = filter_var($data['email'] ?? '', FILTER_SANITIZE_EMAIL);
    $subject = htmlspecialchars(trim($data['subject'] ?? ''), ENT_QUOTES, 'UTF-8');
    $message = htmlspecialchars(trim($data['message'] ?? ''), ENT_QUOTES, 'UTF-8');
    
    // Validate required fields
    if (empty($name) || empty($email) || empty($subject) || empty($message)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'All fields are required'
        ]);
        exit;
    }
    
    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid email address'
        ]);
        exit;
    }
    
    // TODO: Send email
    // Example with mail() or PHPMailer
    
    // Update session
    $_SESSION['last_submission_time'] = $now;
    
    // Generate new token
    $newToken = generateCSRFToken();
    $_SESSION['csrf_token'] = $newToken;
    
    echo json_encode([
        'success' => true,
        'message' => 'Message sent successfully!',
        'csrf_token' => $newToken
    ]);
    exit;
}

// Invalid method
http_response_code(405);
echo json_encode([
    'success' => false,
    'error' => 'Method not allowed'
]);
?>
*/


// ============================================================================
// DEPLOYMENT CHECKLIST
// ============================================================================

/**
 * BEFORE DEPLOYING TO PRODUCTION:
 * 
 * ✅ FRONTEND (form-validation.js):
 * 1. Set BACKEND_API_URL to your production endpoint
 * 2. Ensure HTTPS is enabled (required for secure cookies)
 * 3. Test CSRF token injection in contact form
 * 
 * ✅ BACKEND:
 * 1. Implement one of the examples above for your stack
 * 2. Set strong SESSION_SECRET environment variable
 * 3. Enable HTTPS (Let's Encrypt recommended)
 * 4. Configure CORS for your domain
 * 5. Set up email service (SendGrid, AWS SES, SMTP)
 * 6. Implement rate limiting (prevent spam/DOS)
 * 7. Add input sanitization and validation
 * 8. Enable session security (httpOnly, secure, sameSite)
 * 9. Add logging for failed CSRF attempts
 * 10. Test token rotation after submission
 * 
 * ✅ SECURITY BEST PRACTICES:
 * - Use HTTPS everywhere
 * - Set secure session cookies
 * - Implement rate limiting
 * - Sanitize all inputs
 * - Use environment variables for secrets
 * - Monitor for CSRF attacks
 * - Rotate tokens after each submission
 * - Set token expiry (1 hour recommended)
 * - Use constant-time comparison for tokens
 * - Log suspicious activity
 * 
 * ✅ TESTING:
 * 1. Test successful form submission
 * 2. Test CSRF token validation (try invalid token)
 * 3. Test token expiry (wait 1 hour)
 * 4. Test rate limiting (rapid submissions)
 * 5. Test input validation (empty, invalid email, etc.)
 * 6. Test token rotation after submission
 * 7. Test cross-origin requests (should fail)
 */
