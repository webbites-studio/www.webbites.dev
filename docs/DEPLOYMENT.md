# Deployment Guide

## Overview

This guide covers deploying the WebBites.dev website to various hosting platforms and environments. The site is a static website requiring no server-side processing, making deployment straightforward.

## Pre-Deployment Checklist

### 1. Content Verification
- [ ] All text content is proofread and accurate
- [ ] All images are optimized and loaded
- [ ] Contact information is correct
- [ ] Links are working and point to correct destinations
- [ ] SEO meta tags are populated with accurate information

### 2. Testing
- [ ] Test in multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices (iOS and Android)
- [ ] Test theme switching (Light/Dark/System)
- [ ] Test all navigation links
- [ ] Test form validation (if forms are implemented)
- [ ] Verify smooth scrolling and animations

### 3. Optimization
- [ ] Images are compressed and optimized
- [ ] Unused CSS/JS is removed
- [ ] Meta tags are properly configured
- [ ] favicon.ico is present (if desired)
- [ ] robots.txt is configured (if needed)

## Deployment Options

### Option 1: Static Web Hosting Services

#### Netlify

**Pros**: Free tier, automatic HTTPS, CDN, continuous deployment

**Steps:**
1. Create account at [netlify.com](https://netlify.com)
2. Click "Add new site" → "Deploy manually"
3. Drag and drop the `html` folder
4. Or connect to Git repository for automatic deployments
5. Configure custom domain (if applicable)

**Configuration:**
Create `netlify.toml` in project root (optional):
```toml
[build]
  publish = "html"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Vercel

**Pros**: Fast CDN, free tier, excellent performance

**Steps:**
1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to project directory
3. Run `vercel`
4. Follow prompts to deploy
5. Configure custom domain in dashboard

**Configuration:**
Create `vercel.json` in project root:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "html/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/html/$1"
    }
  ]
}
```

#### GitHub Pages

**Pros**: Free, integrated with Git, automatic deployments

**Steps:**
1. Push code to GitHub repository
2. Go to repository Settings → Pages
3. Select branch and folder (`/html` or root)
4. Save and wait for deployment
5. Access at `username.github.io/repository-name`

**Configuration:**
If using root of repo, move `html` contents to root and add `.nojekyll` file:
```bash
touch .nojekyll
```

### Option 2: Traditional Web Hosting

#### Shared Hosting (cPanel)

**Compatible Hosts**: Bluehost, HostGator, SiteGround, etc.

**Steps:**
1. Access cPanel File Manager
2. Navigate to `public_html` directory
3. Upload contents of `html` folder
4. Verify index.html is in root
5. Test the website URL

**FTP Upload:**
```bash
# Using FileZilla or similar FTP client
Host: ftp.yourdomain.com
Username: your-username
Password: your-password
Port: 21 (or 22 for SFTP)

# Upload html/* to public_html/
```

#### VPS/Cloud Servers

**Compatible Services**: AWS EC2, DigitalOcean, Linode, Vultr

**Using Apache:**
```bash
# Install Apache
sudo apt update
sudo apt install apache2

# Copy files
sudo cp -r html/* /var/www/html/

# Set permissions
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html

# Restart Apache
sudo systemctl restart apache2
```

**Using Nginx:**
```bash
# Install Nginx
sudo apt update
sudo apt install nginx

# Create site configuration
sudo nano /etc/nginx/sites-available/webbites

# Add configuration (see Nginx config below)

# Enable site
sudo ln -s /etc/nginx/sites-available/webbites /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/webbites/html;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss;
}
```

## Custom Domain Configuration

### DNS Settings

**For Netlify/Vercel:**
1. Add custom domain in platform dashboard
2. Update DNS records with your registrar:
   ```
   Type: A
   Name: @
   Value: [provided by platform]

   Type: CNAME
   Name: www
   Value: [provided by platform]
   ```

**For Direct Hosting:**
```
Type: A
Name: @
Value: [your server IP]

Type: A
Name: www
Value: [your server IP]
```

### SSL/TLS Certificate

**Automatic (Netlify/Vercel/GitHub Pages):**
- SSL automatically provisioned
- No configuration needed

**Manual (VPS/Cloud):**
```bash
# Using Let's Encrypt (free)
sudo apt install certbot python3-certbot-nginx

# For Nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# For Apache
sudo certbot --apache -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Performance Optimization

### 1. Image Optimization

```bash
# Using ImageMagick
mogrify -format webp -quality 85 images/*.jpg

# Using online tools
# - TinyPNG.com
# - Squoosh.app
# - ImageOptim (Mac)
```

### 2. CDN Integration

**Cloudflare (Free):**
1. Sign up at cloudflare.com
2. Add your domain
3. Update nameservers with your registrar
4. Configure caching rules
5. Enable "Always Use HTTPS"

### 3. Caching Headers

**Apache (.htaccess):**
```apache
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

**Nginx:**
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|webp)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location ~* \.(css|js)$ {
    expires 1M;
    add_header Cache-Control "public";
}
```

## Environment-Specific Configuration

### Development
```bash
# Local development server
cd html
python -m http.server 8000
# Access at http://localhost:8000
```

### Staging
- Use subdomain: `staging.yourdomain.com`
- Same configuration as production
- Test all features before production deploy

### Production
- Use main domain
- Enable caching and compression
- Set up monitoring and analytics
- Configure backup strategy

## Continuous Deployment

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Netlify
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v1.2
        with:
          publish-dir: './html'
          production-branch: main
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### Git Hooks

Create `.git/hooks/pre-push`:

```bash
#!/bin/bash
echo "Running pre-push checks..."

# Check if HTML is valid (optional)
# htmlhint html/index.html

echo "Checks passed!"
```

## Monitoring & Analytics

### Google Analytics

Add before closing `</head>` tag:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Uptime Monitoring

Free services:
- UptimeRobot.com
- Pingdom (free tier)
- StatusCake

## Rollback Strategy

### Quick Rollback

**Netlify/Vercel:**
- Use dashboard to deploy previous version
- Or use CLI: `netlify rollback`

**Git-based:**
```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

**Manual:**
- Keep backup of previous version
- Upload via FTP/File Manager if needed

## Troubleshooting

### Issue: 404 errors
**Solution:** Verify index.html is in the correct directory

### Issue: CSS not loading
**Solution:** Check file paths (relative vs absolute)

### Issue: HTTPS not working
**Solution:** Verify SSL certificate is installed and DNS propagated

### Issue: Slow loading
**Solution:** Optimize images, enable compression, use CDN

### Issue: Theme not persisting
**Solution:** Ensure JavaScript is enabled and localStorage is accessible

## Post-Deployment

1. **Test thoroughly** in production environment
2. **Monitor analytics** for traffic and errors
3. **Set up backups** (automated if possible)
4. **Document** any custom configurations
5. **Update DNS records** if needed
6. **Submit sitemap** to Google Search Console
7. **Test mobile responsiveness** on real devices

## Security Best Practices

1. Always use HTTPS
2. Set security headers (CSP, HSTS)
3. Keep dependencies updated (Tailwind CDN)
4. Regular backups
5. Monitor for suspicious activity
6. Use strong passwords for hosting accounts
7. Enable 2FA on hosting accounts

## Support & Resources

- **Netlify Docs**: docs.netlify.com
- **Vercel Docs**: vercel.com/docs
- **GitHub Pages**: docs.github.com/pages
- **Let's Encrypt**: letsencrypt.org
- **Cloudflare**: cloudflare.com/learning
