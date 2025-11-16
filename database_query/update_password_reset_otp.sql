-- Update password_reset_requests table to support OTP
ALTER TABLE password_reset_requests 
ADD COLUMN otp VARCHAR(6),
ADD COLUMN otp_expiry DATETIME,
MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'Active';

-- Update existing records
UPDATE password_reset_requests SET status = 'Active' WHERE status = 'Pending';

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    kind VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME NOT NULL,
    INDEX idx_user_email (user_email),
    INDEX idx_created_at (created_at)
);
