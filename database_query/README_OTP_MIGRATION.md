# Password Reset OTP Migration

## Database Migration Required

Before using the new OTP-based password reset system, run the following SQL script:

```sql
-- File: update_password_reset_otp.sql
ALTER TABLE password_reset_requests 
ADD COLUMN otp VARCHAR(6),
ADD COLUMN otp_expiry DATETIME,
MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'Active';

UPDATE password_reset_requests SET status = 'Active' WHERE status = 'Pending';
```

## How It Works

### For Learners:
1. Click "Forgot your password?" on login page
2. Enter email address
3. System generates a 6-digit OTP (valid for 15 minutes)
4. **OTP is sent to your notification center** - Login to check notifications
5. Enter OTP and new password
6. Password is reset immediately

### For Admins:
1. View all password reset requests in Admin Panel > Requests
2. See the generated OTP for each active request
3. Can provide OTP to users if they can't access notifications
4. OTP expires after 15 minutes
5. Delete completed or expired requests

## Changes Made:
- Removed admin approval workflow
- Added automatic OTP generation
- OTP expires in 15 minutes
- Users can reset password immediately after OTP verification
- **OTP is sent to learner's notification center**
- Created notifications table and API
- Integrated notification system with password reset
