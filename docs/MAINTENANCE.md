# Maintenance Guide

## Overview

This guide covers ongoing maintenance tasks, updates, and troubleshooting for the WebBites.dev website. Regular maintenance ensures the site remains secure, performant, and up-to-date.

## Regular Maintenance Tasks

### Daily Tasks

#### 1. Monitor Uptime
- Check uptime monitoring service (UptimeRobot, Pingdom, etc.)
- Verify site loads correctly
- Test critical functionality

#### 2. Review Analytics
- Check visitor traffic
- Review bounce rates
- Monitor page load times
- Check for 404 errors

### Weekly Tasks

#### 1. Content Review
- Verify all links are working
- Check for broken images
- Review and respond to inquiries
- Update any time-sensitive content

#### 2. Performance Check
- Test page load speed (Google PageSpeed Insights)
- Verify mobile responsiveness
- Check Core Web Vitals
- Test theme switching functionality

#### 3. Security Scan
- Check SSL certificate status (valid and not expiring soon)
- Review access logs for suspicious activity
- Ensure backups are running

### Monthly Tasks

#### 1. Comprehensive Testing
- Test in all major browsers
- Test on various devices (mobile, tablet, desktop)
- Verify all forms and interactive elements
- Check scroll animations and transitions

#### 2. SEO Review
- Check search rankings
- Review Google Search Console
- Update meta descriptions if needed
- Ensure sitemap is current

#### 3. Backup Verification
- Verify automated backups are running
- Test backup restoration process
- Store backups in multiple locations

#### 4. Performance Optimization
- Review and optimize images
- Check for unused CSS/JavaScript
- Review CDN performance
- Optimize database (if applicable)

### Quarterly Tasks

#### 1. Content Audit
- Review all content for accuracy
- Update outdated information
- Refresh testimonials
- Update portfolio/case studies

#### 2. Dependency Updates
- Check for Tailwind CSS updates
- Review browser compatibility
- Update any third-party services
- Test after updates

#### 3. Strategic Review
- Review analytics trends
- Assess conversion rates
- Identify improvement opportunities
- Plan content updates

## Update Procedures

### Updating Content

#### Text Updates

1. Locate content in `html/index.html`
2. Make changes in your code editor
3. Test locally:
   ```bash
   cd html
   python -m http.server 8000
   ```
4. Verify changes in browser
5. Deploy to production
6. Clear cache if needed

#### Image Updates

1. Optimize new images:
   ```bash
   # Compress images
   # Target size: < 200KB for photos, < 50KB for icons
   ```
2. Upload to `html/images/` directory
3. Update HTML references
4. Test loading and display
5. Remove old images if replaced

### Updating Styles

#### Theme Color Changes

Edit `html/css/styles.css`:

```css
:root {
    --bg-panel: rgba(new, values, here);
    /* Update other variables */
}

html[data-theme="light"] {
    --bg-panel: rgba(new, values, here);
    /* Update light theme too */
}
```

**Testing Checklist:**
- [ ] Dark theme displays correctly
- [ ] Light theme displays correctly
- [ ] System theme switches properly
- [ ] All interactive elements visible
- [ ] Sufficient contrast (WCAG AA)

#### Adding New Styles

1. Add to `html/css/styles.css`
2. Use theme variables for colors
3. Test in both themes
4. Verify responsive behavior
5. Check browser compatibility

### Updating JavaScript

#### Modifying Existing Functions

1. Edit `html/scripts/main.js`
2. Maintain existing function signatures
3. Test thoroughly in multiple browsers
4. Check console for errors
5. Verify localStorage functionality

#### Adding New Features

1. Follow IIFE pattern:
   ```javascript
   (function () {
       'use strict';
       // Your code here
   })();
   ```
2. Add event listeners properly
3. Handle errors gracefully
4. Test with console open
5. Verify mobile functionality

### Version Control

#### Committing Changes

```bash
# Check status
git status

# Stage changes
git add html/index.html html/css/styles.css

# Commit with meaningful message
git commit -m "Update hero section copy and adjust button spacing"

# Push to repository
git push origin main
```

#### Branching Strategy

