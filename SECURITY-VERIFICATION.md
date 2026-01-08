# Security Configuration Verification Guide

## Overview
This document provides instructions for verifying that directory listing has been disabled for sensitive directories in the portfolio.

## Configuration Applied

### Primary Security Measure
- **Directive**: `Options -Indexes`
- **Effect**: Disables directory browsing for all directories
- **Files Protected**: All files in `/js/`, `/assets/`, `/assets/styles/`, and subdirectories

### Additional Security
- Hidden files protection (`.git`, `.env`, `.github`)
- Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- Sensitive file access restrictions
- MIME type protection

---

## Verification Steps

### 1. Test Directory Listing (Should FAIL)

Try accessing these URLs in your browser:

```
https://your-domain.com/js/
https://your-domain.com/assets/
https://your-domain.com/assets/styles/
https://your-domain.com/assets/scripts/
https://your-domain.com/assets/images/
```

**Expected Result**: 
- **403 Forbidden** error, OR
- **404 Not Found** error
- **No directory listing** should be visible

**Failure Indicators**:
- You see a list of files and folders
- You can browse directory contents
- Apache/server version information is visible

---

### 2. Test File Access (Should SUCCEED)

Verify individual files are still accessible:

```
https://your-domain.com/index.html
https://your-domain.com/js/system-state-mode.js
https://your-domain.com/js/explain-mode.js
https://your-domain.com/assets/styles/main.css
https://your-domain.com/assets/scripts/main.js
```

**Expected Result**:
- Files load correctly
- No 403 or 404 errors
- Scripts execute, styles apply

---

### 3. Test Protected Files (Should FAIL)

Try accessing configuration/hidden files:

```
https://your-domain.com/.htaccess
https://your-domain.com/.git/config
https://your-domain.com/.gitignore
https://your-domain.com/package.json
https://your-domain.com/README.md
```

**Expected Result**:
- **403 Forbidden** error
- Files should NOT be downloadable

---

### 4. Security Headers Verification

#### Using Browser DevTools:
1. Open any page (e.g., `index.html`)
2. Open Developer Tools (F12)
3. Go to **Network** tab
4. Refresh the page
5. Click on the main document request
6. Check **Response Headers**

**Expected Headers**:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

#### Using Command Line (curl):
```bash
curl -I https://your-domain.com/index.html
```

---

### 5. Apache Configuration Check

#### Local Testing (if Apache installed):
```bash
# Check if .htaccess is being read
apache2ctl -M | grep rewrite

# Test configuration syntax
apachectl configtest

# View error logs
tail -f /var/log/apache2/error.log
```

#### Required Apache Modules:
- `mod_rewrite` (for URL rewriting)
- `mod_headers` (for security headers)
- `mod_deflate` (for compression)
- `mod_expires` (for caching)
- `mod_authz_core` (for access control)

**Enable modules** (if not already enabled):
```bash
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod deflate
sudo a2enmod expires
sudo systemctl restart apache2
```

---

## Common Issues & Solutions

### Issue 1: .htaccess Not Working
**Symptoms**: Directory listing still visible

**Solution**:
1. Verify `.htaccess` file is in the **root directory** of your site
2. Check Apache configuration allows `.htaccess` overrides:
   ```apache
   <Directory /var/www/html>
       AllowOverride All
   </Directory>
   ```
3. Restart Apache: `sudo systemctl restart apache2`

### Issue 2: 500 Internal Server Error
**Symptoms**: All pages return 500 error

**Solution**:
1. Check Apache error logs: `tail -f /var/log/apache2/error.log`
2. Verify all required modules are enabled
3. Check for syntax errors in `.htaccess`
4. Comment out sections one by one to identify the problem

### Issue 3: Files Not Loading
**Symptoms**: CSS/JS files return 403 errors

**Solution**:
1. Check file permissions: `chmod 644 file.css`
2. Check directory permissions: `chmod 755 directory/`
3. Review `<FilesMatch>` directives in `.htaccess`

### Issue 4: Security Headers Not Appearing
**Symptoms**: Headers missing in browser DevTools

**Solution**:
1. Enable `mod_headers`: `sudo a2enmod headers`
2. Restart Apache
3. Clear browser cache
4. Verify with `curl -I https://your-domain.com/`

---

## Testing Checklist

- [ ] `/js/` directory returns 403/404 (not file listing)
- [ ] `/assets/` directory returns 403/404
- [ ] `/assets/styles/` directory returns 403/404
- [ ] Individual `.js` files still load correctly
- [ ] Individual `.css` files still load correctly
- [ ] Images still display correctly
- [ ] `.htaccess` file not accessible via browser
- [ ] `.git/` directory not accessible
- [ ] `package.json` not accessible
- [ ] Security headers present in response
- [ ] Website functions normally (no broken features)
- [ ] Forms submit correctly
- [ ] Navigation works across all pages

---

## Production Deployment Notes

### Before Deploying:
1. **Test locally** if possible (XAMPP, WAMP, or local Apache server)
2. **Backup existing `.htaccess`** if one exists
3. **Review custom directives** (HTTPS redirect, hotlink protection)
4. **Update domain names** in commented sections

### After Deploying:
1. **Immediate verification** - Test all URLs above
2. **Monitor error logs** for the first 24 hours
3. **Check analytics** - Verify no drop in traffic (false 403s)
4. **Test all functionality** - Forms, animations, interactive features

### Optional Enhancements:
Uncomment these sections in `.htaccess` when ready:

```apache
# Force HTTPS (requires SSL certificate)
# Lines 70-75

# Hotlink Protection (prevents image theft)
# Lines 105-111
```

---

## Security Best Practices

✅ **Implemented**:
- Directory listing disabled
- Hidden files protected
- Security headers enabled
- Sensitive files blocked

🔒 **Recommended Next Steps**:
1. Implement SSL/TLS (HTTPS)
2. Set up Content Security Policy (CSP)
3. Regular security audits
4. Keep server software updated
5. Monitor access logs for suspicious activity

---

## Support & Troubleshooting

### If Issues Persist:

1. **Check Server Configuration**:
   - Hosting provider may restrict `.htaccess` functionality
   - Some shared hosts disable certain directives
   - Contact support if `.htaccess` changes don't apply

2. **Alternative Solutions**:
   - Nginx: Use `autoindex off;` in server block
   - IIS: Disable directory browsing in web.config
   - Node.js: Configure express static middleware
   - Cloud hosting: Use platform-specific settings

3. **Manual Verification**:
   ```bash
   # Test from command line
   curl -I https://your-domain.com/js/
   curl -I https://your-domain.com/assets/
   ```

---

## Documentation References

- Apache mod_autoindex: https://httpd.apache.org/docs/current/mod/mod_autoindex.html
- Apache .htaccess: https://httpd.apache.org/docs/current/howto/htaccess.html
- Security Headers: https://securityheaders.com/
- OWASP Security Guidelines: https://owasp.org/

---

**Last Updated**: January 9, 2026  
**Configuration File**: `.htaccess` (root directory)  
**Status**: ✅ Directory Listing Disabled
