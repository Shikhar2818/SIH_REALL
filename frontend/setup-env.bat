@echo off
echo.
echo ========================================
echo    Frontend Environment Setup
echo ========================================
echo.

echo Creating .env file for frontend...
echo.

REM Create the .env file with API URL
echo # Frontend Environment Variables > .env
echo VITE_API_URL=http://localhost:3001 >> .env

echo.
echo ✅ .env file created successfully!
echo.
echo 📋 Configuration:
echo - API URL: http://localhost:3001
echo.
echo 🚀 Now restart your frontend server:
echo npm run dev
echo.
echo 📝 Note: The .env file contains the backend API URL
echo that the frontend uses to communicate with the backend.
echo.
pause



