@echo off
echo Checking Service Status...
echo ========================

echo.
echo Checking Frontend (Port 3000)...
netstat -ano | findstr ":3000" | findstr "LISTENING"
if %errorlevel% equ 0 (
    echo ✅ Frontend is running
) else (
    echo ❌ Frontend is not running
)

echo.
echo Checking Backend (Port 3001)...
netstat -ano | findstr ":3001" | findstr "LISTENING"
if %errorlevel% equ 0 (
    echo ✅ Backend is running
) else (
    echo ❌ Backend is not running
)

echo.
echo Checking AI Chatbot (Port 5000)...
netstat -ano | findstr ":5000" | findstr "LISTENING"
if %errorlevel% equ 0 (
    echo ✅ AI Chatbot is running
) else (
    echo ❌ AI Chatbot is not running
)

echo.
echo ========================
echo Service Status Summary:
echo ========================
echo Frontend: http://localhost:3000
echo Backend: http://localhost:3001
echo AI Chatbot: http://localhost:5000
echo AI Chatbot Page: http://localhost:3000/ai-chatbot
echo.
echo If services are not running, please start them manually:
echo 1. AI Chatbot: cd bot && python start_backend.py
echo 2. Backend: cd backend && npm run dev
echo 3. Frontend: cd frontend && npm run dev
echo.
pause
