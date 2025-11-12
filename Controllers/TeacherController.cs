using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

[ApiController]
[Route("api/[controller]")]
public class TeacherController : ControllerBase
{
    private readonly TeacherService _teacherService;

    public TeacherController(IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("KiraKiraDB");
        _teacherService = new TeacherService(connectionString);
    }

    [HttpGet("classes")]
    public async Task<IActionResult> GetTeacherClasses()
    {
        try
        {
            var teacherId = GetCurrentTeacherId(); // Implement this based on your auth
            var classes = await _teacherService.GetTeacherClassesAsync(teacherId);
            return Ok(classes);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving classes", error = ex.Message });
        }
    }

    [HttpGet("courses")]
    public async Task<IActionResult> GetAvailableCourses()
    {
        try
        {
            var courses = await _teacherService.GetAvailableCoursesAsync();
            return Ok(courses);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving courses", error = ex.Message });
        }
    }

    [HttpGet("assignments")]
    public async Task<IActionResult> GetTeacherAssignments()
    {
        try
        {
            var teacherId = GetCurrentTeacherId();
            var assignments = await _teacherService.GetTeacherAssignmentsAsync(teacherId);
            return Ok(assignments);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving assignments", error = ex.Message });
        }
    }

    [HttpPost("assignments")]
    public async Task<IActionResult> CreateAssignment([FromBody] CreateAssignmentRequest request)
    {
        try
        {
            var assignment = new TeacherAssignmentDto
            {
                TeacherId = GetCurrentTeacherId(),
                ClassId = request.ClassId,
                Title = request.Title,
                CourseName = request.CourseName,
                Deadline = request.Deadline
            };

            var result = await _teacherService.CreateAssignmentAsync(assignment);
            
            if (result)
            {
                return Ok(new { message = "Assignment created successfully" });
            }
            else
            {
                return BadRequest(new { message = "Failed to create assignment" });
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error creating assignment", error = ex.Message });
        }
    }

    [HttpPut("assignments/{assignmentId}/status")]
    public async Task<IActionResult> UpdateAssignmentStatus(int assignmentId, [FromBody] UpdateStatusRequest request)
    {
        try
        {
            var result = await _teacherService.UpdateAssignmentStatusAsync(assignmentId, request.Status);
            
            if (result)
            {
                return Ok(new { message = "Assignment status updated successfully" });
            }
            else
            {
                return BadRequest(new { message = "Failed to update assignment status" });
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error updating assignment status", error = ex.Message });
        }
    }

    [HttpDelete("assignments/{assignmentId}")]
    public async Task<IActionResult> DeleteAssignment(int assignmentId)
    {
        try
        {
            var result = await _teacherService.DeleteAssignmentAsync(assignmentId);
            
            if (result)
            {
                return Ok(new { message = "Assignment deleted successfully" });
            }
            else
            {
                return BadRequest(new { message = "Failed to delete assignment" });
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error deleting assignment", error = ex.Message });
        }
    }

    private string GetCurrentTeacherId()
    {
        // Implement based on your authentication system
        // This could come from JWT token, session, etc.
        return "teacher123"; // Placeholder - replace with actual implementation
    }
}

public class CreateAssignmentRequest
{
    public string ClassId { get; set; }
    public string Title { get; set; }
    public string CourseName { get; set; }
    public DateTime Deadline { get; set; }
}

public class UpdateStatusRequest
{
    public string Status { get; set; }
}