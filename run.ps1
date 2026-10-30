# IT's Playtime - Development Launcher Script
Write-Host "🎈 Starting IT's Playtime Horror Gaming Platform..." -ForegroundColor Red

# 1. Start Python Backend in background
Write-Host "⚙️ Launching Flask AI Backend on http://127.0.0.1:5000..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location "$using:PSScriptRoot\backend"
    python app.py
}

Start-Sleep -Seconds 2

# 2. Start Frontend Dev Server
Write-Host "🎪 Launching Vite Frontend on http://localhost:5173..." -ForegroundColor Green
Set-Location "$PSScriptRoot\frontend"
npm run dev
