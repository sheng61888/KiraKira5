CREATE TABLE IF NOT EXISTS lessons (
    lesson_id VARCHAR(20) NOT NULL PRIMARY KEY,  -- e.g., 'form4-01'
    title VARCHAR(255) NOT NULL,
    eyebrow VARCHAR(100),                         -- e.g., 'Form 4 - Module 01'
    overview TEXT,                                -- Use TEXT for long HTML content
    concepts TEXT,                                -- Use TEXT for long HTML content
    source VARCHAR(255)
);