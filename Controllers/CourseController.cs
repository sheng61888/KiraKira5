using Microsoft.AspNetCore.Mvc;
using KiraKira5.Services;
using KiraKira5.Models;

namespace KiraKira5.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CourseController : ControllerBase
    {
        private readonly CourseService _courseService;

        public CourseController(CourseService courseService)
        {
            _courseService = courseService;
        }

        /// <summary>
        /// Enroll learner in course by code
        /// </summary>
        [HttpPost("enroll")]
        public async Task<IActionResult> EnrollLearner([FromBody] EnrollRequest request)
        {
            try
            {
                Console.WriteLine($"Enrollment request - LearnerId: {request.LearnerId}, Code: {request.EnrollmentCode}");
                var result = await _courseService.EnrollLearnerAsync(request.LearnerId, request.EnrollmentCode);
                Console.WriteLine($"Enrollment result: {result}");
                return result ? Ok(new { message = "Enrolled successfully" }) : BadRequest(new { message = "Invalid enrollment code or already enrolled" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Enrollment error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = ex.Message, detail = ex.StackTrace });
            }
        }

        /// <summary>
        /// Complete course and award XP
        /// </summary>
        [HttpPost("complete/{enrollmentId}")]
        public async Task<IActionResult> CompleteCourse(int enrollmentId)
        {
            try
            {
                Console.WriteLine($"Completing course for enrollment ID: {enrollmentId}");
                var result = await _courseService.CompleteCourseAsync(enrollmentId);
                Console.WriteLine($"Completion result: {result}");
                return result ? Ok(new { message = "Course completed, 1000 XP awarded" }) : NotFound();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error completing course: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Update sub-chapter progress
        /// </summary>
        [HttpPost("progress/subchapter")]
        public async Task<IActionResult> UpdateSubChapterProgress([FromBody] ProgressRequest request)
        {
            var result = await _courseService.UpdateSubChapterProgressAsync(request.EnrollmentId, request.SubChapterId, request.IsCompleted);
            return result ? Ok() : BadRequest();
        }

        /// <summary>
        /// Get learner enrollments
        /// </summary>
        [HttpGet("enrollments/{learnerId}")]
        public async Task<IActionResult> GetEnrollments(int learnerId)
        {
            var enrollments = await _courseService.GetLearnerEnrollmentsAsync(learnerId);
            return Ok(enrollments);
        }

        /// <summary>
        /// Create course (Admin)
        /// </summary>
        [HttpPost("admin/course")]
        public async Task<IActionResult> CreateCourse([FromBody] CreateCourseRequest request)
        {
            var courseId = await _courseService.CreateCourseAsync(request.Title, request.Description, request.EnrollmentCode);
            return Ok(new { courseId });
        }

        /// <summary>
        /// Create chapter (Admin)
        /// </summary>
        [HttpPost("admin/chapter")]
        public async Task<IActionResult> CreateChapter([FromBody] CreateChapterRequest request)
        {
            var chapterId = await _courseService.CreateChapterAsync(request.CourseId, request.Title, request.Content, request.OrderIndex);
            return Ok(new { chapterId });
        }

        /// <summary>
        /// Create sub-chapter (Admin)
        /// </summary>
        [HttpPost("admin/subchapter")]
        public async Task<IActionResult> CreateSubChapter([FromBody] CreateSubChapterRequest request)
        {
            var subChapterId = await _courseService.CreateSubChapterAsync(request.ChapterId, request.Title, request.Content, request.OrderIndex);
            return Ok(new { subChapterId });
        }

        /// <summary>
        /// Get all courses (Admin)
        /// </summary>
        [HttpGet("admin/courses")]
        public async Task<IActionResult> GetAllCourses()
        {
            var courses = await _courseService.GetAllCoursesAsync();
            return Ok(courses);
        }

        /// <summary>
        /// Get chapters by course (Admin)
        /// </summary>
        [HttpGet("admin/chapters/{courseId}")]
        public async Task<IActionResult> GetChaptersByCourse(int courseId)
        {
            var chapters = await _courseService.GetChaptersByCourseAsync(courseId);
            return Ok(chapters);
        }

        /// <summary>
        /// Get chapters by course (Learner)
        /// </summary>
        [HttpGet("chapters/{courseId}")]
        public async Task<IActionResult> GetChapters(int courseId)
        {
            var chapters = await _courseService.GetChaptersByCourseAsync(courseId);
            return Ok(chapters);
        }

        /// <summary>
        /// Get course structure (Admin)
        /// </summary>
        [HttpGet("admin/structure")]
        public async Task<IActionResult> GetCourseStructure()
        {
            var structure = await _courseService.GetCourseStructureAsync();
            return Ok(structure);
        }

        /// <summary>
        /// Get sub-chapters by chapter (Admin)
        /// </summary>
        [HttpGet("admin/subchapters/{chapterId}")]
        public async Task<IActionResult> GetSubChaptersByChapter(int chapterId)
        {
            var subChapters = await _courseService.GetSubChaptersByChapterAsync(chapterId);
            return Ok(subChapters);
        }

        /// <summary>
        /// Get sub-chapters by chapter (Learner)
        /// </summary>
        [HttpGet("subchapters/{chapterId}")]
        public async Task<IActionResult> GetSubChapters(int chapterId)
        {
            var subChapters = await _courseService.GetSubChaptersByChapterAsync(chapterId);
            return Ok(subChapters);
        }

        /// <summary>
        /// Test endpoint to verify course by code
        /// </summary>
        [HttpGet("test/code/{code}")]
        public async Task<IActionResult> TestCourseCode(string code)
        {
            var courses = await _courseService.GetAllCoursesAsync();
            var course = courses.FirstOrDefault(c => c.EnrollmentCode == code);
            return Ok(new { found = course != null, course, allCodes = courses.Select(c => c.EnrollmentCode).ToList() });
        }
    }

    public class EnrollRequest
    {
        public int LearnerId { get; set; }
        public string EnrollmentCode { get; set; }
    }

    public class ProgressRequest
    {
        public int EnrollmentId { get; set; }
        public int SubChapterId { get; set; }
        public bool IsCompleted { get; set; }
    }

    public class CreateCourseRequest
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string EnrollmentCode { get; set; }
    }

    public class CreateChapterRequest
    {
        public int CourseId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public int OrderIndex { get; set; }
    }

    public class CreateSubChapterRequest
    {
        public int ChapterId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public int OrderIndex { get; set; }
    }
}
