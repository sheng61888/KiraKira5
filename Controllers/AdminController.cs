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
}
