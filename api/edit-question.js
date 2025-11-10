/*
 * Listens for a 'POST' request to edit an existing question.
 */
const db = require('../server-database-connection');

app.post('/api/edit-question', (req, res) => {
    const q = req.body; // q = questionData

    const sqlQuery = `
        UPDATE questions 
        SET 
            quiz_type = ?,
            question_text = ?,
            option_1 = ?,
            option_2 = ?,
            option_3 = ?,
            option_4 = ?,
            correct_answer = ?,
            explanation = ?
        WHERE 
            question_id = ?;
    `;
    
    const params = [
        q.quizType, q.questionText, 
        q.option1, q.option2, q.option3, q.option4, 
        q.correctAnswer, q.explanation,
        q.questionId // The ID of the question to update
    ];

    db.query(sqlQuery, params, (err, result) => {
        if (err) return res.json({ success: false, message: err.message });
        res.json({ success: true, message: 'Question updated!' });
    });
});