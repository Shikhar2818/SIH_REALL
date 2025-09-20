# Sample Login Credentials

This document provides pre-configured login credentials for testing different user roles in the Digital Psychological Intervention Platform.

## 🔐 **Sample Login Accounts**

### 👨‍🎓 **Student Account**
- **Email**: `student@test.com`
- **Password**: `password123`
- **Role**: Student
- **Access**: 
  - Book appointments with counsellors
  - Take mental health screenings (PHQ-9, GAD-7)
  - Access educational resources
  - Use AI chat support
  - View personal dashboard

### 👨‍💼 **Admin Account**
- **Email**: `admin@test.com`
- **Password**: `admin123`
- **Role**: Admin
- **Access**:
  - Full platform analytics dashboard
  - User management (view, edit, deactivate users)
  - Booking management and oversight
  - Screening analytics and reports
  - System administration
  - Data export functionality

### 👩‍⚕️ **Counsellor Account**
- **Email**: `counsellor@test.com`
- **Password**: `counsellor123`
- **Role**: Counsellor
- **Access**:
  - Manage personal bookings
  - View student profiles
  - Update booking statuses
  - Track session statistics
  - Manage availability
  - View assigned students

## 🚀 **How to Use Sample Logins**

### **Method 1: Direct Login**
1. Go to the [Login Page](http://localhost:3000/login)
2. Enter the credentials for the role you want to test
3. Click "Sign In"
4. Explore the platform with that role's permissions

### **Method 2: Sample Logins Page**
1. Go to [Sample Logins Page](http://localhost:3000/sample-logins)
2. Click "Copy Credentials" for the desired role
3. Go to the Login Page and paste the credentials
4. Sign in and explore

## 🎯 **Testing Scenarios**

### **Student Testing**
- ✅ Register a new account
- ✅ Book an appointment with Monis or Amaan
- ✅ Take a PHQ-9 or GAD-7 screening
- ✅ Browse educational resources
- ✅ Use the AI chat widget
- ✅ View personal dashboard

### **Admin Testing**
- ✅ Access admin dashboard
- ✅ View platform analytics
- ✅ Manage user accounts
- ✅ Export data reports
- ✅ Monitor booking statistics
- ✅ View screening analytics

### **Counsellor Testing**
- ✅ View assigned bookings
- ✅ Update booking statuses
- ✅ Manage availability
- ✅ View student profiles
- ✅ Track session statistics
- ✅ Update personal profile

## 🔧 **Role-Based Features**

### **Student Features**
- **Dashboard**: Personal overview with upcoming appointments
- **Bookings**: Schedule and manage appointments
- **Screening**: Take mental health assessments
- **Resources**: Access educational materials
- **Chat**: AI-powered support widget

### **Admin Features**
- **Analytics Dashboard**: Platform-wide statistics
- **User Management**: Create, edit, deactivate users
- **Booking Oversight**: Monitor all appointments
- **Screening Reports**: Anonymized mental health data
- **Data Export**: Generate reports
- **System Settings**: Platform configuration

### **Counsellor Features**
- **My Dashboard**: Personal counsellor overview
- **My Bookings**: Manage assigned appointments
- **Student Profiles**: View student information
- **Session Tracking**: Monitor completed sessions
- **Availability Management**: Set working hours
- **Profile Management**: Update personal information

## 📊 **Pre-seeded Data**

The platform comes with the following pre-configured data:

### **Counsellors**
- **Monis**: `mustbemonis@gmail.com`
- **Amaan**: `amaanhaque26@gmail.com`

### **Sample Users**
- **Student**: `student@test.com`
- **Admin**: `admin@test.com`
- **Counsellor**: `counsellor@test.com`

## 🛡️ **Security Notes**

- These are **test accounts only** - not for production use
- Passwords are simple for testing purposes
- All test data is isolated and safe to modify
- Real user data is protected and separate

## 🔄 **Resetting Test Data**

To reset the test data:
1. Stop all services
2. Remove the MongoDB volume: `docker volume rm sih_real_mongo_data`
3. Restart services: `start-services.bat`
4. Sample users will be recreated automatically

## 📱 **Quick Access Links**

- **Main Application**: http://localhost:3000
- **Login Page**: http://localhost:3000/login
- **Sample Logins**: http://localhost:3000/sample-logins
- **Email Testing**: http://localhost:8025
- **Backend API**: http://localhost:3001

## 🎉 **Ready to Test!**

Choose any role above and start exploring the platform with full functionality. Each role provides a different perspective and access level, allowing you to test all aspects of the system.

---

**Happy Testing! 🚀**
