CREATE TABLE IF NOT EXISTS community_threads (
    thread_id INT AUTO_INCREMENT PRIMARY KEY,
    uid VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    category VARCHAR(100),
    primary_tag VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uid) REFERENCES usertable(uid) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS community_replies (
    reply_id INT AUTO_INCREMENT PRIMARY KEY,
    thread_id INT NOT NULL,
    uid VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (thread_id) REFERENCES community_threads(thread_id) ON DELETE CASCADE,
    FOREIGN KEY (uid) REFERENCES usertable(uid) ON DELETE CASCADE
);
