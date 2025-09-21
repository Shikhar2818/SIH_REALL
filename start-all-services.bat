@echo off
echo ========================================
echo Starting Digital Psychological Intervention Platform
echo ========================================

echo.
echo 1. Starting MongoDB and MailHog...
cd C:\SIH_REAL
docker compose up mongo mailhog -d
echo MongoDB and MailHog started.

echo.
echo 2. Starting Backend Server...
cd C:\SIH_REAL\backend
start "Backend Server" cmd /k "npm run dev"

echo.
echo 3. Waiting for backend to start...
timeout /t 8 /nobreak > nul

echo.
echo 4. Starting Frontend...
cd C:\SIH_REAL\frontend
start "Frontend Server" cmd /k "npm start"

echo.
echo ========================================
echo All Services Started!
echo ========================================
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo MailHog: http://localhost:8025
echo.
echo Login Credentials:
echo Student: student@test.com / student123
echo Admin: admin@test.com / admin123
echo Counsellor: sarah@counsellor.com / sarah123
echo.
echo Press any key to exit...
pause > nul