@echo off
echo ========================================
echo Debugging Forum Post Creation Issue
echo ========================================

echo.
echo 1. Testing backend health...
curl -s http://localhost:3001/health
echo.

echo.
echo 2. Testing authentication...
curl -s -X POST -H "Content-Type: application/json" -d "{\"email\":\"student@test.com\",\"password\":\"student123\"}" http://localhost:3001/api/auth/login
echo.

echo.
echo 3. Getting authentication token...
for /f "tokens=*" %%i in ('curl -s -X POST -H "Content-Type: application/json" -d "{\"email\":\"student@test.com\",\"password\":\"student123\"}" http://localhost:3001/api/auth/login') do set LOGIN_RESPONSE=%%i

echo Login response: %LOGIN_RESPONSE%

echo.
echo 4. Extracting token (this might not work in batch, but shows the structure)...
echo You'll need to manually extract the accessToken from the response above.

echo.
echo 5. Testing forum posts endpoint (replace YOUR_TOKEN_HERE with actual token)...
curl -s -X GET -H "Authorization: Bearer YOUR_TOKEN_HERE" http://localhost:3001/api/forum/posts

echo.
echo 6. Testing forum post creation (replace YOUR_TOKEN_HERE with actual token)...
curl -s -X POST -H "Authorization: Bearer YOUR_TOKEN_HERE" -H "Content-Type: application/json" -d "{\"title\":\"Test Post\",\"content\":\"This is a test post content that meets the minimum length requirement.\",\"category\":\"general\",\"tags\":[\"test\"],\"isAnonymous\":false}" http://localhost:3001/api/forum/posts

echo.
echo ========================================
echo Debug Complete!
echo ========================================
echo.
echo Instructions:
echo 1. Copy the accessToken from step 2
echo 2. Replace YOUR_TOKEN_HERE in steps 5 and 6 with the actual token
echo 3. Run those commands manually to test
echo.
pause
