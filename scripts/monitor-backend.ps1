# Backend Monitoring Script
# This script monitors the backend server and restarts it if it crashes

param(
    [int]$CheckInterval = 30,  # Check every 30 seconds
    [string]$BackendUrl = "http://localhost:3001/health",
    [string]$BackendPath = "C:\SIH_REAL\backend"
)

Write-Host "Starting Backend Monitor..." -ForegroundColor Green
Write-Host "Check Interval: $CheckInterval seconds" -ForegroundColor Yellow
Write-Host "Backend URL: $BackendUrl" -ForegroundColor Yellow

function Test-BackendHealth {
    try {
        $response = Invoke-RestMethod -Uri $BackendUrl -Method GET -TimeoutSec 5
        return $response.status -eq "OK"
    }
    catch {
        Write-Host "Backend health check failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Start-Backend {
    Write-Host "Starting backend server..." -ForegroundColor Yellow
    try {
        # Kill any existing node processes on port 3001
        $processes = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
        if ($processes) {
            $pids = $processes | Select-Object -ExpandProperty OwningProcess
            foreach ($pid in $pids) {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            }
        }
        
        # Start the backend server
        Start-Process -FilePath "cmd" -ArgumentList "/c", "cd /d `"$BackendPath`" && npm run dev" -WindowStyle Hidden
        Start-Sleep -Seconds 10
        
        # Test if server started successfully
        if (Test-BackendHealth) {
            Write-Host "Backend server started successfully!" -ForegroundColor Green
            return $true
        } else {
            Write-Host "Backend server failed to start properly" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "Error starting backend: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Start-MongoDB {
    Write-Host "Starting MongoDB..." -ForegroundColor Yellow
    try {
        Set-Location "C:\SIH_REAL"
        Start-Process -FilePath "docker" -ArgumentList "compose", "up", "mongo", "mailhog", "-d" -WindowStyle Hidden
        Start-Sleep -Seconds 15
        Write-Host "MongoDB started" -ForegroundColor Green
    }
    catch {
        Write-Host "Error starting MongoDB: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Main monitoring loop
while ($true) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] Checking backend health..." -ForegroundColor Cyan
    
    if (-not (Test-BackendHealth)) {
        Write-Host "[$timestamp] Backend is down! Attempting to restart..." -ForegroundColor Red
        
        # First, make sure MongoDB is running
        Start-MongoDB
        
        # Then start the backend
        if (Start-Backend) {
            Write-Host "[$timestamp] Backend restarted successfully!" -ForegroundColor Green
        } else {
            Write-Host "[$timestamp] Failed to restart backend. Will retry in $CheckInterval seconds..." -ForegroundColor Red
        }
    } else {
        Write-Host "[$timestamp] Backend is healthy" -ForegroundColor Green
    }
    
    Start-Sleep -Seconds $CheckInterval
}
