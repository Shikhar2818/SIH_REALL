@echo off
title Digital Psychological Intervention Platform - Setup and Run
color 0E

echo.
echo ================================================================
echo    Digital Psychological Intervention Platform - Setup and Run
echo ================================================================
echo.

echo This script will set up and run the entire application.
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed!
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo ✓ Node.js and Docker are installed
echo.

echo [1/5] Installing Backend Dependencies...
cd /d "%~dp0backend"
if not exist "node_modules" (
    echo Installing backend dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install backend dependencies!
        pause
        exit /b 1
    )
) else (
    echo Backend dependencies already installed
)
echo ✓ Backend dependencies ready

echo.
echo [2/5] Installing Frontend Dependencies...
cd /d "%~dp0frontend"
if not exist "node_modules" (
    echo Installing frontend dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install frontend dependencies!
        pause
        exit /b 1
    )
) else (
    echo Frontend dependencies already installed
)
echo ✓ Frontend dependencies ready

echo.
echo [3/5] Starting Docker Services...
cd /d "%~dp0"
docker compose up mongo mailhog -d
if %errorlevel% neq 0 (
    echo ERROR: Failed to start Docker services!
    pause
    exit /b 1
)
echo ✓ Docker services started

echo.
echo [4/5] Starting Backend Server...
start "Backend Server" cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 5 /nobreak >nul
echo ✓ Backend server starting...

echo.
echo [5/5] Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 5 /nobreak >nul
echo ✓ Frontend server starting...

echo.
echo ================================================================
echo                    SETUP COMPLETE!
echo ================================================================
echo.
echo All services are starting up. Please wait a moment for them to fully load.
echo.
echo Services:
echo ✓ MongoDB:         localhost:27017
echo ✓ MailHog:         http://localhost:8025
echo ✓ Backend API:     http://localhost:3001
echo ✓ Frontend App:    http://localhost:3000
echo.
echo The application will open in your browser automatically.
echo.
echo To manage services, use:
echo - start-services.bat  (Start all services)
echo - stop-services.bat   (Stop all services)
echo - check-status.bat    (Check service status)
echo.

timeout /t 10 /nobreak >nul
start http://localhost:3000

echo.
echo Press any key to exit...
pause >nul
