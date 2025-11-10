-- Course Framework Tables

CREATE TABLE courses (
    course_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    enrollment_code VARCHAR(50) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_date DATETIME NOT NULL
);

CREATE TABLE chapters (
    chapter_id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    order_index INT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);

CREATE TABLE subchapters (
    subchapter_id INT PRIMARY KEY AUTO_INCREMENT,
    chapter_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    order_index INT NOT NULL,
    FOREIGN KEY (chapter_id) REFERENCES chapters(chapter_id) ON DELETE CASCADE
);

CREATE TABLE enrollments (
    enrollment_id INT PRIMARY KEY AUTO_INCREMENT,
    learner_id INT NOT NULL,
    course_id INT NOT NULL,
    enrolled_date DATETIME NOT NULL,
    completed_date DATETIME,
    is_completed BOOLEAN DEFAULT FALSE,
    xp_earned INT DEFAULT 0,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (learner_id, course_id)
);

CREATE TABLE chapter_progress (
    chapter_progress_id INT PRIMARY KEY AUTO_INCREMENT,
    enrollment_id INT NOT NULL,
    chapter_id INT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_date DATETIME,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(enrollment_id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES chapters(chapter_id) ON DELETE CASCADE,
    UNIQUE KEY unique_chapter_progress (enrollment_id, chapter_id)
);

CREATE TABLE subchapter_progress (
    subchapter_progress_id INT PRIMARY KEY AUTO_INCREMENT,
    enrollment_id INT NOT NULL,
    subchapter_id INT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_date DATETIME,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(enrollment_id) ON DELETE CASCADE,
    FOREIGN KEY (subchapter_id) REFERENCES subchapters(subchapter_id) ON DELETE CASCADE,
    UNIQUE KEY unique_subchapter_progress (enrollment_id, subchapter_id)
);

CREATE INDEX idx_enrollment_code ON courses(enrollment_code);
CREATE INDEX idx_learner_enrollments ON enrollments(learner_id);
CREATE INDEX idx_course_chapters ON chapters(course_id, order_index);
CREATE INDEX idx_chapter_subchapters ON subchapters(chapter_id, order_index);
