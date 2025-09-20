@echo off
echo Starting Stable Backend System...
echo.

REM Check if Docker is running
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

REM Start MongoDB and MailHog
echo Starting MongoDB and MailHog...
docker compose up mongo mailhog -d
if %errorlevel% neq 0 (
    echo ERROR: Failed to start MongoDB container
    pause
    exit /b 1
)

REM Wait for MongoDB to be ready
echo Waiting for MongoDB to be ready...
timeout /t 10 /nobreak >nul

REM Kill any existing backend processes
echo Cleaning up existing backend processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do (
    taskkill /f /pid %%a >nul 2>&1
)

REM Start the backend with environment variables
echo Starting backend server...
set JWT_SECRET=your-super-secret-jwt-key-for-development-only
set JWT_REFRESH_SECRET=your-super-secret-refresh-key-for-development-only
set MONGODB_URI=mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin
set ALLOW_MINIMAL_SEED=true

cd backend
start "Backend Server" cmd /c "npm run dev"

REM Wait a moment for the server to start
timeout /t 5 /nobreak >nul

REM Test if the server is running
echo Testing backend health...
powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:3001/health' -Method GET -TimeoutSec 10; if ($response.status -eq 'OK') { Write-Host 'Backend is running successfully!' -ForegroundColor Green } else { Write-Host 'Backend started but health check failed' -ForegroundColor Yellow } } catch { Write-Host 'Backend failed to start or is not responding' -ForegroundColor Red }"

echo.
echo Backend system started!
echo - MongoDB: http://localhost:27017
echo - Backend: http://localhost:3001
echo - Health Check: http://localhost:3001/health
echo - Detailed Health: http://localhost:3001/health/detailed
echo - MailHog: http://localhost:8025
echo.
echo Press any key to exit...
pause >nul
