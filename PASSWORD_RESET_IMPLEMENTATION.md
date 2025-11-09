# Password Reset Implementation Guide

## Overview
This implementation adds a password reset request system where users can request password resets through the login form, and admins can approve or reject these requests.

## Database Setup

### 1. Create the password_reset_requests table
Run the SQL script located at:
```
database_query/create_password_reset_table.sql
```

This creates a table with the following structure:
- `request_id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `email` (VARCHAR(255), NOT NULL)
- `request_date` (DATETIME, NOT NULL)
- `status` (VARCHAR(50), NOT NULL, DEFAULT 'Pending')

## Files Created/Modified

### New Files:
1. **Controllers/PasswordResetController.cs** - Backend API controller
   - POST `/api/passwordreset/request` - Submit password reset request
   - GET `/api/passwordreset/requests` - Get all requests (admin)
   - POST `/api/passwordreset/approve` - Approve and reset password
   - POST `/api/passwordreset/reject` - Reject request

2. **html/admin-Requests.html** - Admin page to view and manage requests

3. **js/admin-requests.js** - Frontend logic for admin requests page

4. **database_query/create_password_reset_table.sql** - Database schema

### Modified Files:
1. **html/admin-dashboard.html** - Added "Requests" link to sidebar
2. **html/admin-Reporting.html** - Added "Requests" link to sidebar
3. **html/admin-UserManagement.html** - Added "Requests" link to sidebar
4. **js/login.js** - Added forgot password functionality

## User Flow

### For Users:
1. Click "Forgot your password?" on login page
2. Enter email address
3. Request is submitted to admin
4. Wait for admin approval

### For Admins:
1. Navigate to "Requests" in admin sidebar
2. View all pending password reset requests
3. Click "Approve" to set new password
4. Enter new password for the user
5. Password is updated in database

## Security Features
- Parameterized SQL queries to prevent SQL injection
- Email validation before accepting requests
- Admin-only access to approve/reject requests
- Status tracking (Pending/Approved/Rejected)

## Configuration
The controller uses the "KiraKiraDB" connection string from `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "KiraKiraDB": "Server=0.tcp.ap.ngrok.io;Port=19021;Database=kirakiradb;Uid=root;Pwd=Sheng#0618;"
  }
}
```
