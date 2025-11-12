CREATE TABLE IF NOT EXISTS course_assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id VARCHAR(255) NOT NULL,
    student_id VARCHAR(255) NOT NULL,
    course_id INT NOT NULL,
    assigned_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    deadline DATETIME NOT NULL,
    status ENUM('assigned', 'in-progress', 'completed', 'overdue') DEFAULT 'assigned',
    FOREIGN KEY (teacher_id) REFERENCES usertable(uid),
    FOREIGN KEY (student_id) REFERENCES usertable(uid),
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
);

-- Add some indexes for better performance
CREATE INDEX idx_assignments_student ON course_assignments(student_id);
CREATE INDEX idx_assignments_teacher ON course_assignments(teacher_id);
CREATE INDEX idx_assignments_deadline ON course_assignments(deadline);