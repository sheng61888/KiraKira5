using Microsoft.AspNetCore.Mvc;
using System;
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

    [HttpGet("live-progress")]
    public async Task<IActionResult> GetLiveProgressSnapshot()
    {
        var snapshot = await _learnerService.GetLiveProgressSnapshotAsync();
        return Ok(snapshot);
    }

    [HttpGet("{learnerId}/classes")]
    public async Task<IActionResult> GetClasses(string learnerId)
    {
        var data = await _learnerService.GetClassesAsync(learnerId);
        return Ok(data);
    }

    [HttpPost("{learnerId}/mission")]
    public async Task<IActionResult> SaveMissionPreferences(string learnerId, [FromBody] LearnerMissionUpdateRequest request)
    {
        if (request == null)
        {
            return BadRequest(new { error = "Mission preferences are required." });
        }

        Console.WriteLine($"Received mission: Grade={request.Grade}, Readiness={request.Readiness}, WantsVideos={request.WantsVideos}");
        var mission = await _learnerService.SaveMissionPreferencesAsync(learnerId, request);
        return Ok(mission);
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

    [HttpPost("{learnerId}/profile/featured-badge")]
    public async Task<IActionResult> SaveFeaturedBadge(string learnerId, [FromBody] LearnerFeaturedBadgeRequest request)
    {
        if (string.IsNullOrWhiteSpace(learnerId))
        {
            return BadRequest(new { error = "Learner ID is required." });
        }

        if (request == null || string.IsNullOrWhiteSpace(request.BadgeId))
        {
            return BadRequest(new { error = "badgeId is required." });
        }

        var badge = await _learnerService.SaveFeaturedBadgeAsync(learnerId, request);
        return Ok(badge);
    }

    [HttpPost("{learnerId}/modules/quizzes")]
    public async Task<IActionResult> LogModuleQuiz(string learnerId, [FromBody] ModuleQuizLogRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.ModuleId) || string.IsNullOrWhiteSpace(request.UnitId))
        {
            return BadRequest(new { error = "moduleId and unitId are required." });
        }

        var result = await _learnerService.LogModuleQuizAsync(learnerId, request);
        return Ok(result);
    }

    [HttpPost("{learnerId}/pastpapers/logs")]
    public async Task<IActionResult> LogPastPaperSession(string learnerId, [FromBody] PastPaperLogRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.PaperTitle))
        {
            return BadRequest(new { error = "paperTitle is required." });
        }

        var result = await _learnerService.LogPastPaperAsync(learnerId, request);
        return Ok(result);
    }

    [HttpPost("{learnerId}/modules/selection")]
    public async Task<IActionResult> AddModuleSelection(string learnerId, [FromBody] ModuleSelectionRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.ModuleId))
        {
            return BadRequest(new { error = "moduleId is required." });
        }

        var result = await _learnerService.AddModuleSelectionAsync(learnerId, request);
        if (!result.Success)
        {
            return BadRequest(new { error = result.Message });
        }

        return Ok(result);
    }

    [HttpDelete("{learnerId}/modules/selection/{moduleId}")]
    public async Task<IActionResult> RemoveModuleSelection(string learnerId, string moduleId)
    {
        if (string.IsNullOrWhiteSpace(moduleId))
        {
            return BadRequest(new { error = "moduleId is required." });
        }

        var result = await _learnerService.RemoveModuleSelectionAsync(learnerId, moduleId);
        if (!result.Success)
        {
            return BadRequest(new { error = result.Message });
        }

        return Ok(result);
    }

    [HttpPost("{learnerId}/modules/progress")]
    public async Task<IActionResult> LogModuleProgress(string learnerId, [FromBody] ModuleProgressLogRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.ModuleId) || string.IsNullOrWhiteSpace(request.UnitId))
        {
            return BadRequest(new { error = "moduleId and unitId are required." });
        }

        var result = await _learnerService.LogModuleProgressAsync(learnerId, request);
        if (!result.Success)
        {
            return BadRequest(new { error = result.Message });
        }

        return Ok(result);
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

    [HttpGet("{learnerId}/community/profiles/{profileLearnerId}")]
    public async Task<IActionResult> GetCommunityProfileCard(string learnerId, string profileLearnerId)
    {
        var profile = await _learnerService.GetCommunityProfileCardAsync(profileLearnerId);
        if (string.IsNullOrWhiteSpace(profile.LearnerId))
        {
            return NotFound(new { error = "Learner not found." });
        }

        return Ok(profile);
    }

    /// <summary>
    /// Gets assigned modules with due dates for a learner
    /// </summary>
    [HttpGet("{learnerId}/assignments")]
    public async Task<IActionResult> GetAssignedModules(string learnerId)
    {
        var assignments = await _learnerService.GetAssignedModulesAsync(learnerId);
        return Ok(assignments);
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

public class LearnerFeaturedBadgeRequest
{
    public string BadgeId { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string Style { get; set; } = "level";
}

public class LearnerMissionUpdateRequest
{
    public string Grade { get; set; } = string.Empty;
    public int Readiness { get; set; }
    public bool WantsVideos { get; set; }
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

public class ModuleQuizLogRequest
{
    public string ModuleId { get; set; } = string.Empty;
    public string UnitId { get; set; } = string.Empty;
    public int? ScorePercent { get; set; }
    public int? DurationSeconds { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int? XpAwarded { get; set; }
}

public class PastPaperLogRequest
{
    public string PaperSlug { get; set; } = string.Empty;
    public string PaperTitle { get; set; } = string.Empty;
    public string Mode { get; set; } = "timed";
    public int DurationMinutes { get; set; }
    public decimal? ScorePercent { get; set; }
    public string Reflection { get; set; } = string.Empty;
    public DateTime? LoggedAt { get; set; }
    public int? XpAwarded { get; set; }
}

public class ModuleSelectionRequest
{
    public string ModuleId { get; set; } = string.Empty;
}

public class ModuleProgressLogRequest
{
    public string ModuleId { get; set; } = string.Empty;
    public string UnitId { get; set; } = string.Empty;
    public string Status { get; set; } = "completed";
    public int? ScorePercent { get; set; }
    public int? DurationSeconds { get; set; }
}
