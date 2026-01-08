# 🚀 Production Deployment Checklist
**Azhar Ali Portfolio - azharalidayo.me**  
**Date:** January 9, 2026

---

## ✅ Pre-Flight Checklist (Complete Before Upload)

### Files Ready for Deployment
- [x] `.htaccess` - Enhanced with comprehensive security headers
- [x] Directory listing disabled (`Options -Indexes`)
- [x] CSRF protection implemented
- [x] Rate limiting configured
- [x] Console logs cleaned (production mode)
- [x] Prefers-reduced-motion support added
- [x] All security headers configured

---

## 📤 Deployment Steps

### Step 1: Upload .htaccess File
```bash
# Method A: FTP/SFTP (FileZilla, WinSCP, etc.)
# 1. Connect to azharalidayo.me server
# 2. Navigate to public_html/ or www/ directory
# 3. Upload: .htaccess (from your local project root)
# 4. Set permissions: 644 (read/write for owner, read for others)

# Method B: cPanel File Manager
# 1. Login to cPanel
# 2. Open File Manager
# 3. Navigate to public_html/
# 4. Upload .htaccess
# 5. Ensure "Show Hidden Files" is enabled to see .htaccess
```

**Important:** Make sure the file is named exactly `.htaccess` (with the leading dot).

---

### Step 2: Verify Directory Listing Disabled

**Test these URLs in your browser:**

1. **JavaScript directory:**
   ```
   https://azharalidayo.me/js/
   ```
   **Expected:** 403 Forbidden (not a file list)

2. **Assets directory:**
   ```
   https://azharalidayo.me/assets/
   ```
   **Expected:** 403 Forbidden (not a file list)

3. **Styles directory:**
   ```
   https://azharalidayo.me/assets/styles/
   ```
   **Expected:** 403 Forbidden (not a file list)

4. **Individual file (should still work):**
   ```
   https://azharalidayo.me/js/particle-bg.js
   ```
   **Expected:** File loads successfully (200 OK)

**✅ Pass Criteria:** Directories return 403, individual files load normally.

---

### Step 3: Test Security Headers

**Command Line Test:**
```bash
curl -I https://azharalidayo.me
```

