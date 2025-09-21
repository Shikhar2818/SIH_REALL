@echo off
title Digital Psychological Intervention Platform - Stop Services
color 0C

echo.
echo ================================================================
echo    Digital Psychological Intervention Platform - Stop Services
echo ================================================================
echo.

echo Stopping all services...
echo.

echo [1/3] Stopping Docker containers...
docker compose down
if %errorlevel% neq 0 (
    echo WARNING: Some Docker containers may not have stopped properly.
)

echo.
echo [2/3] Stopping Node.js processes...
taskkill /f /im node.exe >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Some Node.js processes may not have stopped properly.
)

echo.
echo [3/3] Cleaning up...
timeout /t 2 /nobreak >nul

echo.
echo ================================================================
echo                    SERVICES STOPPED
echo ================================================================
echo.
echo ✓ All Docker containers stopped
echo ✓ All Node.js processes stopped
echo ✓ All services have been shut down
echo.
echo To start services again, run: start-services.bat
echo.
pause
