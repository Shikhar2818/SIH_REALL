@echo off
echo ========================================
echo STOPPING PSYCHOLOGICAL INTERVENTION PLATFORM
echo ========================================

echo.
echo Step 1: Stopping Node.js processes...
taskkill /f /im node.exe 2>nul
if %errorlevel% equ 0 (
    echo Node.js processes stopped successfully.
) else (
    echo No Node.js processes found.
)

echo.
echo Step 2: Stopping npm processes...
taskkill /f /im npm.exe 2>nul
if %errorlevel% equ 0 (
    echo npm processes stopped successfully.
) else (
    echo No npm processes found.
)

echo.
echo Step 3: Stopping Docker services...
docker compose down
if %errorlevel% equ 0 (
    echo Docker services stopped successfully.
) else (
    echo Docker services were not running or failed to stop.
)

echo.
echo Step 4: Checking for any remaining processes...
tasklist /fi "imagename eq node.exe" 2>nul | find /i "node.exe" >nul
if %errorlevel% equ 0 (
    echo Warning: Some Node.js processes may still be running.
    echo You may need to stop them manually.
) else (
    echo All Node.js processes have been stopped.
)

echo.
echo ========================================
echo SERVICES STOPPED
echo ========================================
echo.
echo All services have been stopped:
echo - Backend server (Node.js)
echo - Frontend server (Node.js)
echo - MongoDB (Docker)
echo - MailHog (Docker)
echo.
echo You can now run start-services.bat to start them again.
echo.
pause
