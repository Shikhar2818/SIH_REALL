@echo off
echo ========================================
echo Fixing Forum Post Creation Issue
echo ========================================

echo.
echo Step 1: Starting MongoDB and MailHog...
cd C:\SIH_REAL
docker compose up mongo mailhog -d
timeout /t 5 /nobreak > nul

echo.
echo Step 2: Starting Backend Server...
cd C:\SIH_REAL\backend
start "Backend Server" cmd /k "npm run dev"

echo.
echo Step 3: Waiting for backend to fully start...
timeout /t 15 /nobreak > nul

echo.
echo Step 4: Testing the system...
echo.

echo Testing health endpoint...
curl -s http://localhost:3001/health
echo.

echo Testing authentication...
curl -s -X POST -H "Content-Type: application/json" -d "{\"email\":\"student@test.com\",\"password\":\"student123\"}" http://localhost:3001/api/auth/login
echo.

echo.
echo ========================================
echo Backend should now be running!
echo ========================================
echo.
echo Now you can:
echo 1. Start the frontend: cd C:\SIH_REAL\frontend ^&^& npm start
echo 2. Go to http://localhost:3000
echo 3. Login as student: student@test.com / student123
echo 4. Go to Peer Community
echo 5. Try creating a post
echo.
echo If it still doesn't work, check the browser console (F12) for errors.
echo.
pause
