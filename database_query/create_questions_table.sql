CREATE TABLE IF NOT EXISTS questions (
    question_id INT AUTO_INCREMENT PRIMARY KEY,
    lesson_id VARCHAR(20) NOT NULL,             -- Which lesson this belongs to
    quiz_type VARCHAR(10) NOT NULL,             -- 'quizA' or 'quizB'
    question_text TEXT NOT NULL,
    option_1 VARCHAR(255),
    option_2 VARCHAR(255),
    option_3 VARCHAR(255),
    option_4 VARCHAR(255),
    correct_answer INT NOT NULL,                -- 1, 2, 3, or 4
    explanation TEXT,
    
    -- This links the question to the lesson
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) 
        ON DELETE CASCADE -- If a lesson is deleted, delete its questions
);