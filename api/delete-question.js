/*
 * This is another server file.
 * It listens for a 'POST' request to delete a question.
 */

// 1. Get the database connection
const db = require('../server-database-connection');

// 2. Listen for the request at the URL '/api/delete-question'
app.post('/api/delete-question', (req, res) => {

    // 3. Get the ID of the question to delete
    const questionIdToDelete = req.body.questionId;

    // 4. Create the SQL DELETE command
    const sqlQuery = `
        DELETE FROM questions 
        WHERE question_id = ?;
    `;

    // 5. Run the query
    db.query(sqlQuery, [questionIdToDelete], (err, result) => {
        if (err) {
            return res.json({ success: false, message: 'Database error' });
        }
        
        // 6. Send success back
        res.json({ success: true, message: 'Question deleted!' });
    });
});