# Password Reset Workflow Implementation

## Overview
Learners can request password resets from their profile page. Admins review and approve/deny requests. Once approved, learners can set their new password.

## Workflow

### 1. Learner Requests Reset
- Navigate to Profile page
- Click "Request Password Reset" button
- Request sent to admin with status "Pending"

### 2. Admin Reviews Request
- Navigate to Admin > Requests page
- View all password reset requests
- Approve or Reject the request

### 3. Learner Sets New Password
- After admin approval, profile page shows password reset form
- Enter new password and confirm
- Submit to complete the reset

## API Endpoints

### POST /api/passwordreset/request
Submit password reset request
```json
{ "email": "learner@example.com" }
```

### GET /api/passwordreset/requests
Get all password reset requests (Admin)

### GET /api/passwordreset/status/{email}
Check reset status for specific email

### POST /api/passwordreset/approve
Approve password reset request (Admin)
```json
{ "requestId": 1 }
```

### POST /api/passwordreset/reject
Reject password reset request (Admin)
```json
{ "requestId": 1 }
```

### POST /api/passwordreset/submit
Submit new password after approval
```json
{ "requestId": 1, "newPassword": "newpass123" }
```

## Database
Table: `password_reset_requests`
- request_id (INT, PRIMARY KEY)
- email (VARCHAR)
- request_date (DATETIME)
- status (VARCHAR) - "Pending", "Approved", "Rejected", "Completed"

## Files Modified
- Controllers/PasswordResetController.cs
- html/learner-profile.html
- js/learner-profile-page.js
- js/admin-requests.js