**Expected Headers:**
```
HTTP/2 200
Content-Security-Policy: default-src 'self'; script-src...
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Permissions-Policy: geolocation=()...
X-XSS-Protection: 1; mode=block
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

**Online Testing Tools:**
1. **Security Headers Test:**
   - Visit: https://securityheaders.com/?q=https://azharalidayo.me
   - **Target:** A or A+ rating

2. **Mozilla Observatory:**
   - Visit: https://observatory.mozilla.org/analyze/azharalidayo.me
   - **Target:** A or A+ rating

3. **SSL Labs (if HTTPS):**
   - Visit: https://www.ssllabs.com/ssltest/analyze.html?d=azharalidayo.me
   - **Target:** A or A+ rating

---

### Step 4: Full Portfolio Testing

**Test All Pages:**
- [ ] https://azharalidayo.me/index.html (Home)
- [ ] https://azharalidayo.me/projects.html (Projects)
- [ ] https://azharalidayo.me/skills.html (Skills)
- [ ] https://azharalidayo.me/about.html (About)
- [ ] https://azharalidayo.me/contact.html (Contact)
- [ ] https://azharalidayo.me/security-lab.html (Security Lab)

**For Each Page, Verify:**
1. **Visual Check:**
   - [ ] Page loads completely
   - [ ] No broken images
   - [ ] Styles applied correctly
   - [ ] Layout not broken

2. **Console Check:**
   - [ ] Open browser DevTools (F12)
   - [ ] Check Console tab
   - [ ] **Expected:** Clean console (no errors)
   - [ ] **Exception:** Educational console logs in message-encryption.js (only on localhost)

3. **Navigation:**
   - [ ] Header navigation works
   - [ ] Footer links work
   - [ ] Sidebar navigation (if present)
   - [ ] All internal links functional

4. **Animations:**
   - [ ] Vanta.js particles load (if not reduced motion)
   - [ ] Hacker terminal animations (if not reduced motion)
   - [ ] Smooth scrolling works
   - [ ] Hover effects functional

5. **Performance:**
   - [ ] Page loads in < 3 seconds
   - [ ] Images lazy-load
   - [ ] No layout shifts

---

### Step 5: Contact Form Testing

**Test CSRF Protection:**
1. **Valid Submission (should succeed):**
   - [ ] Open contact form
   - [ ] Fill all fields
   - [ ] Submit
   - [ ] **Expected:** Success message appears

2. **Check CSRF Token:**
   - [ ] Open DevTools > Network tab
   - [ ] Submit form
   - [ ] Check request payload
   - [ ] **Expected:** `csrf_token` field present

**Test Rate Limiting:**
1. **Rapid Submissions:**
   - [ ] Submit form 5 times quickly
   - [ ] **Expected:** First 5 succeed
   - [ ] Try 6th submission
   - [ ] **Expected:** Error message with countdown timer

2. **After Cooldown:**
   - [ ] Wait 10 minutes
   - [ ] Try submitting again
   - [ ] **Expected:** Works normally

---

### Step 6: Accessibility Testing

**Keyboard Navigation:**
- [ ] Press `Tab` key repeatedly
- [ ] **Expected:** Focus indicators visible (green outline)
- [ ] All interactive elements reachable

**Skip Link:**
- [ ] Press `1` key (or Tab from top)
- [ ] **Expected:** "Skip to main content" appears
- [ ] Press Enter
- [ ] **Expected:** Jumps to main content

**Motion Preferences:**
1. **Enable Reduced Motion:**
   - Windows: Settings > Accessibility > Visual effects > Animation effects (OFF)
   - macOS: System Preferences > Accessibility > Display > Reduce motion
   - Browser: DevTools > Rendering > Emulate prefers-reduced-motion: reduce

2. **Reload Page:**
   - [ ] **Expected:** No Vanta particles (static gradient instead)
   - [ ] **Expected:** Hacker terminal shows text instantly
   - [ ] **Expected:** CSS animations minimal/disabled

3. **Disable Reduced Motion:**
   - [ ] Re-enable animations in OS settings
   - [ ] Reload page
   - [ ] **Expected:** Normal animations restored

**Screen Reader Test (Optional but Recommended):**
- [ ] Test with NVDA (Windows) or VoiceOver (macOS)
- [ ] Navigate through page
- [ ] **Expected:** All content announced properly
- [ ] Form labels read correctly
- [ ] Links have descriptive text

---

### Step 7: Mobile Responsiveness

**Test Breakpoints:**
1. **Desktop (1920×1080):**
   - [ ] Full layout displays correctly

2. **Laptop (1366×768):**
   - [ ] Layout adapts properly

3. **Tablet (768×1024):**
   - [ ] Mobile menu appears
   - [ ] Images resize appropriately

4. **Mobile (375×667):**
   - [ ] Hamburger menu works
   - [ ] Touch targets large enough (min 44×44px)
   - [ ] Text readable without zooming
   - [ ] No horizontal scrolling

**Testing Tools:**
- Browser DevTools (F12) > Device Toolbar (Ctrl+Shift+M)
- Test on real devices if possible

---

### Step 8: SEO Verification

**Check Meta Tags:**
```bash
# View page source (Ctrl+U in browser)
# Verify these tags exist in <head>:
```
- [ ] `<title>` present and descriptive
- [ ] `<meta name="description">` present
- [ ] `<meta name="keywords">` present
- [ ] Open Graph tags (`og:title`, `og:description`, `og:image`)
- [ ] Twitter Card tags (`twitter:card`, `twitter:title`)
- [ ] Canonical URL (`<link rel="canonical">`)

**Check Files:**
- [ ] https://azharalidayo.me/robots.txt (accessible)
- [ ] https://azharalidayo.me/sitemap.xml (accessible)

**Submit to Search Engines:**
- [ ] Google Search Console: https://search.google.com/search-console
- [ ] Submit sitemap: https://azharalidayo.me/sitemap.xml

---

### Step 9: Performance Audit

**Google Lighthouse:**
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Select:
   - [x] Performance
   - [x] Accessibility
   - [x] Best Practices
   - [x] SEO
4. Click "Analyze page load"

**Target Scores:**
- **Performance:** ≥ 90 (Green)
- **Accessibility:** ≥ 95 (Green)
- **Best Practices:** ≥ 95 (Green)
- **SEO:** ≥ 95 (Green)

**Core Web Vitals:**
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

**If Scores Low:**
- Check [PRODUCTION-DEPLOYMENT-GUIDE.md](PRODUCTION-DEPLOYMENT-GUIDE.md) for optimization tips
- Ensure images optimized (WebP format, compressed)
- Verify build process completed (`npm run build`)

---

### Step 10: Error Tracking Setup (Optional)

**Sentry Configuration:**
1. **Create Account:**
   - Visit: https://sentry.io/signup/
   - Create project (JavaScript)

2. **Get DSN:**
   - Copy DSN from project settings
   - Format: `https://[key]@sentry.io/[project-id]`

