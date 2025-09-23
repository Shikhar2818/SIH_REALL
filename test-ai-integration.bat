@echo off
echo Testing AI Chatbot Integration...
echo ==================================

echo.
echo 1. Checking AI Service (Port 5000)...
netstat -ano | findstr ":5000" | findstr "LISTENING"
if %errorlevel% equ 0 (
    echo ✅ AI Service is running
) else (
    echo ❌ AI Service is not running - starting it now...
    start "AI Service" cmd /k "cd /d %~dp0\bot && python start_backend.py"
    echo Waiting for AI service to start...
    timeout /t 20 /nobreak > nul
)

echo.
echo 2. Checking Backend Service (Port 3001)...
netstat -ano | findstr ":3001" | findstr "LISTENING"
if %errorlevel% equ 0 (
    echo ✅ Backend Service is running
) else (
    echo ❌ Backend Service is not running
)

echo.
echo 3. Checking Frontend Service (Port 3000)...
netstat -ano | findstr ":3000" | findstr "LISTENING"
if %errorlevel% equ 0 (
    echo ✅ Frontend Service is running
) else (
    echo ❌ Frontend Service is not running
)

echo.
echo 4. Testing AI Service Health...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5000/api/health' -Method GET; Write-Host '✅ AI Service Health: OK'; Write-Host $response.Content } catch { Write-Host '❌ AI Service Health: Failed - ' $_.Exception.Message }"

echo.
echo 5. Testing Backend AI Integration...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3001/api/ai-chat/health' -Method GET; Write-Host '✅ Backend AI Integration: OK'; Write-Host $response.Content } catch { Write-Host '❌ Backend AI Integration: Failed - ' $_.Exception.Message }"

echo.
echo ==================================
echo Integration Test Results:
echo ==================================
echo.
echo Next Steps:
echo 1. If all services are running, go to: http://localhost:3000/ai-chatbot
echo 2. The AI chatbot should show "AI service is online" instead of "Fallback Response"
echo 3. Try sending a message like "I'm feeling anxious about my exams"
echo 4. You should get an intelligent response from Dr. Sarah AI
echo.
pause
