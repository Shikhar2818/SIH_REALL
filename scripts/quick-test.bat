@echo off
echo Quick Test of Counsellor Routes
echo.

echo 1. Testing Backend Health...
curl -s http://localhost:3001/health
echo.

echo 2. Testing Counsellor Dashboard Route...
curl -s -H "Authorization: Bearer invalid-token" http://localhost:3001/api/counsellor/extended/dashboard-summary
echo.

echo 3. Testing Frontend...
curl -s http://localhost:3000 | findstr "title"
echo.

echo If you see "Route not found" - restart the backend
echo If you see "Authentication failed" - routes are working!
echo If you see HTML title - frontend is working!
echo.
pause
