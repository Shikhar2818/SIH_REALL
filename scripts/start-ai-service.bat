@echo off
echo Starting Dr. Sarah AI Service...
echo =================================

cd /d "%~dp0"

echo Starting AI Chatbot backend...
start "AI Chatbot Service" cmd /k "python start_backend.py"

echo.
echo Waiting for AI service to initialize...
timeout /t 15 /nobreak > nul

echo.
echo Checking if AI service is running...
netstat -ano | findstr ":5000" | findstr "LISTENING"
if %errorlevel% equ 0 (
    echo ✅ AI Chatbot service is running on port 5000
    echo.
    echo Testing AI service health...
    powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5000/api/health' -Method GET; Write-Host '✅ AI Service Health Check: OK'; Write-Host $response.Content } catch { Write-Host '❌ AI Service Health Check: Failed' }"
) else (
    echo ❌ AI Chatbot service is not running on port 5000
    echo Please check the AI service terminal for errors
)

echo.
echo =================================
echo AI Service Status:
echo =================================
echo If the service is running, you can now:
echo 1. Go to http://localhost:3000/ai-chatbot
echo 2. Test the AI chatbot integration
echo 3. The "Fallback Response" should change to "AI service is online"
echo.
pause
