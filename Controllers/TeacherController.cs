using KiraKira5.Services;
using Microsoft.AspNetCore.Mvc;

namespace KiraKira5.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // This creates the base URL: /api/Teacher
    public class TeacherController : ControllerBase
    {
        private readonly TeacherService _teacherService;

        public TeacherController(TeacherService teacherService)
        {
            _teacherService = teacherService;
        }

        // *** FIXED: Now accepts a teacherId from the query string ***
        // Handles GET /api/Teacher/classes?teacherId=T001
        [HttpGet("classes")]
        public async Task<IActionResult> GetTeacherClasses([FromQuery] string teacherId)
        {
            if (string.IsNullOrEmpty(teacherId))
            {
                return BadRequest(new { message = "A teacherId is required." });
            }
            try
            {
                var classes = await _teacherService.GetTeacherClassesAsync(teacherId);
                return Ok(classes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }

        // Handles GET /api/Teacher/courses
        [HttpGet("courses")]
        public async Task<IActionResult> GetCourses()
        {
            try
            {
                var courses = await _teacherService.GetCoursesAsync();
                return Ok(courses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }
        
        // *** FIXED: Now accepts a teacherId from the query string ***
        // Handles GET /api/Teacher/assignments?teacherId=T001
        [HttpGet("assignments")]
        public async Task<IActionResult> GetAssignments([FromQuery] string teacherId)
        {
            if (string.IsNullOrEmpty(teacherId))
            {
                return BadRequest(new { message = "A teacherId is required." });
            }
            try
            {
                var assignments = await _teacherService.GetAssignmentsAsync(teacherId);
                return Ok(assignments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }

        // Handles POST /api/Teacher/assignments
        [HttpPost("assignments")]
        public async Task<IActionResult> CreateAssignment([FromBody] CreateAssignmentRequest req)
        {
            if (req == null || string.IsNullOrEmpty(req.ClassId))
            {
                return BadRequest(new { message = "Invalid assignment data."});
            }
            try
            {
                var newAssignment = await _teacherService.CreateAssignmentAsync(req);
                return Ok(newAssignment);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }

        // Handles GET /api/Teacher/classes/{classId}/students
        [HttpGet("classes/{classId}/students")]
        public async Task<IActionResult> GetStudentsInClass(string classId)
        {
            try
            {
                var students = await _teacherService.GetStudentsInClassAsync(classId);
                return Ok(students);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }
        
        // *** FIXED: Now accepts a teacherId from the query string ***
        // Handles GET /api/Teacher/student-progress?teacherId=T001
        [HttpGet("student-progress")]
        public async Task<IActionResult> GetStudentProgress([FromQuery] string teacherId)
        {
            if (string.IsNullOrEmpty(teacherId))
            {
                return BadRequest(new { message = "A teacherId is required." });
            }
            try
            {
                var progress = await _teacherService.GetStudentProgressAsync(teacherId);
                return Ok(progress);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }

        // Add other endpoints for PUT (update) and DELETE
        [HttpPut("assignments/{assignmentId}/status")]
        public async Task<IActionResult> UpdateAssignmentStatus(int assignmentId, [FromBody] UpdateStatusRequest req)
        {
            try
            {
                var success = await _teacherService.UpdateAssignmentStatusAsync(assignmentId, req.Status);
                if (success) return Ok(new { success = true, message = "Status updated." });
                return NotFound(new { success = false, message = "Assignment not found." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }

        [HttpDelete("assignments/{assignmentId}")]
        public async Task<IActionResult> DeleteAssignment(int assignmentId)
        {
             try
            {
                var success = await _teacherService.DeleteAssignmentAsync(assignmentId);
                if (success) return Ok(new { success = true, message = "Assignment deleted." });
                return NotFound(new { success = false, message = "Assignment not found." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }
    }

    // --- Request Models ---
    public class CreateAssignmentRequest
    {
        public string ClassId { get; set; }
        public string Title { get; set; }
        public string Topic { get; set; }
        public DateTime DueAt { get; set; }
        public string StatusTemplate { get; set; }
        public string TeacherId { get; set; }
    }

    public class UpdateStatusRequest
    {
        public string Status { get; set; }
    }
}