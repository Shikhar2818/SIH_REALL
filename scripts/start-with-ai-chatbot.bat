@echo off
echo Starting Rapy Platform with AI Chatbot...
echo =============================================================

echo.
echo Starting AI Chatbot Service (Dr. Sarah AI)...
echo ---------------------------------------------
start "AI Chatbot Service" cmd /k "cd /d %~dp0\bot && python start_backend.py"

echo.
echo Waiting for AI service to initialize...
timeout /t 10 /nobreak > nul

echo.
echo Starting Backend Service...
echo ---------------------------
start "Backend Service" cmd /k "cd /d %~dp0\backend && npm run dev"

echo.
echo Waiting for backend to initialize...
timeout /t 5 /nobreak > nul

echo.
echo Starting Frontend Service...
echo ----------------------------
start "Frontend Service" cmd /k "cd /d %~dp0\frontend && npm run dev"

echo.
echo =============================================================
echo All services are starting up!
echo.
echo AI Chatbot Service: http://localhost:5000
echo Backend API: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Note: It may take a few minutes for the AI chatbot to fully load.
echo The AI model needs to download and initialize on first run.
echo =============================================================

pause
