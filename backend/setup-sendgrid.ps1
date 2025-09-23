# PowerShell script to help set up SendGrid configuration
# Run this script to create your .env file with SendGrid settings

Write-Host "🔧 Setting up SendGrid Configuration for Rapy Platform" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# Check if .env already exists
if (Test-Path ".env") {
    Write-Host "⚠️  .env file already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/n)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "❌ Setup cancelled." -ForegroundColor Red
        exit
    }
}

Write-Host "📝 Please provide the following SendGrid configuration:" -ForegroundColor Green

# Get SendGrid API Key
do {
    $sendgridApiKey = Read-Host "Enter your SendGrid API Key (get it from https://sendgrid.com/settings/api_keys)"
    if ([string]::IsNullOrWhiteSpace($sendgridApiKey)) {
        Write-Host "❌ SendGrid API Key cannot be empty!" -ForegroundColor Red
    }
} while ([string]::IsNullOrWhiteSpace($sendgridApiKey))

# Get SendGrid FROM Email
do {
    $sendgridFromEmail = Read-Host "Enter your verified sender email (e.g., noreply@yourdomain.com)"
    if ([string]::IsNullOrWhiteSpace($sendgridFromEmail)) {
        Write-Host "❌ FROM Email cannot be empty!" -ForegroundColor Red
    }
} while ([string]::IsNullOrWhiteSpace($sendgridFromEmail))

# Optional: Get custom JWT secret
$jwtSecret = Read-Host "Enter JWT secret (press Enter for default)"
if ([string]::IsNullOrWhiteSpace($jwtSecret)) {
    $jwtSecret = "your-super-secret-jwt-key-for-development-only-change-in-production"
}

# Optional: Get custom MongoDB URI
$mongoUri = Read-Host "Enter MongoDB URI (press Enter for default)"
if ([string]::IsNullOrWhiteSpace($mongoUri)) {
    $mongoUri = "mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin"
}

# Create .env file content
$envContent = @"
# Database Configuration
MONGODB_URI=$mongoUri

# JWT Configuration
JWT_SECRET=$jwtSecret

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000

# SendGrid Configuration
SENDGRID_API_KEY=$sendgridApiKey
SENDGRID_FROM_EMAIL=$sendgridFromEmail

# SMTP Configuration (fallback - optional)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@psychological-intervention.com

# AI Chatbot Configuration
AI_CHATBOT_URL=http://127.0.0.1:5000

# Database Seeding
ALLOW_MINIMAL_SEED=true
"@

# Write .env file
try {
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ .env file created successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error creating .env file: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 SendGrid configuration complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Verify your sender email in SendGrid dashboard: https://sendgrid.com/settings/sender_auth" -ForegroundColor White
Write-Host "2. Start your backend server: npm run dev" -ForegroundColor White
Write-Host "3. Test credential generation with: node ../test-credential-system.js" -ForegroundColor White
Write-Host ""
Write-Host "🔒 Security Note:" -ForegroundColor Red
Write-Host "Make sure to change the JWT_SECRET in production!" -ForegroundColor White



