// TeacherDataController.cs
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using System.Data;

[ApiController]
[Route("api/[controller]")]
public class TeacherDataController : ControllerBase
{
    private readonly MySqlConnection _db;

    public TeacherDataController(MySqlConnection db)
    {
        _db = db;
    }

    // This endpoint gets the students for the "My Classes" page
    [HttpGet("classes/{classId}/students")]
    public async Task<IActionResult> GetStudentsInClass(string classId)
    {
        var students = new List<object>();
        try
        {
            await _db.OpenAsync();
            // This query assumes 'learner_classes' links students (by uid) to classes (by class_id)
            // You have 'learner_classes' but your 'usertable' might have a different ID.
            // This query joins usertable, learner_classes, and classes
            var query = @"
                SELECT u.uid, u.username, u.name, u.email 
                FROM usertable u
                JOIN learner_classes lc ON u.uid = lc.uid
                JOIN classes cl ON lc.class_id = cl.class_id
                WHERE cl.class_id = @classId AND u.usertype = 'learner'";
            
            using var command = new MySqlCommand(query, _db);
            command.Parameters.AddWithValue("@classId", classId);
            
            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                students.Add(new {
                    uid = reader.GetString("uid"),
                    username = reader.GetString("username"),
                    name = reader.GetString("name"),
                    email = reader.GetString("email")
                });
            }
            return Ok(students);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error getting students", error = ex.Message });
        }
    }

    // This endpoint gets progress for the "Student Progress" page
    [HttpGet("student-progress")]
    public async Task<IActionResult> GetStudentProgress()
    {
        // This is a complex query. It joins 4 tables to get the name, email,
        // class, and count of completed chapters for each student.
        var progressList = new List<object>();
        try
        {
            await _db.OpenAsync();
            // This assumes a teacher (e.g., 'teacher123') is linked via 'teacher_classes'
            // and students are in 'learner_classes'.
            var query = @"
                SELECT 
                    u.name AS studentName,
                    u.email,
                    c.title AS className,
                    COUNT(cp.chapter_id) AS completedCount
                FROM usertable u
                JOIN learner_classes lc ON u.uid = lc.uid
                JOIN classes c ON lc.class_id = c.class_id
                JOIN teacher_classes tc ON c.class_id = tc.class_id
                LEFT JOIN chapter_progress cp ON lc.enrollment_id = cp.enrollment_id AND cp.is_completed = 1
                WHERE tc.teacher_id = @teacherId AND u.usertype = 'learner'
                GROUP BY u.uid, u.name, u.email, c.title
                ORDER BY studentName, className";

            using var command = new MySqlCommand(query, _db);
            // This assumes the logged-in teacher is 'teacher123'.
            // You will need to replace this with your real login system's ID.
            command.Parameters.AddWithValue("@teacherId", "teacher123"); 
            
            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                progressList.Add(new {
                    studentName = reader.GetString("studentName"),
                    email = reader.GetString("email"),
                    className = reader.GetString("className"),
                    completedCount = reader.GetInt32("completedCount")
                });
            }
            return Ok(progressList);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error getting progress", error = ex.Message });
        }
    }
}