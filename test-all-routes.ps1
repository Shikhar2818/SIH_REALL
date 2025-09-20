# Test All Backend Routes
# This script tests all available API routes to identify any issues

$baseUrl = "http://localhost:3001"
$token = ""

Write-Host "Testing Backend Routes..." -ForegroundColor Green
Write-Host "Base URL: $baseUrl" -ForegroundColor Yellow
Write-Host ""

# Test health endpoint
Write-Host "1. Testing Health Endpoint..." -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "✅ Health: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health: $($_.Exception.Message)" -ForegroundColor Red
}

# Test login to get token
Write-Host "2. Testing Login..." -ForegroundColor Cyan
try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@test.com","password":"admin123"}'
    $token = $loginResponse.accessToken
    Write-Host "✅ Login: Success" -ForegroundColor Green
} catch {
    Write-Host "❌ Login: $($_.Exception.Message)" -ForegroundColor Red
}

if ($token) {
    $headers = @{"Authorization" = "Bearer $token"}
    
    # Test admin routes
    Write-Host "3. Testing Admin Routes..." -ForegroundColor Cyan
    $adminRoutes = @(
        "/api/admin/stats",
        "/api/admin/users",
        "/api/admin/analytics/mental-health"
    )
    
    foreach ($route in $adminRoutes) {
        try {
            $response = Invoke-RestMethod -Uri "$baseUrl$route" -Method GET -Headers $headers
            Write-Host "✅ $route : Success" -ForegroundColor Green
        } catch {
            Write-Host "❌ $route : $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    # Test other routes
    Write-Host "4. Testing Other Routes..." -ForegroundColor Cyan
    $otherRoutes = @(
        "/api/screenings/history",
        "/api/bookings/my-bookings",
        "/api/forum/posts",
        "/api/counsellors"
    )
    
    foreach ($route in $otherRoutes) {
        try {
            $response = Invoke-RestMethod -Uri "$baseUrl$route" -Method GET -Headers $headers
            Write-Host "✅ $route : Success" -ForegroundColor Green
        } catch {
            Write-Host "❌ $route : $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Test routes without authentication
Write-Host "5. Testing Public Routes..." -ForegroundColor Cyan
$publicRoutes = @(
    "/api/forum/posts"
)

foreach ($route in $publicRoutes) {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl$route" -Method GET
        Write-Host "✅ $route : Success" -ForegroundColor Green
    } catch {
        Write-Host "❌ $route : $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Route testing completed!" -ForegroundColor Green
