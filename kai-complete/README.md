# KAI — Complete 10/10 Vision
Unzip into `dropos-v2/` — all files land in the right place automatically.

---

## What's Inside (Full Vision)

```
BACKEND:
  services/kai.service.ts         ← Core AI: Claude streaming, web search, intent detection
  services/kai.memory.service.ts  ← Persistent memory: learns forever across sessions
  services/kai.pulse.service.ts   ← Proactive 24/7 monitoring and alerts
  services/kai.market.service.ts  ← Daily market intelligence: forex, trends, seasonality
  controllers/kai.controller.ts   ← All 20+ endpoints
  routes/kai.routes.ts            ← Route definitions
  jobs/kai.jobs.ts                ← Background cron: Pulse every 2h, Market daily, Briefs at 7am

FRONTEND:
  types/kai.ts                    ← All TypeScript types
  store/kai.store.ts              ← Complete Zustand state
  hooks/useKai.ts                 ← All API calls + streaming
  components/kai/
    KAIChat.tsx                   ← Main chat with 5 tabs
    KAISidebar.tsx                ← Conversation history
    KAIMessage.tsx                ← Message bubbles
    KAIInput.tsx                  ← Floating input + image + voice
    KAIPulse.tsx                  ← Proactive alerts panel
    KAISkills.tsx                 ← Saved prompts panel
    KAIMemory.tsx                 ← What KAI remembers panel
    KAIGoals.tsx                  ← Business goals panel
  app/dashboard/kai/page.tsx      ← The full page

DATABASE:
  add-to-schema.prisma            ← 9 new Prisma models
  kai-migration.sql               ← Raw SQL alternative
```

---

## 4 Steps After Unzipping

### Step 1 — Add Prisma Models
Open `backend/prisma/schema.prisma`

Paste everything from `database/add-to-schema.prisma` at the bottom.

Also add these to the **Store model**:
```prisma
kaiConversations  KaiConversation[]
kaiMemories       KaiMemory[]
kaiGoals          KaiGoal[]
kaiSkills         KaiSkill[]
kaiPulseAlerts    KaiPulseAlert[]
kaiBrandVoice     KaiBrandVoice?
kaiMorningBriefs  KaiMorningBrief[]
```

### Step 2 — Run Migration
```bash
cd backend
npx prisma migrate dev --name add_kai_complete
npx prisma generate
```

### Step 3 — Register in app.ts
Open `backend/src/app.ts` and add:
```typescript
import kaiRoutes from "./routes/kai.routes";
import "./jobs/kai.jobs";           // starts background jobs

app.use("/api/kai", kaiRoutes);
```

### Step 4 — Add to Dashboard Navigation
Open `frontend/src/components/layout/DashboardLayout.tsx`

Add `Bot` to the lucide-react import at the top.

Add at the **top of the Overview group** in OWNER_NAV:
```typescript
{ href: "/dashboard/kai", icon: Bot, label: "KAI" },
```

---

## Add ANTHROPIC_API_KEY to Render
```
ANTHROPIC_API_KEY = sk-ant-...
```
Without this nothing works.

---

## What KAI Can Do Now (10/10)

### Intelligence
- Real Claude AI responses streaming word by word
- Three-layer context: store data + market cache + live web search
- Intent detection — simple queries answered from DB instantly
- Nigerian/African market intelligence built into every response
- Knows payday cycles, Lagos pricing, seasonal trends

### Memory (NEW)
- Remembers everything across ALL sessions forever
- Learns from every conversation automatically (background)
- Remembers: business facts, preferences, goals, what worked, what failed
- References memory naturally: "You mentioned last week that..."
- Owner can view and delete memories in the Memory tab

### KAI Pulse (NEW)
- Runs 24/7 in background, analyses every store every 2 hours
- Alerts for: unfulfilled orders, sales drops, low stock, goal progress, opportunities
- Colour-coded by severity: info / warning / critical / opportunity
- One-tap to ask KAI about any alert
- Bell icon shows unread count

### Goals (NEW)
- Set revenue, orders, or customer targets with deadlines
- KAI tracks progress automatically
- Progress bars per goal
- KAI references goal progress in conversations
- "Ask KAI" button to get specific action plan for each goal

### Skills (NEW)
- Save any prompt as a one-tap skill
- DropOS global skills: Weekly Summary, Flash Sale, WhatsApp Broadcast, etc.
- Create custom skills for repeated tasks
- Usage tracking per skill

### Brand Voice (NEW)
- KAI analyses owner's writing style from past content
- All generated content matches their exact tone
- Formal / casual / Pidgin / energetic — detected automatically
- Gets smarter over time

### Background Jobs (NEW)
- KAI Pulse: analyses all stores every 2 hours
- Market intelligence: fetches trends, forex daily
- Morning brief: generated for every store at 7am

### Chat Features
- Conversation history saved to DB
- Pin, rename, delete conversations
- Image upload + vision analysis
- Voice input (Web Speech API)
- Copy and share any message
- Context-aware quick action chips (changes based on store state)
- Streaming word by word

---

## The 5 Tabs

| Tab | What It Shows |
|-----|--------------|
| Chat | Main conversation with KAI |
| Pulse | Proactive alerts — KAI noticed something |
| Skills | Saved prompts — one-tap execute |
| Memory | Everything KAI remembers about your business |
| Goals | Business targets with progress tracking |

---

## API Endpoints (all new)

```
GET  /api/kai/greeting              ← personalised greeting + store context
POST /api/kai/smart-chat            ← streaming chat (SSE)
POST /api/kai/action                ← execute approved actions

GET  /api/kai/conversations         ← conversation list
GET  /api/kai/conversation/:id      ← single conversation
PATCH /api/kai/conversation/:id     ← rename/pin/archive
DELETE /api/kai/conversation/:id    ← delete
DELETE /api/kai/conversations/all   ← delete all

GET  /api/kai/memories              ← all memories
DELETE /api/kai/memory/:key         ← delete one memory

GET  /api/kai/pulse                 ← unread alerts
PATCH /api/kai/pulse/:id/read       ← mark read

GET  /api/kai/skills                ← store + global skills
POST /api/kai/skills                ← create skill
DELETE /api/kai/skills/:id          ← delete skill
POST /api/kai/skills/:id/use        ← increment usage

POST /api/kai/analyze-voice         ← analyse brand voice

GET  /api/kai/goals                 ← all goals
POST /api/kai/goals                 ← create goal
```

---

## Files Modified (only 2)

1. `backend/src/app.ts` — add 2 lines
2. `frontend/src/components/layout/DashboardLayout.tsx` — add 1 nav item

Everything else is new files. Zero conflicts.
