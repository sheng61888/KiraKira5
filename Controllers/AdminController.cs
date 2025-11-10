using Microsoft.AspNetCore.Mvc;

/// <summary>
/// API controller for admin dashboard operations
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly IConfiguration _configuration;
    
    public AdminController(IConfiguration configuration)
    {
        _configuration = configuration;
    }
    
    /// <summary>
    /// Gets the total count of users in the system
    /// </summary>
    [HttpGet("total-users")]
    public async Task<IActionResult> GetTotalUsers()
    {
        try
        {
            var count = await AdminService.GetTotalUsersAsync(_configuration);
            return Ok(new { totalUsers = count });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting total users: {ex.Message}");
            return StatusCode(500, new { totalUsers = 0, error = ex.Message });
        }
    }

    /// <summary>
    /// Gets all community threads
    /// </summary>
    [HttpGet("community/threads")]
    public async Task<IActionResult> GetCommunityThreads()
    {
        try
        {
            var threads = await CommunityService.GetAllThreadsAsync(_configuration);
            return Ok(threads);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting community threads: {ex.Message}");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Deletes a community thread
    /// </summary>
    [HttpDelete("community/threads/{threadId}")]
    public async Task<IActionResult> DeleteThread(int threadId)
    {
        try
        {
            var success = await CommunityService.DeleteThreadAsync(_configuration, threadId);
            if (success)
            {
                return Ok(new { message = "Thread deleted successfully" });
            }
            return NotFound(new { error = "Thread not found" });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error deleting thread: {ex.Message}");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Gets all replies for a thread
    /// </summary>
    [HttpGet("community/threads/{threadId}/replies")]
    public async Task<IActionResult> GetThreadReplies(int threadId)
    {
        try
        {
            var replies = await CommunityService.GetThreadRepliesAsync(_configuration, threadId);
            return Ok(replies);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting replies: {ex.Message}");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Deletes a reply
    /// </summary>
    [HttpDelete("community/replies/{replyId}")]
    public async Task<IActionResult> DeleteReply(int replyId)
    {
        try
        {
            var success = await CommunityService.DeleteReplyAsync(_configuration, replyId);
            if (success)
            {
                return Ok(new { message = "Reply deleted successfully" });
            }
            return NotFound(new { error = "Reply not found" });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error deleting reply: {ex.Message}");
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