```bash
# Create feature branch
git checkout -b feature/new-section

# Make changes and commit
git add .
git commit -m "Add new services section"

# Merge back to main
git checkout main
git merge feature/new-section

# Push to remote
git push origin main

# Delete feature branch
git branch -d feature/new-section
```

## Backup Strategy

### Automated Backups

#### Option 1: Git Repository
- All code changes automatically versioned
- Push to GitHub/GitLab/Bitbucket
- Maintain production and development branches

#### Option 2: Hosting Provider
- Enable automatic backups (Netlify, Vercel, etc.)
- Configure backup frequency
- Set retention period

#### Option 3: Custom Script

Create `backup.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y-%m-%d)
BACKUP_DIR="backups/$DATE"

# Create backup directory
mkdir -p $BACKUP_DIR

# Copy website files
cp -r html $BACKUP_DIR/

# Compress
tar -czf "$BACKUP_DIR.tar.gz" $BACKUP_DIR

# Upload to cloud storage (optional)
# aws s3 cp "$BACKUP_DIR.tar.gz" s3://your-bucket/backups/

# Clean up old backups (keep last 30 days)
find backups -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR.tar.gz"
```

Run with cron:
```bash
# Daily backup at 2 AM
0 2 * * * /path/to/backup.sh
```

### Manual Backup

```bash
# Create timestamped backup
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf "webbites_backup_$DATE.tar.gz" html/

# Or zip
zip -r "webbites_backup_$DATE.zip" html/
```

### Restoration Process

```bash
# Extract backup
tar -xzf webbites_backup_YYYYMMDD.tar.gz

# Or unzip
unzip webbites_backup_YYYYMMDD.zip

# Test locally before deploying
cd html
python -m http.server 8000

# Deploy if working correctly
```

## Troubleshooting Common Issues

### Issue: Website Not Loading

**Symptoms:** Site unreachable, 500/502 errors

**Diagnosis:**
1. Check DNS propagation: `nslookup yourdomain.com`
2. Check server status (hosting dashboard)
3. Review error logs
4. Test with different device/network

**Solutions:**
- Contact hosting provider if server down
- Clear DNS cache: `ipconfig /flushdns` (Windows)
- Wait for DNS propagation (24-48 hours after DNS changes)
- Check SSL certificate validity

### Issue: Styles Not Applying

**Symptoms:** Plain unstyled HTML, layout broken

**Diagnosis:**
1. Check browser console for 404 errors
2. Verify file paths in HTML
3. Check CSS file exists and is accessible
4. Test with browser cache cleared

**Solutions:**
```html
<!-- Verify correct paths -->
<link rel="stylesheet" href="css/styles.css">

<!-- Not: -->
<link rel="stylesheet" href="/css/styles.css">
<link rel="stylesheet" href="../css/styles.css">
```

Clear cache:
- Chrome: Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
- Hard reload: Ctrl+Shift+R or Cmd+Shift+R

### Issue: JavaScript Not Working

**Symptoms:** Theme toggle broken, animations not playing

**Diagnosis:**
1. Open browser console (F12)
2. Check for JavaScript errors
3. Verify script file loads
4. Test in different browser

**Solutions:**
- Fix syntax errors in console
- Verify script path in HTML
- Ensure script loads after DOM:
  ```html
  <script src="scripts/main.js"></script>
  <!-- Place before closing </body> tag -->
  ```
- Check for conflicts with browser extensions

### Issue: Theme Not Persisting

**Symptoms:** Theme resets on page reload

**Diagnosis:**
1. Check if localStorage is enabled
2. Verify JavaScript errors in console
3. Test in incognito/private mode

**Solutions:**
- Enable localStorage in browser settings
- Check for privacy/cookie restrictions
- Verify theme code in `main.js`:
  ```javascript
  localStorage.setItem('studio-theme', mode);
  ```

### Issue: Slow Loading

**Symptoms:** Page takes > 3 seconds to load

**Diagnosis:**
1. Test with Google PageSpeed Insights
2. Check Network tab in browser DevTools
3. Verify image sizes
4. Check CDN status (Tailwind CSS)

