@echo off
title Digital Psychological Intervention Platform - Status Check
color 0B

echo.
echo ================================================================
echo    Digital Psychological Intervention Platform - Status Check
echo ================================================================
echo.

echo Checking service status...
echo.

echo [1/4] Checking Docker containers...
echo.
docker compose ps
echo.

echo [2/4] Checking port availability...
echo.
echo Frontend (Port 3000):
netstat -an | findstr :3000
if %errorlevel% equ 0 (
    echo ✓ Frontend is running on port 3000
) else (
    echo ✗ Frontend is NOT running on port 3000
)
echo.

echo Backend (Port 3001):
netstat -an | findstr :3001
if %errorlevel% equ 0 (
    echo ✓ Backend is running on port 3001
) else (
    echo ✗ Backend is NOT running on port 3001
)
echo.

echo MongoDB (Port 27017):
netstat -an | findstr :27017
if %errorlevel% equ 0 (
    echo ✓ MongoDB is running on port 27017
) else (
    echo ✗ MongoDB is NOT running on port 27017
)
echo.

echo MailHog (Port 8025):
netstat -an | findstr :8025
if %errorlevel% equ 0 (
    echo ✓ MailHog is running on port 8025
) else (
    echo ✗ MailHog is NOT running on port 8025
)
echo.

echo [3/4] Testing service endpoints...
echo.
echo Testing Backend Health:
curl -s http://localhost:3001/health
if %errorlevel% equ 0 (
    echo ✓ Backend health check passed
) else (
    echo ✗ Backend health check failed
)
echo.

echo Testing Frontend:
curl -s http://localhost:3000 >nul
if %errorlevel% equ 0 (
    echo ✓ Frontend is accessible
) else (
    echo ✗ Frontend is not accessible
)
echo.

echo [4/4] Quick access links...
echo.
echo ================================================================
echo                    QUICK ACCESS LINKS
echo ================================================================
echo.
echo Frontend Application:    http://localhost:3000
echo Backend API:             http://localhost:3001
echo Email Testing (MailHog): http://localhost:8025
echo Backend Health Check:    http://localhost:3001/health
echo.
echo ================================================================
echo.

echo Press any key to open the main application...
pause >nul
start http://localhost:3000
