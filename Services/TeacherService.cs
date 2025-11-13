using Dapper;
using MySql.Data.MySqlClient;
using KiraKira5.Controllers; // Needed for the CreateAssignmentRequest

namespace KiraKira5.Services
{
    // --- Data Models (DTOs) ---
    // These classes define the shape of the data your API will send

    public class TeacherClassDto
    {
        public string ClassId { get; set; }
        public string ClassName { get; set; }
        public int StudentCount { get; set; }
    }

    public class TeacherCourseDto
    {
        public string CourseName { get; set; }
    }

    public class TeacherAssignmentDto
    {
        public int AssignmentId { get; set; }
        public string ClassId { get; set; }
        public string Title { get; set; }
        public string CourseName { get; set; }
        public DateTime Deadline { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class StudentDto
    {
        public string Uid { get; set; }
        public string Name { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
    }

    public class StudentProgressDto
    {
        public string StudentName { get; set; }
        public string Email { get; set; }
        public string ClassName { get; set; }
        public int CompletedCount { get; set; }
    }

    // --- The Service Class ---

    public class TeacherService
    {
        private readonly string _connectionString;

        public TeacherService(string connectionString)
        {
            _connectionString = connectionString;
        }

        private MySqlConnection GetConnection()
        {
            return new MySqlConnection(_connectionString);
        }

        // Used by Dashboard and My Classes
        public async Task<IEnumerable<TeacherClassDto>> GetTeacherClassesAsync(string teacherId)
        {
            using (var conn = GetConnection())
            {
                // *** FIXED: Now uses the teacherId in the query ***
                var sql = @"
                    SELECT 
                        class_code AS ClassId, 
                        title AS ClassName,
                        (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.course_id) AS StudentCount
                    FROM classes c
                    WHERE c.teacher_id = @TeacherId";
                return await conn.QueryAsync<TeacherClassDto>(sql, new { TeacherId = teacherId });
            }
        }

        // Used by Dashboard dropdown
        public async Task<IEnumerable<TeacherCourseDto>> GetCoursesAsync()
        {
            using (var conn = GetConnection())
            {
                // Gets all unique assignment topics to use as "Courses"
                var sql = "SELECT DISTINCT topic AS CourseName FROM class_assignments";
                return await conn.QueryAsync<TeacherCourseDto>(sql);
            }
        }

        // Used by Dashboard
        public async Task<IEnumerable<TeacherAssignmentDto>> GetAssignmentsAsync(string teacherId)
        {
            using (var conn = GetConnection())
            {
                // *** FIXED: Now uses the teacherId in the query ***
                var sql = @"
                    SELECT 
                        ca.assignment_id AS AssignmentId, 
                        ca.class_code AS ClassId, 
                        ca.title AS Title, 
                        ca.topic AS CourseName, 
                        ca.due_at AS Deadline, 
                        ca.status_template AS Status, 
                        ca.created_at AS CreatedAt
                    FROM class_assignments ca
                    JOIN classes c ON ca.class_code = c.class_code
                    WHERE c.teacher_id = @TeacherId
                    ORDER BY ca.due_at DESC";
                return await conn.QueryAsync<TeacherAssignmentDto>(sql, new { TeacherId = teacherId });
            }
        }

        // Used by Dashboard (Create)
        public async Task<TeacherAssignmentDto> CreateAssignmentAsync(CreateAssignmentRequest req)
        {
            using (var conn = GetConnection())
            {
                var sql = @"
                    INSERT INTO class_assignments (class_code, title, topic, due_at, status_template)
                    VALUES (@ClassId, @Title, @Topic, @DueAt, @StatusTemplate);
                    SELECT LAST_INSERT_ID();";
                
                int newId = await conn.ExecuteScalarAsync<int>(sql, new 
                {
                    req.ClassId,
                    req.Title,
                    req.Topic,
                    req.DueAt,
                    req.StatusTemplate
                });

                // Return the newly created assignment
                return new TeacherAssignmentDto
                {
                    AssignmentId = newId,
                    ClassId = req.ClassId,
                    Title = req.Title,
                    CourseName = req.Topic,
                    Deadline = req.DueAt,
                    Status = req.StatusTemplate,
                    CreatedAt = DateTime.UtcNow
                };
            }
        }

        // Used by My Classes
        public async Task<IEnumerable<StudentDto>> GetStudentsInClassAsync(string classId)
        {
            // *** NOTE ***
            // This query assumes you have an 'enrollments' table linking users to courses
            // and a 'classes' table linked to 'courses'.
            // Based on your 'create_course_tables.sql'
            using (var conn = GetConnection())
            {
                var sql = @"
                    SELECT u.uid, u.name, u.username, u.email 
                    FROM usertable u
                    JOIN enrollments e ON u.uid = e.learner_id
                    JOIN courses co ON e.course_id = co.course_id
                    JOIN classes cl ON co.course_id = cl.course_id
                    WHERE cl.class_code = @ClassId AND u.usertype = 'learner'";
                return await conn.QueryAsync<StudentDto>(sql, new { ClassId = classId });
            }
        }

        // Used by Student Progress
        public async Task<IEnumerable<StudentProgressDto>> GetStudentProgressAsync(string teacherId)
        {
            // *** NOTE ***
            // This query is complex and relies on your schema.
            // It joins classes, courses, enrollments, users, and progress.
            using (var conn = GetConnection())
            {
                var sql = @"
                    SELECT 
                        u.name AS StudentName, 
                        u.email AS Email, 
                        c.title AS ClassName, 
                        COUNT(cp.chapter_id) AS CompletedCount
                    FROM chapter_progress cp
                    JOIN enrollments e ON cp.enrollment_id = e.enrollment_id
                    JOIN usertable u ON e.learner_id = u.uid
                    JOIN courses co ON e.course_id = co.course_id
                    JOIN classes c ON co.course_id = c.course_id
                    WHERE c.teacher_id = @TeacherId AND cp.is_completed = 1
                    GROUP BY u.uid, c.class_code, u.name, u.email, c.title";
                
                return await conn.QueryAsync<StudentProgressDto>(sql, new { TeacherId = teacherId });
            }
        }

        // Used by Dashboard (Update)
        public async Task<bool> UpdateAssignmentStatusAsync(int assignmentId, string status)
        {
             using (var conn = GetConnection())
            {
                var sql = "UPDATE class_assignments SET status_template = @Status WHERE assignment_id = @AssignmentId";
                var rowsAffected = await conn.ExecuteAsync(sql, new { Status = status, AssignmentId = assignmentId });
                return rowsAffected > 0;
            }
        }

        // Used by Dashboard (Delete)
         public async Task<bool> DeleteAssignmentAsync(int assignmentId)
        {
             using (var conn = GetConnection())
            {
                var sql = "DELETE FROM class_assignments WHERE assignment_id = @AssignmentId";
                var rowsAffected = await conn.ExecuteAsync(sql, new { AssignmentId = assignmentId });
                return rowsAffected > 0;
            }
        }
    }
}