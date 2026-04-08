# DropOS Visual Store Editor
Unzip into `dropos-v2/` — files land in correct paths.

---

## What This Is

A 3-panel visual editor for store owners to customise
their store without touching any code.

```
┌─────────────┬──────────────────────┬─────────────┐
│  SETTINGS   │    LIVE PREVIEW      │  KAI CHAT   │
│             │                      │             │
│ • Sections  │  Real iframe of      │ "Make it    │
│ • Colors    │  their actual store  │  darker"    │
│ • Fonts     │                      │             │
│ • Layout    │  Device toggle:      │ "Gold       │
│ • Custom    │  Desktop/Tablet/     │  accent"    │
│             │  Mobile              │             │
│             │                      │ "Round the  │
│             │                      │  buttons"   │
└─────────────┴──────────────────────┴─────────────┘
         TOP BAR: Template picker · Undo/Redo · Save
```

---

## Every Feature

### Template Picker (12 templates)
Click current template name → grid of all 12 templates
with colour previews. Click to switch instantly.

Templates: Classic, Lagos Noir, Bold, Glow, Runway,
Boutique, Cozy, Circuit, Suya, Minimal Pro, Neon Tokyo, Afro Vibe

### Settings Panels

**Sections tab** — drag to reorder, toggle on/off
- Hero Banner, Featured Products, Announcement Bar,
  Trust Badges, New Arrivals, Testimonials, Newsletter

**Colors tab** — click any swatch to open colour picker
- Primary, Accent, Background, Surface, Text, Text Muted
- 8 preset colour schemes for one-click changes

**Fonts tab** — click any font to preview live
- 12 Google Fonts for headings and body separately

**Layout tab** — button group pickers (no dropdowns)
- Header style: Minimal / Centered / Full Width
- Hero style: Fullscreen / Split / Contained
- Button shape: Sharp / Soft / Round
- Product columns: 2 / 3 / 4
- Footer columns: 2 / 3 / 4

**Custom tab** — toggles and text inputs
- Show/hide: Reviews, Trust Badges, Live Sales, Stock Counter
- Announcement bar text
- Social links: Instagram, TikTok, WhatsApp, Twitter

### Live Preview
- Real iframe of their actual store
- Changes apply immediately — no page reload
- Device toggle: Desktop / 768px tablet / 390px mobile
- External preview link (opens store in new tab)

### KAI Chat Panel
- Type natural language → KAI applies instantly
- "make the header darker" → accent colour deepened
- "use a serif heading font" → font changed
- "make buttons more rounded" → roundness updated
- Quick suggestion chips for common changes
- Full chat history in session

### Undo / Redo
- 30 state history
- Ctrl+Z / Ctrl+Y keyboard shortcuts
- Visual undo/redo buttons in top bar

### Save
- Yellow dot indicator when unsaved changes exist
- "Save now" shortcut in the unsaved indicator
- Save button glows purple when dirty
- Green "Saved" flash confirmation on success

---

## 3 Integration Steps

### Step 1 — Add route to app.ts
```typescript
import themeRoutes from "./routes/theme.routes";
app.use("/api/theme", themeRoutes);
```

### Step 2 — Add to Dashboard Nav
```typescript
{ href: "/dashboard/customize", icon: Palette, label: "Customize Store" }
```

### Step 3 — themeSettings already in Store model
If not, add to Prisma schema:
```prisma
model Store {
  // ... existing fields
  themeSettings Json? // stores all theme config
}
```
Run: `npx prisma migrate dev --name add_theme_settings`

---

## Files
```
backend/src/
  services/theme.service.ts      ← Theme CRUD + KAI theme command
  controllers/theme.controller.ts ← Endpoints
  routes/theme.routes.ts         ← Routes

frontend/src/
  app/dashboard/customize/page.tsx ← Complete visual editor
```

---

## How the Live Preview Works

The iframe points to:
`https://{storeSlug}.droposHQ.com?preview=true&editor=true`

When owner changes any setting, the editor sends a
`postMessage` to the iframe with the new theme data.

The store's frontend must listen for this:
```typescript
// In store layout/root
window.addEventListener("message", (event) => {
  if (event.data?.type === "THEME_UPDATE") {
    applyTheme(event.data.settings);
  }
});
```

Until this is wired in the storefront, the iframe shows
the last saved version. Changes appear after saving.