**Solutions:**
- Optimize images (compress, resize, convert to WebP)
- Enable caching headers
- Use CDN (Cloudflare)
- Minimize CSS/JavaScript
- Enable gzip compression

### Issue: Mobile Display Problems

**Symptoms:** Layout broken on mobile, buttons too small

**Diagnosis:**
1. Test in browser mobile emulator (F12 → Device Toolbar)
2. Test on actual mobile devices
3. Check viewport meta tag
4. Review responsive classes

**Solutions:**
```html
<!-- Ensure viewport meta tag exists -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- Use responsive Tailwind classes -->
<div class="text-sm md:text-base lg:text-lg">
<div class="flex flex-col md:flex-row">
```

## Performance Monitoring

### Tools & Services

#### Google PageSpeed Insights
```
https://pagespeed.web.dev/
```
- Test desktop and mobile
- Target score: > 90
- Fix Critical and High priority issues

#### WebPageTest
```
https://www.webpagetest.org/
```
- Detailed performance analysis
- Waterfall charts
- Multiple location testing

#### Lighthouse (Chrome DevTools)
```
Press F12 → Lighthouse tab → Generate report
```
- Performance score
- Accessibility score
- Best Practices score
- SEO score

### Performance Metrics

**Target Metrics:**
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- First Input Delay (FID): < 100ms
- Time to Interactive (TTI): < 3.8s

### Optimization Checklist

- [ ] Images optimized and compressed
- [ ] CSS minified (if using custom build)
- [ ] JavaScript minified (if using custom build)
- [ ] Caching headers configured
- [ ] Gzip/Brotli compression enabled
- [ ] CDN configured (Cloudflare)
- [ ] Unused CSS removed
- [ ] Critical CSS inlined (advanced)
- [ ] Fonts optimized (preload, display: swap)

## Security Maintenance

### SSL Certificate

**Check Expiration:**
```bash
echo | openssl s_client -servername yourdomain.com -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

**Auto-Renewal (Let's Encrypt):**
```bash
# Test renewal
sudo certbot renew --dry-run

# Actual renewal (runs automatically)
sudo certbot renew
```

### Security Headers

Add to server configuration:

**Nginx:**
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' https: 'unsafe-inline'" always;
```

**Apache (.htaccess):**
```apache
<IfModule mod_headers.c>
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-Content-Type-Options "nosniff"
    Header set Referrer-Policy "no-referrer-when-downgrade"
</IfModule>
```

### Access Logs Review

```bash
# Recent access (last 100 lines)
tail -n 100 /var/log/nginx/access.log

# Recent errors
tail -n 100 /var/log/nginx/error.log

# Failed login attempts (if applicable)
grep "Failed" /var/log/auth.log
```

## Documentation Updates

Keep documentation current:

1. **Update README** when adding new features
2. **Update this MAINTENANCE guide** when procedures change
3. **Document custom configurations** in repository memory
4. **Note known issues** and their solutions
5. **Keep deployment guide** current with hosting changes

## Emergency Procedures

### Site Down Emergency

1. **Check hosting status** immediately
2. **Verify DNS** is resolving
3. **Check SSL certificate** validity
4. **Review recent changes** (git log)
5. **Rollback** if recent deployment caused issue
6. **Contact hosting support** if needed
7. **Communicate** with stakeholders

### Data Loss Recovery

1. **Identify** what was lost
2. **Check backups** (automated and manual)
3. **Restore from backup** if available
4. **Check version control** (git history)
5. **Document incident** for future prevention

### Security Breach Response

1. **Isolate** affected systems immediately
2. **Change all passwords**
3. **Review access logs**
4. **Restore from clean backup**
5. **Update security measures**
6. **Document and report** incident

## Contact & Support

### Internal Team
- Developer: [contact information]
- Designer: [contact information]
- Project Manager: [contact information]

### External Services
- Hosting Support: [provider contact]
- Domain Registrar: [registrar contact]
- CDN Support: [CDN contact]

### Useful Resources
- Project Repository: [GitHub/GitLab URL]
- Analytics Dashboard: [Google Analytics URL]
- Hosting Dashboard: [hosting panel URL]
- Documentation: [docs location]
