@echo off
echo ========================================
echo Testing YouTube Videos Integration
echo ========================================

echo.
echo 1. Starting MongoDB and MailHog...
cd C:\SIH_REAL
docker compose up mongo mailhog -d
timeout /t 5 /nobreak > nul

echo.
echo 2. Starting Backend Server...
cd C:\SIH_REAL\backend
start "Backend Server" cmd /k "npm run dev"

echo.
echo 3. Waiting for backend to start...
timeout /t 15 /nobreak > nul

echo.
echo 4. Testing YouTube videos API...
curl -s http://localhost:3001/api/resources?category=video

echo.
echo.
echo 5. Testing specific video endpoint...
curl -s http://localhost:3001/api/resources

echo.
echo ========================================
echo YouTube Videos Test Complete!
echo ========================================
echo.
echo Now you can:
echo 1. Start the frontend: cd C:\SIH_REAL\frontend ^&^& npm start
echo 2. Go to http://localhost:3000
echo 3. Login as any user
echo 4. Go to Resources page
echo 5. You should see YouTube videos with thumbnails
echo 6. Click on any video to play it
echo.
echo Features to test:
echo - YouTube video thumbnails are displayed
echo - Clicking on videos opens the player
echo - Videos are categorized properly
echo - Featured videos are marked
echo.
pause
