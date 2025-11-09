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

    [HttpPost("{learnerId}/profile/avatar")]
    public async Task<IActionResult> UpdateAvatar(string learnerId, [FromBody] AvatarUpdateRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.AvatarUrl))
        {
            return BadRequest(new { error = "avatarUrl is required." });
        }

        var profile = await _learnerService.UpdateAvatarAsync(learnerId, request.AvatarUrl);
        return Ok(profile);
    }

    [HttpPost("{learnerId}/profile/details")]
    public async Task<IActionResult> UpdateProfileDetails(string learnerId, [FromBody] ProfileDetailsUpdateRequest request)
    {
        if (request == null)
        {
            return BadRequest(new { error = "Profile details payload is required." });
        }

        var payload = await _learnerService.UpdateProfileDetailsAsync(learnerId, request);
        return Ok(payload);
    }

    [HttpGet("{learnerId}/community/threads")]
    public async Task<IActionResult> GetCommunityThreads(string learnerId, [FromQuery] CommunityThreadQuery query)
    {
        var payload = await _learnerService.GetCommunityThreadsAsync(learnerId, query ?? new CommunityThreadQuery());
        return Ok(payload);
    }

    [HttpPost("{learnerId}/community/threads")]
    public async Task<IActionResult> CreateCommunityThread(string learnerId, [FromBody] CommunityThreadCreateRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Topic) || string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(new { error = "Topic and message are required." });
        }

        var thread = await _learnerService.CreateCommunityThreadAsync(learnerId, request);
        return Ok(thread);
    }

    [HttpPost("{learnerId}/community/threads/{threadId}/replies")]
    public async Task<IActionResult> CreateCommunityReply(string learnerId, long threadId, [FromBody] CommunityReplyCreateRequest request)
    {
        if (threadId <= 0)
        {
            return BadRequest(new { error = "A valid threadId is required." });
        }

        if (request == null || string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(new { error = "Message is required." });
        }

        var reply = await _learnerService.CreateCommunityReplyAsync(learnerId, threadId, request);
        return Ok(reply);
    }

    [HttpGet("{learnerId}/community/threads/{threadId}")]
    public async Task<IActionResult> GetCommunityThreadDetail(string learnerId, long threadId, [FromQuery] CommunityThreadDetailQuery query)
    {
        if (threadId <= 0)
        {
            return BadRequest(new { error = "A valid threadId is required." });
        }

        var payload = await _learnerService.GetCommunityThreadDetailAsync(learnerId, threadId, query ?? new CommunityThreadDetailQuery());
        return Ok(payload);
    }
}

public class JoinClassRequest
{
    public string Code { get; set; } = string.Empty;
}

public class AvatarUpdateRequest
{
    public string AvatarUrl { get; set; } = string.Empty;
}

public class ProfileDetailsUpdateRequest
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Motto { get; set; } = string.Empty;
    public string School { get; set; } = string.Empty;
    public string Year { get; set; } = string.Empty;
}

public class CommunityThreadQuery
{
    public string Category { get; set; } = string.Empty;
    public string Tag { get; set; } = string.Empty;
    public string Cursor { get; set; } = string.Empty;
    public int Limit { get; set; } = 10;
}

public class CommunityThreadCreateRequest
{
    public string Topic { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string FormLevel { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Tag { get; set; } = string.Empty;
}

public class CommunityReplyCreateRequest
{
    public string Message { get; set; } = string.Empty;
}

public class CommunityThreadDetailQuery
{
    public string Cursor { get; set; } = string.Empty;
    public int Limit { get; set; } = 20;
}
