@echo off
title TalentFlow SAP - Startup
echo.
echo ========================================================
echo   TalentFlow SAP - Accenture Talent Intelligence
echo   SAP Professional Hiring Platform - Brazil
echo ========================================================
echo.

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo Recommended: Node.js 18 LTS or later
    pause
    exit /b 1
)

:: Display Node version
echo [INFO] Node.js version:
node --version
echo.

:: Check if node_modules exists
if not exist "node_modules" (
    echo [SETUP] Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
    echo.
)

:: Copy .env if needed
if not exist ".env" (
    if exist ".env.example" (
        echo [SETUP] Creating .env from .env.example...
        copy .env.example .env
        echo [INFO] Please edit .env with your API keys for full functionality
        echo.
    )
)

:: Create data directory
if not exist "data" (
    mkdir data
)

:: Run migrations and seed
echo [SETUP] Setting up database...
call npx tsx server/db/migrate.ts
if %errorlevel% neq 0 (
    echo [ERROR] Database migration failed
    pause
    exit /b 1
)

call npx tsx server/db/seed.ts
echo.

:: Start the application
echo [START] Launching TalentFlow SAP...
echo.
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:3001
echo.
echo Press Ctrl+C to stop the application
echo.
call npm run dev
