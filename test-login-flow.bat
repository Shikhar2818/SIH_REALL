@echo off
echo ========================================
echo TESTING LOGIN FLOW AND JWT TOKENS
echo ========================================

echo.
echo Step 1: Testing Counsellor Login...
echo Login: sarah@counsellor.com / sarah123
curl -s -X POST -H "Content-Type: application/json" -d "{\"email\":\"sarah@counsellor.com\",\"password\":\"sarah123\"}" http://localhost:3001/api/auth/login
echo.

echo.
echo Step 2: Testing Student Login...
echo Login: student@test.com / password123
curl -s -X POST -H "Content-Type: application/json" -d "{\"email\":\"student@test.com\",\"password\":\"password123\"}" http://localhost:3001/api/auth/login
echo.

echo.
echo Step 3: Testing Admin Login...
echo Login: admin@test.com / admin123
curl -s -X POST -H "Content-Type: application/json" -d "{\"email\":\"admin@test.com\",\"password\":\"admin123\"}" http://localhost:3001/api/auth/login
echo.

echo.
echo ========================================
echo LOGIN FLOW TEST COMPLETE
echo ========================================
echo.
echo If you see "Login successful" messages above with access tokens,
echo then the JWT system is working correctly!
echo.
echo If you see "Invalid credentials" errors, the user accounts exist.
echo If you see connection errors, the backend is not running.
echo.
pause