# DropOS PWA & Push Notifications Setup

## 1. Generate VAPID Keys (one-time)

```bash
cd backend
node scripts/generate-vapid-keys.mjs
```

Copy the output to both `backend/.env` and `frontend/.env.local`.

## 2. Backend .env additions

```
VAPID_PUBLIC_KEY=<your_public_key>
VAPID_PRIVATE_KEY=<your_private_key>
VAPID_EMAIL=mailto:push@yourdomain.com
```

## 3. Frontend .env.local additions

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<your_public_key>
```

## 4. Build for PWA (production only — SW disabled in dev)

```bash
cd frontend
npm run build
npm start
```

## 5. Install prompt

The `PWAInstallBanner` component auto-appears when:
- The user is on a supported browser (Chrome, Edge, Samsung Internet)
- The app isn't already installed
- The user hasn't dismissed it before

## Push notification triggers

| Event           | Template                     | Fired in                        |
|-----------------|------------------------------|---------------------------------|
| New order       | `PushTemplates.newOrder()`   | `order.controller.ts`           |
| Low stock       | `PushTemplates.lowStock()`   | Add to product update route     |
| New review      | `PushTemplates.reviewReceived()` | `review.routes.ts` POST     |
| Abandoned cart  | `PushTemplates.abandonedCart()`  | Cron job / abandoned cart route |
| Payout ready    | `PushTemplates.payoutReady()`    | `affiliate.routes.ts` payout   |
| Flash sale live | `PushTemplates.flashSaleLive()` | `discount.routes.ts` at start  |

## iOS / Safari notes

iOS Safari supports PWA install via "Add to Home Screen" in the Share menu.
The `beforeinstallprompt` event is NOT fired on iOS — the install banner 
won't appear automatically there. Consider adding an iOS-specific prompt 
that shows when `navigator.standalone !== true` and the user is on Safari/iOS.

## Service worker

The custom SW additions are in `public/sw-custom.js`. next-pwa injects this
into the generated `sw.js`. Features:
- Offline fallback page (`/offline`)
- Push notification display + click routing  
- Background sync for queued API mutations
- Cache-first for static assets, network-first for API calls
