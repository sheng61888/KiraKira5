using Microsoft.AspNetCore.Mvc;
using System.Data.SqlClient;

namespace KiraKira5.Controllers
{
    /// <summary>
    /// Handles admin course management operations
    /// </summary>
    [ApiController]
    [Route("api/admin/courses")]
    public class AdminCourseController : ControllerBase
    {
        private readonly string connectionString = "Server=localhost;Database=KiraKira;Trusted_Connection=True;";

        /// <summary>
        /// Get all courses
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetCourses()
        {
            var courses = new List<object>();
            try
            {
                using (var conn = new SqlConnection(connectionString))
                {
                    await conn.OpenAsync();
                    var cmd = new SqlCommand("SELECT CourseId, Title, Description, GradeLevel, EnrollmentCode, CreatedAt FROM Courses ORDER BY CreatedAt DESC", conn);
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            courses.Add(new
                            {
                                courseId = reader.GetInt32(0),
                                title = reader.GetString(1),
                                description = reader.IsDBNull(2) ? "" : reader.GetString(2),
                                gradeLevel = reader.IsDBNull(3) ? "" : reader.GetString(3),
                                enrollmentCode = reader.IsDBNull(4) ? "" : reader.GetString(4),
                                createdAt = reader.GetDateTime(5)
                            });
                        }
                    }
                }
                return Ok(courses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// Add new course
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> AddCourse([FromBody] CourseRequest request)
        {
            try
            {
                using (var conn = new SqlConnection(connectionString))
                {
                    await conn.OpenAsync();
                    var cmd = new SqlCommand("INSERT INTO Courses (Title, Description, GradeLevel, EnrollmentCode, CreatedAt) OUTPUT INSERTED.CourseId VALUES (@Title, @Description, @GradeLevel, @EnrollmentCode, @CreatedAt)", conn);
                    cmd.Parameters.AddWithValue("@Title", request.Title);
                    cmd.Parameters.AddWithValue("@Description", request.Description ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@GradeLevel", request.GradeLevel ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@EnrollmentCode", request.EnrollmentCode ?? GenerateCode());
                    cmd.Parameters.AddWithValue("@CreatedAt", DateTime.Now);
                    
                    var courseId = (int)await cmd.ExecuteScalarAsync();
                    return Ok(new { courseId, message = "Course created successfully" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// Update course
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCourse(int id, [FromBody] CourseRequest request)
        {
            try
            {
                using (var conn = new SqlConnection(connectionString))
                {
                    await conn.OpenAsync();
                    var cmd = new SqlCommand("UPDATE Courses SET Title = @Title, Description = @Description, GradeLevel = @GradeLevel WHERE CourseId = @CourseId", conn);
                    cmd.Parameters.AddWithValue("@CourseId", id);
                    cmd.Parameters.AddWithValue("@Title", request.Title);
                    cmd.Parameters.AddWithValue("@Description", request.Description ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@GradeLevel", request.GradeLevel ?? (object)DBNull.Value);
                    
                    await cmd.ExecuteNonQueryAsync();
                    return Ok(new { message = "Course updated successfully" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// Delete course
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCourse(int id)
        {
            try
            {
                using (var conn = new SqlConnection(connectionString))
                {
                    await conn.OpenAsync();
                    var cmd = new SqlCommand("DELETE FROM Courses WHERE CourseId = @CourseId", conn);
                    cmd.Parameters.AddWithValue("@CourseId", id);
                    await cmd.ExecuteNonQueryAsync();
                    return Ok(new { message = "Course deleted successfully" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// Add chapter to course
        /// </summary>
        [HttpPost("{courseId}/chapters")]
        public async Task<IActionResult> AddChapter(int courseId, [FromBody] ChapterRequest request)
        {
            try
            {
                using (var conn = new SqlConnection(connectionString))
                {
                    await conn.OpenAsync();
                    var cmd = new SqlCommand("INSERT INTO Chapters (CourseId, Title, OrderIndex) OUTPUT INSERTED.ChapterId VALUES (@CourseId, @Title, @OrderIndex)", conn);
                    cmd.Parameters.AddWithValue("@CourseId", courseId);
                    cmd.Parameters.AddWithValue("@Title", request.Title);
                    cmd.Parameters.AddWithValue("@OrderIndex", request.OrderIndex);
                    
                    var chapterId = (int)await cmd.ExecuteScalarAsync();
                    return Ok(new { chapterId, message = "Chapter added successfully" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// Delete chapter
        /// </summary>
        [HttpDelete("chapters/{chapterId}")]
        public async Task<IActionResult> DeleteChapter(int chapterId)
        {
            try
            {
                using (var conn = new SqlConnection(connectionString))
                {
                    await conn.OpenAsync();
                    var cmd = new SqlCommand("DELETE FROM Chapters WHERE ChapterId = @ChapterId", conn);
                    cmd.Parameters.AddWithValue("@ChapterId", chapterId);
                    await cmd.ExecuteNonQueryAsync();
                    return Ok(new { message = "Chapter deleted successfully" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        private string GenerateCode()
        {
            return Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper();
        }
    }

    public class CourseRequest
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string GradeLevel { get; set; }
        public string EnrollmentCode { get; set; }
    }

    public class ChapterRequest
    {
        public string Title { get; set; }
        public int OrderIndex { get; set; }
    }
}
