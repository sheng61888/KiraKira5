-- Teacher Panel Tables

-- Classes table with join codes
CREATE TABLE IF NOT EXISTS teacher_classes (
    class_id INT PRIMARY KEY AUTO_INCREMENT,
    teacher_id VARCHAR(255) NOT NULL,
    class_name VARCHAR(255) NOT NULL,
    join_code VARCHAR(8) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_teacher (teacher_id),
    INDEX idx_join_code (join_code)
);

-- Student enrollments in classes
CREATE TABLE IF NOT EXISTS class_enrollments (
    enrollment_id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL,
    student_id VARCHAR(255) NOT NULL,
    enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_enrollment (class_id, student_id),
    INDEX idx_student (student_id),
    INDEX idx_class (class_id)
);

-- Module assignments for classes
CREATE TABLE IF NOT EXISTS class_module_assignments (
    assignment_id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL,
    module_id VARCHAR(50) NOT NULL,
    due_date DATETIME NOT NULL,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_class (class_id)
);

-- Student progress on assigned modules
CREATE TABLE IF NOT EXISTS student_module_progress (
    progress_id INT PRIMARY KEY AUTO_INCREMENT,
    assignment_id INT NOT NULL,
    student_id VARCHAR(255) NOT NULL,
    completed_at DATETIME,
    is_completed BOOLEAN DEFAULT FALSE,
    UNIQUE KEY unique_progress (assignment_id, student_id),
    INDEX idx_student_progress (student_id, is_completed),
    INDEX idx_assignment (assignment_id)
);
