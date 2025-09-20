@echo off
echo ========================================
echo PSYCHOLOGICAL INTERVENTION PLATFORM
echo ========================================
echo.

echo Step 1: Stopping all existing processes...
taskkill /f /im node.exe 2>nul
taskkill /f /im npm.exe 2>nul

echo.
echo Step 2: Starting MongoDB and MailHog services...
docker compose up -d mongo mailhog
timeout /t 5 /nobreak > nul

echo.
echo Step 3: Setting environment variables...
set JWT_SECRET=your-super-secret-jwt-key-for-development-only
set JWT_REFRESH_SECRET=your-super-secret-refresh-key-for-development-only
set NODE_ENV=development

echo.
echo Step 4: Starting Backend Server...
start "Backend Server" cmd /k "cd /d C:\SIH_REAL\backend && set JWT_SECRET=your-super-secret-jwt-key-for-development-only && set JWT_REFRESH_SECRET=your-super-secret-refresh-key-for-development-only && set NODE_ENV=development && npm run dev"

echo Waiting for backend to compile and start...
timeout /t 20 /nobreak > nul

echo.
echo Step 5: Testing Backend Health...
curl -s http://localhost:3001/health
echo.

echo.
echo Step 6: Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d C:\SIH_REAL\frontend && npm start"

echo.
echo Step 7: Waiting for Frontend to start...
timeout /t 15 /nobreak > nul

echo.
echo ========================================
echo PLATFORM STARTED SUCCESSFULLY!
echo ========================================
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Login Credentials:
echo - Student: student@test.com / password123
echo - Admin: admin@test.com / admin123
echo - Dr. Sarah: sarah@counsellor.com / sarah123
echo - Dr. Amaan: amaan@counsellor.com / amaan123
echo - Dr. Monis: monis@counsellor.com / monis123
echo.
echo Features Available:
echo - Student Dashboard with bookings and screenings
echo - Counsellor Dashboard with booking management
echo - Admin Dashboard with analytics and user management
echo - Peer Community Forum
echo - Mental Health Screenings
echo - Resource Library
echo.
echo If you see any errors, wait 2-3 minutes for full compilation.
echo.
pause
