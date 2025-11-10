/*
 * Listens for a 'POST' request to add a new question.
 */
const db = require('../server-database-connection'); 

app.post('/api/add-question', (req, res) => {
    const q = req.body; // q = questionData

    const sqlQuery = `
        INSERT INTO questions 
            (lesson_id, quiz_type, question_text, option_1, option_2, option_3, option_4, correct_answer, explanation)
        VALUES 
            (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
    
    const params = [
        q.lessonId, q.quizType, q.questionText, 
        q.option1, q.option2, q.option3, q.option4, 
        q.correctAnswer, q.explanation
    ];

    db.query(sqlQuery, params, (err, result) => {
        if (err) return res.json({ success: false, message: err.message });
        res.json({ success: true, message: 'Question added!' });
    });
});