/*
 * This file listens for a 'GET' request.
 * It fetches all data for a single lesson.
 */
const db = require('../server-database-connection'); 

app.get('/api/get-lesson-data', (req, res) => {
    const lessonId = req.query.lesson;
    if (!lessonId) {
        return res.json({ success: false, message: 'No lesson ID provided.' });
    }

    let lessonData = {};

    // 1. Get lesson details
    const lessonQuery = "SELECT * FROM lessons WHERE lesson_id = ?";
    db.query(lessonQuery, [lessonId], (err, results) => {
        if (err) return res.json({ success: false, message: err.message });
        
        lessonData = results[0];
        lessonData.quizzes = { quizA: [], quizB: [] }; // Prepare for questions

        // 2. Get questions for this lesson
        const questionsQuery = "SELECT * FROM questions WHERE lesson_id = ?";
        db.query(questionsQuery, [lessonId], (err, qResults) => {
            if (err) return res.json({ success: false, message: err.message });
            
            // 3. Sort questions into Quiz A and Quiz B
            qResults.forEach(q => {
                if (q.quiz_type === 'quizA') {
                    lessonData.quizzes.quizA.push(q);
                } else if (q.quiz_type === 'quizB') {
                    lessonData.quizzes.quizB.push(q);
                }
            });
            
            // 4. Send all data back
            res.json({ success: true, lesson: lessonData });
        });
    });
});