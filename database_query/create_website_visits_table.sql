CREATE TABLE IF NOT EXISTS website_visits (
    visit_id INT AUTO_INCREMENT PRIMARY KEY,
    visit_date DATETIME NOT NULL,
    INDEX idx_visit_date (visit_date)
);
