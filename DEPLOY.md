# DropOS Deployment Guide

## Option A — Railway (Easiest, recommended)

### Backend on Railway
1. Go to https://railway.app → New Project → Deploy from GitHub
2. Connect your GitHub and push the `backend/` folder as a repo
3. Railway auto-detects Node.js and uses `railway.json`
4. Add these environment variables in Railway dashboard:
   ```
   DATABASE_URL        = (Railway gives you a free PostgreSQL — use that URL)
   JWT_SECRET          = (any long random string, 32+ chars)
   JWT_REFRESH_SECRET  = (any long random string, 32+ chars)
   NODE_ENV            = production
   FRONTEND_URL        = https://your-app.vercel.app
   CLOUDINARY_CLOUD_NAME = (your Cloudinary name)
   CLOUDINARY_API_KEY    = (your Cloudinary key)
   CLOUDINARY_API_SECRET = (your Cloudinary secret)
   STRIPE_SECRET_KEY   = (your Stripe live key)
   PAYSTACK_SECRET_KEY = (your Paystack live key)
   ```
5. Deploy → Railway gives you a URL like `https://dropos-backend.up.railway.app`

### Frontend on Vercel
1. Go to https://vercel.com → New Project → Import from GitHub
2. Push the `frontend/` folder as a repo
3. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL = https://dropos-backend.up.railway.app/api
   ```
4. Deploy → Vercel gives you a URL like `https://dropos.vercel.app`
5. Go back to Railway → update `FRONTEND_URL` to your Vercel URL

---

## Option B — Render (Free tier available)

### Backend on Render
1. Go to https://render.com → New Web Service → Connect GitHub
2. The `render.yaml` file handles configuration automatically
3. Add secret environment variables (DATABASE_URL, JWT secrets, etc.)

### Frontend on Vercel
Same as Option A step above.

---

## Option C — Docker (VPS/Self-hosted)

```bash
# In the backend folder
docker build -t dropos-backend .
docker run -p 5000:5000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="your-secret" \
  -e NODE_ENV=production \
  dropos-backend
```

---

## Getting Real API Keys

| Service | Where | Cost |
|---------|-------|------|
| **Cloudinary** (images) | cloudinary.com → Dashboard | Free 25GB |
| **Stripe** (payments) | dashboard.stripe.com → API Keys | Free + 2.9% per transaction |
| **Paystack** (payments) | dashboard.paystack.com → Settings → API | Free + 1.5% per transaction |
| **Gmail SMTP** (email) | Google Account → Security → 2FA → App Passwords | Free |
| **SendGrid** (email alt) | sendgrid.com → API Keys | Free 100/day |

---

## Custom Domain

After deploying to Vercel:
1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g. `mystore.com`)
3. Update your DNS records as shown by Vercel
4. SSL is automatic

For store subdomains (e.g. `store.mystore.com/store/demo-store`):
- The app already supports `/store/[slug]` routing
- Custom domain routing can be added via Vercel middleware
