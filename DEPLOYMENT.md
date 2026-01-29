# Deployment Guide for Enable

Enable is a **100% client-side** application that can be deployed to any static hosting platform for **free**. No backend required!

## 📋 Prerequisites

- Your own Claude API key (get one at [console.anthropic.com](https://console.anthropic.com))
- A GitHub account
- 5 minutes

## 🚀 Deploy to Vercel (Recommended)

### Option 1: Deploy via Vercel Dashboard

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"

3. **Done!** 
   - Your app will be live at `your-project.vercel.app`
   - Free SSL certificate included
   - Global CDN distribution

### Option 2: Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts
```

## 🌐 Deploy to Netlify

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Netlify**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository

3. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 18 or higher

4. **Deploy!**
   - Netlify will build and deploy automatically
   - Free SSL and CDN included

## 📦 Deploy to GitHub Pages

1. **Update `next.config.ts`**
   ```typescript
   const nextConfig = {
     output: 'export',
     basePath: '/your-repo-name',
     images: {
       unoptimized: true,
     },
     // ... rest of config
   };
   ```

2. **Build**
   ```bash
   npm run build
   ```

3. **Deploy**
   - Push the `out` directory to `gh-pages` branch
   - Or use GitHub Actions (see `.github/workflows/deploy.yml`)

## 🔒 Security Best Practices

### API Key Management

⚠️ **IMPORTANT**: Never commit API keys to your repository!

Enable stores API keys **client-side only**:
- In browser memory (cleared on refresh)
- Or encrypted in localStorage (stays until manually cleared)

Your API key is **never sent to any server** except Claude's API.

### Security Headers

Enable includes production-ready security headers:
- ✅ Content Security Policy (CSP)
- ✅ HTTPS enforcement (HSTS)
- ✅ XSS protection
- ✅ Clickjacking prevention
- ✅ MIME type sniffing prevention

These are automatically applied in production.

## 🛠️ Environment Variables

Enable **doesn't require** environment variables for deployment! Everything is client-side.

However, if you want to customize:

```env
# Optional: Set Node environment
NODE_ENV=production

# Optional: Analytics/monitoring
NEXT_PUBLIC_ANALYTICS_ID=your-id
```

## 🎨 Custom Domain

### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as shown
4. SSL certificate auto-provisioned

### Netlify
1. Go to Site Settings → Domain management
2. Add custom domain
3. Update DNS records
4. SSL certificate auto-provisioned

## 🔄 Automatic Deployments

Both Vercel and Netlify support automatic deployments:

- **Push to `main`** → Deploys to production
- **Push to feature branch** → Creates preview deployment
- **Open PR** → Creates preview URL automatically

## 📊 Monitoring

### Cost Tracking
Enable includes **built-in cost tracking**:
- Tracks every API call
- Shows real-time costs
- Stores data in IndexedDB (local only)

### Error Monitoring
Production logs are disabled for security. To add monitoring:

```typescript
// In app/layout.tsx or _app.tsx
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

## 🧪 Testing Production Build Locally

```bash
# Build for production
npm run build

# Serve locally
npm start

# Visit http://localhost:3000
```

## 🚨 Troubleshooting

### Build Fails
- Ensure Node.js version is 18+
- Run `npm install` to update dependencies
- Check for TypeScript errors: `npm run build`

### API Not Working
- Check that Claude API is accessible from your region
- Verify API key is valid at [console.anthropic.com](https://console.anthropic.com)
- Check browser console for errors

### Styles Broken
- Clear browser cache
- Ensure all CSS files are included in build
- Check Next.js static file serving

## 📝 Post-Deployment Checklist

- [ ] Test API key entry and storage
- [ ] Verify chat functionality and streaming
- [ ] Check cost tracking updates
- [ ] Test context panel (persona selector)
- [ ] Try demo mode button
- [ ] Test on mobile devices
- [ ] Verify all security headers (use [securityheaders.com](https://securityheaders.com))
- [ ] Test with different Claude models

## 🎉 You're Live!

Your Enable deployment is now:
- ✅ Globally distributed
- ✅ SSL secured
- ✅ 100% free (no server costs)
- ✅ Auto-scaling
- ✅ Production-ready

Share with your team and start enabling better demos! 🚀

---

**Need Help?**
- Check the main [README.md](./README.md)
- Review [Next.js deployment docs](https://nextjs.org/docs/deployment)
- Open an issue on GitHub
