@echo off
title Rapy Platform - Service Manager
color 0A

echo.
echo ================================================================
echo    Rapy Platform - Service Manager
echo ================================================================
echo.

echo Starting all services...
echo.

REM Check if Docker is running
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not running!
    echo Please install Docker Desktop and start it.
    pause
    exit /b 1
)

echo [1/4] Starting MongoDB and MailHog containers...
docker compose up mongo mailhog -d
if %errorlevel% neq 0 (
    echo ERROR: Failed to start MongoDB and MailHog containers!
    pause
    exit /b 1
)
echo ✓ MongoDB and MailHog started successfully

echo.
echo [2/4] Starting Backend Server...
start "Backend Server" cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo [3/4] Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo [4/4] Opening Application in Browser...
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo.
echo ================================================================
echo                    SERVICES STATUS
echo ================================================================
echo.
echo ✓ MongoDB:         localhost:27017
echo ✓ MailHog:         http://localhost:8025
echo ✓ Backend API:     http://localhost:3001
echo ✓ Frontend App:    http://localhost:3000
echo ✓ Email Testing:   http://localhost:8025
echo.
echo ================================================================
echo                    QUICK ACCESS
echo ================================================================
echo.
echo Press 1 to open Frontend Application
echo Press 2 to open Email Testing (MailHog)
echo Press 3 to check Backend Health
echo Press 4 to view all services status
echo Press 5 to stop all services
echo Press 6 to restart all services
echo Press 0 to exit
echo.

:menu
set /p choice="Enter your choice (0-6): "

if "%choice%"=="1" (
    echo Opening Frontend Application...
    start http://localhost:3000
    goto menu
)

if "%choice%"=="2" (
    echo Opening Email Testing Interface...
    start http://localhost:8025
    goto menu
)

if "%choice%"=="3" (
    echo Checking Backend Health...
    curl -s http://localhost:3001/health
    echo.
    echo.
    goto menu
)

if "%choice%"=="4" (
    echo.
    echo ================================================================
    echo                    SERVICES STATUS CHECK
    echo ================================================================
    echo.
    echo Checking Docker containers...
    docker compose ps
    echo.
    echo Checking running processes...
    netstat -an | findstr ":3000\|:3001\|:27017\|:8025"
    echo.
    echo.
    goto menu
)

if "%choice%"=="5" (
    echo.
    echo Stopping all services...
    echo.
    echo Stopping Docker containers...
    docker compose down
    echo.
    echo Stopping Node.js processes...
    taskkill /f /im node.exe >nul 2>&1
    echo.
    echo All services stopped successfully!
    echo.
    pause
    exit /b 0
)

if "%choice%"=="6" (
    echo.
    echo Restarting all services...
    echo.
    echo Stopping current services...
    docker compose down
    taskkill /f /im node.exe >nul 2>&1
    timeout /t 2 /nobreak >nul
    echo.
    echo Restarting services...
    call "%~dp0%~nx0"
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

echo Invalid choice! Please enter 0-6.
goto menu
