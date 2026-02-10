# TalentFlow SAP - PowerShell Startup Script
# For Windows 11

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  TalentFlow SAP - Accenture Talent Intelligence" -ForegroundColor Cyan
Write-Host "  SAP Professional Hiring Platform - Brazil" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Check for Node.js
try {
    $nodeVersion = node --version
    Write-Host "[INFO] Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Recommended: Node.js 18 LTS or later" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "[SETUP] Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Copy .env if needed
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Write-Host "[SETUP] Creating .env from .env.example..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env"
        Write-Host "[INFO] Please edit .env with your API keys for full functionality" -ForegroundColor Yellow
    }
}

# Create data directory
if (-not (Test-Path "data")) {
    New-Item -ItemType Directory -Path "data" | Out-Null
}

# Run migrations and seed
Write-Host "[SETUP] Setting up database..." -ForegroundColor Yellow
npx tsx server/db/migrate.ts
npx tsx server/db/seed.ts
Write-Host ""

# Start the application
Write-Host "[START] Launching TalentFlow SAP..." -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the application" -ForegroundColor Gray
Write-Host ""

npm run dev
