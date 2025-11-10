CREATE TABLE IF NOT EXISTS learner_mission (
    uid VARCHAR(255) PRIMARY KEY,
    grade VARCHAR(50) NOT NULL,
    readiness_percent INT NOT NULL DEFAULT 45,
    target_focus VARCHAR(100),
    wants_videos BOOLEAN DEFAULT TRUE,
    mission_title VARCHAR(255),
    mission_mood TEXT,
    mission_mode VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (uid) REFERENCES usertable(uid) ON DELETE CASCADE
);

SELECT * FROM learner_mission WHERE uid = 'your_learner_id';

SELECT uid, grade, readiness_percent FROM learner_mission;

UPDATE learner_mission SET readiness_percent = 100 WHERE uid = 'L000007';
SELECT uid, grade, readiness_percent FROM learner_mission WHERE uid = 'L000007';
