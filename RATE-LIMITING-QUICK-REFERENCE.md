# Rate Limiting Quick Reference

**⚡ Fast Setup Guide for Contact Form Rate Limiting**

---

## 🎯 At a Glance

```
Client: 5 submissions per 10 minutes (sessionStorage)
Backend: 5 requests per 10 minutes per IP (server-enforced)
Status: ✅ Fully Implemented
```

---

## 📝 Configuration

### Current Settings

| Setting | Value | Location |
|---------|-------|----------|
| **Max Submissions** | 5 | `RateLimitManager.MAX_SUBMISSIONS` |
| **Time Window** | 10 minutes | `RateLimitManager.TIME_WINDOW` |
| **Storage (Client)** | sessionStorage | `form_submission_history` |
| **Storage (Backend)** | Map/Dict/JSON | IP-based tracking |
| **Error Code** | 429 | Too Many Requests |

### Customizing Limits

**Client-Side ([js/form-validation.js](js/form-validation.js)):**
```javascript
const RateLimitManager = {
    MAX_SUBMISSIONS: 5,        // Change to 3, 10, etc.
    TIME_WINDOW: 600000,       // 10 minutes (milliseconds)
    // ...
};
```

**Backend ([js/backend-example.js](js/backend-example.js)):**
```javascript
const RATE_LIMIT_MAX = 5;           // Max requests
const RATE_LIMIT_WINDOW = 600000;   // 10 minutes in ms
```

---

## 🚀 Quick Start

### Test Locally (No Backend Required)

1. **Open contact page**
   ```
   file:///path/to/contact.html
   ```

2. **Open browser console**
   ```javascript
   // Check current status
   RateLimitManager.checkLimit()
   // Returns: { allowed: true, remaining: 5, currentCount: 0 }
   ```

3. **Submit form 5 times**
   - Each submission records timestamp
   - 6th submission will show rate limit error

4. **Reset for testing**
   ```javascript
   RateLimitManager.reset();
   sessionStorage.clear();
   ```

---

## 🧪 Testing Commands

### Client-Side (Browser Console)

```javascript
// Check if limit exceeded
RateLimitManager.checkLimit()
// { allowed: true/false, remaining: number, currentCount: number, resetTime: timestamp }

// Get submission history
const history = JSON.parse(sessionStorage.getItem('form_submission_history') || '[]');
console.log('Submissions:', history);

// Calculate time until reset
const check = RateLimitManager.checkLimit();
if (!check.allowed) {
    const minutes = Math.ceil((check.resetTime - Date.now()) / 60000);
    console.log(`Wait ${minutes} minutes`);
}

// Reset rate limit (testing only)
RateLimitManager.reset();

// Simulate exceeding limit
for (let i = 0; i < 6; i++) {
    RateLimitManager.recordSubmission();
}
```

### Backend (cURL)

```bash
# Test single request
curl -X POST https://your-domain.com/api/contact \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: your-token" \
  -d '{"name":"Test","email":"test@example.com","message":"Test"}' \
  -i

# Test rate limit (6 requests)
for i in {1..6}; do
  curl -X POST https://your-domain.com/api/contact \
    -H "Content-Type: application/json" \
    -H "X-CSRF-Token: your-token" \
    -d "{\"name\":\"Test$i\",\"email\":\"test$i@example.com\",\"message\":\"Test\"}" \
    -w "\nStatus: %{http_code}\n\n" \
    -s
done
# Expected: First 5 return 200, 6th returns 429

# Check rate limit headers
curl -I -X POST https://your-domain.com/api/contact
# Look for: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
```

---

## 📊 Response Examples

### Success (Allowed)

**Status:** 200 OK
```json
{
    "success": true,
    "message": "Thank you! Your message has been sent.",
    "rateLimitInfo": {
        "remaining": 3,
        "limit": 5,
        "resetTime": 1736451834
    }
}
```

**Headers:**
```http
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 1736451834
```

### Rate Limit Exceeded

**Status:** 429 Too Many Requests
```json
{
    "success": false,
    "error": "Rate limit exceeded",
    "message": "Too many requests. Please wait 8 minutes before trying again.",
    "retryAfter": 480,
    "limit": 5,
    "window": 10,
    "resetTime": 1736451834
}
```

**Headers:**
```http
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1736451834
Retry-After: 480
```

---

## 🔧 Common Tasks

### Change Rate Limit

**To 3 submissions per 5 minutes:**
```javascript
// js/form-validation.js
const RateLimitManager = {
    MAX_SUBMISSIONS: 3,
    TIME_WINDOW: 300000,  // 5 minutes
    // ...
};

// js/backend-example.js
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW = 300000;
```

### Add Logging

