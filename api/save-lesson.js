/*
 * This is a server file (e.g., using Node.js + Express).
 * It listens for a 'POST' request from the teacher's edit page.
 */

// 1. Get the database connection (this is setup in your server)
const db = require('../server-database-connection'); 

// 2. Listen for the request at the URL '/api/save-lesson'
app.post('/api/save-lesson', (req, res) => {

    // 3. Get the data sent from the 'fetch()' in teacher-lesson-edit.html
    const lessonId = req.body.lessonId;
    const newOverview = req.body.overview;
    const newConcepts = req.body.concepts;
    const newSource = req.body.source;

    // 4. Create an SQL command, just like your 'update_admin.sql'
    const sqlQuery = `
        UPDATE lessons 
        SET 
            overview = ?, 
            concepts = ?, 
            source = ?
        WHERE 
            lesson_id = ?;
    `;

    // 5. Run the query safely with the new data
    db.query(sqlQuery, [newOverview, newConcepts, newSource, lessonId], (err, result) => {
        if (err) {
            // If it fails, send an error
            return res.json({ success: false, message: 'Database error' });
        }
        
        // 6. If it works, send a success message back
        res.json({ success: true, message: 'Lesson saved!' });
    });
});