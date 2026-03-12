# DropOS — Installation Guide

## Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm 9+

---

## Backend Setup

```bash
cd dropos/backend
npm install
```

### 1. Environment Variables
Copy the example and fill in your values:
```bash
cp .env.example .env
```

Required values in `.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/dropos
JWT_SECRET=<generate: openssl rand -base64 64>
JWT_REFRESH_SECRET=<generate: openssl rand -base64 64>
FRONTEND_URL=http://localhost:3000

# Payments (at least one required)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@yourdomain.com

# File uploads
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# AI (optional)
ANTHROPIC_API_KEY=sk-ant-...

# Push notifications (run: node scripts/generate-vapid-keys.mjs)
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_EMAIL=mailto:admin@yourdomain.com
```

### 2. Database
```bash
npx prisma migrate dev --name init
npx prisma generate
# Optional: seed with demo data
npm run seed
```

### 3. Run
```bash
npm run dev        # development
npm run build && npm start   # production
```

---

## Frontend Setup

```bash
cd dropos/frontend
npm install
```

### 1. Environment Variables
Create `dropos/frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<same as backend VAPID_PUBLIC_KEY>
```

### 2. Run
```bash
npm run dev        # development (http://localhost:3000)
npm run build && npm start   # production
```

---

## Deployment Checklist

- [ ] Set `NODE_ENV=production` in backend
- [ ] Set `trust proxy` is handled automatically in production
- [ ] Run `npx prisma migrate deploy` (not `dev`) in production
- [ ] Set `FRONTEND_URL` to your actual domain
- [ ] Generate VAPID keys with `node scripts/generate-vapid-keys.mjs`
- [ ] Configure Stripe/Paystack webhooks to point to `/api/payments/webhook/stripe` etc.
- [ ] Max file upload is 5MB by default (set `MAX_FILE_SIZE_MB` to change)

---

## Common Issues & Fixes

| Error | Fix |
|-------|-----|
| `prisma generate` fails | Run `npx prisma generate` after any schema change |
| `Cannot find module '@prisma/client'` | Run `npm install && npx prisma generate` |
| JWT secrets missing at startup | Add `JWT_SECRET` and `JWT_REFRESH_SECRET` to `.env` |
| CORS errors | Set `FRONTEND_URL` in backend `.env` to match your frontend URL |
| Push notifications not working | Generate VAPID keys and set both in frontend and backend `.env` |
| `useSearchParams` hydration error | All pages using it are wrapped in `<Suspense>` (already fixed) |
| `use client` missing error | All 31 client components are tagged (already fixed) |