**Backend (Express):**
```javascript
function rateLimitByIP(req, res, next) {
    // ... existing code ...
    
    if (ipData.requests.length >= RATE_LIMIT_MAX) {
        console.warn('⚠️ Rate limit exceeded:', {
            ip: clientIP,
            attempts: ipData.requests.length,
            endpoint: req.path
        });
        // ... return 429 ...
    }
    
    console.log('✅ Rate limit OK:', {
        ip: clientIP,
        remaining: RATE_LIMIT_MAX - ipData.requests.length
    });
    // ... continue ...
}
```

### Whitelist an IP

**Backend (Express):**
```javascript
const WHITELIST = ['192.168.1.100', '10.0.0.1'];

function rateLimitByIP(req, res, next) {
    const clientIP = getClientIP(req);
    
    // Skip rate limit for whitelisted IPs
    if (WHITELIST.includes(clientIP)) {
        console.log('🔓 Whitelisted IP bypassed rate limit:', clientIP);
        return next();
    }
    
    // ... normal rate limit logic ...
}
```

### Reset Rate Limit for Specific IP

**Backend (Express):**
```javascript
// Admin endpoint to reset rate limit
app.post('/admin/reset-rate-limit', async (req, res) => {
    const { ip } = req.body;
    rateLimitStore.delete(ip);
    res.json({ success: true, message: `Rate limit reset for ${ip}` });
});
```

---

## 🐛 Troubleshooting

### Problem: 6th submission succeeds (should fail)

**Check:**
```javascript
// Verify recordSubmission() is being called
console.log('Before submit:', RateLimitManager.checkLimit());
RateLimitManager.recordSubmission();
console.log('After submit:', RateLimitManager.checkLimit());
```

**Fix:** Ensure `recordSubmission()` is called after successful submission in [js/form-validation.js](js/form-validation.js#L330)

### Problem: Rate limit resets immediately

**Check:**
```javascript
// Verify TIME_WINDOW is correct
console.log('Time window (ms):', RateLimitManager.TIME_WINDOW);
console.log('Expected (10 min):', 10 * 60 * 1000); // Should be 600000
```

**Fix:** Ensure `TIME_WINDOW` is in milliseconds, not seconds

### Problem: Backend allows unlimited requests

**Check:**
```bash
# Verify backend is using rate limit middleware
curl -v https://your-domain.com/api/contact 2>&1 | grep -i "x-ratelimit"
```

**Fix:** Ensure rate limit middleware is applied to endpoint:
```javascript
app.post('/api/contact', rateLimitByIP, validateCSRFToken, async (req, res) => {
    // ...
});
```

### Problem: Different tabs share rate limit

**Expected Behavior:** sessionStorage is tab-scoped, so each tab has its own limit.

**If tabs are sharing limits:**
- Check if using localStorage instead of sessionStorage
- Verify storage key is unique per tab

---

## 📈 Monitoring

### Check Rate Limit Events

**View Blocked Requests:**
```javascript
// Backend logging
grep "Rate limit exceeded" /var/log/app.log | tail -20

// Count blocks per IP
grep "Rate limit exceeded" /var/log/app.log | \
  awk '{print $NF}' | sort | uniq -c | sort -rn
```

### Dashboard Metrics

**Track over time:**
```javascript
// Log to analytics
analytics.track('rate_limit_event', {
    type: 'exceeded' | 'allowed',
    ip: clientIP,
    remaining: remaining,
    endpoint: '/api/contact'
});
```

---

## 🎓 Best Practices

### ✅ Do

- Set reasonable limits (5-10 per 10-15 minutes)
- Use Redis/Memcached in production
- Log rate limit violations
- Show user-friendly error messages
- Include rate limit headers in responses
- Clean old entries regularly

### ❌ Don't

- Set limits too strict (<3 per 10 minutes)
- Store client-side only (bypassed easily)
- Block users permanently
- Show technical error messages to users
- Trust X-Forwarded-For without proxy validation

---

## 🔗 Related Documentation

- **Full Guide:** [RATE-LIMITING-GUIDE.md](RATE-LIMITING-GUIDE.md)
- **CSRF Protection:** [CSRF-PROTECTION-GUIDE.md](CSRF-PROTECTION-GUIDE.md)
- **Backend Examples:** [js/backend-example.js](js/backend-example.js)
- **Client Implementation:** [js/form-validation.js](js/form-validation.js)

---

## 📞 Need Help?

**Common Questions:**

**Q: Can users bypass this?**  
A: Client-side can be bypassed, but backend enforcement prevents actual spam.

**Q: What happens after 10 minutes?**  
A: Counter resets automatically, user can submit again.

**Q: Does this affect legitimate users?**  
A: Rarely - 5 submissions in 10 minutes is generous for legitimate use.

**Q: How do I adjust for high-traffic sites?**  
A: Use Redis for storage, consider increasing limits during peak hours.

**Q: Can I combine with CSRF protection?**  
A: Yes! Both are implemented and work together. Rate limit runs first, then CSRF validation.

---

**Last Updated:** January 9, 2026  
**Status:** ✅ Production Ready
