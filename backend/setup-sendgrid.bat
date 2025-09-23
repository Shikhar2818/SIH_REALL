@echo off
echo.
echo ========================================
echo    Rapy Platform SendGrid Setup
echo ========================================
echo.

echo Creating .env file for SendGrid configuration...
echo.

REM Create the .env file with SendGrid configuration
echo # Database Configuration > .env
echo MONGODB_URI=mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin >> .env
echo. >> .env
echo # JWT Configuration >> .env
echo JWT_SECRET=your-super-secret-jwt-key-for-development-only-change-in-production >> .env
echo. >> .env
echo # Server Configuration >> .env
echo PORT=3001 >> .env
echo NODE_ENV=development >> .env
echo. >> .env
echo # Frontend URL >> .env
echo FRONTEND_URL=http://localhost:3000 >> .env
echo. >> .env
echo # SendGrid Configuration >> .env
echo # Get your API key from: https://sendgrid.com/settings/api_keys >> .env
echo SENDGRID_API_KEY=your-sendgrid-api-key-here >> .env
echo # Verify this email in SendGrid dashboard: https://sendgrid.com/settings/sender_auth >> .env
echo SENDGRID_FROM_EMAIL=noreply@rapy.com >> .env
echo. >> .env
echo # SMTP Configuration (fallback - optional) >> .env
echo SMTP_HOST=localhost >> .env
echo SMTP_PORT=1025 >> .env
echo SMTP_USER= >> .env
echo SMTP_PASS= >> .env
echo SMTP_FROM=noreply@psychological-intervention.com >> .env
echo. >> .env
echo # AI Chatbot Configuration >> .env
echo AI_CHATBOT_URL=http://127.0.0.1:5000 >> .env
echo. >> .env
echo # Database Seeding >> .env
echo ALLOW_MINIMAL_SEED=true >> .env

echo.
echo ✅ .env file created successfully!
echo.
echo 📋 IMPORTANT: You need to update the following values in the .env file:
echo.
echo 1. SENDGRID_API_KEY - Get it from: https://sendgrid.com/settings/api_keys
echo 2. SENDGRID_FROM_EMAIL - Your verified sender email address
echo.
echo 📧 SendGrid Setup Steps:
echo 1. Sign up at https://sendgrid.com/
echo 2. Create an API key with Full Access permissions
echo 3. Verify your sender email address
echo 4. Update the .env file with your credentials
echo.
echo 🚀 After updating .env, start your server with: npm run dev
echo.
pause



