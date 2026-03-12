@echo off
title DropOS Setup
color 0A

echo.
echo  ██████╗ ██████╗  ██████╗ ██████╗  ██████╗ ███████╗
echo  ██╔══██╗██╔══██╗██╔═══██╗██╔══██╗██╔═══██╗██╔════╝
echo  ██║  ██║██████╔╝██║   ██║██████╔╝██║   ██║███████╗
echo  ██║  ██║██╔══██╗██║   ██║██╔═══╝ ██║   ██║╚════██║
echo  ██████╔╝██║  ██║╚██████╔╝██║     ╚██████╔╝███████║
echo  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝      ╚═════╝ ╚══════╝
echo.
echo  Full setup - installs everything and prepares database.
echo  Takes about 3-5 minutes. Please wait.
echo.

:: ── Check Node.js ─────────────────────────────────────────────────────────────
node --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo  [ERROR] Node.js is not installed!
    echo  Download it from: https://nodejs.org  (choose LTS version)
    echo  Then run SETUP.bat again.
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do set NODE_VER=%%v
echo  [OK] Node.js %NODE_VER% found

:: ── Check PostgreSQL ──────────────────────────────────────────────────────────
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0E
    echo.
    echo  [WARNING] psql not found in PATH.
    echo  Make sure PostgreSQL is installed and running.
    echo  Download: https://www.postgresql.org/download/windows/
    echo.
    echo  If PostgreSQL IS installed but not in PATH, that is OK.
    echo  Just make sure the service is running before continuing.
    echo.
    pause
    color 0A
)

:: ── Backend dependencies ──────────────────────────────────────────────────────
echo.
echo  [1/6] Installing backend dependencies...
cd /d "%~dp0backend"
call npm install
if %errorlevel% neq 0 (
    color 0C
    echo  [ERROR] Backend npm install failed. Check your internet connection.
    pause
    exit /b 1
)
echo  [1/6] Done.

:: ── Prisma Generate ───────────────────────────────────────────────────────────
echo.
echo  [2/6] Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    color 0C
    echo  [ERROR] prisma generate failed!
    pause
    exit /b 1
)
echo  [2/6] Done.

:: ── Database Migration ────────────────────────────────────────────────────────
echo.
echo  [3/6] Running database migrations...
echo  (Make sure PostgreSQL is running and DATABASE_URL in backend\.env is correct)
echo  Current DATABASE_URL:
findstr "DATABASE_URL" .env
echo.
call npx prisma migrate dev --name init --skip-seed
if %errorlevel% neq 0 (
    color 0E
    echo.
    echo  [WARNING] Migration had an issue.
    echo  Common fixes:
    echo    1. Open backend\.env and check DATABASE_URL password
    echo    2. Make sure PostgreSQL service is running
    echo    3. Create the database manually: createdb dropos_db
    echo.
    echo  Press any key to continue anyway (or Ctrl+C to stop and fix first)
    pause
    color 0A
)
echo  [3/6] Done.

:: ── Seed Database ─────────────────────────────────────────────────────────────
echo.
echo  [4/6] Seeding database with demo accounts...
call npx ts-node prisma/seed.ts
if %errorlevel% neq 0 (
    echo  [4/6] Seed skipped (may already be seeded, that is OK)
) else (
    echo  [4/6] Done.
)

:: ── Frontend dependencies ─────────────────────────────────────────────────────
echo.
echo  [5/6] Installing frontend dependencies...
cd /d "%~dp0frontend"
call npm install
if %errorlevel% neq 0 (
    color 0C
    echo  [ERROR] Frontend npm install failed.
    pause
    exit /b 1
)
echo  [5/6] Done.

:: ── Mark setup complete ───────────────────────────────────────────────────────
echo.
echo  [6/6] Finalizing...
cd /d "%~dp0"
echo SETUP_COMPLETE=true > .setup_done
echo  [6/6] Done.

:: ── Success ───────────────────────────────────────────────────────────────────
echo.
color 0A
echo  ============================================================
echo.
echo   Setup complete!
echo.
echo   Login credentials:
echo     Admin:       admin@dropos.io  /  Admin123!
echo     Store Owner: owner@dropos.io  /  Owner123!
echo.
echo   Double-click START.bat to launch DropOS
echo.
echo  ============================================================
echo.
pause
