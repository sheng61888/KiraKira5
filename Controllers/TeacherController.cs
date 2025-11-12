using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

[ApiController]
[Route("api/[controller]")]
public class TeacherController : ControllerBase
{
    private readonly AssignmentService _assignmentService;

    public TeacherController(IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("KiraKiraDB");
        _assignmentService = new AssignmentService(connectionString);
    }

    [HttpGet("students")]
    public async Task<IActionResult> GetAvailableStudents()
    {
        try
        {
            var students = await _assignmentService.GetAvailableStudentsAsync();
            return Ok(students);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving students", error = ex.Message });
        }
    }

    [HttpGet("courses")]
    public async Task<IActionResult> GetAvailableCourses()
    {
        try
        {
            var courses = await _assignmentService.GetAvailableCoursesAsync();
            return Ok(courses);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving courses", error = ex.Message });
        }
    }

    [HttpGet("{teacherId}/assignments")]
    public async Task<IActionResult> GetTeacherAssignments(string teacherId)
    {
        try
        {
            var assignments = await _assignmentService.GetTeacherAssignmentsAsync(teacherId);
            return Ok(assignments);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving assignments", error = ex.Message });
        }
    }

    [HttpPost("assign")]
    public async Task<IActionResult> AssignCourse([FromBody] AssignCourseRequest request)
    {
        try
        {
            bool result;
            
            if (request.StudentIds.Count == 1)
            {
                result = await _assignmentService.AssignCourseToStudentAsync(
                    request.TeacherId, 
                    request.StudentIds[0], 
                    request.CourseId, 
                    request.Deadline
                );
            }
            else
            {
                result = await _assignmentService.AssignCourseToMultipleStudentsAsync(
                    request.TeacherId, 
                    request.StudentIds, 
                    request.CourseId, 
                    request.Deadline
                );
            }

            if (result)
            {
                return Ok(new { message = "Course assigned successfully" });
            }
            else
            {
                return BadRequest(new { message = "Failed to assign course" });
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error assigning course", error = ex.Message });
        }
    }

    [HttpPut("assignments/{assignmentId}/deadline")]
    public async Task<IActionResult> UpdateDeadline(int assignmentId, [FromBody] UpdateDeadlineRequest request)
    {
        try
        {
            var result = await _assignmentService.UpdateAssignmentDeadlineAsync(assignmentId, request.NewDeadline);
            
            if (result)
            {
                return Ok(new { message = "Deadline updated successfully" });
            }
            else
            {
                return BadRequest(new { message = "Failed to update deadline" });
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error updating deadline", error = ex.Message });
        }
    }

    [HttpDelete("assignments/{assignmentId}")]
    public async Task<IActionResult> DeleteAssignment(int assignmentId)
    {
        try
        {
            var result = await _assignmentService.DeleteAssignmentAsync(assignmentId);
            
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
}

public class AssignCourseRequest
{
    public string TeacherId { get; set; }
    public List<string> StudentIds { get; set; }
    public int CourseId { get; set; }
    public DateTime Deadline { get; set; }
}

public class UpdateDeadlineRequest
{
    public DateTime NewDeadline { get; set; }
}