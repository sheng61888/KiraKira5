using MySql.Data.MySqlClient;
using System.Data;
using KiraKira5.Models;


public class TeacherService
{
    private readonly string _connectionString;

    public TeacherService(string connectionString)
    {
        _connectionString = connectionString;
    }

    public async Task<List<TeacherClassDto>> GetTeacherClassesAsync(string teacherId)
    {
        var classes = new List<TeacherClassDto>();
        
        using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();

        var query = @"SELECT class_id, class_name FROM teacher_classes 
                     WHERE teacher_id = @teacherId 
                     ORDER BY class_name";

        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@teacherId", teacherId);

        using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            classes.Add(new TeacherClassDto
            {
                ClassId = reader.GetString("class_id"),
                ClassName = reader.GetString("class_name")
            });
        }

        return classes;
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

    public async Task<bool> CreateAssignmentAsync(TeacherAssignmentDto assignment)
    {
        using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();

        var query = @"INSERT INTO teacher_assignments 
                     (teacher_id, class_id, title, course_name, deadline, status) 
                     VALUES (@teacherId, @classId, @title, @courseName, @deadline, @status)";

        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@teacherId", assignment.TeacherId);
        command.Parameters.AddWithValue("@classId", assignment.ClassId);
        command.Parameters.AddWithValue("@title", assignment.Title);
        command.Parameters.AddWithValue("@courseName", assignment.CourseName);
        command.Parameters.AddWithValue("@deadline", assignment.Deadline);
        command.Parameters.AddWithValue("@status", "Open");

        var result = await command.ExecuteNonQueryAsync();
        return result > 0;
    }

    public async Task<List<TeacherAssignmentDto>> GetTeacherAssignmentsAsync(string teacherId)
    {
        var assignments = new List<TeacherAssignmentDto>();
        
        using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();

        var query = @"SELECT * FROM teacher_assignments 
                     WHERE teacher_id = @teacherId 
                     ORDER BY deadline ASC, created_at DESC";

        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@teacherId", teacherId);

        using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            assignments.Add(new TeacherAssignmentDto
            {
                AssignmentId = reader.GetInt32("assignment_id"),
                TeacherId = reader.GetString("teacher_id"),
                ClassId = reader.GetString("class_id"),
                Title = reader.GetString("title"),
                CourseName = reader.GetString("course_name"),
                Deadline = reader.GetDateTime("deadline"),
                Status = reader.GetString("status"),
                CreatedAt = reader.GetDateTime("created_at")
            });
        }

        return assignments;
    }

    public async Task<bool> UpdateAssignmentStatusAsync(int assignmentId, string status)
    {
        using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();

        var query = "UPDATE teacher_assignments SET status = @status WHERE assignment_id = @assignmentId";
        
        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@status", status);
        command.Parameters.AddWithValue("@assignmentId", assignmentId);

        var result = await command.ExecuteNonQueryAsync();
        return result > 0;
    }

    public async Task<bool> DeleteAssignmentAsync(int assignmentId)
    {
        using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();

        var query = "DELETE FROM teacher_assignments WHERE assignment_id = @assignmentId";
        
        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@assignmentId", assignmentId);

        var result = await command.ExecuteNonQueryAsync();
        return result > 0;
    }
}

public class TeacherClassDto
{
    public string ClassId { get; set; }
    public string ClassName { get; set; }
}

public class TeacherAssignmentDto
{
    public int AssignmentId { get; set; }
    public string TeacherId { get; set; }
    public string ClassId { get; set; }
    public string Title { get; set; }
    public string CourseName { get; set; }
    public DateTime Deadline { get; set; }
    public string Status { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CourseDto
{
    public int CourseId { get; set; }
    public string CourseName { get; set; }
    public string Description { get; set; }
}