@echo off
echo ========================================
echo SETUP AND RUN PSYCHOLOGICAL INTERVENTION PLATFORM
echo ========================================

echo.
echo Step 1: Installing dependencies...
echo Installing backend dependencies...
cd backend
npm install
if %errorlevel% neq 0 (
    echo Backend dependency installation failed!
    pause
    exit /b 1
)

echo.
echo Installing frontend dependencies...
cd ../frontend
npm install
if %errorlevel% neq 0 (
    echo Frontend dependency installation failed!
    pause
    exit /b 1
)

cd ..

echo.
echo Step 2: Starting Docker services...
docker compose up -d mongo mailhog
if %errorlevel% neq 0 (
    echo Docker services failed to start!
    pause
    exit /b 1
)

echo.
echo Step 3: Waiting for services to be ready...
timeout /t 10 /nobreak > nul

echo.
echo Step 4: Starting backend server...
start "Backend Server" cmd /k "cd /d C:\SIH_REAL\backend && set JWT_SECRET=your-super-secret-jwt-key-for-development-only && set JWT_REFRESH_SECRET=your-super-secret-refresh-key-for-development-only && set NODE_ENV=development && npm run dev"

echo.
echo Step 5: Waiting for backend to start...
timeout /t 15 /nobreak > nul

echo.
echo Step 6: Starting frontend server...
start "Frontend Server" cmd /k "cd /d C:\SIH_REAL\frontend && npm start"

echo.
echo ========================================
echo SETUP COMPLETE - SERVICES STARTING
echo ========================================
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo MailHog: http://localhost:8025
echo.
echo Login Credentials:
echo - Student: student@test.com / password123
echo - Admin: admin@test.com / admin123
echo - Dr. Sarah: sarah@counsellor.com / sarah123
echo - Dr. Amaan: amaan@counsellor.com / amaan123
echo - Dr. Monis: monis@counsellor.com / monis123
echo.
echo Wait 2-3 minutes for full compilation and startup.
echo.
pause
