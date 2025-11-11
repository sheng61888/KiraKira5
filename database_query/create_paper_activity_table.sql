CREATE TABLE IF NOT EXISTS learner_paper_activity (
    activity_id INT AUTO_INCREMENT PRIMARY KEY,
    uid VARCHAR(255) NOT NULL,
    paper_name VARCHAR(255) NOT NULL,
    paper_type VARCHAR(50),
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uid) REFERENCES usertable(uid) ON DELETE CASCADE,
    INDEX idx_paper_name (paper_name),
    INDEX idx_uid (uid)
);
