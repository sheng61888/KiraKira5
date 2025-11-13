using MySql.Data.MySqlClient;
using System.Data;
using KiraKira5.Models;

public class AssignmentService
{
    private readonly string _connectionString;

    public AssignmentService(string connectionString)
    {
        _connectionString = connectionString;
    }

    public async Task<bool> AssignCourseToStudentAsync(string teacherId, string studentId, int courseId, DateTime deadline)
    {
        using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();

        var query = @"INSERT INTO course_assignments (teacher_id, student_id, course_id, deadline) 
                     VALUES (@teacherId, @studentId, @courseId, @deadline)";

        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@teacherId", teacherId);
        command.Parameters.AddWithValue("@studentId", studentId);
        command.Parameters.AddWithValue("@courseId", courseId);
        command.Parameters.AddWithValue("@deadline", deadline);

        var result = await command.ExecuteNonQueryAsync();
        return result > 0;
    }

    public async Task<bool> AssignCourseToMultipleStudentsAsync(string teacherId, List<string> studentIds, int courseId, DateTime deadline)
    {
        using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();

        var query = @"INSERT INTO course_assignments (teacher_id, student_id, course_id, deadline) 
                     VALUES (@teacherId, @studentId, @courseId, @deadline)";

        foreach (var studentId in studentIds)
        {
            using var command = new MySqlCommand(query, connection);
            command.Parameters.AddWithValue("@teacherId", teacherId);
            command.Parameters.AddWithValue("@studentId", studentId);
            command.Parameters.AddWithValue("@courseId", courseId);
            command.Parameters.AddWithValue("@deadline", deadline);
            
            await command.ExecuteNonQueryAsync();
        }

        return true;
    }

    public async Task<List<AssignmentDto>> GetTeacherAssignmentsAsync(string teacherId)
    {
        var assignments = new List<AssignmentDto>();
        
        using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();

        var query = @"SELECT ca.*, c.course_name, c.description, u.username as student_name
                     FROM course_assignments ca
                     JOIN courses c ON ca.course_id = c.course_id
                     JOIN usertable u ON ca.student_id = u.uid
                     WHERE ca.teacher_id = @teacherId
                     ORDER BY ca.deadline ASC";

        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@teacherId", teacherId);

        using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            assignments.Add(new AssignmentDto
            {
                AssignmentId = reader.GetInt32("assignment_id"),
                CourseId = reader.GetInt32("course_id"),
                CourseName = reader.GetString("course_name"),
                StudentId = reader.GetString("student_id"),
                StudentName = reader.GetString("student_name"),
                Deadline = reader.GetDateTime("deadline"),
                AssignedDate = reader.GetDateTime("assigned_date"),
                Status = reader.GetString("status"),
                Description = reader.GetString("description")
            });
        }

        return assignments;
    }

    public async Task<List<StudentDto>> GetAvailableStudentsAsync()
    {
        var students = new List<StudentDto>();
        
        using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();

        var query = @"SELECT uid, username, email FROM usertable 
                     WHERE role = 'student' OR role = 'learner' 
                     ORDER BY username";

        using var command = new MySqlCommand(query, connection);
        
        using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            students.Add(new StudentDto
            {
                StudentId = reader.GetString("uid"),
                StudentName = reader.GetString("username"),
                Email = reader.GetString("email")
            });
        }

        return students;
    }

    public async Task<List<CourseDto>> GetAvailableCoursesAsync()
    {
        var courses = new List<CourseDto>();
        
        using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();

        var query = "SELECT course_id, course_name, description FROM courses ORDER BY course_name";

        using var command = new MySqlCommand(query, connection);
        
        using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            courses.Add(new CourseDto
            {
                CourseId = reader.GetInt32("course_id"),
                CourseName = reader.GetString("course_name"),
                Description = reader.GetString("description")
            });
        }

        return courses;
    }

    public async Task<bool> UpdateAssignmentDeadlineAsync(int assignmentId, DateTime newDeadline)
    {
        using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();

        var query = "UPDATE course_assignments SET deadline = @deadline WHERE assignment_id = @assignmentId";
        
        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@deadline", newDeadline);
        command.Parameters.AddWithValue("@assignmentId", assignmentId);

        var result = await command.ExecuteNonQueryAsync();
        return result > 0;
    }

    public async Task<bool> DeleteAssignmentAsync(int assignmentId)
    {
        using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();

        var query = "DELETE FROM course_assignments WHERE assignment_id = @assignmentId";
        
        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@assignmentId", assignmentId);

        var result = await command.ExecuteNonQueryAsync();
        return result > 0;
    }
}

public class AssignmentDto
{
    public int AssignmentId { get; set; }
    public int CourseId { get; set; }
    public string CourseName { get; set; }
    public string StudentId { get; set; }
    public string StudentName { get; set; }
    public DateTime Deadline { get; set; }
    public DateTime AssignedDate { get; set; }
    public string Status { get; set; }
    public string Description { get; set; }
}

public class StudentDto
{
    public string StudentId { get; set; }
    public string StudentName { get; set; }
    public string Email { get; set; }
}

public class CourseDto
{
    public int CourseId { get; set; }
    public string CourseName { get; set; }
    public string Description { get; set; }
}