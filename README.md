# DropOS — Running in VS Code

## One-time setup

Open VS Code, press **Ctrl+`** to open the terminal, then run these commands **in order**:

### Step 1 — Backend setup
```
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts
```

### Step 2 — Frontend setup (open a second terminal with the + button)
```
cd frontend
npm install
```

---

## Start the app (every time)

**Terminal 1 — Backend:**
```
cd backend
npm run dev
```
Wait until you see: `🚀 DropOS API running on port 5000`

**Terminal 2 — Frontend:**
```
cd frontend
npm run dev
```
Wait until you see: `✓ Ready on http://localhost:3000`

Then open: **http://localhost:3000**

---

## Login

| Role        | Email             | Password  |
|-------------|-------------------|-----------|
| Store Owner | owner@dropos.io   | Owner123! |
| Admin       | admin@dropos.io   | Admin123! |

---

## If DATABASE_URL is wrong

Open `backend/.env` and change line 5 to match your PostgreSQL password:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/dropos_db?schema=public"
```
Then redo Step 1.

---

## Pages

| Page        | URL |
|-------------|-----|
| Login       | http://localhost:3000/auth/login |
| Dashboard   | http://localhost:3000/dashboard |
| Admin panel | http://localhost:3000/admin |
| Demo store  | http://localhost:3000/store/demo-store |
| API health  | http://localhost:5000/api/health |
