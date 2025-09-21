@echo off
echo ========================================
echo Testing YouTube Videos Import
echo ========================================

echo.
echo 1. Testing API endpoint...
curl -s "http://localhost:3001/api/resources?category=video" > temp_videos.json

echo.
echo 2. Checking if videos are accessible...
findstr /C:"title" temp_videos.json | findstr /C:"How to Ask for Help"

if %errorlevel% equ 0 (
    echo ✅ SUCCESS: Videos are imported and accessible!
) else (
    echo ❌ ERROR: Videos not found in API response
)

echo.
echo 3. Cleaning up...
del temp_videos.json

echo.
echo ========================================
echo Test Complete!
echo ========================================
echo.
echo Your videos should now be visible at:
echo - Frontend: http://localhost:3000/resources
echo - API: http://localhost:3001/api/resources?category=video
echo.
pause
