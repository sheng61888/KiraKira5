using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

/// <summary>
/// Serves consolidated learner-facing data to power the front-end pages.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class LearnerController : ControllerBase
{
    private readonly ILearnerService _learnerService;

    public LearnerController(ILearnerService learnerService)
    {
        _learnerService = learnerService;
    }

    [HttpGet("{learnerId}/dashboard")]
    public async Task<IActionResult> GetDashboard(string learnerId)
    {
        var data = await _learnerService.GetDashboardAsync(learnerId);
        return Ok(data);
    }

    [HttpGet("{learnerId}/progress")]
    public async Task<IActionResult> GetProgress(string learnerId)
    {
        var data = await _learnerService.GetProgressAsync(learnerId);
        return Ok(data);
    }

    [HttpGet("{learnerId}/classes")]
    public async Task<IActionResult> GetClasses(string learnerId)
    {
        var data = await _learnerService.GetClassesAsync(learnerId);
        return Ok(data);
    }

    [HttpPost("{learnerId}/classes/join")]
    public async Task<IActionResult> JoinClass(string learnerId, [FromBody] JoinClassRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Code))
        {
            return BadRequest(new { error = "Class code is required." });
        }

        var data = await _learnerService.JoinClassAsync(learnerId, request.Code.Trim());
        return Ok(data);
    }

    [HttpGet("{learnerId}/pastpapers")]
    public async Task<IActionResult> GetPastPapers(string learnerId, [FromQuery] string year, [FromQuery] string type, [FromQuery] string topic)
    {
        var data = await _learnerService.GetPastPapersAsync(learnerId, year, type, topic);
        return Ok(data);
    }

    [HttpGet("{learnerId}/profile")]
    public async Task<IActionResult> GetProfile(string learnerId)
    {
        var data = await _learnerService.GetProfileAsync(learnerId);
        return Ok(data);
    }
}

public class JoinClassRequest
{
    public string Code { get; set; } = string.Empty;
}
