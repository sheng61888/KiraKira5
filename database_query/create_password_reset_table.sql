CREATE TABLE IF NOT EXISTS password_reset_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    request_date DATETIME NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    INDEX idx_email (email),
    INDEX idx_status (status)
);
