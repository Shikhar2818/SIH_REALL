@echo off
title Rapy Platform - Full Startup
color 0A

echo.
echo ================================================================
echo    Rapy Platform - Full Startup
echo ================================================================
echo.

REM Check if Docker is running
echo [1/6] Checking Docker status...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not running!
    echo Please install Docker Desktop and start it.
    pause
    exit /b 1
)
echo ✓ Docker is running

echo.
echo [2/6] Starting MongoDB and MailHog containers...
docker compose up mongo mailhog -d
if %errorlevel% neq 0 (
    echo ERROR: Failed to start MongoDB and MailHog containers!
    pause
    exit /b 1
)
echo ✓ MongoDB and MailHog started successfully

echo.
echo [3/6] Starting AI Chatbot Service (Dr. Sarah AI)...
echo ---------------------------------------------
cd /d "%~dp0..\bot"
echo Installing Python dependencies if needed...
pip install -r requirements.txt >nul 2>&1
start "AI Chatbot Service" cmd /k "cd /d %~dp0..\bot && python start_backend.py"
echo ✓ AI Chatbot Service starting...

echo.
echo [4/6] Waiting for AI service to initialize...
timeout /t 15 /nobreak >nul

echo.
echo [5/6] Starting Backend Server...
cd /d "%~dp0..\backend"
start "Backend Server" cmd /k "cd /d %~dp0..\backend && npm run dev"
echo ✓ Backend Server starting...

echo.
echo [6/6] Starting Frontend Server...
cd /d "%~dp0..\frontend"
start "Frontend Server" cmd /k "cd /d %~dp0..\frontend && npm run dev"
echo ✓ Frontend Server starting...

echo.
echo ================================================================
echo                    ALL SERVICES STARTED!
echo ================================================================
echo.
echo ✓ MongoDB:         localhost:27017
echo ✓ MailHog:         http://localhost:8025
echo ✓ AI Chatbot:      http://localhost:5000
echo ✓ Backend API:     http://localhost:3001
echo ✓ Frontend App:    http://localhost:3000
echo.
echo ================================================================
echo                    QUICK ACCESS
echo ================================================================
echo.
echo Press 1 to open Frontend Application
echo Press 2 to open AI Chatbot Interface
echo Press 3 to open Email Testing (MailHog)
echo Press 4 to check Backend Health
echo Press 5 to check AI Chatbot Health
echo Press 6 to view all services status
echo Press 7 to stop all services
echo Press 0 to exit
echo.

:menu
set /p choice="Enter your choice (0-7): "

if "%choice%"=="1" (
    echo Opening Frontend Application...
    start http://localhost:3000
    goto menu
)

if "%choice%"=="2" (
    echo Opening AI Chatbot Interface...
    start http://localhost:5000
    goto menu
)

if "%choice%"=="3" (
    echo Opening Email Testing Interface...
    start http://localhost:8025
    goto menu
)

if "%choice%"=="4" (
    echo Checking Backend Health...
    curl -s http://localhost:3001/health
    echo.
    echo.
    goto menu
)

if "%choice%"=="5" (
    echo Checking AI Chatbot Health...
    curl -s http://localhost:5000/health
    echo.
    echo.
    goto menu
)

if "%choice%"=="6" (
    echo.
    echo ================================================================
    echo                    SERVICES STATUS CHECK
    echo ================================================================
    echo.
    echo Checking Docker containers...
    docker compose ps
    echo.
    echo Checking running processes...
    netstat -an | findstr ":3000\|:3001\|:5000\|:27017\|:8025"
    echo.
    echo.
    goto menu
)

if "%choice%"=="7" (
    echo.
    echo Stopping all services...
    echo.
    echo Stopping Docker containers...
    docker compose down
    echo.
    echo Stopping Node.js processes...
    taskkill /f /im node.exe >nul 2>&1
    echo.
    echo Stopping Python processes...
    taskkill /f /im python.exe >nul 2>&1
    echo.
    echo All services stopped successfully!
    echo.
    pause
    exit /b 0
)

if "%choice%"=="0" (
    echo.
    echo Exiting Service Manager...
    echo Services will continue running in background.
    echo To stop all services, run: stop-services.bat
    echo.
    exit /b 0
)

echo Invalid choice! Please enter 0-7.
goto menu
