-- This code is from your 'create_teacher_tables.sql' file
CREATE TABLE IF NOT EXISTS teacher_assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id VARCHAR(255) NOT NULL,
    class_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    deadline DATETIME NOT NULL,
    status ENUM('Open', 'Upcoming', 'Closed', 'Completed') DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS teacher_classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id VARCHAR(255) NOT NULL,
    class_id VARCHAR(50) NOT NULL,
    class_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- This sample data is from your file
INSERT INTO teacher_classes (teacher_id, class_id, class_name) VALUES
('teacher123', 'C001', 'Form 4 Mathematics'),
('teacher123', 'C002', 'Form 5 Additional Mathematics'),
('teacher123', 'C003', 'SPM Revision Class');