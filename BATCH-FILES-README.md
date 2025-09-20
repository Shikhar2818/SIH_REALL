# Batch Files for Digital Psychological Intervention Platform

This directory contains several batch files to easily manage and run the Digital Psychological Intervention Platform services.

## 📁 Available Batch Files

### 1. `setup-and-run.bat` - **RECOMMENDED FOR FIRST TIME**
- **Purpose**: Complete setup and run for first-time users
- **What it does**:
  - Checks if Node.js and Docker are installed
  - Installs all dependencies (backend and frontend)
  - Starts all services
  - Opens the application in browser
- **Usage**: Double-click to run

### 2. `start-services.bat` - **MAIN SERVICE MANAGER**
- **Purpose**: Start and manage all services with interactive menu
- **What it does**:
  - Starts MongoDB and MailHog containers
  - Starts backend and frontend servers
  - Provides interactive menu for service management
- **Usage**: Double-click to run
- **Menu Options**:
  - Press 1: Open Frontend Application
  - Press 2: Open Email Testing (MailHog)
  - Press 3: Check Backend Health
  - Press 4: View All Services Status
  - Press 5: Stop All Services
  - Press 6: Restart All Services
  - Press 0: Exit

### 3. `stop-services.bat` - **STOP ALL SERVICES**
- **Purpose**: Cleanly stop all running services
- **What it does**:
  - Stops all Docker containers
  - Kills all Node.js processes
  - Cleans up resources
- **Usage**: Double-click to run

### 4. `check-status.bat` - **STATUS CHECKER**
- **Purpose**: Check the status of all services
- **What it does**:
  - Checks Docker container status
  - Checks port availability
  - Tests service endpoints
  - Provides quick access links
- **Usage**: Double-click to run

## 🚀 Quick Start Guide

### For First-Time Users:
1. **Double-click `setup-and-run.bat`**
2. Wait for the setup to complete
3. The application will open automatically in your browser

### For Regular Use:
1. **Double-click `start-services.bat`**
2. Use the interactive menu to manage services
3. When done, run `stop-services.bat` to stop all services

## 🔧 Service Management

### Starting Services:
```bash
# Complete setup and run (first time)
setup-and-run.bat

# Start services with management menu
start-services.bat
```

### Stopping Services:
```bash
# Stop all services
stop-services.bat
```

### Checking Status:
```bash
# Check service status
check-status.bat
```

## 📊 Service Ports

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| Frontend | 3000 | http://localhost:3000 | React application |
| Backend | 3001 | http://localhost:3001 | Express API server |
| MongoDB | 27017 | localhost:27017 | Database |
| MailHog | 8025 | http://localhost:8025 | Email testing interface |

## 🛠️ Troubleshooting

### If services don't start:
1. Make sure Docker Desktop is running
2. Check if ports 3000, 3001, 27017, 8025 are available
3. Run `check-status.bat` to diagnose issues

### If you get permission errors:
1. Run Command Prompt as Administrator
2. Navigate to the project directory
3. Run the batch files from there

### If dependencies are missing:
1. Run `setup-and-run.bat` to install all dependencies
2. Or manually run `npm install` in both `backend` and `frontend` directories

## 📱 Features Available

Once all services are running, you can:

- **Register/Login**: Create account or use Google OAuth
- **Book Appointments**: Schedule with Monis or Amaan counsellors
- **Take Screenings**: Complete PHQ-9 and GAD-7 assessments
- **Browse Resources**: Access educational materials
- **Chat Support**: Use the AI chat widget
- **Email Testing**: Check notifications at http://localhost:8025
- **Admin Dashboard**: View analytics and manage data

## 🎯 Pre-seeded Data

The application comes with:
- **Counsellors**: Monis (mustbemonis@gmail.com) and Amaan (amaanhaque26@gmail.com)
- **Email Testing**: All booking notifications appear in MailHog
- **Multi-language Support**: English, Hindi, Tamil

## 💡 Tips

- Keep the service manager window open to monitor services
- Use `check-status.bat` if you're unsure about service status
- Always use `stop-services.bat` to cleanly shut down services
- The application works best when all services are running

---

**Happy coding! 🎉**
