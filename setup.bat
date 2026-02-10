@echo off
title TalentFlow SAP - First Time Setup
echo.
echo ========================================================
echo   TalentFlow SAP - First Time Setup
echo   Accenture SAP Talent Intelligence Platform
echo ========================================================
echo.

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js 18 LTS or later from:
    echo   https://nodejs.org/
    echo.
    echo After installing, restart this script.
    pause
    exit /b 1
)

echo [1/5] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed
    pause
    exit /b 1
)

echo.
echo [2/5] Creating environment configuration...
if not exist ".env" (
    copy .env.example .env
    echo   Created .env file - edit with your API keys
) else (
    echo   .env already exists - skipping
)

echo.
echo [3/5] Creating data directory...
if not exist "data" mkdir data

echo.
echo [4/5] Running database migrations...
call npx tsx server/db/migrate.ts

echo.
echo [5/5] Seeding sample data...
call npx tsx server/db/seed.ts

echo.
echo ========================================================
echo   Setup complete!
echo.
echo   To start the application, run:
echo     start.bat
echo.
echo   Or use PowerShell:
echo     .\start.ps1
echo.
echo   The app will be available at:
echo     http://localhost:3000
echo ========================================================
echo.
pause
