@echo off
echo ========================================
echo CHECKING SERVICE STATUS
echo ========================================

echo.
echo Checking Backend Server (http://localhost:3001)...
curl -s http://localhost:3001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Backend server is RUNNING
    curl -s http://localhost:3001/health
    echo.
) else (
    echo ✗ Backend server is NOT RUNNING
)

echo.
echo Checking Frontend Server (http://localhost:3000)...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Frontend server is RUNNING
) else (
    echo ✗ Frontend server is NOT RUNNING
)

echo.
echo Checking MongoDB (Docker)...
docker ps --filter "name=mongo" --format "table {{.Names}}\t{{.Status}}" 2>nul | find /i "mongo" >nul
if %errorlevel% equ 0 (
    echo ✓ MongoDB is RUNNING
    docker ps --filter "name=mongo" --format "table {{.Names}}\t{{.Status}}"
) else (
    echo ✗ MongoDB is NOT RUNNING
)

echo.
echo Checking MailHog (Docker)...
docker ps --filter "name=mailhog" --format "table {{.Names}}\t{{.Status}}" 2>nul | find /i "mailhog" >nul
if %errorlevel% equ 0 (
    echo ✓ MailHog is RUNNING
    docker ps --filter "name=mailhog" --format "table {{.Names}}\t{{.Status}}"
) else (
    echo ✗ MailHog is NOT RUNNING
)

echo.
echo Checking Node.js processes...
tasklist /fi "imagename eq node.exe" 2>nul | find /i "node.exe" >nul
if %errorlevel% equ 0 (
    echo ✓ Node.js processes are RUNNING
    echo Active Node.js processes:
    tasklist /fi "imagename eq node.exe"
) else (
    echo ✗ No Node.js processes found
)

echo.
echo ========================================
echo STATUS CHECK COMPLETE
echo ========================================
echo.
echo If any services show as NOT RUNNING, use start-services.bat to start them.
echo If you need to stop all services, use stop-services.bat.
echo.
pause