3. **Update Configuration:**
   - Edit `js/error-tracking.js` on server
   - Replace line 25:
     ```javascript
     dsn: 'https://your-actual-dsn@sentry.io/your-project-id',
     ```

4. **Test Error Tracking:**
   - Open browser console
   - Type: `throw new Error('Sentry test error');`
   - Check Sentry dashboard for error

---

## 🎯 Final Verification

### Quick Checklist
- [ ] Directory listing disabled (403 on /js/, /assets/)
- [ ] Security headers present (test with curl)
- [ ] All pages load without console errors
- [ ] Contact form works (CSRF + rate limiting)
- [ ] Keyboard navigation functional (Tab, focus indicators)
- [ ] Motion preferences respected
- [ ] Mobile responsive on all breakpoints
- [ ] Lighthouse scores all green (≥90)
- [ ] SEO meta tags present
- [ ] robots.txt and sitemap.xml accessible

### Security Rating Verification
- [ ] securityheaders.com: A or A+ rating
- [ ] observatory.mozilla.org: A or A+ rating
- [ ] No critical security warnings

### Performance Verification
- [ ] Page load time < 3 seconds
- [ ] Core Web Vitals all green
- [ ] Images optimized and lazy-loaded
- [ ] GZIP compression enabled

---

## 🐛 Troubleshooting

### Issue: Directory Listing Still Showing
**Solution:**
1. Check .htaccess file uploaded correctly
2. Ensure filename is exactly `.htaccess` (with dot)
3. Check file permissions (should be 644)
4. Contact hosting provider if mod_autoindex not supported

### Issue: Security Headers Not Showing
**Solution:**
1. Check if mod_headers enabled on server
2. Contact hosting provider to enable mod_headers
3. Test with: `curl -I https://azharalidayo.me`
4. Check .htaccess syntax (no typos)

### Issue: Console Errors
**Solution:**
1. Open DevTools > Console
2. Note specific error messages
3. Check if resources loading (Network tab)
4. Verify paths correct (case-sensitive)
5. See [PRODUCTION-DEPLOYMENT-GUIDE.md](PRODUCTION-DEPLOYMENT-GUIDE.md#troubleshooting)

### Issue: Form Not Working
**Solution:**
1. Check CSRF token generation
2. Verify rate limiting not blocking
3. Check backend endpoint configured
4. See [CSRF-PROTECTION-GUIDE.md](CSRF-PROTECTION-GUIDE.md) for details

### Issue: Animations Not Working
**Solution:**
1. Check browser console for JavaScript errors
2. Verify CDN resources loading (Vanta.js, Three.js)
3. Check if reduced motion enabled (disable to test)
4. Ensure JavaScript files not blocked by CSP

---

## 📊 Post-Deployment Monitoring

### Daily Checks (First Week)
- [ ] Check Sentry dashboard for errors
- [ ] Monitor Core Web Vitals in Search Console
- [ ] Check uptime (site accessible)
- [ ] Review form submissions

### Weekly Checks
- [ ] Security header test (securityheaders.com)
- [ ] SSL certificate status (if HTTPS)
- [ ] Lighthouse performance audit
- [ ] Check for broken links

### Monthly Checks
- [ ] Update dependencies (npm update)
- [ ] Review and rotate CSRF secrets
- [ ] Backup site files
- [ ] Check Google Search Console for issues

---

## 🎉 Deployment Complete!

Once all checkboxes are complete, your portfolio is **production-ready** and **secure**!

**Next Steps:**
1. Monitor performance for 24 hours
2. Share portfolio URL: https://azharalidayo.me
3. Submit to Google Search Console
4. Add to professional profiles (LinkedIn, GitHub)

**Questions?**
- Security: [SECURITY-HARDENING-STATUS.md](SECURITY-HARDENING-STATUS.md)
- Deployment: [PRODUCTION-DEPLOYMENT-GUIDE.md](PRODUCTION-DEPLOYMENT-GUIDE.md)
- Quick Start: [PRODUCTION-QUICK-START.md](PRODUCTION-QUICK-START.md)

---

**Deployed:** ✅  
**Secure:** ✅  
**Tested:** ✅  
**Live:** 🚀

**Congratulations on your production deployment!** 🎊
