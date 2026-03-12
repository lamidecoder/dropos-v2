@echo off
title DropOS
color 0A

:: Check if setup was run
if not exist "%~dp0.setup_done" (
    color 0E
    echo.
    echo  [WARNING] Setup has not been run yet!
    echo  Please run SETUP.bat first, then START.bat.
    echo.
    pause
    exit /b 1
)

echo.
echo  Starting DropOS servers...
echo.

:: Start backend
start "DropOS Backend - Port 5000" cmd /k "cd /d %~dp0backend && color 0B && echo Backend starting... && npm run dev"

:: Wait then start frontend
timeout /t 3 /nobreak >nul
start "DropOS Frontend - Port 3000" cmd /k "cd /d %~dp0frontend && color 0D && echo Frontend starting... && npm run dev"

:: Wait for servers to boot
echo  Waiting for servers to start...
timeout /t 6 /nobreak >nul

color 0A
echo.
echo  ============================================================
echo.
echo   DropOS is running!
echo.
echo   Frontend:    http://localhost:3000
echo   Dashboard:   http://localhost:3000/dashboard
echo   Admin:       http://localhost:3000/admin
echo   Demo Store:  http://localhost:3000/store/demo-store
echo   API:         http://localhost:5000/api
echo.
echo   Login:
echo     owner@dropos.io  /  Owner123!
echo     admin@dropos.io  /  Admin123!
echo.
echo   Opening browser...
echo  ============================================================
echo.

timeout /t 2 /nobreak >nul
start http://localhost:3000/auth/login

echo  Both servers are running in their own windows.
echo  Close those windows to stop the servers.
echo.
pause
