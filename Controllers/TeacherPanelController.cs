using KiraKira5.Models;
using KiraKira5.Services;
using Microsoft.AspNetCore.Mvc;

namespace KiraKira5.Controllers
{
    /// <summary>
    /// Controller for teacher panel operations
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class TeacherPanelController : ControllerBase
    {
        private readonly TeacherPanelService _service;

        public TeacherPanelController(TeacherPanelService service)
        {
            _service = service;
        }

        /// <summary>
        /// Creates a new class
        /// </summary>
        [HttpPost("classes")]
        public async Task<IActionResult> CreateClass([FromBody] CreateClassRequest request)
        {
            try
            {
                var result = await _service.CreateClassAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Gets all classes for a teacher
        /// </summary>
        [HttpGet("classes")]
        public async Task<IActionResult> GetClasses([FromQuery] string teacherId)
        {
            try
            {
                var classes = await _service.GetTeacherClassesAsync(teacherId);
                return Ok(classes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Allows a student to join a class
        /// </summary>
        [HttpPost("join")]
        public async Task<IActionResult> JoinClass([FromBody] JoinTeacherClassRequest request)
        {
            try
            {
                var success = await _service.JoinClassAsync(request);
                if (success)
                    return Ok(new { message = "Successfully joined class" });
                return BadRequest(new { message = "Invalid join code" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Gets students in a class
        /// </summary>
        [HttpGet("classes/{classId}/students")]
        public async Task<IActionResult> GetClassStudents(int classId)
        {
            try
            {
                var students = await _service.GetClassStudentsAsync(classId);
                return Ok(students);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Assigns a module to a class
        /// </summary>
        [HttpPost("assignments")]
        public async Task<IActionResult> AssignModule([FromBody] AssignModuleRequest request)
        {
            try
            {
                var assignment = await _service.AssignModuleAsync(request);
                return Ok(assignment);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Gets module assignments for a class
        /// </summary>
        [HttpGet("classes/{classId}/assignments")]
        public async Task<IActionResult> GetClassAssignments(int classId)
        {
            try
            {
                var assignments = await _service.GetClassAssignmentsAsync(classId);
                return Ok(assignments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Gets student progress for a teacher
        /// </summary>
        [HttpGet("progress")]
        public async Task<IActionResult> GetStudentProgress([FromQuery] string teacherId)
        {
            try
            {
                var progress = await _service.GetStudentProgressAsync(teacherId);
                return Ok(progress);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}
