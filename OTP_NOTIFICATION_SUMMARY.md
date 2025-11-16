# Password Reset with OTP Notification System

## Summary
The password reset system has been updated to send OTP directly to learner's notification center instead of requiring admin approval.

## What Changed

### 1. Database Changes
- Added `otp` and `otp_expiry` columns to `password_reset_requests` table
- Created new `notifications` table to store user notifications
- Run: `update_password_reset_otp.sql`

### 2. Backend Changes
- **PasswordResetController.cs**: 
  - Generates 6-digit OTP automatically
  - Sends OTP to user's notification center
  - Validates OTP and resets password
  
- **NotificationController.cs** (NEW):
  - GET `/api/notifications/{email}` - Fetch user notifications
  - POST `/api/notifications` - Create notification

### 3. Frontend Changes
- **login.js**: 
  - Stores user email in sessionStorage
  - Updated password reset flow to inform users about notifications
  
- **learner-home.js**:
  - Loads server notifications on dashboard load
  - Displays OTP notifications in notification center
  
- **admin-requests.js**:
  - Shows OTP and expiry time for each request
  - Removed approve/reject buttons

## User Flow

### Learner Password Reset:
1. Click "Forgot password?" on login page
2. Enter email → OTP generated and sent to notifications
3. Login with old password (if remembered) OR contact admin for OTP
4. Check notification center for OTP
5. Enter OTP + new password → Password reset complete

### Admin View:
- See all password reset requests with OTP displayed
- Can share OTP with users who can't access notifications
- Delete old/completed requests

## Files Modified
- `Controllers/PasswordResetController.cs`
- `js/admin-requests.js`
- `js/login.js`
- `js/learner-home.js`
- `html/admin-Requests.html`

## Files Created
- `Controllers/NotificationController.cs`
- `database_query/create_notifications_table.sql`
- `database_query/update_password_reset_otp.sql`
- `database_query/README_OTP_MIGRATION.md`

## Deployment Steps
1. Run SQL migration: `update_password_reset_otp.sql`
2. Restart application
3. Test password reset flow
