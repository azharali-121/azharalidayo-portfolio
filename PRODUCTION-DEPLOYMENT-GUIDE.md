# Production Deployment Guide

**Portfolio:** Azhar Ali - Cybersecurity Specialist & Full-Stack Developer  
**Last Updated:** January 9, 2026  
**Status:** ✅ Production Ready

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Build Process](#build-process)
3. [Security Configuration](#security-configuration)
4. [Error Tracking Setup](#error-tracking-setup)
5. [Performance Optimization](#performance-optimization)
6. [Accessibility Verification](#accessibility-verification)
7. [Deployment Steps](#deployment-steps)
8. [Post-Deployment Verification](#post-deployment-verification)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)

---

## ✅ Pre-Deployment Checklist

### Development Completed
- [ ] All features implemented and tested
- [ ] CSRF protection functional (see [CSRF-PROTECTION-GUIDE.md](CSRF-PROTECTION-GUIDE.md))
- [ ] Rate limiting configured (see [RATE-LIMITING-GUIDE.md](RATE-LIMITING-GUIDE.md))
- [ ] Security Lab features working
- [ ] Contact form validated
- [ ] All pages responsive (mobile, tablet, desktop)

### Code Quality
- [ ] Console.log statements removed (production-config.js handles this)
- [ ] No debug code in production files
- [ ] Error tracking configured
- [ ] Code minified and bundled
- [ ] CSS optimized and minified
- [ ] Images optimized (WebP where possible)

### Security
- [ ] HTTPS certificate obtained (Let's Encrypt recommended)
- [ ] Security headers configured (see security-headers.conf)
- [ ] CSP policy tested and validated
- [ ] CSRF tokens functional
- [ ] Rate limiting active
- [ ] Input sanitization verified

### Accessibility
- [ ] All images have alt text
- [ ] Form fields have proper labels
- [ ] Skip links functional
- [ ] Keyboard navigation works
- [ ] ARIA attributes correct
- [ ] Color contrast meets WCAG AA standards

### Performance
- [ ] Lighthouse score > 90 (all categories)
- [ ] First Contentful Paint < 1.8s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Total Blocking Time < 300ms
- [ ] Cumulative Layout Shift < 0.1

---

## 🔨 Build Process

### Step 1: Install Dependencies

```bash
# Navigate to project directory
cd u:\Projects\PORTFOLIO\azhar-ali-portfolio

# Install Node.js dependencies
npm install
```

**Expected output:**
```
+ esbuild@0.19.11
+ clean-css@5.3.3
+ clean-css-cli@5.6.3
+ html-minifier-terser@7.2.0
+ http-server@14.1.1
added 45 packages
```

### Step 2: Clean Previous Builds

```bash
npm run clean
```

**What it does:**
- Removes `dist/` directory
- Clears old build artifacts

### Step 3: Build JavaScript

```bash
npm run build:js
```

**What it does:**
- Bundles all JavaScript files using esbuild
- Minifies code (removes whitespace, shortens variable names)
- Generates source maps for debugging
- Tree-shakes unused code
- Creates bundles:
  * `dist/js/main.bundle.min.js` - Core functionality
  * `dist/js/security-lab.min.js` - Security Lab features
  * `dist/js/contact.min.js` - Contact form functionality

**Expected output:**
```
✓ Built main bundle (45.23 KB)
✓ Built security-lab bundle (12.45 KB)
✓ Built contact bundle (18.67 KB)
✅ JavaScript build complete!
```

### Step 4: Build CSS

```bash
npm run build:css
```

**What it does:**
- Concatenates all CSS files
- Minifies CSS (removes comments, whitespace)
- Optimizes property values
- Creates `dist/css/main.min.css`

**Expected output:**
```
✓ Built main bundle: 156.78 KB → 89.34 KB (43.0% smaller)
✅ CSS build complete!
```

### Step 5: Full Production Build

```bash
npm run build
```

**What it does:**
- Runs all build steps in sequence:
  1. Clean
  2. Build JS
  3. Build CSS

**Total build time:** ~5-10 seconds

---

## 🔒 Security Configuration

### Step 1: Configure Security Headers

#### For Apache (.htaccess)

Copy [security-headers.conf](security-headers.conf) to your web root as `.htaccess`:

```bash
# Copy security headers
cp security-headers.conf .htaccess

# Or append to existing .htaccess
cat security-headers.conf >> .htaccess
```

**Verify:** Check if mod_headers is enabled
```bash
# Apache
apache2ctl -M | grep headers

# Should show: headers_module (shared)
```

#### For Nginx

Add to your Nginx server block:

```nginx
server {
    # ... existing config ...
    
    # Include security headers
    include /path/to/security-headers.conf;
    
    # ... rest of config ...
}
```

Reload Nginx:
```bash
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

#### For Node.js/Express

Install helmet:
```bash
npm install helmet
```

Add to server.js:
```javascript
const helmet = require('helmet');
app.use(helmet({
    // See security-headers.conf for full configuration
}));
```

### Step 2: Enable HTTPS

**Using Let's Encrypt (Recommended - Free):**

```bash
# Install certbot
sudo apt install certbot python3-certbot-apache

# Obtain certificate
sudo certbot --apache -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
# Verify with:
sudo certbot renew --dry-run
```

**Important:** Only enable HSTS header AFTER HTTPS is fully working!

Uncomment this line in `.htaccess`:
```apache
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
```

### Step 3: Test Security Headers

```bash
# Test locally
curl -I http://localhost:8080

# Test production
curl -I https://yourdomain.com

# Look for these headers:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# Referrer-Policy: no-referrer
# Content-Security-Policy: ...
```

**Online Tools:**
- https://securityheaders.com/
- https://observatory.mozilla.org/
- https://csp-evaluator.withgoogle.com/

**Target Grade:** A or A+

---

## 📊 Error Tracking Setup

### Option 1: Sentry (Recommended)

1. **Sign up:** https://sentry.io/signup/
2. **Create project:** Select "JavaScript" platform
3. **Copy DSN:** Format: `https://abc123@o123456.ingest.sentry.io/123456`

4. **Configure:**

Edit [js/error-tracking.js](js/error-tracking.js):
```javascript
dsn: 'YOUR_SENTRY_DSN_HERE',  // ← Replace with your DSN
```

5. **Rebuild:**
```bash
npm run build:js
```

6. **Verify:**
- Deploy
- Trigger an error (e.g., click non-existent button)
- Check Sentry dashboard for error report

### Option 2: LogRocket

Uncomment LogRocket section in error-tracking.js and configure:

```javascript
const LOGROCKET_APP_ID = 'your-app-id';
```

### Option 3: Custom Error Tracking

Uncomment `setupCustomErrorTracking()` in error-tracking.js and create backend endpoint:

```javascript
app.post('/api/log-error', (req, res) => {
    const { message, stack, url, timestamp } = req.body;
    
    // Log to file or database
    console.error('[ERROR]', {
        message,
        stack,
        url,
        timestamp
    });
    
    res.json({ received: true });
});
```

---

## ⚡ Performance Optimization

### Step 1: Optimize Images

```bash
# Install imagemin
npm install -g imagemin-cli imagemin-webp

# Convert to WebP
imagemin assets/images/**/*.{jpg,png} --plugin=webp --out-dir=assets/images/webp/

# Reduce quality (optional)
imagemin assets/images/**/*.jpg --plugin=mozjpeg --out-dir=assets/images/optimized/
```

### Step 2: Enable Caching

Add to `.htaccess`:
```apache
<IfModule mod_expires.c>
    ExpiresActive On
    
    # Images
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    
    # CSS and JavaScript
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    
    # Fonts
    ExpiresByType font/woff2 "access plus 1 year"
</IfModule>
```

### Step 3: Enable Gzip Compression

Add to `.htaccess`:
```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript application/json
</IfModule>
```

### Step 4: Preload Critical Resources

Add to `<head>`:
```html
<link rel="preload" href="dist/css/main.min.css" as="style">
<link rel="preload" href="dist/js/main.bundle.min.js" as="script">
<link rel="preload" href="assets/fonts/your-font.woff2" as="font" type="font/woff2" crossorigin>
```

---

## ♿ Accessibility Verification

### Automated Testing

**Using Lighthouse (Chrome DevTools):**
1. Open DevTools (F12)
2. Navigate to "Lighthouse" tab
3. Select "Accessibility" category
4. Click "Generate report"
5. Target score: ≥ 90

**Using axe DevTools:**
```bash
# Install axe CLI
npm install -g @axe-core/cli

# Run accessibility scan
axe http://localhost:8080 --save axe-report.json
```

### Manual Testing

**Keyboard Navigation:**
- [ ] Tab through all interactive elements
- [ ] Enter/Space activates buttons
- [ ] Escape closes modals
- [ ] Focus visible at all times
- [ ] Skip link appears on first Tab

**Screen Reader Testing:**
- [ ] NVDA (Windows): https://www.nvaccess.org/download/
- [ ] JAWS (Windows): https://www.freedomscientific.com/products/software/jaws/
- [ ] VoiceOver (Mac): Cmd+F5

**Tests:**
- [ ] All images have alt text
- [ ] Form fields announced correctly
- [ ] Error messages announced
- [ ] Navigation landmarks present
- [ ] Headings in logical order

**Color Contrast:**
```bash
# Install pa11y
npm install -g pa11y

# Check contrast
pa11y http://localhost:8080 --runner axe --standard WCAG2AA
```

**Responsive Design:**
- [ ] Test on mobile (< 768px)
- [ ] Test on tablet (768px - 1024px)
- [ ] Test on desktop (> 1024px)
- [ ] Text readable without zoom
- [ ] Buttons large enough to tap (min 44x44px)

---

## 🚀 Deployment Steps

### Option 1: Static Hosting (Netlify/Vercel)

#### Netlify

1. **Install Netlify CLI:**
```bash
npm install -g netlify-cli
```

2. **Build project:**
```bash
npm run build
```

3. **Deploy:**
```bash
# First time
netlify deploy --prod

# Choose:
# - Create new site
# - Site name: azhar-ali-portfolio
# - Publish directory: . (root)

# Future deploys
netlify deploy --prod
```

4. **Configure custom domain:**
- Netlify Dashboard → Domain settings
- Add custom domain: yourdomain.com
- Update DNS records:
  ```
  Type: A
  Name: @
  Value: 75.2.60.5
  
  Type: CNAME
  Name: www
  Value: your-site.netlify.app
  ```

#### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Configure domain in Vercel dashboard
```

### Option 2: Traditional Web Hosting (cPanel/Apache)

1. **Build locally:**
```bash
npm run build
```

2. **Upload files via FTP:**
```
/public_html/
├── index.html
├── *.html
├── dist/
│   ├── js/
│   └── css/
├── assets/
├── js/ (original sources - optional)
├── .htaccess (from security-headers.conf)
└── manifest.json
```

3. **Set file permissions:**
```bash
# On server
chmod 644 *.html
chmod 644 .htaccess
chmod -R 755 assets/
chmod -R 755 dist/
```

4. **Configure domain:**
- Point DNS A record to server IP
- Wait for DNS propagation (24-48 hours)

### Option 3: VPS/Cloud Server

**Using Ubuntu + Nginx:**

```bash
# Install Nginx
sudo apt update
sudo apt install nginx

# Copy files
sudo mkdir -p /var/www/azhar-ali-portfolio
sudo cp -r * /var/www/azhar-ali-portfolio/

# Configure Nginx
sudo nano /etc/nginx/sites-available/azhar-ali-portfolio
```

**Nginx config:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/azhar-ali-portfolio;
    index index.html;
    
    # Security headers
    include /var/www/azhar-ali-portfolio/security-headers.conf;
    
    # Gzip
    gzip on;
    gzip_types text/css application/javascript image/svg+xml;
    
    # Cache
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA routing
    location / {
        try_files $uri $uri/ =404;
    }
}
```

**Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/azhar-ali-portfolio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## ✅ Post-Deployment Verification

### Functional Testing

**Homepage:**
- [ ] Particle background loads (or static fallback if reduced motion)
- [ ] Navigation menu works
- [ ] Links navigate correctly
- [ ] Images load
- [ ] Animations work (if enabled)

**Contact Form:**
- [ ] CSRF token present in hidden field
- [ ] Form validation works
- [ ] Submission successful (or mock backend working)
- [ ] Rate limiting active (6th submission blocked)
- [ ] Error messages display correctly

**Security Lab:**
- [ ] Hacker terminal animation works (or instant display if reduced motion)
- [ ] Skill demos functional
- [ ] Security simulator interactive

**Responsive Design:**
```bash
# Test mobile
curl -A "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)" https://yourdomain.com

# Check viewport meta tag present
```

### Security Testing

**SSL/TLS:**
```bash
# Check certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com < /dev/null

# Or use:
# https://www.ssllabs.com/ssltest/
# Target grade: A or A+
```

**Headers:**
```bash
curl -I https://yourdomain.com

# Verify all security headers present
```

**CSP Violations:**
- Open browser console
- Check for CSP errors
- If violations found, update CSP policy in security-headers.conf

**CSRF & Rate Limiting:**
```bash
# Test CSRF protection
curl -X POST https://yourdomain.com/api/contact \
  -d '{"name":"Test","email":"test@test.com","message":"Test"}' \
  -H "Content-Type: application/json"
# Should return 403 (no CSRF token)

# Test rate limiting (6 requests)
for i in {1..6}; do
  curl -X POST https://yourdomain.com/api/contact \
    -H "X-CSRF-Token: valid-token" \
    -d '{"name":"Test","email":"test@test.com","message":"Test"}'
done
# 6th should return 429
```

### Performance Testing

**Lighthouse:**
```bash
# Install lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://yourdomain.com --output html --output-path report.html

# Target scores:
# Performance: > 90
# Accessibility: > 90
# Best Practices: > 90
# SEO: > 90
```

**WebPageTest:**
- Visit: https://www.webpagetest.org/
- Enter URL
- Choose location close to your users
- Target metrics:
  * First Byte: < 200ms
  * Start Render: < 1.5s
  * Fully Loaded: < 3s

**Core Web Vitals:**
```bash
# Using PageSpeed Insights
# https://pagespeed.web.dev/

# Or Chrome User Experience Report
# https://web.dev/chrome-ux-report/
```

---

## 📈 Monitoring & Maintenance

### Daily
- [ ] Check Sentry for new errors
- [ ] Review rate limit violations (if logged)
- [ ] Monitor uptime (use UptimeRobot: https://uptimerobot.com/)

### Weekly
- [ ] Review performance metrics
- [ ] Check SSL certificate expiry
- [ ] Test contact form functionality
- [ ] Review analytics (Google Analytics/Plausible)

### Monthly
- [ ] Update dependencies: `npm update`
- [ ] Rebuild: `npm run build`
- [ ] Re-run Lighthouse audit
- [ ] Test on latest browsers
- [ ] Check for security updates

### Quarterly
- [ ] Full security audit (securityheaders.com, observatory.mozilla.org)
- [ ] Review and update CSP policy
- [ ] Optimize images (new formats, better compression)
- [ ] Content update (projects, skills, etc.)

### Annually
- [ ] Review and renew SSL certificate (if not auto-renewing)
- [ ] Complete redesign consideration
- [ ] Technology stack review

---

## 🔧 Troubleshooting

### Issue: CORS Errors

**Symptoms:** Contact form fails, console shows CORS error

**Solution:**
```javascript
// Backend (Express)
app.use(cors({
    origin: 'https://yourdomain.com',
    credentials: true
}));
```

### Issue: CSP Violations

**Symptoms:** Features broken, console shows CSP errors

**Solution:**
1. Note the blocked resource URL
2. Add domain to CSP policy in `.htaccess`
3. Example:
```apache
# If blocking Google Fonts
script-src 'self' https://fonts.googleapis.com;
```

### Issue: Images Not Loading

**Symptoms:** Broken image icons

**Solution:**
```bash
# Check file permissions
ls -la assets/images/

# Should be 644
chmod 644 assets/images/**/*.{jpg,png,webp}
```

### Issue: Rate Limiting Not Working

**Symptoms:** Can submit form > 5 times

**Solution:**
1. Check backend is deployed
2. Verify `BACKEND_API_URL` in form-validation.js
3. Check backend logs for errors
4. Test with curl (see Security Testing above)

### Issue: Animations Not Disabling

**Symptoms:** prefers-reduced-motion not respected

**Solution:**
1. Check production-config.js is loading first
2. Verify order in HTML:
```html
<script src="js/production-config.js"></script>
<script src="js/particle-bg.js"></script>
<script src="js/hacker-terminal.js"></script>
```

### Issue: Build Errors

**Symptoms:** `npm run build` fails

**Solution:**
```bash
# Clear node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Try build again
npm run build
```

### Issue: Slow Page Load

**Symptoms:** Lighthouse performance < 90

**Common causes:**
1. **Large images:** Optimize with imagemin
2. **No caching:** Add cache headers
3. **No compression:** Enable gzip
4. **Render-blocking resources:** Add preload tags
5. **Unused CSS/JS:** Review bundle size

**Solution:**
```bash
# Analyze bundle size
npm install -g webpack-bundle-analyzer

# Check what's in your bundle
webpack-bundle-analyzer dist/js/main.bundle.min.js
```

---

## 🎉 Deployment Complete!

**Your portfolio is now live with:**
- ✅ Production-optimized code
- ✅ Security headers configured
- ✅ Error tracking active
- ✅ Accessibility features enabled
- ✅ Performance optimized
- ✅ CSRF protection active
- ✅ Rate limiting functional
- ✅ Monitoring set up

**Share your portfolio:**
- LinkedIn
- GitHub README
- Resume/CV
- Portfolio directories (Behance, Dribbble)

**Next steps:**
- Add Google Analytics
- Set up Google Search Console
- Submit sitemap.xml
- Build backlinks (blog posts, guest posts)
- Share on social media

---

**Questions or Issues?**
Review the documentation:
- [CSRF-PROTECTION-GUIDE.md](CSRF-PROTECTION-GUIDE.md)
- [RATE-LIMITING-GUIDE.md](RATE-LIMITING-GUIDE.md)
- [SECURITY-IMPLEMENTATION-COMPLETE.md](SECURITY-IMPLEMENTATION-COMPLETE.md)

**Last Updated:** January 9, 2026  
**Deployment Status:** ✅ PRODUCTION READY
