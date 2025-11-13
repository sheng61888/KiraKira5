using Microsoft.Extensions.Configuration;
using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

/// <summary>
/// Describes the operations required to hydrate learner-facing pages.
/// </summary>
public interface ILearnerService
{
    Task<LearnerDashboardDto> GetDashboardAsync(string learnerId);
    Task<LearnerProgressDto> GetProgressAsync(string learnerId);
    Task<LearnerClassesDto> GetClassesAsync(string learnerId);
    Task<LearnerClassesDto> JoinClassAsync(string learnerId, string classCode);
    Task<LearnerPastPapersDto> GetPastPapersAsync(string learnerId, string year, string type, string topic);
    Task<LearnerProfilePayload> GetProfileAsync(string learnerId);
    Task<LearnerProfileDto> UpdateAvatarAsync(string learnerId, string avatarUrl);
    Task<LearnerProfilePayload> UpdateProfileDetailsAsync(string learnerId, ProfileDetailsUpdateRequest request);
    Task<LearnerMissionDto> SaveMissionPreferencesAsync(string learnerId, LearnerMissionUpdateRequest request);
    Task<LearnerFeaturedBadgeDto> SaveFeaturedBadgeAsync(string learnerId, LearnerFeaturedBadgeRequest request);
    Task<CommunityFeedDto> GetCommunityThreadsAsync(string learnerId, CommunityThreadQuery query);
    Task<CommunityThreadDto> CreateCommunityThreadAsync(string learnerId, CommunityThreadCreateRequest request);
    Task<CommunityReplyDto> CreateCommunityReplyAsync(string learnerId, long threadId, CommunityReplyCreateRequest request);
    Task<CommunityThreadDetailDto> GetCommunityThreadDetailAsync(string learnerId, long threadId, CommunityThreadDetailQuery query);
    Task<CommunityProfileCardDto> GetCommunityProfileCardAsync(string learnerId);
    Task<StudyActivityResultDto> LogModuleQuizAsync(string learnerId, ModuleQuizLogRequest request);
    Task<StudyActivityResultDto> LogPastPaperAsync(string learnerId, PastPaperLogRequest request);
    Task<ModuleSelectionResponse> AddModuleSelectionAsync(string learnerId, ModuleSelectionRequest request);
    Task<ModuleSelectionResponse> RemoveModuleSelectionAsync(string learnerId, string moduleId);
    Task<ModuleProgressResponse> LogModuleProgressAsync(string learnerId, ModuleProgressLogRequest request);
    Task<LiveProgressSnapshotDto> GetLiveProgressSnapshotAsync();
    Task<IEnumerable<KiraKira5.Models.LearnerAssignedModule>> GetAssignedModulesAsync(string learnerId);
}

/// <summary>
/// Temporary implementation backed by sample data. Replace with DB queries next.
/// </summary>
public class LearnerService : ILearnerService
{
    private readonly IConfiguration _configuration;
    private readonly string _connectionString;
    private const int DefaultModuleQuizXp = 120;
    private const int DefaultPastPaperXp = 100;
    private const int MaxActivityXp = 500;
    private const int BaseLevelXp = 1000;
    private const int XpPerUnitCompletion = 60;
    private const int PostLevelRampIncrement = 250;
    private static readonly int[] EarlyLevelRequirements = { 0, 200, 300, 400, 500 };
    private const string DefaultAvatar = "/images/profile-cat.jpg";
    private static readonly HashSet<string> AllowedAvatars = new(StringComparer.OrdinalIgnoreCase)
    {
        DefaultAvatar,
        "/images/pfp/pfp 1.png",
        "/images/pfp/pfp 2.png",
        "/images/pfp/pfp 3.png",
        "/images/pfp/pfp 4.png",
        "/images/pfp/pfp 5.png",
        "/images/pfp/pfp 6.png",
        "/images/pfp/pfp 1.jpg",
        "/images/pfp/pfp 2.jpg",
        "/images/pfp/pfp 3.jpg",
        "/images/pfp/pfp 4.jpg",
        "/images/pfp/pfp 5.jpg",
        "/images/pfp/pfp 6.jpg"
    };

    public LearnerService(IConfiguration configuration)
    {
        _configuration = configuration;
        _connectionString = _configuration.GetConnectionString("KiraKiraDB") ?? string.Empty;
    }

    private async Task<MySqlConnection?> OpenConnectionAsync()
    {
        if (string.IsNullOrWhiteSpace(_connectionString))
        {
            return null;
        }

        var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();
        return connection;
    }

    public async Task<LearnerDashboardDto> GetDashboardAsync(string learnerId)
    {
        var learnerRecord = await FetchLearnerAsync(learnerId);
        var profile = await FetchProfileDtoAsync(learnerId, learnerRecord);
        var mission = await FetchMissionDtoAsync(learnerId, profile);
        var streak = await FetchStreakDtoAsync(learnerId, profile);
        var moduleSnapshot = await BuildModuleSnapshotAsync(learnerId);
        var badges = await BuildBadgeStatsAsync(learnerId, profile, streak, moduleSnapshot);
        var highlightStats = BuildHighlightStats(streak, mission, moduleSnapshot);

        return new LearnerDashboardDto
        {
            Profile = profile,
            Mission = mission,
            Streak = streak,
            HighlightStats = highlightStats,
            Modules = moduleSnapshot,
            Badges = badges
        };
    }

    public async Task<LearnerProgressDto> GetProgressAsync(string learnerId)
    {
        var moduleSnapshot = await BuildModuleSnapshotAsync(learnerId);
        var topics = BuildTopicProgressList(moduleSnapshot);
        var checkpoints = await FetchCheckpointsAsync(learnerId);
        var overall = topics.Any() ? (int)Math.Round(topics.Average(topic => topic.Percent)) : 0;
        var motivation = BuildMotivation(overall);

        return new LearnerProgressDto
        {
            OverallPercent = overall,
            WeeklyDelta = 0,
            Topics = topics,
            Checkpoints = checkpoints,
            ReportUrl = "/reports/learner-progress.pdf",
            Motivation = motivation
        };
    }

    public async Task<LearnerClassesDto> GetClassesAsync(string learnerId)
    {
        var classInfo = await FetchLearnerClassInfoAsync(learnerId);
        var moduleSnapshot = await BuildModuleSnapshotAsync(learnerId);

        if (classInfo == null)
        {
            return new LearnerClassesDto
            {
                HasEnrollment = false,
                Catalogue = moduleSnapshot.Catalogue
            };
        }

        var announcements = await FetchClassAnnouncementsAsync(classInfo.Code);
        var topics = BuildTopicProgressList(moduleSnapshot, 3);

        var assignments = await FetchClassAssignmentsAsync(learnerId, classInfo.Code);
        var classModules = await FetchClassModulesAsync(classInfo.Code, moduleSnapshot.Catalogue);

        return new LearnerClassesDto
        {
            HasEnrollment = true,
            ClassInfo = classInfo,
            Announcements = announcements,
            OngoingTopics = topics,
            Assignments = assignments,
            ClassModules = classModules,
            Catalogue = moduleSnapshot.Catalogue
        };
    }

    public async Task<LearnerClassesDto> JoinClassAsync(string learnerId, string classCode)
    {
        if (string.IsNullOrWhiteSpace(classCode))
        {
            return await GetClassesAsync(learnerId);
        }

        await SaveLearnerClassAsync(learnerId, classCode.Trim());
        return await GetClassesAsync(learnerId);
    }

    public async Task<LearnerPastPapersDto> GetPastPapersAsync(string learnerId, string year, string type, string topic)
    {
        var papers = await FetchPastPapersFromDbAsync(learnerId, year, type, topic);
        var checklist = (await FetchCheckpointsAsync(learnerId))
            .Take(3)
            .Select(c => new ChecklistItemDto(c.Title, c.Note, c.Primary))
            .ToList();

        if (!checklist.Any())
        {
            checklist = SampleChecklist();
        }

        return new LearnerPastPapersDto
        {
            Papers = papers,
            Checklist = checklist,
            Tip = new TipDto
            {
                Title = "Streak tip",
                Badge = "After each paper",
                Body = "Snap a photo of one \"aha!\" solution and drop it into your learning journal - reflection boosts retention by 30%."
            }
        };
    }

    public async Task<StudyActivityResultDto> LogModuleQuizAsync(string learnerId, ModuleQuizLogRequest request)
    {
        var result = new StudyActivityResultDto
        {
            Source = "module-quiz",
            ActivityDate = NormalizeActivityDate(NormalizeTimestamp(request?.CompletedAt))
        };

        if (string.IsNullOrWhiteSpace(learnerId) || request == null)
        {
            result.Message = "Invalid request.";
            return result;
        }

        var moduleId = request.ModuleId?.Trim();
        var unitId = request.UnitId?.Trim();
        if (string.IsNullOrWhiteSpace(moduleId) || string.IsNullOrWhiteSpace(unitId))
        {
            result.Message = "moduleId and unitId are required.";
            return result;
        }

        var completedAt = NormalizeTimestamp(request.CompletedAt);
        result.ActivityDate = NormalizeActivityDate(completedAt);
        var xpAwarded = NormalizeXpAward(request.XpAwarded, DefaultModuleQuizXp);
        long logId = 0;

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                result.Message = "Database unavailable.";
                return result;
            }

            const string sql = @"INSERT INTO learner_module_quiz_log
                                 (uid, module_id, unit_id, score_percent, duration_seconds, completed_at, streak_applied)
                                 VALUES (@Uid, @ModuleId, @UnitId, @Score, @Duration, @CompletedAt, 0)";
            await using var command = new MySqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Uid", learnerId);
            command.Parameters.AddWithValue("@ModuleId", Truncate(moduleId, 64));
            command.Parameters.AddWithValue("@UnitId", Truncate(unitId, 64));
            command.Parameters.AddWithValue("@Score", request.ScorePercent.HasValue ? request.ScorePercent.Value : (object)DBNull.Value);
            command.Parameters.AddWithValue("@Duration", request.DurationSeconds.HasValue ? request.DurationSeconds.Value : (object)DBNull.Value);
            command.Parameters.AddWithValue("@CompletedAt", completedAt);
            await command.ExecuteNonQueryAsync();
            logId = command.LastInsertedId;
            result.Logged = true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to log module quiz for {learnerId}: {ex.Message}");
            result.Message = "Unable to log quiz completion.";
            return result;
        }

        var streakChange = await ApplyStudyActivityAsync(learnerId, completedAt, "module-quiz", xpAwarded);
        result.StreakUpdated = streakChange.Counted;
        result.ActivityDate = streakChange.ActivityDate;
        result.Message = streakChange.Message;

        if (logId > 0)
        {
            await MarkModuleQuizLogAppliedAsync(logId);
        }

        result.Streak = await BuildStreakSnapshotAsync(learnerId);
        return result;
    }

    public async Task<StudyActivityResultDto> LogPastPaperAsync(string learnerId, PastPaperLogRequest request)
    {
        var result = new StudyActivityResultDto
        {
            Source = "pastpaper-log",
            ActivityDate = NormalizeActivityDate(NormalizeTimestamp(request?.LoggedAt))
        };

        if (string.IsNullOrWhiteSpace(learnerId) || request == null)
        {
            result.Message = "Invalid request.";
            return result;
        }

        var title = string.IsNullOrWhiteSpace(request.PaperTitle) ? "Past paper session" : request.PaperTitle.Trim();
        var slug = BuildPaperSlug(request.PaperSlug, title);
        var loggedAt = NormalizeTimestamp(request.LoggedAt);
        result.ActivityDate = NormalizeActivityDate(loggedAt);
        var xpAwarded = NormalizeXpAward(request.XpAwarded, DefaultPastPaperXp);
        long logId = 0;

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                result.Message = "Database unavailable.";
                return result;
            }

            const string sql = @"INSERT INTO learner_pastpaper_log
                                 (uid, paper_slug, paper_title, mode, duration_minutes, score_percent, reflection, logged_at, streak_applied)
                                 VALUES (@Uid, @Slug, @Title, @Mode, @Duration, @Score, @Reflection, @LoggedAt, 0)";
            await using var command = new MySqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Uid", learnerId);
            command.Parameters.AddWithValue("@Slug", Truncate(slug, 128));
            command.Parameters.AddWithValue("@Title", Truncate(title, 255));
            command.Parameters.AddWithValue("@Mode", Truncate(string.IsNullOrWhiteSpace(request.Mode) ? "timed" : request.Mode.Trim(), 32));
            command.Parameters.AddWithValue("@Duration", Math.Max(0, request.DurationMinutes));
            command.Parameters.AddWithValue("@Score", request.ScorePercent.HasValue ? request.ScorePercent.Value : (object)DBNull.Value);
            command.Parameters.AddWithValue("@Reflection", string.IsNullOrWhiteSpace(request.Reflection) ? (object)DBNull.Value : Truncate(request.Reflection.Trim(), 2000));
            command.Parameters.AddWithValue("@LoggedAt", loggedAt);
            await command.ExecuteNonQueryAsync();
            logId = command.LastInsertedId;
            result.Logged = true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to log past paper for {learnerId}: {ex.Message}");
            result.Message = "Unable to log past paper session.";
            return result;
        }

        var streakChange = await ApplyStudyActivityAsync(learnerId, loggedAt, "pastpaper-log", xpAwarded);
        result.StreakUpdated = streakChange.Counted;
        result.ActivityDate = streakChange.ActivityDate;
        result.Message = streakChange.Message;

        if (logId > 0)
        {
            await MarkPastPaperLogAppliedAsync(logId);
        }

        result.Streak = await BuildStreakSnapshotAsync(learnerId);
        return result;
    }

    public async Task<ModuleSelectionResponse> AddModuleSelectionAsync(string learnerId, ModuleSelectionRequest request)
    {
        var response = new ModuleSelectionResponse
        {
            ModuleId = request?.ModuleId ?? string.Empty,
            Success = false
        };

        if (string.IsNullOrWhiteSpace(learnerId))
        {
            response.Message = "Learner is required.";
            return response;
        }

        var normalizedModuleId = NormalizeModuleKey(request?.ModuleId);
        if (string.IsNullOrWhiteSpace(normalizedModuleId))
        {
            response.Message = "moduleId is required.";
            return response;
        }

        var catalogue = SampleModules().ToList();
        var lookup = BuildModuleLookup(catalogue, out _);
        if (!lookup.TryGetValue(normalizedModuleId, out var module))
        {
            response.Message = "Module not found.";
            return response;
        }

        var saved = await SaveModuleSelectionAsync(learnerId, module.ModuleId);
        if (!saved)
        {
            response.Message = "Unable to save module selection.";
            return response;
        }

        var snapshot = await BuildModuleSnapshotAsync(learnerId);
        response.Success = true;
        response.ModuleId = module.ModuleId;
        response.ActiveModules = snapshot.ActiveModules;
        return response;
    }

    public async Task<ModuleSelectionResponse> RemoveModuleSelectionAsync(string learnerId, string moduleId)
    {
        var response = new ModuleSelectionResponse
        {
            ModuleId = moduleId ?? string.Empty,
            Success = false
        };

        if (string.IsNullOrWhiteSpace(learnerId))
        {
            response.Message = "Learner is required.";
            return response;
        }

        var normalizedModuleId = NormalizeModuleKey(moduleId);
        if (string.IsNullOrWhiteSpace(normalizedModuleId))
        {
            response.Message = "moduleId is required.";
            return response;
        }

        var removed = await DeleteModuleSelectionAsync(learnerId, normalizedModuleId);
        if (!removed)
        {
            response.Message = "Unable to remove module selection.";
            return response;
        }

        var snapshot = await BuildModuleSnapshotAsync(learnerId);
        response.Success = true;
        response.ActiveModules = snapshot.ActiveModules;
        response.ModuleId = normalizedModuleId;
        return response;
    }

    public async Task<ModuleProgressResponse> LogModuleProgressAsync(string learnerId, ModuleProgressLogRequest request)
    {
        var response = new ModuleProgressResponse
        {
            ModuleId = request?.ModuleId ?? string.Empty,
            UnitId = request?.UnitId ?? string.Empty,
            Status = request?.Status ?? "completed",
            Success = false
        };

        if (string.IsNullOrWhiteSpace(learnerId))
        {
            response.Message = "Learner is required.";
            return response;
        }

        var normalizedModuleId = NormalizeModuleKey(request?.ModuleId);
        var normalizedUnitId = NormalizeModuleKey(request?.UnitId);
        if (string.IsNullOrWhiteSpace(normalizedModuleId) || string.IsNullOrWhiteSpace(normalizedUnitId))
        {
            response.Message = "moduleId and unitId are required.";
            return response;
        }

        var catalogue = SampleModules().ToList();
        var lookup = BuildModuleLookup(catalogue, out _);
        if (!lookup.TryGetValue(normalizedModuleId, out var module))
        {
            response.Message = "Module not found.";
            return response;
        }

        var unitExists = module.Units.Any(unit =>
            NormalizeModuleKey(unit.UnitId) == normalizedUnitId ||
            NormalizeModuleKey(unit.UnitId) == request?.UnitId?.Trim().ToLowerInvariant());
        if (!unitExists)
        {
            response.Message = "Unit not found in module.";
            return response;
        }

        var normalizedStatus = string.IsNullOrWhiteSpace(request?.Status)
            ? "completed"
            : request.Status.Trim().ToLowerInvariant();
        var priorState = await FetchUnitProgressAsync(learnerId, normalizedModuleId, normalizedUnitId);

        var saved = await UpsertTopicProgressAsync(
            learnerId,
            normalizedModuleId,
            normalizedUnitId,
            normalizedStatus,
            request?.ScorePercent,
            request?.DurationSeconds);
        if (!saved)
        {
            response.Message = "Unable to log progress.";
            return response;
        }

        var snapshot = await BuildModuleSnapshotAsync(learnerId);
        response.Success = true;
        response.ActiveModules = snapshot.ActiveModules;
        response.ModuleId = normalizedModuleId;
        response.UnitId = normalizedUnitId;
        response.Status = normalizedStatus;

        var newlyCompleted = string.Equals(normalizedStatus, "completed", StringComparison.OrdinalIgnoreCase) &&
            (priorState == null || !string.Equals(priorState.Status, "completed", StringComparison.OrdinalIgnoreCase));

        if (newlyCompleted)
        {
            var xpSnapshot = await ApplyXpAwardAsync(learnerId, XpPerUnitCompletion);
            if (xpSnapshot != null)
            {
                await UpdateLearnerXpToNextLevelAsync(learnerId, xpSnapshot.XpToNextLevel);
                response.XpSnapshot = xpSnapshot;
                response.Streak = await BuildStreakSnapshotAsync(learnerId);
            }
        }

        return response;
    }

    public async Task<LiveProgressSnapshotDto> GetLiveProgressSnapshotAsync()
    {
        var snapshot = new LiveProgressSnapshotDto
        {
            AccuracyWindowLabel = "Last 7 days",
            AssignmentsWindowLabel = "All time",
            StreakWindowLabel = "This week"
        };

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return snapshot;
            }

            const string streakSql = @"SELECT
                                            COALESCE(AVG(current_streak), 0) AS avg_streak,
                                            SUM(CASE WHEN last_activity_on >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) AS active_learners
                                       FROM learner_streak";

            await using (var streakCommand = new MySqlCommand(streakSql, connection))
            await using (var streakReader = await streakCommand.ExecuteReaderAsync())
            {
                if (await streakReader.ReadAsync())
                {
                    snapshot.AverageStreakDays = SafeToDouble(streakReader["avg_streak"], snapshot.AverageStreakDays);
                    snapshot.ActiveLearnerCount = SafeToInt(streakReader["active_learners"], snapshot.ActiveLearnerCount);
                }
            }

            const string accuracySql = @"SELECT
                                            COALESCE(AVG(score_percent), 0) AS avg_score,
                                            COUNT(*) AS attempts
                                         FROM learner_module_quiz_log
                                         WHERE module_id LIKE 'form5-%'
                                           AND completed_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 7 DAY)";

            await using (var accuracyCommand = new MySqlCommand(accuracySql, connection))
            await using (var accuracyReader = await accuracyCommand.ExecuteReaderAsync())
            {
                if (await accuracyReader.ReadAsync())
                {
                    snapshot.Form5AccuracyPercent = SafeToDouble(accuracyReader["avg_score"], snapshot.Form5AccuracyPercent);
                    snapshot.Form5AttemptCount = SafeToInt(accuracyReader["attempts"], snapshot.Form5AttemptCount);
                }
            }

            const string assignmentsSql = @"SELECT
                                                SUM(CASE WHEN completion_percent >= 100 THEN 1 ELSE 0 END) AS completed
                                            FROM learner_assignments";

            await using (var assignmentsCommand = new MySqlCommand(assignmentsSql, connection))
            await using (var assignmentsReader = await assignmentsCommand.ExecuteReaderAsync())
            {
                if (await assignmentsReader.ReadAsync())
                {
                    snapshot.AssignmentsCompleted = SafeToInt(assignmentsReader["completed"], snapshot.AssignmentsCompleted);
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to build live progress snapshot: {ex.Message}");
        }

        return snapshot;
    }

    public async Task<LearnerProfilePayload> GetProfileAsync(string learnerId)
    {
        var record = await FetchLearnerAsync(learnerId);
        var profile = await FetchProfileDtoAsync(learnerId, record);
        var streak = await FetchStreakDtoAsync(learnerId, profile);
        var notifications = await FetchNotificationPreferencesAsync(learnerId);
        var badges = await BuildBadgeStatsAsync(learnerId, profile, streak);
        var mission = await FetchMissionDtoAsync(learnerId, profile);

        return new LearnerProfilePayload
        {
            Profile = profile,
            Contact = new ContactInfoDto
            {
                Email = record?.Email ?? string.Empty
            },
            School = new SchoolInfoDto
            {
                School = string.IsNullOrWhiteSpace(profile.School) ? "School not set" : profile.School,
                Year = string.IsNullOrWhiteSpace(profile.GradeYear) ? "Year not set" : profile.GradeYear
            },
            Notifications = notifications,
            Badges = badges,
            Mission = mission
        };
    }

    public async Task<LearnerProfileDto> UpdateAvatarAsync(string learnerId, string avatarUrl)
    {
        var normalized = NormalizeAvatarPath(avatarUrl);
        await SaveAvatarAsync(learnerId, normalized);
        var record = await FetchLearnerAsync(learnerId);
        var profile = await FetchProfileDtoAsync(learnerId, record);
        profile.AvatarUrl = normalized;
        return profile;
    }

    public async Task<LearnerProfilePayload> UpdateProfileDetailsAsync(string learnerId, ProfileDetailsUpdateRequest request)
    {
        if (string.IsNullOrWhiteSpace(learnerId) || request == null)
        {
            return await GetProfileAsync(learnerId);
        }

        var record = await FetchLearnerAsync(learnerId);
        var profile = await FetchProfileDtoAsync(learnerId, record);

        var updatedName = CoalesceProfileValue(request.Name, profile.Name);
        var updatedSchool = CoalesceProfileValue(request.School, profile.School);
        var updatedYear = CoalesceProfileValue(request.Year, profile.GradeYear);
        var updatedMotto = CoalesceProfileValue(request.Motto, profile.Motto);

        await SaveProfileFieldsAsync(learnerId, updatedName, updatedSchool, updatedYear, updatedMotto);
        await UpdateLearnerAccountAsync(learnerId, request.Name, request.Email);

        return await GetProfileAsync(learnerId);
    }

    public async Task<LearnerMissionDto> SaveMissionPreferencesAsync(string learnerId, LearnerMissionUpdateRequest request)
    {
        request ??= new LearnerMissionUpdateRequest();
        var grade = string.IsNullOrWhiteSpace(request.Grade) ? "Form 4" : request.Grade.Trim();
        var readiness = Math.Max(0, Math.Min(100, request.Readiness));
        var wantsVideos = request.WantsVideos;
        var copy = DescribeMissionByReadiness(readiness);

        if (string.IsNullOrWhiteSpace(learnerId))
        {
            return BuildMissionDto(grade, readiness, wantsVideos, copy);
        }

        var saved = false;
        const string sql = @"INSERT INTO learner_mission (uid, grade, readiness_percent, target_focus, wants_videos, mission_title, mission_mood, mission_mode)
                             VALUES (@Uid, @Grade, @Readiness, @Focus, @WantsVideos, @Title, @Mood, @Mode)
                             ON DUPLICATE KEY UPDATE grade = @Grade, readiness_percent = @Readiness, target_focus = @Focus, wants_videos = @WantsVideos, mission_title = @Title, mission_mood = @Mood, mission_mode = @Mode";

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection != null)
            {
                await using var command = new MySqlCommand(sql, connection);
                command.Parameters.AddWithValue("@Uid", learnerId);
                command.Parameters.AddWithValue("@Grade", grade);
                command.Parameters.AddWithValue("@Readiness", readiness);
                command.Parameters.AddWithValue("@Focus", copy.Focus);
                command.Parameters.AddWithValue("@WantsVideos", wantsVideos);
                command.Parameters.AddWithValue("@Title", copy.Title);
                command.Parameters.AddWithValue("@Mood", copy.Mood);
                command.Parameters.AddWithValue("@Mode", copy.Mode);
                Console.WriteLine($"[LearnerService] Saving mission: readiness={readiness}, grade={grade}");
                await command.ExecuteNonQueryAsync();
                saved = true;
                Console.WriteLine($"[LearnerService] Mission saved successfully for {learnerId}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to save learner_mission for {learnerId}: {ex.Message}");
        }

        if (!saved)
        {
            return BuildMissionDto(grade, readiness, wantsVideos, copy);
        }

        var record = await FetchLearnerAsync(learnerId);
        var profile = await FetchProfileDtoAsync(learnerId, record);
        return await FetchMissionDtoAsync(learnerId, profile);
    }

    public async Task<LearnerFeaturedBadgeDto> SaveFeaturedBadgeAsync(string learnerId, LearnerFeaturedBadgeRequest request)
    {
        if (string.IsNullOrWhiteSpace(learnerId) || request == null)
        {
            return new LearnerFeaturedBadgeDto();
        }

        var badgeId = (request.BadgeId ?? string.Empty).Trim();
        var label = string.IsNullOrWhiteSpace(request.Label) ? string.Empty : request.Label.Trim();
        var style = string.IsNullOrWhiteSpace(request.Style) ? "level" : request.Style.Trim();

        const string sql = @"INSERT INTO learner_profile (uid, featured_badge_id, featured_badge_label, featured_badge_style)
                             VALUES (@Uid, @BadgeId, @Label, @Style)
                             ON DUPLICATE KEY UPDATE featured_badge_id = @BadgeId, featured_badge_label = @Label, featured_badge_style = @Style";

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection != null)
            {
                await using var command = new MySqlCommand(sql, connection);
                command.Parameters.AddWithValue("@Uid", learnerId);
                command.Parameters.AddWithValue("@BadgeId", badgeId);
                command.Parameters.AddWithValue("@Label", label);
                command.Parameters.AddWithValue("@Style", style);
                await command.ExecuteNonQueryAsync();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to save featured badge for {learnerId}: {ex.Message}");
        }

        return new LearnerFeaturedBadgeDto
        {
            BadgeId = badgeId,
            Label = label,
            Style = style
        };
    }

    public async Task<CommunityFeedDto> GetCommunityThreadsAsync(string learnerId, CommunityThreadQuery query)
    {
        var normalized = query ?? new CommunityThreadQuery();
        normalized.Limit = normalized.Limit <= 0 ? 10 : Math.Min(25, normalized.Limit);
        normalized.Category = normalized.Category?.Trim() ?? string.Empty;
        normalized.Tag = normalized.Tag?.Trim() ?? string.Empty;
        normalized.Cursor = normalized.Cursor?.Trim() ?? string.Empty;

        var threads = await FetchCommunityThreadsAsync(normalized);
        var tags = await FetchCommunityTagsAsync();

        return new CommunityFeedDto
        {
            Threads = threads,
            TrendingTags = tags,
            NextCursor = threads.Count == normalized.Limit && threads.Any()
                ? threads.Last().ThreadId.ToString()
                : null,
            Filters = new CommunityThreadFiltersDto
            {
                AvailableCategories = new List<string> { "Form 4", "Form 5", "Study tips", "Motivation", "Help needed" },
                ActiveCategory = normalized.Category,
                ActiveTag = normalized.Tag
            }
        };
    }

    public async Task<CommunityThreadDto> CreateCommunityThreadAsync(string learnerId, CommunityThreadCreateRequest request)
    {
        if (string.IsNullOrWhiteSpace(learnerId) || request == null)
        {
            return new CommunityThreadDto();
        }

        var topic = string.IsNullOrWhiteSpace(request.Topic) ? "Untitled conversation" : request.Topic.Trim();
        var body = string.IsNullOrWhiteSpace(request.Message) ? string.Empty : request.Message.Trim();
        var category = string.IsNullOrWhiteSpace(request.Category) ? "General" : request.Category.Trim();
        var formLevel = string.IsNullOrWhiteSpace(request.FormLevel) ? category : request.FormLevel.Trim();
        var tag = NormalizeTag(request.Tag);

        const string insertSql = @"INSERT INTO community_threads
                                      (uid, title, body, category, form_level, primary_tag, reply_count, last_reply_at, created_at)
                                   VALUES
                                      (@Uid, @Title, @Body, @Category, @FormLevel, @Tag, 0, NOW(), NOW())";

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return BuildSampleThread(topic, body, category, tag);
            }

            await using var command = new MySqlCommand(insertSql, connection);
            command.Parameters.AddWithValue("@Uid", learnerId);
            command.Parameters.AddWithValue("@Title", topic);
            command.Parameters.AddWithValue("@Body", body);
            command.Parameters.AddWithValue("@Category", category);
            command.Parameters.AddWithValue("@FormLevel", formLevel);
            command.Parameters.AddWithValue("@Tag", tag);

            await command.ExecuteNonQueryAsync();
            var threadId = command.LastInsertedId;
            if (threadId <= 0)
            {
                return BuildSampleThread(topic, body, category, tag);
            }

            var thread = await FetchCommunityThreadByIdAsync((long)threadId);
            return thread ?? BuildSampleThread(topic, body, category, tag);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to create community thread for {learnerId}: {ex.Message}");
            return BuildSampleThread(topic, body, category, tag);
        }
    }

    public async Task<CommunityReplyDto> CreateCommunityReplyAsync(string learnerId, long threadId, CommunityReplyCreateRequest request)
    {
        if (string.IsNullOrWhiteSpace(learnerId) || request == null || threadId <= 0)
        {
            return new CommunityReplyDto();
        }

        var message = request.Message?.Trim();
        if (string.IsNullOrWhiteSpace(message))
        {
            return new CommunityReplyDto();
        }

        const string insertSql = @"INSERT INTO community_replies(thread_id, uid, body, created_at)
                                   VALUES (@ThreadId, @Uid, @Body, NOW())";
        const string updateSql = @"UPDATE community_threads
                                   SET reply_count = reply_count + 1,
                                       last_reply_at = NOW()
                                   WHERE thread_id = @ThreadId";

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return BuildSampleReply(message);
            }

            await using MySqlTransaction transaction = await connection.BeginTransactionAsync();
            try
            {
                await using (var insertCommand = new MySqlCommand(insertSql, connection, transaction))
                {
                    insertCommand.Parameters.AddWithValue("@ThreadId", threadId);
                    insertCommand.Parameters.AddWithValue("@Uid", learnerId);
                    insertCommand.Parameters.AddWithValue("@Body", message);
                    await insertCommand.ExecuteNonQueryAsync();
                    var replyId = insertCommand.LastInsertedId;

                    await using var updateCommand = new MySqlCommand(updateSql, connection, transaction);
                    updateCommand.Parameters.AddWithValue("@ThreadId", threadId);
                    await updateCommand.ExecuteNonQueryAsync();

                    await transaction.CommitAsync();

                    var reply = await FetchCommunityReplyByIdAsync((long)replyId);
                    return reply ?? BuildSampleReply(message);
                }
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to create community reply for {learnerId} thread {threadId}: {ex.Message}");
            return BuildSampleReply(message);
        }
    }

    public async Task<CommunityThreadDetailDto> GetCommunityThreadDetailAsync(string learnerId, long threadId, CommunityThreadDetailQuery query)
    {
        var normalized = query ?? new CommunityThreadDetailQuery();
        normalized.Limit = normalized.Limit <= 0 ? 10 : Math.Min(50, normalized.Limit);
        normalized.Cursor = normalized.Cursor?.Trim() ?? string.Empty;

        if (threadId <= 0)
        {
            return new CommunityThreadDetailDto
            {
                Thread = BuildSampleThread("Thread unavailable", "We could not find that conversation.", "Community", "general")
            };
        }

        var thread = await FetchCommunityThreadByIdAsync(threadId) ??
            BuildSampleThread("Thread unavailable", "We could not find that conversation.", "Community", "general");

        var replies = await FetchCommunityRepliesAsync(threadId, normalized);

        return new CommunityThreadDetailDto
        {
            Thread = thread,
            Replies = replies,
            NextCursor = replies.Count == normalized.Limit && replies.Any()
                ? replies.Last().ReplyId.ToString()
                : null
        };
    }

    public async Task<CommunityProfileCardDto> GetCommunityProfileCardAsync(string targetLearnerId)
    {
        if (string.IsNullOrWhiteSpace(targetLearnerId))
        {
            return BuildFallbackCommunityProfileCard();
        }

        try
        {
            var record = await FetchLearnerAsync(targetLearnerId);
            var profile = await FetchProfileDtoAsync(targetLearnerId, record);
            var streak = await FetchStreakDtoAsync(targetLearnerId, profile);
            var badges = await BuildBadgeStatsAsync(targetLearnerId, profile, streak);
            var featuredBadge = profile.FeaturedBadge ?? SelectFeaturedBadgeChip(badges);

            return new CommunityProfileCardDto
            {
                LearnerId = targetLearnerId,
                Name = profile.Name,
                AvatarUrl = profile.AvatarUrl,
                Motto = string.IsNullOrWhiteSpace(profile.Motto) ? "Learning maths" : profile.Motto,
                Level = profile.Level,
                Xp = profile.Xp,
                Rank = "Learner",
                StreakDays = streak?.Current ?? 0,
                FeaturedBadge = featuredBadge
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to load community profile card for {targetLearnerId}: {ex.Message}");
            return BuildFallbackCommunityProfileCard();
        }
    }

    private static CommunityProfileCardDto BuildFallbackCommunityProfileCard()
    {
        return new CommunityProfileCardDto
        {
            LearnerId = string.Empty,
            Name = "Learner",
            AvatarUrl = DefaultAvatar,
            Motto = "Learning maths",
            Level = 1,
            Xp = 0,
            Rank = "Learner",
            StreakDays = 0,
            FeaturedBadge = new BadgeChipDto
            {
                Id = "level-1",
                Label = "Catthew",
                Style = "level"
            }
        };
    }

    private static BadgeChipDto? SelectFeaturedBadgeChip(LearnerBadgeStatsDto? stats)
    {
        if (stats?.Collections == null || stats.Stats == null)
        {
            return null;
        }

        foreach (var collection in stats.Collections)
        {
            if (collection?.Rewards == null || string.IsNullOrWhiteSpace(collection.Metric))
            {
                continue;
            }

            var metricKey = collection.Metric;
            stats.Stats.TryGetValue(metricKey, out var metricValue);
            var unlocked = collection.Rewards
                .Where(reward => reward != null && metricValue >= reward.Value)
                .OrderByDescending(reward => reward.Value)
                .FirstOrDefault();

            if (unlocked != null)
            {
                return new BadgeChipDto
                {
                    Id = $"{(collection.Id ?? collection.Metric)}-{unlocked.Value}",
                    Label = string.IsNullOrWhiteSpace(unlocked.Label) ? "Unlocked badge" : unlocked.Label,
                    Style = string.IsNullOrWhiteSpace(collection.Style) ? "level" : collection.Style
                };
            }
        }

        return null;
    }

    private static LearnerBadgeStatsDto SampleBadgeStats()
    {
        return new LearnerBadgeStatsDto
        {
            Stats = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase)
            {
                { "level", 0 },
                { "streak", 0 },
                { "consistency", 0 },
                { "moduleMastery", 0 },
                { "paperWarrior", 0 }
            },
            Collections = BadgeLibrary()
        };
    }

    private static IEnumerable<BadgeCollectionDto> BadgeLibrary()
    {
        return new List<BadgeCollectionDto>
        {
            new BadgeCollectionDto
            {
                Id = "level",
                Title = "Level-Up Cats",
                Description = "Earn new familiars as you level up.",
                Metric = "level",
                Style = "level",
                Rewards = new List<BadgeRewardDto>
                {
                    new BadgeRewardDto(1, "Catthew", "../images/level/bronze.png"),
                    new BadgeRewardDto(3, "Catrick", "../images/level/silver.png"),
                    new BadgeRewardDto(5, "Reginald", "../images/level/gold.png"),
                    new BadgeRewardDto(8, "Stinkbert da dookie man", "../images/level/rainbow.png")
                }
            },
            new BadgeCollectionDto
            {
                Id = "module-mastery",
                Title = "Module Mastery",
                Description = "Complete full modules to adopt new meme cats.",
                Metric = "moduleMastery",
                Style = "module",
                Rewards = new List<BadgeRewardDto>
                {
                    new BadgeRewardDto(1, "DESPAIRRRR", "../images/module-mastery/DESPAIRRRRR.png")
                    {
                        Hint = "Complete one module with 95% progress.",
                        Requirement = "1 completed module"
                    },
                    new BadgeRewardDto(3, "Nyum", "../images/module-mastery/Nyum.png")
                    {
                        Hint = "Keep momentum by finishing three modules.",
                        Requirement = "3 completed modules"
                    },
                    new BadgeRewardDto(6, "Butter", "../images/module-mastery/Butter.png")
                    {
                        Hint = "Six full modules unlock gold fur.",
                        Requirement = "6 completed modules"
                    },
                    new BadgeRewardDto(8, "EEEEEEE", "../images/module-mastery/EEEEEEE.png")
                    {
                        Hint = "Master almost every topic to meet the rare cat.",
                        Requirement = "8 completed modules"
                    }
                }
            },
            new BadgeCollectionDto
            {
                Id = "paper-warrior",
                Title = "Paper Warrior",
                Description = "Log timed papers and grow your staff collection.",
                Metric = "paperWarrior",
                Style = "paper",
                Rewards = new List<BadgeRewardDto>
                {
                    new BadgeRewardDto(1, "Wooden Stick", "../images/paper-wizard/Wooden stick.png")
                    {
                        Requirement = "1 logged past-paper",
                        Hint = "Log your first paper."
                    },
                    new BadgeRewardDto(3, "Wooden Staff", "../images/paper-wizard/Wooden staff.png")
                    {
                        Requirement = "3 logged papers",
                        Hint = "Keep practicing to upgrade your gear."
                    },
                    new BadgeRewardDto(5, "Silver Staff", "../images/paper-wizard/Silver staff.png")
                    {
                        Requirement = "5 logged papers",
                        Hint = "Silver arrives after five serious sessions."
                    },
                    new BadgeRewardDto(8, "Enchanted Staff", "../images/paper-wizard/Enchanted staff.png")
                    {
                        Requirement = "8 logged papers",
                        Hint = "Stay consistent to charge the staff."
                    },
                    new BadgeRewardDto(12, "Golden Staff", "../images/paper-wizard/Golden staff.png")
                    {
                        Requirement = "12 logged papers",
                        Hint = "A dozen papers forge the golden staff."
                    }
                }
            },
            new BadgeCollectionDto
            {
                Id = "consistency",
                Title = "Consistency Sparks",
                Description = "Keep the flame alive with consecutive study days.",
                Metric = "consistency",
                Style = "streak",
                Rewards = new List<BadgeRewardDto>
                {
                    new BadgeRewardDto(0, "Dormant Seed", "../images/streak/0.png")
                    {
                        Requirement = "0 day streak"
                    },
                    new BadgeRewardDto(3, "Day 1 Sprout", "../images/streak/1.png")
                    {
                        Requirement = "3 day streak"
                    },
                    new BadgeRewardDto(7, "Day 3 Leaves", "../images/streak/2.png")
                    {
                        Requirement = "7 day streak"
                    },
                    new BadgeRewardDto(14, "Full Bloom", "../images/streak/3.png")
                    {
                        Requirement = "14 day streak"
                    },
                    new BadgeRewardDto(30, "Radiant Torch", "../images/streak/4.png")
                    {
                        Requirement = "30 day streak"
                    },
                    new BadgeRewardDto(60, "Blazing Trail", "../images/streak/5.png")
                    {
                        Requirement = "60 day streak"
                    },
                    new BadgeRewardDto(90, "Everlight Bloom", "../images/streak/6.png")
                    {
                        Requirement = "90 day streak"
                    },
                    new BadgeRewardDto(100, "Centennial Flame", "../images/streak/7.png")
                    {
                        Requirement = "100 day streak"
                    }
                }
            }
        };
    }

    private static IEnumerable<ModuleCatalogueSectionDto> SampleModules()
    {
        return new List<ModuleCatalogueSectionDto>
        {
            new ModuleCatalogueSectionDto
            {
                Grade = "Form 4",
                Title = "Form 4 Mathematics (KSSM)",
                Description = "Core concepts that prepare you for the final SPM push in Form 5.",
                Modules = new List<ModuleCardDto>
                {
                    new ModuleCardDto("01", "Quadratic Functions and Equations in One Variable", new List<string> { "Quadratic Functions", "Quadratic Equations" }, "course-map.html?module=form4-01", 100)
                    {
                        ModuleId = "form4-01",
                        Units = BuildQuadraticUnits()
                    },
                    new ModuleCardDto("02", "Number Bases", new List<string> { "Number Bases" }, "course-map.html?module=form4-02", 0)
                    {
                        ModuleId = "form4-02",
                        Units = BuildNumberBasesUnits()
                    },
                    new ModuleCardDto("03", "Logical Reasoning", new List<string> { "Statements", "Arguments" }, "course-map.html?module=form4-03", 0)
                    {
                        ModuleId = "form4-03"
                    },
                    new ModuleCardDto("04", "Operations on Sets", new List<string> { "Intersection of Sets", "Union of Sets", "Combined Operations on Sets" }, "course-map.html?module=form4-04")
                    {
                        ModuleId = "form4-04"
                    },
                    new ModuleCardDto("05", "Network in Graph Theory", new List<string> { "Network" }, "course-map.html?module=form4-05")
                    {
                        ModuleId = "form4-05"
                    }
                }
            },
            new ModuleCatalogueSectionDto
            {
                Grade = "Form 5",
                Title = "Form 5 Mathematics (KSSM)",
                Description = "Exam-focused topics that complete the SPM Modern Math syllabus.",
                Modules = new List<ModuleCardDto>
                {
                    new ModuleCardDto("01", "Variation", new List<string> { "Direct Variation", "Inverse Variation", "Joint Variation" })
                    {
                        ModuleId = "form5-01",
                        Link = "course-map.html?module=form5-01"
                    },
                    new ModuleCardDto("02", "Matrices", new List<string> { "Matrices", "Basic Operations on Matrices" })
                    {
                        ModuleId = "form5-02",
                        Link = "course-map.html?module=form5-02"
                    },
                    new ModuleCardDto("03", "Consumer Mathematics: Insurance", new List<string> { "Risk and Insurance Protection" })
                    {
                        ModuleId = "form5-03"
                    },
                    new ModuleCardDto("04", "Consumer Mathematics: Taxation", new List<string> { "Taxation" })
                    {
                        ModuleId = "form5-04"
                    }
                }
            }
        };
    }

    private static List<ModuleUnitDto> BuildQuadraticUnits()
    {
        return new List<ModuleUnitDto>
        {
            new ModuleUnitDto
            {
                UnitId = "overview",
                Title = "Module overview",
                Type = "overview",
                Duration = "3 min",
                Summary = "Scope out the skills, files, and XP tied to this module before you dive in.",
                Body = "This roadmap shows you where each concept sits - from intuition and graph sense to the algebraic moves tested on SPM.",
                Objectives = new List<string>
                {
                    "See how standard, vertex, and factored form connect",
                    "Know which drills unlock XP and streak protection",
                    "Prep your workspace with the same sheet coaches use"
                },
                Resources = new List<ModuleUnitResourceDto>
                {
                    new ModuleUnitResourceDto
                    {
                        Label = "Module planner",
                        Type = "guide",
                        Detail = "Print-ready, 2 pages",
                        Url = "../docs/module01-planner.pdf"
                    }
                },
                Cta = new ModuleUnitCtaDto
                {
                    Label = "Download planner",
                    Link = "../docs/module01-planner.pdf",
                    Kind = "download"
                }
            },
            new ModuleUnitDto
            {
                UnitId = "rescue-intro",
                Title = "Rescue video: Quadratic intuition",
                Type = "video",
                Duration = "4 min",
                Summary = "Need a slower start? Watch this primer on how parabolas move when a, h, or k change.",
                Body = "We walk through the vertex form, label every parameter, and show how to sketch without a calculator.",
                Objectives = new List<string>
                {
                    "Spot vertex, axis of symmetry, and opening direction quickly",
                    "Link transformations to a real graph"
                },
                Cta = new ModuleUnitCtaDto
                {
                    Label = "Play rescue video",
                    Link = "https://www.youtube.com/watch?v=bgM8F1J-rescue",
                    Kind = "video"
                },
                RescueOnly = true
            },
            new ModuleUnitDto
            {
                UnitId = "lesson-vertex-sense",
                Title = "Lesson 1 · Sketch from vertex form",
                Type = "lesson",
                Duration = "5 min",
                Summary = "Build fast graph intuition from vertex form with a slider-based playground.",
                Body = "Tweak a, h, and k to trace how the vertex and opening change. Log one observation per slider move.",
                Objectives = new List<string>
                {
                    "Describe how each parameter shifts or stretches the graph",
                    "Predict root count without solving"
                }
            },
            new ModuleUnitDto
            {
                UnitId = "quiz-vertex-sense",
                Title = "Quick check · Graph sense",
                Type = "quiz",
                Duration = "3 min",
                Summary = "Match three vertex-form equations to their graphs.",
                Body = "You have 90 seconds per prompt. Focus on identifying vertex + opening direction.",
                Cta = new ModuleUnitCtaDto
                {
                    Label = "Start quiz",
                    Link = "../docs/module01-quiz-vertex.html",
                    Kind = "quiz"
                }
            },
            new ModuleUnitDto
            {
                UnitId = "lesson-form-switch",
                Title = "Lesson 2 · Switch between forms",
                Type = "lesson",
                Duration = "6 min",
                Summary = "Convert standard form to vertex/factored form in bite-sized steps.",
                Body = "Complete the square on a guided worksheet, then factor friendly quadratics to spot roots.",
                Objectives = new List<string>
                {
                    "Complete the square without losing constant terms",
                    "Explain when factoring beats the square method"
                }
            },
            new ModuleUnitDto
            {
                UnitId = "quiz-form-switch",
                Title = "Quick check · Form shuffle",
                Type = "quiz",
                Duration = "4 min",
                Summary = "Two conversions with instant feedback and hints if you get stuck.",
                Body = "Convert the given standard form to vertex form, then to factored form.",
                Cta = new ModuleUnitCtaDto
                {
                    Label = "Try shuffle quiz",
                    Link = "../docs/module01-quiz-forms.html",
                    Kind = "quiz"
                }
            },
            new ModuleUnitDto
            {
                UnitId = "lesson-solving-paths",
                Title = "Lesson 3 · Choose the solving path",
                Type = "lesson",
                Duration = "6 min",
                Summary = "Classify quadratics and lock in the fastest solving method.",
                Body = "Sort cards into 'factor', 'complete square', or 'quadratic formula' buckets and justify each choice.",
                Objectives = new List<string>
                {
                    "Classify quadratics by structure",
                    "State a reason behind each solving choice"
                }
            },
            new ModuleUnitDto
            {
                UnitId = "quiz-solving-paths",
                Title = "Quick check · Solve + explain",
                Type = "quiz",
                Duration = "4 min",
                Summary = "Solve two equations and type one-sentence reasoning after each answer.",
                Body = "Focus on communicating why your method worked, not just the final root.",
                Cta = new ModuleUnitCtaDto
                {
                    Label = "Take reasoning quiz",
                    Link = "../docs/module01-quiz-solve.html",
                    Kind = "quiz"
                }
            },
            new ModuleUnitDto
            {
                UnitId = "lesson-modelling",
                Title = "Lesson 4 · Model real situations",
                Type = "lesson",
                Duration = "5 min",
                Summary = "Translate revenue and projectile prompts into quadratics.",
                Body = "Use the modelling canvas: identify variables, write the quadratic, and interpret the vertex or roots.",
                Objectives = new List<string>
                {
                    "Build quadratic models from short scenarios",
                    "Interpret vertex/roots in context"
                }
            },
            new ModuleUnitDto
            {
                UnitId = "quiz-application",
                Title = "Quick check · Application",
                Type = "quiz",
                Duration = "4 min",
                Summary = "Two context problems that ask what the vertex or roots mean.",
                Body = "Explain whether your solutions fit the real-world restriction.",
                Cta = new ModuleUnitCtaDto
                {
                    Label = "Start context quiz",
                    Link = "../docs/module01-quiz-context.html",
                    Kind = "quiz"
                }
            },
            new ModuleUnitDto
            {
                UnitId = "final-test",
                Title = "Final mastery test",
                Type = "assessment",
                Duration = "10 min",
                Summary = "6-question timed drill mixing graphs, solving, and modelling.",
                Body = "Attempt under exam timing. Mark whether each question felt easy, medium, or panic.",
                Cta = new ModuleUnitCtaDto
                {
                    Label = "Begin timed test",
                    Link = "../docs/module01-mastery.pdf",
                    Kind = "quiz"
                }
            },
            new ModuleUnitDto
            {
                UnitId = "practice-bank",
                Title = "Practice question bank",
                Type = "practice",
                Duration = "15 min",
                Summary = "Extra questions sorted by skill so you can keep drilling weak spots.",
                Body = "Pick any row and attempt 4 questions. Log mistakes in your notebook.",
                Resources = new List<ModuleUnitResourceDto>
                {
                    new ModuleUnitResourceDto
                    {
                        Label = "Practice set",
                        Type = "sheet",
                        Detail = "18 questions + answers",
                        Url = "../docs/module01-practice.pdf"
                    }
                },
                Cta = new ModuleUnitCtaDto
                {
                    Label = "Open practice set",
                    Link = "../docs/module01-practice.pdf",
                    Kind = "download"
                }
            }
        };
    }

    private static List<ModuleUnitDto> BuildNumberBasesUnits()
    {
        return new List<ModuleUnitDto>
        {
            new ModuleUnitDto
            {
                UnitId = "nb-overview",
                Title = "Module overview",
                Type = "overview",
                Duration = "2 min",
                Summary = "See how base-10 links to binary, octal, and hexadecimal systems.",
                Objectives = new List<string>
                {
                    "Recall the place value idea behind every base",
                    "Spot where number bases show up in exam questions"
                }
            },
            new ModuleUnitDto
            {
                UnitId = "nb-place-values",
                Title = "Lesson 1 · Place values in any base",
                Type = "lesson",
                Duration = "5 min",
                Summary = "Expand numbers in base-2, base-5, and base-8 using positional notation.",
                Objectives = new List<string>
                {
                    "Write expanded form for a given base",
                    "Explain why base-2 only uses digits 0 and 1"
                }
            },
            new ModuleUnitDto
            {
                UnitId = "nb-convert-to10",
                Title = "Lesson 2 · Convert to base-10",
                Type = "lesson",
                Duration = "6 min",
                Summary = "Convert binary/octal/hex numbers to base-10 using expanded form.",
                Objectives = new List<string>
                {
                    "Translate any base up to 16 into base-10",
                    "Check answers quickly with a calculator-free method"
                }
            },
            new ModuleUnitDto
            {
                UnitId = "nb-convert-from10",
                Title = "Lesson 3 · Convert from base-10",
                Type = "lesson",
                Duration = "6 min",
                Summary = "Use repeated division (or subtraction) to move from base-10 to another base.",
                Objectives = new List<string>
                {
                    "Perform repeated division to reach binary",
                    "Write the digits in the correct order"
                }
            },
            new ModuleUnitDto
            {
                UnitId = "nb-arithmetic",
                Title = "Lesson 4 · Arithmetic across bases",
                Type = "lesson",
                Duration = "6 min",
                Summary = "Add and subtract numbers in base-2 and base-8 while tracking carries.",
                Objectives = new List<string>
                {
                    "Add binary numbers with carries",
                    "Explain why subtraction borrows look different in octal"
                }
            },
            new ModuleUnitDto
            {
                UnitId = "nb-quiz-core",
                Title = "Quick check · Core conversions",
                Type = "quiz",
                Duration = "4 min",
                Summary = "Convert between base-2/base-10/base-8 within a timer.",
                Cta = new ModuleUnitCtaDto
                {
                    Label = "Attempt conversion quiz",
                    Link = "../docs/module02-quiz-core.pdf",
                    Kind = "quiz"
                }
            },
            new ModuleUnitDto
            {
                UnitId = "nb-application",
                Title = "Lesson 5 · Application and code tables",
                Type = "lesson",
                Duration = "5 min",
                Summary = "Connect hexadecimal to RGB codes and simple ASCII representations.",
                Objectives = new List<string>
                {
                    "Map a hex value to RGB intensity",
                    "Explain why computers prefer base-2 and base-16"
                }
            },
            new ModuleUnitDto
            {
                UnitId = "nb-master-check",
                Title = "Mastery check",
                Type = "assessment",
                Duration = "8 min",
                Summary = "Six mixed conversions and two application prompts to seal the module.",
                Cta = new ModuleUnitCtaDto
                {
                    Label = "Take mastery check",
                    Link = "../docs/module02-mastery.pdf",
                    Kind = "quiz"
                }
            }
        };
    }

    private static List<PastPaperDto> SamplePastPapers()
    {
        return new List<PastPaperDto>
        {
            new PastPaperDto("SPM Mathematics 2023 Paper 2", "Structured · 45 marks · Moderate difficulty", "resources/SPM_Math_2023_P2.pdf"),
            new PastPaperDto("SPM Mathematics 2022 Paper 1", "Objective · 40 marks · Easy difficulty", "resources/SPM_Math_2022_P1.pdf"),
            new PastPaperDto("SPM Mathematics 2021 Paper 2", "Structured · 45 marks · Hard difficulty", "resources/SPM_Math_2021_P2.pdf")
        };
    }

    private static List<ChecklistItemDto> SampleChecklist()
    {
        return new List<ChecklistItemDto>
        {
            new ChecklistItemDto("Complete 2 timed papers", "Recommended pace: 1 per week"),
            new ChecklistItemDto("Review marking scheme", "Highlight careless mistakes"),
            new ChecklistItemDto("Log reflections", "Capture what to improve next time", true)
        };
    }

    private static List<CommunityThreadDto> SampleCommunityThreads()
    {
        return new List<CommunityThreadDto>
        {
            new CommunityThreadDto
            {
                ThreadId = 101,
                Title = "Need intuition for sine graph transformations",
                Body = "I can stretch/shift but still mix up the order. Anyone got a mental model?",
                Category = "Form 5",
                FormLevel = "Form 5",
                PrimaryTag = "trigonometry",
                ReplyCount = 12,
                LastReplyLabel = "10m ago",
                CreatedLabel = "1h ago",
                Author = new CommunityAuthorDto { LearnerId = "min-cat", Name = "Min", Username = "min-cat" }
            },
            new CommunityThreadDto
            {
                ThreadId = 92,
                Title = "Venn diagram challenge (with cats!)",
                Body = "Sharing a fun teacher-made question. Let's see who can solve it fastest.",
                Category = "Form 4",
                FormLevel = "Form 4",
                PrimaryTag = "sets",
                ReplyCount = 5,
                LastReplyLabel = "32m ago",
                CreatedLabel = "2h ago",
                Author = new CommunityAuthorDto { LearnerId = "akira", Name = "Akira", Username = "akira" }
            },
            new CommunityThreadDto
            {
                ThreadId = 87,
                Title = "Keeping streaks during exam week",
                Body = "How do you balance school + KiraKira? Looking for realistic routines.",
                Category = "Study tips",
                FormLevel = "Study tips",
                PrimaryTag = "habits",
                ReplyCount = 9,
                LastReplyLabel = "1h ago",
                CreatedLabel = "4h ago",
                Author = new CommunityAuthorDto { LearnerId = "zara", Name = "Zara", Username = "zara" }
            }
        };
    }

    private static List<CommunityTagDto> SampleCommunityTags()
    {
        return new List<CommunityTagDto>
        {
            new CommunityTagDto { Slug = "algebra-sos", Label = "algebra-sos", UsageCount = 42 },
            new CommunityTagDto { Slug = "probability", Label = "probability", UsageCount = 35 },
            new CommunityTagDto { Slug = "exam-stress", Label = "exam-stress", UsageCount = 28 },
            new CommunityTagDto { Slug = "study-logs", Label = "study-logs", UsageCount = 21 },
            new CommunityTagDto { Slug = "coach-asks", Label = "coach-asks", UsageCount = 14 },
            new CommunityTagDto { Slug = "math-memes", Label = "math-memes", UsageCount = 10 }
        };
    }

    private static List<CommunityReplyDto> SampleCommunityReplies()
    {
        return new List<CommunityReplyDto>
        {
            new CommunityReplyDto
            {
                ReplyId = 501,
                Body = "I break the questions into smaller steps and double-check units. Helps calm the panic.",
                CreatedLabel = "2h ago",
                Author = new CommunityAuthorDto { LearnerId = "coachmin", Name = "Coach Min", Username = "coachmin" }
            },
            new CommunityReplyDto
            {
                ReplyId = 492,
                Body = "Try a 20-minute timer with one focused topic. Momentum builds fast.",
                CreatedLabel = "3h ago",
                Author = new CommunityAuthorDto { LearnerId = "dinamath", Name = "Dina", Username = "dinamath" }
            }
        };
    }

    private async Task<LearnerProfileDto> FetchProfileDtoAsync(string learnerId, LearnerRecord? identity)
    {
        var profile = BuildProfile(learnerId, identity);
        const string sql = @"SELECT full_name, school, grade_year, motto, avatar_url, level, xp,
                                    featured_badge_id, featured_badge_label, featured_badge_style
                             FROM learner_profile
                             WHERE uid = @Uid
                             LIMIT 1";

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return profile;
            }

            await using var command = new MySqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Uid", learnerId);

            await using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                profile.Name = reader["full_name"]?.ToString() ?? profile.Name;
                profile.School = reader["school"]?.ToString() ?? profile.School;
                profile.GradeYear = reader["grade_year"]?.ToString() ?? profile.GradeYear;
                profile.Motto = reader["motto"]?.ToString() ?? profile.Motto;
                profile.AvatarUrl = reader["avatar_url"]?.ToString() ?? profile.AvatarUrl;
                profile.Level = SafeToInt(reader["level"], profile.Level);
                profile.Xp = SafeToInt(reader["xp"], profile.Xp);

                if (HasColumn(reader, "featured_badge_id") || HasColumn(reader, "featured_badge_label"))
                {
                    var featuredId = HasColumn(reader, "featured_badge_id") ? reader["featured_badge_id"]?.ToString() : string.Empty;
                    var featuredLabel = HasColumn(reader, "featured_badge_label") ? reader["featured_badge_label"]?.ToString() : string.Empty;
                    var featuredStyle = HasColumn(reader, "featured_badge_style") ? reader["featured_badge_style"]?.ToString() : string.Empty;

                    if (!string.IsNullOrWhiteSpace(featuredId) || !string.IsNullOrWhiteSpace(featuredLabel))
                    {
                        profile.FeaturedBadge = new BadgeChipDto
                        {
                            Id = featuredId ?? string.Empty,
                            Label = string.IsNullOrWhiteSpace(featuredLabel) ? "Unlocked badge" : featuredLabel!,
                            Style = string.IsNullOrWhiteSpace(featuredStyle) ? "level" : featuredStyle!
                        };
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to load learner_profile for {learnerId}: {ex.Message}");
        }

        profile.AvatarUrl = NormalizeAvatarPath(profile.AvatarUrl);
        profile.Name = CoalesceProfileValue(profile.Name, identity?.Name ?? identity?.Username ?? "Learner");
        return profile;
    }

    private static LearnerProfileDto BuildProfile(string learnerId, LearnerRecord? record)
    {
        var resolvedName = CoalesceProfileValue(record?.Name, record?.Username ?? "Learner");
        return new LearnerProfileDto
        {
            LearnerId = record?.LearnerId ?? learnerId,
            Name = string.IsNullOrWhiteSpace(resolvedName) ? "Learner" : resolvedName,
            AvatarUrl = DefaultAvatar,
            Motto = "Learning one formula at a time.",
            Level = 1,
            Xp = 0,
            School = string.Empty,
            GradeYear = string.Empty
        };
    }

    private static string NormalizeAvatarPath(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return DefaultAvatar;
        }

        var trimmed = value.Trim();
        trimmed = trimmed.StartsWith("/") ? trimmed : "/" + trimmed.TrimStart('/');
        return AllowedAvatars.Contains(trimmed) ? trimmed : DefaultAvatar;
    }

    private static bool HasColumn(DbDataReader reader, string columnName)
    {
        for (var i = 0; i < reader.FieldCount; i++)
        {
            if (reader.GetName(i).Equals(columnName, StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
        }
        return false;
    }

    private static string CoalesceProfileValue(string? candidate, string fallback)
    {
        if (!string.IsNullOrWhiteSpace(candidate))
        {
            return candidate.Trim();
        }

        return string.IsNullOrWhiteSpace(fallback) ? string.Empty : fallback;
    }

    private async Task SaveProfileFieldsAsync(string learnerId, string fullName, string school, string gradeYear, string motto)
    {
        const string sql = @"INSERT INTO learner_profile (uid, full_name, school, grade_year, motto)
                             VALUES (@Uid, @FullName, @School, @GradeYear, @Motto)
                             ON DUPLICATE KEY UPDATE full_name = @FullName, school = @School, grade_year = @GradeYear, motto = @Motto";

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return;
            }

            await using var command = new MySqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Uid", learnerId);
            command.Parameters.AddWithValue("@FullName", fullName ?? string.Empty);
            command.Parameters.AddWithValue("@School", school ?? string.Empty);
            command.Parameters.AddWithValue("@GradeYear", gradeYear ?? string.Empty);
            command.Parameters.AddWithValue("@Motto", motto ?? string.Empty);
            await command.ExecuteNonQueryAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to save profile fields for {learnerId}: {ex.Message}");
        }
    }

    private async Task UpdateLearnerAccountAsync(string learnerId, string? name, string? email)
    {
        var updates = new List<string>();
        if (!string.IsNullOrWhiteSpace(name))
        {
            updates.Add("name = @Name");
        }
        if (!string.IsNullOrWhiteSpace(email))
        {
            updates.Add("email = @Email");
        }

        if (!updates.Any())
        {
            return;
        }

        var sql = $"UPDATE usertable SET {string.Join(", ", updates)} WHERE uid = @Uid";

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return;
            }

            await using var command = new MySqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Uid", learnerId);
            if (!string.IsNullOrWhiteSpace(name))
            {
                command.Parameters.AddWithValue("@Name", name.Trim());
            }
            if (!string.IsNullOrWhiteSpace(email))
            {
                command.Parameters.AddWithValue("@Email", email.Trim());
            }

            await command.ExecuteNonQueryAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to update learner account for {learnerId}: {ex.Message}");
        }
    }

    private async Task SaveAvatarAsync(string learnerId, string avatarUrl)
    {
        const string sql = @"INSERT INTO learner_profile (uid, avatar_url)
                             VALUES (@Uid, @AvatarUrl)
                             ON DUPLICATE KEY UPDATE avatar_url = @AvatarUrl";

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return;
            }

            await using var command = new MySqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Uid", learnerId);
            command.Parameters.AddWithValue("@AvatarUrl", avatarUrl);
            await command.ExecuteNonQueryAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to save avatar for {learnerId}: {ex.Message}");
        }
    }

    private static DateTime NormalizeTimestamp(DateTime? timestamp)
    {
        return NormalizeTimestamp(timestamp ?? DateTime.UtcNow);
    }

    private static DateTime NormalizeTimestamp(DateTime timestamp)
    {
        return timestamp.Kind switch
        {
            DateTimeKind.Utc => timestamp,
            DateTimeKind.Local => timestamp.ToUniversalTime(),
            _ => DateTime.SpecifyKind(timestamp, DateTimeKind.Utc)
        };
    }

    private static DateTime NormalizeActivityDate(DateTime timestampUtc)
    {
        return DateTime.SpecifyKind(timestampUtc.Date, DateTimeKind.Utc);
    }

    private static int NormalizeXpAward(int? requested, int fallback)
    {
        if (!requested.HasValue)
        {
            return Math.Max(0, Math.Min(MaxActivityXp, fallback));
        }

        var value = requested.Value;
        if (value <= 0)
        {
            return 0;
        }

        return Math.Max(0, Math.Min(MaxActivityXp, value));
    }

    private static int GetXpRequirementForLevel(int currentLevel)
    {
        if (currentLevel < 1)
        {
            return EarlyLevelRequirements[1];
        }

        if (currentLevel < EarlyLevelRequirements.Length)
        {
            return EarlyLevelRequirements[currentLevel];
        }

        var tier = currentLevel - (EarlyLevelRequirements.Length - 1);
        var ramp = Math.Max(0, tier - 1);
        return BaseLevelXp + (ramp * PostLevelRampIncrement);
    }

    private static int CalculateLevelFromXp(int totalXp)
    {
        if (totalXp <= 0)
        {
            return 1;
        }

        var remainingXp = totalXp;
        var level = 1;

        while (true)
        {
            var requirement = GetXpRequirementForLevel(level);
            if (requirement <= 0 || remainingXp < requirement)
            {
                return level;
            }

            remainingXp -= requirement;
            level++;
        }
    }

    private static int CalculateXpToNextLevel(int totalXp)
    {
        if (totalXp < 0)
        {
            return GetXpRequirementForLevel(1);
        }

        var remainingXp = totalXp;
        var level = 1;
        var requirement = GetXpRequirementForLevel(level);

        while (requirement > 0 && remainingXp >= requirement)
        {
            remainingXp -= requirement;
            level++;
            requirement = GetXpRequirementForLevel(level);
        }

        return requirement <= 0 ? 0 : requirement - remainingXp;
    }

    private async Task UpdateLearnerXpToNextLevelAsync(string learnerId, int xpToNextLevel)
    {
        var state = await FetchStreakStateAsync(learnerId) ?? new LearnerStreakState();
        state.XpToNextLevel = xpToNextLevel;
        await SaveStreakStateAsync(learnerId, state);
    }

    private static string Truncate(string? value, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value) || value.Length <= maxLength)
        {
            return value?.Trim() ?? string.Empty;
        }

        return value.Trim()[..maxLength];
    }

    private static string BuildPaperSlug(string? slug, string title)
    {
        if (!string.IsNullOrWhiteSpace(slug))
        {
            return slug.Trim().ToLowerInvariant();
        }

        var cleaned = title
            .ToLowerInvariant()
            .Select(ch => char.IsLetterOrDigit(ch) ? ch : '-')
            .ToArray();
        var normalized = new string(cleaned);
        while (normalized.Contains("--"))
        {
            normalized = normalized.Replace("--", "-");
        }

        normalized = normalized.Trim('-');
        return string.IsNullOrWhiteSpace(normalized) ? "pastpaper-session" : normalized;
    }

    private async Task<LearnerStreakDto> BuildStreakSnapshotAsync(string learnerId)
    {
        var record = await FetchLearnerAsync(learnerId);
        var profile = await FetchProfileDtoAsync(learnerId, record);
        return await FetchStreakDtoAsync(learnerId, profile);
    }

    private async Task<StreakUpdateResult> ApplyStudyActivityAsync(string learnerId, DateTime occurredAtUtc, string source, int xpAwarded)
    {
        var normalizedMoment = NormalizeTimestamp(occurredAtUtc);
        var activityDate = NormalizeActivityDate(normalizedMoment);
        var state = await FetchStreakStateAsync(learnerId) ?? new LearnerStreakState();
        LearnerXpSnapshot? xpSnapshot = null;

        if (xpAwarded > 0)
        {
            xpSnapshot = await ApplyXpAwardAsync(learnerId, xpAwarded);
        }

        var result = new StreakUpdateResult
        {
            ActivityDate = activityDate,
            Counted = false,
            Message = "Already logged for today."
        };

        var lastDate = state.LastActivityOn.HasValue ? NormalizeActivityDate(state.LastActivityOn.Value) : (DateTime?)null;
        var newCurrent = state.Current;

        if (lastDate == activityDate)
        {
            // Already counted today; keep current streak.
        }
        else if (lastDate == activityDate.AddDays(-1))
        {
            newCurrent = Math.Max(1, state.Current) + 1;
            result.Counted = true;
            result.Message = $"Streak extended to {newCurrent} day(s).";
        }
        else
        {
            newCurrent = 1;
            result.Counted = true;
            result.Message = "Streak restarted at 1 day.";
        }

        if (state.Current == 0 && result.Counted && newCurrent == 1)
        {
            result.Message = "Streak started.";
        }

        state.Current = newCurrent;
        state.Longest = Math.Max(state.Longest, newCurrent);
        if (xpSnapshot != null)
        {
            state.XpToNextLevel = xpSnapshot.XpToNextLevel;
        }
        else
        {
            state.XpToNextLevel = Math.Max(0, state.XpToNextLevel - Math.Max(0, xpAwarded));
        }
        state.LastActivityOn = activityDate;
        state.LastActivitySource = source ?? string.Empty;

        await SaveStreakStateAsync(learnerId, state);
        return result;
    }

    private async Task<LearnerXpSnapshot?> ApplyXpAwardAsync(string learnerId, int xpAwarded)
    {
        if (string.IsNullOrWhiteSpace(learnerId) || xpAwarded <= 0)
        {
            return null;
        }

        var currentXp = 0;
        var currentLevel = 1;
        const string selectSql = @"SELECT xp, level FROM learner_profile WHERE uid = @Uid LIMIT 1";

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return null;
            }

            await using (var selectCmd = new MySqlCommand(selectSql, connection))
            {
                selectCmd.Parameters.AddWithValue("@Uid", learnerId);
                await using var reader = await selectCmd.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    currentXp = SafeToInt(reader["xp"], currentXp);
                    currentLevel = SafeToInt(reader["level"], currentLevel);
                }
            }

            var totalXp = Math.Max(0, currentXp) + xpAwarded;
            var level = CalculateLevelFromXp(totalXp);
            var xpToNext = CalculateXpToNextLevel(totalXp);

            const string upsertSql = @"INSERT INTO learner_profile (uid, xp, level)
                                       VALUES (@Uid, @Xp, @Level)
                                       ON DUPLICATE KEY UPDATE xp = @Xp, level = @Level";

            await using (var upsertCmd = new MySqlCommand(upsertSql, connection))
            {
                upsertCmd.Parameters.AddWithValue("@Uid", learnerId);
                upsertCmd.Parameters.AddWithValue("@Xp", totalXp);
                upsertCmd.Parameters.AddWithValue("@Level", level);
                await upsertCmd.ExecuteNonQueryAsync();
            }

            return new LearnerXpSnapshot
            {
                TotalXp = totalXp,
                Level = level,
                XpToNextLevel = xpToNext
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to apply XP for {learnerId}: {ex.Message}");
        }

        return null;
    }

    private async Task<LearnerStreakState?> FetchStreakStateAsync(string learnerId)
    {
        const string sql = @"SELECT current_streak, longest_streak, xp_to_next_level, last_activity_on, last_activity_source
                             FROM learner_streak
                             WHERE uid = @Uid
                             LIMIT 1";

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return null;
            }

            await using var command = new MySqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Uid", learnerId);

            await using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return new LearnerStreakState
                {
                    Current = SafeToInt(reader["current_streak"], 0),
                    Longest = SafeToInt(reader["longest_streak"], 0),
                    XpToNextLevel = SafeToInt(reader["xp_to_next_level"], 1000),
                    LastActivityOn = reader["last_activity_on"] is DateTime dt ? dt : null,
                    LastActivitySource = reader["last_activity_source"]?.ToString() ?? string.Empty
                };
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to fetch learner_streak for {learnerId}: {ex.Message}");
        }

        return null;
    }

    private async Task SaveStreakStateAsync(string learnerId, LearnerStreakState state)
    {
        const string sql = @"INSERT INTO learner_streak (uid, current_streak, longest_streak, xp_to_next_level, last_activity_on, last_activity_source)
                             VALUES (@Uid, @Current, @Longest, @Xp, @LastActivity, @Source)
                             ON DUPLICATE KEY UPDATE current_streak = @Current, longest_streak = @Longest, xp_to_next_level = @Xp, last_activity_on = @LastActivity, last_activity_source = @Source";

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return;
            }

            if (state.XpToNextLevel <= 0)
            {
                state.XpToNextLevel = BaseLevelXp;
            }

            await using var command = new MySqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Uid", learnerId);
            command.Parameters.AddWithValue("@Current", state.Current);
            command.Parameters.AddWithValue("@Longest", state.Longest);
            command.Parameters.AddWithValue("@Xp", Math.Max(0, state.XpToNextLevel));
            command.Parameters.AddWithValue("@LastActivity", state.LastActivityOn);
            command.Parameters.AddWithValue("@Source", state.LastActivitySource ?? string.Empty);
            await command.ExecuteNonQueryAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to save learner_streak for {learnerId}: {ex.Message}");
        }
    }

    private async Task MarkModuleQuizLogAppliedAsync(long logId)
    {
        const string sql = @"UPDATE learner_module_quiz_log SET streak_applied = 1 WHERE id = @Id";

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return;
            }

            await using var command = new MySqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Id", logId);
            await command.ExecuteNonQueryAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to mark module quiz log {logId} as applied: {ex.Message}");
        }
    }

    private async Task MarkPastPaperLogAppliedAsync(long logId)
    {
        const string sql = @"UPDATE learner_pastpaper_log SET streak_applied = 1 WHERE id = @Id";

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return;
            }

            await using var command = new MySqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Id", logId);
            await command.ExecuteNonQueryAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to mark past paper log {logId} as applied: {ex.Message}");
        }
    }

    private static int SafeToInt(object? value, int fallback)
    {
        if (value == null || value == DBNull.Value)
        {
            return fallback;
        }

        if (int.TryParse(value.ToString(), out var parsed))
        {
            return parsed;
        }

        return fallback;
    }

    private static double SafeToDouble(object? value, double fallback)
    {
        if (value == null || value == DBNull.Value)
        {
            return fallback;
        }

        if (double.TryParse(value.ToString(), out var parsed))
        {
            return parsed;
        }

        return fallback;
    }

    private static long SafeToLong(object? value, long fallback)
    {
        if (value == null || value == DBNull.Value)
        {
            return fallback;
        }

        if (long.TryParse(value.ToString(), out var parsed))
        {
            return parsed;
        }

        return fallback;
    }

    private static string NormalizeTag(string? tag)
    {
        if (string.IsNullOrWhiteSpace(tag))
        {
            return "discussion";
        }

        var cleaned = tag.Trim().TrimStart('#');
        if (cleaned.Length > 32)
        {
            cleaned = cleaned[..32];
        }

        return cleaned.ToLowerInvariant();
    }

    private static string FormatRelativeTime(DateTime? dateTime)
    {
        if (!dateTime.HasValue)
        {
            return "Just now";
        }

        var utc = DateTime.SpecifyKind(dateTime.Value, DateTimeKind.Local).ToUniversalTime();
        var delta = DateTime.UtcNow - utc;

        if (delta.TotalSeconds < 60)
        {
            return "Just now";
        }

        if (delta.TotalMinutes < 60)
        {
            return $"{Math.Max(1, (int)delta.TotalMinutes)}m ago";
        }

        if (delta.TotalHours < 24)
        {
            return $"{Math.Max(1, (int)delta.TotalHours)}h ago";
        }

        if (delta.TotalDays < 7)
        {
            return $"{Math.Max(1, (int)delta.TotalDays)}d ago";
        }

        return utc.ToString("dd MMM", CultureInfo.InvariantCulture);
    }

    private static DateTime? ReadNullableDateTime(DbDataReader reader, string columnName)
    {
        try
        {
            var value = reader[columnName];
            if (value == null || value == DBNull.Value)
            {
                return null;
            }

            if (value is DateTime dt)
            {
                return dt;
            }

            if (DateTime.TryParse(value.ToString(), CultureInfo.InvariantCulture, DateTimeStyles.AssumeLocal, out var parsed))
            {
                return parsed;
            }
        }
        catch
        {
            // Intentionally ignored; fallback to null.
        }

        return null;
    }

    private static string FormatDateLabel(DateTime? value)
    {
        return value?.ToString("dd MMM yyyy", CultureInfo.InvariantCulture) ?? string.Empty;
    }

    private static (ModuleCardDto Module, string Grade)? ResolveModuleFromCatalogue(string moduleId, IEnumerable<ModuleCatalogueSectionDto> catalogue)
    {
        if (string.IsNullOrWhiteSpace(moduleId))
        {
            return null;
        }

        foreach (var section in catalogue ?? Enumerable.Empty<ModuleCatalogueSectionDto>())
        {
            foreach (var module in section.Modules ?? Enumerable.Empty<ModuleCardDto>())
            {
                foreach (var key in BuildModuleIdentifiers(section, module))
                {
                    if (string.Equals(key, moduleId, StringComparison.OrdinalIgnoreCase))
                    {
                        return (module, section.Grade ?? string.Empty);
                    }
                }
            }
        }

        return null;
    }

    private static IEnumerable<string> BuildModuleIdentifiers(ModuleCatalogueSectionDto section, ModuleCardDto module)
    {
        if (!string.IsNullOrWhiteSpace(module.Number))
        {
            yield return module.Number;
        }

        if (!string.IsNullOrWhiteSpace(module.Link))
        {
            yield return module.Link;
        }

        if (!string.IsNullOrWhiteSpace(section.Grade) && !string.IsNullOrWhiteSpace(module.Number))
        {
            yield return $"{section.Grade.Replace(" ", string.Empty).ToLowerInvariant()}-{module.Number}";
        }

        if (!string.IsNullOrWhiteSpace(module.Title))
        {
            yield return module.Title;
        }
    }

    private async Task<LearnerMissionDto> FetchMissionDtoAsync(string learnerId, LearnerProfileDto profile)
    {
        var mission = new LearnerMissionDto
        {
            Badge = string.IsNullOrWhiteSpace(profile.GradeYear) ? "Personalised path" : $"{profile.GradeYear} track",
            Grade = string.IsNullOrWhiteSpace(profile.GradeYear) ? "Form 4" : profile.GradeYear,
            Title = "Keep the momentum going",
            Mood = "Let's stack some easy wins with Algebra drills today.",
            Confidence = 45,
            Mode = "Momentum mode",
            WantsVideos = true
        };

        const string sql = @"SELECT grade, readiness_percent, target_focus, wants_videos, mission_title, mission_mood, mission_mode
                             FROM learner_mission
                             WHERE uid = @Uid
                             LIMIT 1";

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return mission;
            }

            await using var command = new MySqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Uid", learnerId);

            await using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                var grade = reader["grade"]?.ToString();
                if (!string.IsNullOrWhiteSpace(grade))
                {
                    mission.Grade = grade;
                    mission.Badge = $"{grade} track";
                }

                mission.Confidence = SafeToInt(reader["readiness_percent"], mission.Confidence);
                mission.Title = reader["mission_title"]?.ToString() ?? mission.Title;
                mission.Mood = reader["mission_mood"]?.ToString() ?? mission.Mood;
                mission.Mode = reader["mission_mode"]?.ToString() ?? mission.Mode;
                mission.WantsVideos = reader["wants_videos"] != DBNull.Value
                    ? Convert.ToBoolean(reader["wants_videos"])
                    : mission.WantsVideos;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to load learner_mission for {learnerId}: {ex.Message}");
        }

        return mission;
    }

    private static MissionLanguage DescribeMissionByReadiness(int readiness)
    {
        if (readiness < 50)
        {
            return new MissionLanguage
            {
                Title = "Rescue plan activated",
                Mood = "We'll prioritise Algebra rescue drills until you're steady again.",
                Mode = "Rescue mode",
                Focus = "Core rescue"
            };
        }

        if (readiness < 80)
        {
            return new MissionLanguage
            {
                Title = "Keep the momentum going",
                Mood = "Solid footing - let's balance revision with trickier sets.",
                Mode = "Momentum mode",
                Focus = "Balanced practice"
            };
        }

        return new MissionLanguage
        {
            Title = "Mastery push unlocked",
            Mood = "Legend status - chase perfect timed papers.",
            Mode = "Mastery mode",
            Focus = "Exam mastery"
        };
    }

    private static LearnerMissionDto BuildMissionDto(string grade, int readiness, bool wantsVideos, MissionLanguage copy)
    {
        var normalizedGrade = string.IsNullOrWhiteSpace(grade) ? "Form 4" : grade;
        return new LearnerMissionDto
        {
            Badge = $"{normalizedGrade} track",
            Grade = normalizedGrade,
            Title = copy.Title,
            Mood = copy.Mood,
            Confidence = readiness,
            Mode = copy.Mode,
            WantsVideos = wantsVideos
        };
    }

    private sealed class MissionLanguage
    {
        public string Title { get; init; } = string.Empty;
        public string Mood { get; init; } = string.Empty;
        public string Mode { get; init; } = string.Empty;
        public string Focus { get; init; } = string.Empty;
    }

    private async Task<LearnerStreakDto> FetchStreakDtoAsync(string learnerId, LearnerProfileDto profile)
    {
        var streak = new LearnerStreakDto
        {
            Current = 0,
            Longest = 0,
            XpToNextLevel = CalculateXpToNextLevel(profile.Xp),
            Status = "Start your streak",
            LevelLabel = $"Level {profile.Level}"
        };

        const string sql = @"SELECT current_streak, longest_streak, xp_to_next_level
                             FROM learner_streak
                             WHERE uid = @Uid
                             LIMIT 1";

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return streak;
            }

            await using var command = new MySqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Uid", learnerId);

            await using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                streak.Current = SafeToInt(reader["current_streak"], streak.Current);
                streak.Longest = SafeToInt(reader["longest_streak"], streak.Longest);
                streak.XpToNextLevel = SafeToInt(reader["xp_to_next_level"], streak.XpToNextLevel);
                if (streak.XpToNextLevel <= 0)
                {
                    streak.XpToNextLevel = CalculateXpToNextLevel(profile.Xp);
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to load learner_streak for {learnerId}: {ex.Message}");
        }

        streak.Status = streak.Current > 0 ? $"{streak.Current}-day streak" : "Ready to start your streak";
        streak.LevelLabel = $"Level {profile.Level}";

        return streak;
    }

    private async Task<LearnerModuleSnapshot> BuildModuleSnapshotAsync(string learnerId)
    {
        var catalogue = SampleModules().ToList();
        var moduleLookup = BuildModuleLookup(catalogue, out var allModules);
        var progress = await FetchModuleProgressAsync(learnerId);
        var topicProgress = await FetchTopicProgressAsync(learnerId);

        foreach (var module in allModules)
        {
            module.ProgressPercent = 0;

            var keys = new List<string?>
            {
                module.ModuleId,
                module.Link,
                module.Number,
                string.IsNullOrWhiteSpace(module.Grade) || string.IsNullOrWhiteSpace(module.Number)
                    ? null
                    : $"{module.Grade.Replace(" ", string.Empty).ToLowerInvariant()}-{module.Number}"
            };

            foreach (var key in keys.Where(k => !string.IsNullOrWhiteSpace(k)))
            {
                if (progress.TryGetValue(key!, out var state))
                {
                    module.ProgressPercent = Math.Max(0, Math.Min(100, state.ProgressPercent));
                    break;
                }
            }

            var topicPercent = CalculateModuleProgress(module, topicProgress);
            if (topicPercent.HasValue)
            {
                module.ProgressPercent = Math.Max(0, Math.Min(100, topicPercent.Value));
            }
        }

        var selections = await FetchModuleSelectionsAsync(learnerId);
        var activeModules = selections
            .Select(selection => moduleLookup.TryGetValue(selection.ModuleId, out var module) ? module : null)
            .Where(module => module != null)
            .Cast<ModuleCardDto>()
            .ToList();

        if (!activeModules.Any())
        {
            activeModules = new List<ModuleCardDto>();
        }

        return new LearnerModuleSnapshot
        {
            ActiveModules = activeModules,
            Catalogue = catalogue
        };
    }

    private Dictionary<string, ModuleCardDto> BuildModuleLookup(List<ModuleCatalogueSectionDto> catalogue, out List<ModuleCardDto> flatModules)
    {
        var lookup = new Dictionary<string, ModuleCardDto>(StringComparer.OrdinalIgnoreCase);
        flatModules = new List<ModuleCardDto>();

        foreach (var section in catalogue)
        {
            foreach (var module in section.Modules)
            {
                module.Grade = section.Grade ?? string.Empty;
                var moduleId = EnsureModuleIdentifier(section, module);
                foreach (var key in BuildModuleKeys(section, module, moduleId))
                {
                    if (string.IsNullOrWhiteSpace(key))
                    {
                        continue;
                    }
                    lookup[key] = module;
                }

                flatModules.Add(module);
            }
        }

        return lookup;
    }

    private static string EnsureModuleIdentifier(ModuleCatalogueSectionDto section, ModuleCardDto module)
    {
        if (!string.IsNullOrWhiteSpace(module.ModuleId))
        {
            module.ModuleId = module.ModuleId.Trim();
            return module.ModuleId;
        }

        var gradeKey = NormalizeGradeKey(section.Grade);
        var number = module.Number?.Trim() ?? string.Empty;
        var identifier = !string.IsNullOrWhiteSpace(gradeKey) && !string.IsNullOrWhiteSpace(number)
            ? $"{gradeKey}-{number}"
            : number;

        if (string.IsNullOrWhiteSpace(identifier))
        {
            identifier = Guid.NewGuid().ToString("N");
        }

        module.ModuleId = identifier.ToLowerInvariant();
        return module.ModuleId;
    }

    private static IEnumerable<string?> BuildModuleKeys(ModuleCatalogueSectionDto section, ModuleCardDto module, string moduleId)
    {
        var gradeKey = NormalizeGradeKey(section.Grade);
        yield return moduleId;
        yield return NormalizeModuleKey(moduleId);
        yield return module.Link;
        yield return module.Number;
        if (!string.IsNullOrWhiteSpace(gradeKey) && !string.IsNullOrWhiteSpace(module.Number))
        {
            yield return $"{gradeKey}-{module.Number}";
        }
    }

    private async Task<List<LearnerModuleSelectionRecord>> FetchModuleSelectionsAsync(string learnerId)
    {
        var selections = new List<LearnerModuleSelectionRecord>();
        const string sql = @"SELECT module_id, display_order
                             FROM learner_module_selection
                             WHERE uid = @Uid AND (status IS NULL OR status = 'active')
                             ORDER BY display_order ASC, module_id ASC";

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return selections;
            }

            await using var command = new MySqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Uid", learnerId);

            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var moduleId = NormalizeModuleKey(reader["module_id"]?.ToString());
                if (string.IsNullOrWhiteSpace(moduleId))
                {
                    continue;
                }

                selections.Add(new LearnerModuleSelectionRecord
                {
                    ModuleId = moduleId,
                    DisplayOrder = SafeToInt(reader["display_order"], selections.Count + 1)
                });
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to load learner_module_selection for {learnerId}: {ex.Message}");
        }

        return selections;
    }

    private async Task<bool> SaveModuleSelectionAsync(string learnerId, string moduleId)
    {
        const string orderSql = @"SELECT COALESCE(MAX(display_order), 0) + 1
                                  FROM learner_module_selection
                                  WHERE uid = @Uid";
        const string insertSql = @"INSERT INTO learner_module_selection (uid, module_id, display_order, status)
                                   VALUES (@Uid, @ModuleId, @DisplayOrder, 'active')
                                   ON DUPLICATE KEY UPDATE status = 'active'";

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return false;
            }

            var displayOrder = 1;
            await using (var orderCommand = new MySqlCommand(orderSql, connection))
            {
                orderCommand.Parameters.AddWithValue("@Uid", learnerId);
                var result = await orderCommand.ExecuteScalarAsync();
                if (result != null && int.TryParse(result.ToString(), out var nextOrder) && nextOrder > 0)
                {
                    displayOrder = nextOrder;
                }
            }

            await using var command = new MySqlCommand(insertSql, connection);
            command.Parameters.AddWithValue("@Uid", learnerId);
            command.Parameters.AddWithValue("@ModuleId", NormalizeModuleKey(moduleId));
            command.Parameters.AddWithValue("@DisplayOrder", displayOrder);
            await command.ExecuteNonQueryAsync();
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to save learner_module_selection for {learnerId}: {ex.Message}");
        }

        return false;
    }

    private async Task<bool> DeleteModuleSelectionAsync(string learnerId, string moduleId)
    {
        const string sql = @"DELETE FROM learner_module_selection
                             WHERE uid = @Uid AND module_id = @ModuleId";

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return false;
            }

            await using var command = new MySqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Uid", learnerId);
            command.Parameters.AddWithValue("@ModuleId", moduleId);
            var affected = await command.ExecuteNonQueryAsync();
            return affected > 0;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to delete learner_module_selection for {learnerId}: {ex.Message}");
        }

        return false;
    }

    private async Task<Dictionary<string, Dictionary<string, TopicProgressState>>> FetchTopicProgressAsync(string learnerId)
    {
        var progress = new Dictionary<string, Dictionary<string, TopicProgressState>>(StringComparer.OrdinalIgnoreCase);
        const string sql = @"SELECT module_id, unit_id, status, score_percent
                             FROM learner_topic_progress
                             WHERE uid = @Uid";

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return progress;
            }

            await using var command = new MySqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Uid", learnerId);

            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var moduleId = NormalizeModuleKey(reader["module_id"]?.ToString());
                var unitId = NormalizeModuleKey(reader["unit_id"]?.ToString());
                if (string.IsNullOrWhiteSpace(moduleId) || string.IsNullOrWhiteSpace(unitId))
                {
                    continue;
                }

                if (!progress.TryGetValue(moduleId, out var unitMap))
                {
                    unitMap = new Dictionary<string, TopicProgressState>(StringComparer.OrdinalIgnoreCase);
                    progress[moduleId] = unitMap;
                }

                unitMap[unitId] = new TopicProgressState
                {
                    Status = reader["status"]?.ToString() ?? "in_progress",
                    ScorePercent = reader["score_percent"] == DBNull.Value ? (int?)null : SafeToInt(reader["score_percent"], 0)
                };
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to load learner_topic_progress for {learnerId}: {ex.Message}");
        }

        return progress;
    }

    private async Task<TopicProgressState?> FetchUnitProgressAsync(string learnerId, string moduleId, string unitId)
    {
        const string sql = @"SELECT status, score_percent
                             FROM learner_topic_progress
                             WHERE uid = @Uid AND module_id = @ModuleId AND unit_id = @UnitId
                             LIMIT 1";

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return null;
            }
            await using var command = new MySqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Uid", learnerId);
            command.Parameters.AddWithValue("@ModuleId", moduleId);
            command.Parameters.AddWithValue("@UnitId", unitId);
            await using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return new TopicProgressState
                {
                    Status = reader["status"]?.ToString() ?? "in_progress",
                    ScorePercent = reader["score_percent"] == DBNull.Value ? (int?)null : SafeToInt(reader["score_percent"], 0)
                };
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to fetch unit progress for {learnerId}: {ex.Message}");
        }
        return null;
    }

    private async Task<bool> UpsertTopicProgressAsync(string learnerId, string moduleId, string unitId, string? status, int? scorePercent, int? durationSeconds)
    {
        const string sql = @"INSERT INTO learner_topic_progress (uid, module_id, unit_id, status, score_percent, updated_at)
                             VALUES (@Uid, @ModuleId, @UnitId, @Status, @ScorePercent, CURRENT_TIMESTAMP)
                             ON DUPLICATE KEY UPDATE status = @Status, score_percent = @ScorePercent, updated_at = CURRENT_TIMESTAMP";

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return false;
            }

            await using var command = new MySqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Uid", learnerId);
            command.Parameters.AddWithValue("@ModuleId", moduleId);
            command.Parameters.AddWithValue("@UnitId", unitId);
            command.Parameters.AddWithValue("@Status", string.IsNullOrWhiteSpace(status) ? "completed" : status.Trim().ToLowerInvariant());
            if (scorePercent.HasValue)
            {
                command.Parameters.AddWithValue("@ScorePercent", scorePercent.Value);
            }
            else
            {
                command.Parameters.AddWithValue("@ScorePercent", DBNull.Value);
            }

            await command.ExecuteNonQueryAsync();
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to upsert learner_topic_progress for {learnerId}: {ex.Message}");
        }

        return false;
    }

    private static int? CalculateModuleProgress(ModuleCardDto module, Dictionary<string, Dictionary<string, TopicProgressState>> topicProgress)
    {
        var units = module.Units ?? new List<ModuleUnitDto>();
        var trackedUnits = units
            .Where(u => !string.IsNullOrWhiteSpace(u.UnitId) && !u.RescueOnly)
            .ToList();
        if (!trackedUnits.Any())
        {
            return null;
        }

        if (!topicProgress.TryGetValue(module.ModuleId, out var unitMap))
        {
            return 0;
        }

        var completed = trackedUnits.Count(unit =>
        {
            var unitKey = NormalizeModuleKey(unit.UnitId);
            return unitMap.TryGetValue(unitKey, out var state) &&
                   string.Equals(state.Status, "completed", StringComparison.OrdinalIgnoreCase);
        });

        return (int)Math.Round((double)completed / trackedUnits.Count * 100);
    }

    private static string NormalizeModuleKey(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? string.Empty : value.Trim().ToLowerInvariant();
    }

    private static string NormalizeGradeKey(string? grade)
    {
        return string.IsNullOrWhiteSpace(grade)
            ? string.Empty
            : grade.Replace(" ", string.Empty).ToLowerInvariant();
    }

    private async Task<Dictionary<string, ModuleProgressState>> FetchModuleProgressAsync(string learnerId)
    {
        var result = new Dictionary<string, ModuleProgressState>(StringComparer.OrdinalIgnoreCase);
        const string sql = @"SELECT module_code, progress_percent, status
                             FROM learner_modules
                             WHERE uid = @Uid";

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return result;
            }

            await using var command = new MySqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Uid", learnerId);

            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var code = reader["module_code"]?.ToString();
                if (string.IsNullOrWhiteSpace(code))
                {
                    continue;
                }

                result[code] = new ModuleProgressState
                {
                    ProgressPercent = SafeToInt(reader["progress_percent"], 0),
                    Status = reader["status"]?.ToString() ?? string.Empty
                };
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to load learner_modules for {learnerId}: {ex.Message}");
        }

        return result;
    }

    private static List<LearnerHighlightStat> BuildHighlightStats(LearnerStreakDto streak, LearnerMissionDto mission, LearnerModuleSnapshot modules)
    {
        var stats = new List<LearnerHighlightStat>
        {
            new LearnerHighlightStat
            {
                Label = "XP to next level",
                Value = streak.XpToNextLevel.ToString(),
                Detail = "Keep your streak alive to level up faster.",
                ProgressPercent = Math.Max(5, Math.Min(100, 100 - (streak.XpToNextLevel / 10)))
            },
            new LearnerHighlightStat
            {
                Label = "Weekly focus",
                Value = mission.Badge,
                Detail = mission.Mood,
                Chip = mission.Mode
            }
        };

        var nextModule = modules.ActiveModules.FirstOrDefault();
        if (nextModule != null)
        {
            stats.Add(new LearnerHighlightStat
            {
                Label = "Next module",
                Value = nextModule.Title,
                Detail = $"Module {nextModule.Number}",
                Chip = nextModule.ProgressPercent >= 95 ? "Review" : nextModule.ProgressPercent >= 35 ? "Continue" : "Preview"
            });
        }

        return stats;
    }

    private async Task<LearnerBadgeStatsDto> BuildBadgeStatsAsync(string learnerId, LearnerProfileDto profile, LearnerStreakDto streak, LearnerModuleSnapshot? modules = null)
    {
        var badgeStats = SampleBadgeStats();
        var stats = badgeStats.Stats;

        stats["level"] = profile.Level;
        stats["streak"] = Math.Max(stats.TryGetValue("streak", out var longest) ? longest : 0, streak.Longest);
        stats["consistency"] = streak.Current;

        if (modules != null)
        {
            stats["moduleMastery"] = CountCompletedModulesFromSnapshot(modules);
        }
        else
        {
            stats["moduleMastery"] = await CountCompletedModulesAsync(learnerId);
        }

        stats["paperWarrior"] = await CountPastPaperSessionsAsync(learnerId);

        var earnedBadgeMetrics = await FetchLearnerBadgeMetricsAsync(learnerId);
        foreach (var kvp in earnedBadgeMetrics)
        {
            if (string.IsNullOrWhiteSpace(kvp.Key))
            {
                continue;
            }

            stats[kvp.Key.Trim()] = kvp.Value;
        }

        return badgeStats;
    }

    private static int CountCompletedModulesFromSnapshot(LearnerModuleSnapshot? modules)
    {
        if (modules == null)
        {
            return 0;
        }

        return modules.Catalogue
            .SelectMany(section => section.Modules)
            .Count(module => (module.ProgressPercent ?? 0) >= 95);
    }

    private async Task<int> CountCompletedModulesAsync(string learnerId)
    {
        var progress = await FetchModuleProgressAsync(learnerId);
        if (progress == null || progress.Count == 0)
        {
            return 0;
        }

        return progress.Values.Count(state =>
            state.ProgressPercent >= 95 ||
            string.Equals(state.Status, "completed", StringComparison.OrdinalIgnoreCase));
    }

    private async Task<int> CountPastPaperSessionsAsync(string learnerId)
    {
        if (string.IsNullOrWhiteSpace(learnerId))
        {
            return 0;
        }

        const string sql = @"SELECT COUNT(*) FROM learner_pastpaper_log WHERE uid = @Uid";

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return 0;
            }

            await using var command = new MySqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Uid", learnerId);
            var result = await command.ExecuteScalarAsync();
            if (result == null || result == DBNull.Value)
            {
                return 0;
            }

            return Convert.ToInt32(result, CultureInfo.InvariantCulture);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to count past papers for {learnerId}: {ex.Message}");
            return 0;
        }
    }

    private async Task<Dictionary<string, int>> FetchLearnerBadgeMetricsAsync(string learnerId)
    {
        const string sql = @"SELECT *
                             FROM learner_badges
                             WHERE uid = @Uid";
        var metrics = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return metrics;
            }

            await using var command = new MySqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Uid", learnerId);

            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var badgeId = ReadBadgeIdentifier(reader);
                if (!TryParseBadgeMetric(badgeId, out var metric, out var value) &&
                    !TryReadMetricColumns(reader, out metric, out value))
                {
                    continue;
                }

                if (metrics.TryGetValue(metric, out var current))
                {
                    metrics[metric] = Math.Max(current, value);
                }
                else
                {
                    metrics[metric] = value;
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to load learner_badges for {learnerId}: {ex.Message}");
        }

        return metrics;
    }

    private static string? ReadBadgeIdentifier(DbDataReader reader)
    {
        var preferredColumns = new[]
        {
            "badge_id",
            "badgeid",
            "badge",
            "badge_code",
            "badgecode",
            "badge_slug",
            "badgeslug"
        };

        foreach (var column in preferredColumns)
        {
            var value = ReadColumnValue(reader, name => string.Equals(name, column, StringComparison.OrdinalIgnoreCase));
            if (!string.IsNullOrWhiteSpace(value))
            {
                return value;
            }
        }

        return ReadColumnValue(reader, name => name.IndexOf("badge", StringComparison.OrdinalIgnoreCase) >= 0);
    }

    private static bool TryReadMetricColumns(DbDataReader reader, out string metric, out int value)
    {
        metric = string.Empty;
        value = 0;

        var metricValue = ReadColumnValue(reader, name =>
            name.IndexOf("metric", StringComparison.OrdinalIgnoreCase) >= 0 ||
            name.IndexOf("stat", StringComparison.OrdinalIgnoreCase) >= 0);
        var amountValue = ReadColumnValue(reader, name =>
            name.IndexOf("value", StringComparison.OrdinalIgnoreCase) >= 0 ||
            name.IndexOf("level", StringComparison.OrdinalIgnoreCase) >= 0 ||
            name.IndexOf("count", StringComparison.OrdinalIgnoreCase) >= 0);

        if (string.IsNullOrWhiteSpace(metricValue) || string.IsNullOrWhiteSpace(amountValue))
        {
            return false;
        }

        metric = metricValue.Trim().ToLowerInvariant();
        if (int.TryParse(amountValue, out value))
        {
            return true;
        }

        var digits = new string(amountValue.Where(char.IsDigit).ToArray());
        if (!string.IsNullOrEmpty(digits) && int.TryParse(digits, out value))
        {
            return true;
        }

        metric = string.Empty;
        return false;
    }

    private static string? ReadColumnValue(DbDataReader reader, Func<string, bool> predicate)
    {
        for (var i = 0; i < reader.FieldCount; i++)
        {
            var columnName = reader.GetName(i);
            if (string.IsNullOrWhiteSpace(columnName) || !predicate(columnName))
            {
                continue;
            }

            if (reader.IsDBNull(i))
            {
                continue;
            }

            var value = reader.GetValue(i)?.ToString();
            if (!string.IsNullOrWhiteSpace(value))
            {
                return value;
            }
        }

        return null;
    }

    private static bool TryParseBadgeMetric(string? badgeId, out string metric, out int value)
    {
        metric = string.Empty;
        value = 0;

        if (string.IsNullOrWhiteSpace(badgeId))
        {
            return false;
        }

        var parts = badgeId.Split('-', 2, StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length != 2)
        {
            return false;
        }

        metric = parts[0].Trim().ToLowerInvariant();
        var numberPart = parts[1].Trim();

        if (int.TryParse(numberPart, out value))
        {
            return true;
        }

        var digits = new string(numberPart.Where(char.IsDigit).ToArray());
        if (!string.IsNullOrEmpty(digits) && int.TryParse(digits, out value))
        {
            return true;
        }

        metric = string.Empty;
        return false;
    }

    private static List<TopicProgressDto> BuildTopicProgressList(LearnerModuleSnapshot snapshot, int? limit = null)
    {
        if (snapshot == null)
        {
            return new List<TopicProgressDto>();
        }

        var modules = snapshot.ActiveModules?
            .Where(module => module != null)
            .Cast<ModuleCardDto>()
            .ToList() ?? new List<ModuleCardDto>();

        if (!modules.Any())
        {
            modules = snapshot.Catalogue
                .SelectMany(section => section.Modules ?? new List<ModuleCardDto>())
                .Where(module => module != null)
                .ToList();
        }

        if (limit.HasValue && limit.Value > 0)
        {
            modules = modules.Take(limit.Value).ToList();
        }

        return modules
            .Select(module => new TopicProgressDto(
                module.Title,
                module.ProgressPercent ?? 0,
                module.Lessons != null ? string.Join(", ", module.Lessons) : string.Empty))
            .ToList();
    }

    private async Task<List<CheckpointDto>> FetchCheckpointsAsync(string learnerId)
    {
        var checkpoints = new List<CheckpointDto>();
        const string sql = @"SELECT title, note, cta_label, is_primary
                             FROM learner_checkpoints
                             WHERE uid = @Uid
                             ORDER BY COALESCE(due_at, created_at) ASC";

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return checkpoints;
            }

            await using var command = new MySqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Uid", learnerId);

            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                checkpoints.Add(new CheckpointDto(
                    reader["title"]?.ToString() ?? "Checkpoint",
                    reader["note"]?.ToString() ?? string.Empty,
                    reader["cta_label"]?.ToString() ?? "Open",
                    reader["is_primary"] != DBNull.Value && Convert.ToBoolean(reader["is_primary"])
                ));
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to load learner_checkpoints for {learnerId}: {ex.Message}");
        }

        return checkpoints;
    }

    private static MotivationDto BuildMotivation(int overallPercent)
    {
        if (overallPercent >= 100)
        {
            return new MotivationDto
            {
                Title = "🎉 You did it!",
                Body = "You’ve completed all your lessons! Take a breather before the next sprint."
            };
        }

        if (overallPercent >= 75)
        {
            return new MotivationDto
            {
                Title = "You're doing amazing! 🐾",
                Body = "Keep going — every problem solved brings you closer to mastery!"
            };
        }

        return new MotivationDto
        {
            Title = "Small steps, big gains",
            Body = "Line up one focused session today to push your progress forward."
        };
    }

    private async Task<LearnerClassInfo?> FetchLearnerClassInfoAsync(string learnerId)
    {
        const string sql = @"SELECT lc.class_code,
                                    COALESCE(c.title, lc.class_code) AS title,
                                    c.description,
                                    c.grade_level,
                                    t.name AS teacher_name,
                                    t.username AS teacher_username
                             FROM learner_classes lc
                             LEFT JOIN classes c ON c.class_code = lc.class_code
                             LEFT JOIN usertable t ON t.uid = c.teacher_id
                             WHERE lc.uid = @Uid
                             ORDER BY lc.joined_at DESC
                             LIMIT 1";

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return null;
            }

            await using var command = new MySqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Uid", learnerId);

            await using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                var teacher = reader["teacher_name"]?.ToString();
                if (string.IsNullOrWhiteSpace(teacher))
                {
                    teacher = reader["teacher_username"]?.ToString();
                }

                return new LearnerClassInfo
                {
                    Code = reader["class_code"]?.ToString() ?? string.Empty,
                    Title = reader["title"]?.ToString() ?? "Your class",
                    TeacherName = teacher ?? string.Empty,
                    Description = reader["description"]?.ToString() ?? string.Empty,
                    GradeLevel = reader["grade_level"]?.ToString() ?? string.Empty
                };
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to load learner_classes for {learnerId}: {ex.Message}");
        }

        return null;
    }

    private async Task<List<AnnouncementDto>> FetchClassAnnouncementsAsync(string classCode)
    {
        var announcements = new List<AnnouncementDto>();
        if (string.IsNullOrWhiteSpace(classCode))
        {
            return announcements;
        }

        const string sql = @"SELECT title, body, posted_at
                             FROM class_announcements
                             WHERE class_code = @Code
                             ORDER BY posted_at DESC
                             LIMIT 5";

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return announcements;
            }

            await using var command = new MySqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Code", classCode);

            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                announcements.Add(new AnnouncementDto(
                    reader["title"]?.ToString() ?? "Announcement",
                    reader["body"]?.ToString() ?? string.Empty,
                    reader["posted_at"]?.ToString() ?? string.Empty
                ));
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to load class_announcements for {classCode}: {ex.Message}");
        }

        return announcements;
    }

    private async Task<List<ClassAssignmentDto>> FetchClassAssignmentsAsync(string learnerId, string classCode)
    {
        var assignments = new List<ClassAssignmentDto>();
        if (string.IsNullOrWhiteSpace(classCode))
        {
            return assignments;
        }

        const string sql = @"SELECT ca.assignment_id,
                                    ca.title,
                                    ca.due_at,
                                    COALESCE(la.completion_percent, 0) AS completion_percent,
                                    COALESCE(la.status, ca.status_template) AS status
                             FROM class_assignments ca
                             LEFT JOIN learner_assignments la
                               ON la.assignment_id = ca.assignment_id
                              AND la.uid = @Uid
                             WHERE ca.class_code = @Code
                             ORDER BY ca.due_at ASC";

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return assignments;
            }

            await using var command = new MySqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Uid", learnerId);
            command.Parameters.AddWithValue("@Code", classCode);

            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                assignments.Add(new ClassAssignmentDto(
                    reader["title"]?.ToString() ?? "Assignment",
                    reader["due_at"]?.ToString() ?? "—",
                    SafeToInt(reader["completion_percent"], 0),
                    reader["status"]?.ToString() ?? "Open"
                ));
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to load class_assignments for {classCode}: {ex.Message}");
        }

        return assignments;
    }

    private async Task<List<ClassModuleAssignmentDto>> FetchClassModulesAsync(string classCode, IEnumerable<ModuleCatalogueSectionDto> catalogue)
    {
        var modules = new List<ClassModuleAssignmentDto>();
        if (string.IsNullOrWhiteSpace(classCode))
        {
            return modules;
        }

        const string sql = @"SELECT module_id,
                                    assigned_at,
                                    due_date
                             FROM class_courses
                             WHERE class_code = @Code
                             ORDER BY COALESCE(due_date, assigned_at) ASC";

        var lookupCatalogue = catalogue ?? Enumerable.Empty<ModuleCatalogueSectionDto>();

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return modules;
            }

            await using var command = new MySqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Code", classCode);

            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var moduleId = reader["module_id"]?.ToString() ?? string.Empty;
                var assignedAt = ReadNullableDateTime(reader, "assigned_at");
                var dueDate = ReadNullableDateTime(reader, "due_date");
                var moduleMeta = ResolveModuleFromCatalogue(moduleId, lookupCatalogue);

                modules.Add(new ClassModuleAssignmentDto
                {
                    ModuleId = moduleId,
                    Number = moduleMeta?.Module.Number ?? moduleId,
                    Title = moduleMeta?.Module.Title ?? moduleId,
                    Grade = moduleMeta?.Grade ?? string.Empty,
                    Lessons = moduleMeta?.Module.Lessons?.ToList() ?? new List<string>(),
                    Link = moduleMeta?.Module.Link ?? string.Empty,
                    AssignedAt = FormatDateLabel(assignedAt),
                    DueDate = FormatDateLabel(dueDate)
                });
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to load class_courses for {classCode}: {ex.Message}");
        }

        return modules;
    }

    private async Task<List<CommunityThreadDto>> FetchCommunityThreadsAsync(CommunityThreadQuery query)
    {
        var threads = new List<CommunityThreadDto>();
        const string sql = @"SELECT t.thread_id,
                                    t.title,
                                    t.body,
                                    t.category,
                                    t.form_level,
                                    t.primary_tag,
                                    t.reply_count,
                                    t.last_reply_at,
                                    t.created_at,
                                    t.uid AS author_id,
                                    u.name AS author_name,
                                    u.username AS author_username
                             FROM community_threads t
                             LEFT JOIN usertable u ON u.uid = t.uid
                             WHERE (@Category IS NULL OR t.category = @Category)
                               AND (@Tag IS NULL OR t.primary_tag = @Tag)
                               AND (@Cursor IS NULL OR t.thread_id < @Cursor)
                             ORDER BY t.thread_id DESC
                             LIMIT @Limit";

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return SampleCommunityThreads();
            }

            await using var command = new MySqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Category", string.IsNullOrWhiteSpace(query.Category) ? (object)DBNull.Value : query.Category);
            command.Parameters.AddWithValue("@Tag", string.IsNullOrWhiteSpace(query.Tag) ? (object)DBNull.Value : query.Tag);

            if (long.TryParse(query.Cursor, out var cursorId) && cursorId > 0)
            {
                command.Parameters.AddWithValue("@Cursor", cursorId);
            }
            else
            {
                command.Parameters.AddWithValue("@Cursor", DBNull.Value);
            }

            command.Parameters.AddWithValue("@Limit", query.Limit);

            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var thread = MapCommunityThread(reader);
                threads.Add(thread);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to load community_threads: {ex.Message}");
            return SampleCommunityThreads();
        }

        return threads;
    }

    private async Task<CommunityThreadDto?> FetchCommunityThreadByIdAsync(long threadId)
    {
        const string sql = @"SELECT t.thread_id,
                                    t.title,
                                    t.body,
                                    t.category,
                                    t.form_level,
                                    t.primary_tag,
                                    t.reply_count,
                                    t.last_reply_at,
                                    t.created_at,
                                    t.uid AS author_id,
                                    u.name AS author_name,
                                    u.username AS author_username
                             FROM community_threads t
                             LEFT JOIN usertable u ON u.uid = t.uid
                             WHERE t.thread_id = @Id
                             LIMIT 1";

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return null;
            }

            await using var command = new MySqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Id", threadId);

            await using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return MapCommunityThread(reader);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to load community_thread {threadId}: {ex.Message}");
        }

        return null;
    }

    private async Task<CommunityReplyDto?> FetchCommunityReplyByIdAsync(long replyId)
    {
        const string sql = @"SELECT r.reply_id,
                                    r.body,
                                    r.created_at,
                                    r.uid AS author_id,
                                    u.name AS author_name,
                                    u.username AS author_username
                             FROM community_replies r
                             LEFT JOIN usertable u ON u.uid = r.uid
                             WHERE r.reply_id = @Id
                             LIMIT 1";

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return null;
            }

            await using var command = new MySqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Id", replyId);

            await using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                var createdAt = ReadNullableDateTime(reader, "created_at");
                return new CommunityReplyDto
                {
                    ReplyId = SafeToLong(reader["reply_id"], 0),
                    Body = reader["body"]?.ToString() ?? string.Empty,
                    CreatedLabel = FormatRelativeTime(createdAt),
                    Author = new CommunityAuthorDto
                    {
                        LearnerId = reader["author_id"]?.ToString() ?? string.Empty,
                        Name = reader["author_name"]?.ToString() ?? "Learner",
                        Username = reader["author_username"]?.ToString() ?? string.Empty
                    }
                };
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to load community_reply {replyId}: {ex.Message}");
        }

        return null;
    }

    private async Task<List<CommunityTagDto>> FetchCommunityTagsAsync()
    {
        var tags = new List<CommunityTagDto>();
        const string sql = @"SELECT slug, label, usage_count
                             FROM community_tags
                             ORDER BY usage_count DESC
                             LIMIT 8";

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return SampleCommunityTags();
            }

            await using var command = new MySqlCommand(sql, connection);

            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                tags.Add(new CommunityTagDto
                {
                    Slug = reader["slug"]?.ToString() ?? string.Empty,
                    Label = reader["label"]?.ToString() ?? string.Empty,
                    UsageCount = SafeToInt(reader["usage_count"], 0)
                });
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to load community_tags: {ex.Message}");
            return SampleCommunityTags();
        }

        return tags;
    }

    private async Task<List<CommunityReplyDto>> FetchCommunityRepliesAsync(long threadId, CommunityThreadDetailQuery query)
    {
        var replies = new List<CommunityReplyDto>();
        if (threadId <= 0)
        {
            return replies;
        }

        var options = query ?? new CommunityThreadDetailQuery();

        const string sql = @"SELECT r.reply_id,
                                    r.body,
                                    r.created_at,
                                    r.uid AS author_id,
                                    u.name AS author_name,
                                    u.username AS author_username
                             FROM community_replies r
                             LEFT JOIN usertable u ON u.uid = r.uid
                             WHERE r.thread_id = @ThreadId
                               AND (@Cursor IS NULL OR r.reply_id < @Cursor)
                             ORDER BY r.reply_id DESC
                             LIMIT @Limit";

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return SampleCommunityReplies();
            }

            await using var command = new MySqlCommand(sql, connection);
            command.Parameters.AddWithValue("@ThreadId", threadId);

            if (long.TryParse(options.Cursor, out var cursorId) && cursorId > 0)
            {
                command.Parameters.AddWithValue("@Cursor", cursorId);
            }
            else
            {
                command.Parameters.AddWithValue("@Cursor", DBNull.Value);
            }

            command.Parameters.AddWithValue("@Limit", options.Limit);

            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var createdAt = ReadNullableDateTime(reader, "created_at");
                replies.Add(new CommunityReplyDto
                {
                    ReplyId = SafeToLong(reader["reply_id"], 0),
                    Body = reader["body"]?.ToString() ?? string.Empty,
                    CreatedLabel = FormatRelativeTime(createdAt),
                    Author = new CommunityAuthorDto
                    {
                        LearnerId = reader["author_id"]?.ToString() ?? string.Empty,
                        Name = reader["author_name"]?.ToString() ?? "Learner",
                        Username = reader["author_username"]?.ToString() ?? string.Empty
                    }
                });
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to load community_replies for thread {threadId}: {ex.Message}");
            return SampleCommunityReplies();
        }

        return replies;
    }

    private static CommunityThreadDto MapCommunityThread(DbDataReader reader)
    {
        var createdAt = ReadNullableDateTime(reader, "created_at");
        var lastReplyAt = ReadNullableDateTime(reader, "last_reply_at") ?? createdAt;

        return new CommunityThreadDto
        {
            ThreadId = SafeToLong(reader["thread_id"], 0),
            Title = reader["title"]?.ToString() ?? "Community thread",
            Body = reader["body"]?.ToString() ?? string.Empty,
            Category = reader["category"]?.ToString() ?? string.Empty,
            FormLevel = reader["form_level"]?.ToString() ?? string.Empty,
            PrimaryTag = reader["primary_tag"]?.ToString() ?? string.Empty,
            ReplyCount = SafeToInt(reader["reply_count"], 0),
            LastReplyLabel = FormatRelativeTime(lastReplyAt),
            CreatedLabel = FormatRelativeTime(createdAt),
            Author = new CommunityAuthorDto
            {
                LearnerId = reader["author_id"]?.ToString() ?? string.Empty,
                Name = reader["author_name"]?.ToString() ?? "Learner",
                Username = reader["author_username"]?.ToString() ?? string.Empty
            }
        };
    }

    private static CommunityThreadDto BuildSampleThread(string title, string body, string category, string tag)
    {
        return new CommunityThreadDto
        {
            ThreadId = Math.Abs(title.GetHashCode()) + DateTime.UtcNow.Millisecond,
            Title = title,
            Body = string.IsNullOrWhiteSpace(body) ? "Thread posted while offline." : body,
            Category = category,
            FormLevel = category,
            PrimaryTag = tag,
            ReplyCount = 0,
            LastReplyLabel = "Just now",
            CreatedLabel = "Just now",
            Author = new CommunityAuthorDto
            {
                LearnerId = "sample",
                Name = "You",
                Username = "learner"
            }
        };
    }

    private static CommunityReplyDto BuildSampleReply(string message)
    {
        return new CommunityReplyDto
        {
            ReplyId = DateTime.UtcNow.Ticks,
            Body = message,
            CreatedLabel = "Just now",
            Author = new CommunityAuthorDto
            {
                LearnerId = "sample",
                Name = "You",
                Username = "learner"
            }
        };
    }

    private async Task SaveLearnerClassAsync(string learnerId, string classCode)
    {
        const string deleteSql = "DELETE FROM learner_classes WHERE uid = @Uid";
        const string insertSql = @"INSERT INTO learner_classes(uid, class_code, joined_at)
                                   VALUES (@Uid, @Code, NOW())";

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return;
            }

            await using var deleteCommand = new MySqlCommand(deleteSql, connection);
            deleteCommand.Parameters.AddWithValue("@Uid", learnerId);
            await deleteCommand.ExecuteNonQueryAsync();

            await using var insertCommand = new MySqlCommand(insertSql, connection);
            insertCommand.Parameters.AddWithValue("@Uid", learnerId);
            insertCommand.Parameters.AddWithValue("@Code", classCode);
            await insertCommand.ExecuteNonQueryAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to save learner_classes for {learnerId}: {ex.Message}");
        }
    }

    private async Task<List<PastPaperDto>> FetchPastPapersFromDbAsync(string learnerId, string year, string type, string topic)
    {
        var papers = new List<PastPaperDto>();
        var conditions = new List<string>();

        if (!string.IsNullOrWhiteSpace(year))
        {
            conditions.Add("year = @Year");
        }
        if (!string.IsNullOrWhiteSpace(type))
        {
            conditions.Add("paper_type = @Type");
        }
        if (!string.IsNullOrWhiteSpace(topic))
        {
            conditions.Add("topic = @Topic");
        }

        var whereClause = conditions.Any() ? $"WHERE {string.Join(" AND ", conditions)}" : string.Empty;
        var sql = $@"SELECT title, details, resource_url
                     FROM past_papers
                     {whereClause}
                     ORDER BY year DESC, title ASC
                     LIMIT 25";

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return SamplePastPapers();
            }

            await using var command = new MySqlCommand(sql, connection);
            if (!string.IsNullOrWhiteSpace(year))
            {
                command.Parameters.AddWithValue("@Year", year);
            }
            if (!string.IsNullOrWhiteSpace(type))
            {
                command.Parameters.AddWithValue("@Type", type);
            }
            if (!string.IsNullOrWhiteSpace(topic))
            {
                command.Parameters.AddWithValue("@Topic", topic);
            }

            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                papers.Add(new PastPaperDto(
                    reader["title"]?.ToString() ?? "Past paper",
                    reader["details"]?.ToString() ?? string.Empty,
                    reader["resource_url"]?.ToString() ?? string.Empty
                ));
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to load past_papers for {learnerId}: {ex.Message}");
        }

        return papers.Any() ? papers : SamplePastPapers();
    }

    private async Task<List<NotificationPreferenceDto>> FetchNotificationPreferencesAsync(string learnerId)
    {
        var preferences = new List<NotificationPreferenceDto>();
        const string sql = @"SELECT pref_key, pref_value
                             FROM learner_preferences
                             WHERE uid = @Uid";

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return preferences;
            }

            await using var command = new MySqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Uid", learnerId);

            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var key = reader["pref_key"]?.ToString() ?? "preference";
                var value = reader["pref_value"]?.ToString() ?? string.Empty;
                var mapped = key switch
                {
                    "daily_nudge" => new NotificationPreferenceDto("Daily streak nudges", value, false),
                    "coach_feedback" => new NotificationPreferenceDto("Coach feedback alerts", value, false),
                    "exam_countdown" => new NotificationPreferenceDto("Exam countdown", value, true),
                    _ => new NotificationPreferenceDto(key, value)
                };
                preferences.Add(mapped);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to load learner_preferences for {learnerId}: {ex.Message}");
        }

        if (!preferences.Any())
        {
            preferences.AddRange(new[]
            {
                new NotificationPreferenceDto("Daily streak nudges", "Sent at 8:00 PM GMT+8"),
                new NotificationPreferenceDto("Coach feedback alerts", "Push + email"),
                new NotificationPreferenceDto("Exam countdown", "Weekly digest on Fridays", true)
            });
        }

        return preferences;
    }

    private async Task<LearnerRecord?> FetchLearnerAsync(string learnerId)
    {
        if (string.IsNullOrWhiteSpace(_connectionString) || string.IsNullOrWhiteSpace(learnerId))
        {
            return null;
        }

        try
        {
            await using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();
            await using var command = new MySqlCommand("SELECT uid, username, name, email, usertype FROM usertable WHERE uid = @Uid LIMIT 1", connection);
            command.Parameters.AddWithValue("@Uid", learnerId);

            await using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return new LearnerRecord
                {
                    LearnerId = reader["uid"]?.ToString() ?? learnerId,
                    Username = reader["username"]?.ToString() ?? string.Empty,
                    Name = reader["name"]?.ToString() ?? string.Empty,
                    Email = reader["email"]?.ToString() ?? string.Empty,
                    UserType = reader["usertype"]?.ToString() ?? string.Empty
                };
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Unable to fetch learner {learnerId}: {ex.Message}");
        }

        return null;
    }

    /// <summary>
    /// Gets assigned modules with due dates for a learner
    /// </summary>
    public async Task<IEnumerable<KiraKira5.Models.LearnerAssignedModule>> GetAssignedModulesAsync(string learnerId)
    {
        var assignments = new List<KiraKira5.Models.LearnerAssignedModule>();
        const string sql = @"SELECT cma.assignment_id, cma.module_id, cma.due_date, cma.assigned_at,
                                    tc.class_name, smp.is_completed, smp.completed_at
                             FROM class_module_assignments cma
                             JOIN class_enrollments ce ON cma.class_id = ce.class_id
                             JOIN teacher_classes tc ON cma.class_id = tc.class_id
                             LEFT JOIN student_module_progress smp ON cma.assignment_id = smp.assignment_id AND smp.student_id = @LearnerId
                             WHERE ce.student_id = @LearnerId
                             ORDER BY cma.due_date ASC";

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return assignments;
            }

            await using var command = new MySqlCommand(sql, connection);
            command.Parameters.AddWithValue("@LearnerId", learnerId);

            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                assignments.Add(new KiraKira5.Models.LearnerAssignedModule
                {
                    AssignmentId = SafeToInt(reader["assignment_id"], 0),
                    ModuleId = reader["module_id"]?.ToString() ?? string.Empty,
                    ModuleName = reader["module_id"]?.ToString() ?? string.Empty,
                    ClassName = reader["class_name"]?.ToString() ?? string.Empty,
                    DueDate = reader["due_date"] is DateTime dueDate ? dueDate : DateTime.MinValue,
                    AssignedAt = reader["assigned_at"] is DateTime assignedAt ? assignedAt : DateTime.MinValue,
                    IsCompleted = reader["is_completed"] != DBNull.Value && Convert.ToBoolean(reader["is_completed"]),
                    CompletedAt = reader["completed_at"] is DateTime completedAt ? completedAt : null
                });
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to load assigned modules for {learnerId}: {ex.Message}");
        }

        return assignments;
    }

    private class LearnerRecord
    {
        public string LearnerId { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string UserType { get; set; } = string.Empty;
    }

    private sealed class ModuleProgressState
    {
        public int ProgressPercent { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    private sealed class TopicProgressState
    {
        public string Status { get; set; } = string.Empty;
        public int? ScorePercent { get; set; }
    }

    private sealed class LearnerModuleSelectionRecord
    {
        public string ModuleId { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
    }

    private sealed class LearnerStreakState
    {
        public int Current { get; set; }
        public int Longest { get; set; }
        public int XpToNextLevel { get; set; } = BaseLevelXp;
        public DateTime? LastActivityOn { get; set; }
        public string LastActivitySource { get; set; } = string.Empty;
    }

    private sealed class StreakUpdateResult
    {
        public bool Counted { get; set; }
        public DateTime ActivityDate { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}

#region DTOs

public class LearnerDashboardDto
{
    public LearnerProfileDto Profile { get; set; } = new();
    public LearnerMissionDto Mission { get; set; } = new();
    public LearnerStreakDto Streak { get; set; } = new();
    public IEnumerable<LearnerHighlightStat> HighlightStats { get; set; } = new List<LearnerHighlightStat>();
    public LearnerModuleSnapshot Modules { get; set; } = new();
    public LearnerBadgeStatsDto Badges { get; set; } = new();
}

public class LearnerProfileDto
{
    public string LearnerId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = string.Empty;
    public string Motto { get; set; } = string.Empty;
    public int Level { get; set; }
    public int Xp { get; set; }
    public string School { get; set; } = string.Empty;
    public string GradeYear { get; set; } = string.Empty;
    public BadgeChipDto? FeaturedBadge { get; set; }
}

public class LearnerMissionDto
{
    public string Badge { get; set; } = string.Empty;
    public string Grade { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Mood { get; set; } = string.Empty;
    public int Confidence { get; set; }
    public string Mode { get; set; } = string.Empty;
    public bool WantsVideos { get; set; }
}

public class LearnerStreakDto
{
    public int Current { get; set; }
    public int Longest { get; set; }
    public int XpToNextLevel { get; set; }
    public string Status { get; set; } = string.Empty;
    public string LevelLabel { get; set; } = string.Empty;
}

public class StudyActivityResultDto
{
    public string Source { get; set; } = string.Empty;
    public DateTime ActivityDate { get; set; } = DateTime.UtcNow;
    public bool Logged { get; set; }
    public bool StreakUpdated { get; set; }
    public string Message { get; set; } = string.Empty;
    public LearnerStreakDto? Streak { get; set; }
}

public class LearnerHighlightStat
{
    public string Label { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Detail { get; set; } = string.Empty;
    public int? ProgressPercent { get; set; }
    public string Chip { get; set; } = string.Empty;
}

public class LearnerModuleSnapshot
{
    public IEnumerable<ModuleCardDto> ActiveModules { get; set; } = new List<ModuleCardDto>();
    public IEnumerable<ModuleCatalogueSectionDto> Catalogue { get; set; } = new List<ModuleCatalogueSectionDto>();
}

public class LearnerXpSnapshot
{
    public int TotalXp { get; set; }
    public int Level { get; set; }
    public int XpToNextLevel { get; set; }
}

public class LearnerFeaturedBadgeDto
{
    public string BadgeId { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string Style { get; set; } = "level";
}

public class ModuleSelectionResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string ModuleId { get; set; } = string.Empty;
    public IEnumerable<ModuleCardDto> ActiveModules { get; set; } = new List<ModuleCardDto>();
}

public class ModuleProgressResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string ModuleId { get; set; } = string.Empty;
    public string UnitId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public IEnumerable<ModuleCardDto> ActiveModules { get; set; } = new List<ModuleCardDto>();
    public LearnerStreakDto? Streak { get; set; }
    public LearnerXpSnapshot? XpSnapshot { get; set; }
}

public class LiveProgressSnapshotDto
{
    public double AverageStreakDays { get; set; }
    public int ActiveLearnerCount { get; set; }
    public double Form5AccuracyPercent { get; set; }
    public int Form5AttemptCount { get; set; }
    public int AssignmentsCompleted { get; set; }
    public string StreakWindowLabel { get; set; } = string.Empty;
    public string AccuracyWindowLabel { get; set; } = string.Empty;
    public string AssignmentsWindowLabel { get; set; } = string.Empty;
}

public class ModuleCatalogueSectionDto
{
    public string Grade { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<ModuleCardDto> Modules { get; set; } = new();
}

public class ModuleCardDto
{
    public ModuleCardDto() { }

    public ModuleCardDto(string number, string title, List<string> lessons, string? link = null, int? progressPercent = null)
    {
        Number = number;
        Title = title;
        Lessons = lessons;
        Link = link ?? string.Empty;
        ProgressPercent = progressPercent;
    }

    public string ModuleId { get; set; } = string.Empty;
    public string Number { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Grade { get; set; } = string.Empty;
    public List<string> Lessons { get; set; } = new();
    public string Link { get; set; } = string.Empty;
    public int? ProgressPercent { get; set; }
    public List<ModuleUnitDto> Units { get; set; } = new();
}

public class ModuleUnitDto
{
    public string UnitId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Duration { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public List<string> Objectives { get; set; } = new();
    public List<ModuleUnitResourceDto> Resources { get; set; } = new();
    public ModuleUnitCtaDto? Cta { get; set; }
    public bool RescueOnly { get; set; }
}

public class ModuleUnitResourceDto
{
    public string Label { get; set; } = string.Empty;
    public string Detail { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
}

public class ModuleUnitCtaDto
{
    public string Label { get; set; } = string.Empty;
    public string Link { get; set; } = string.Empty;
    public string Kind { get; set; } = string.Empty;
}

public class LearnerBadgeStatsDto
{
    public Dictionary<string, int> Stats { get; set; } = new(StringComparer.OrdinalIgnoreCase);
    public IEnumerable<BadgeCollectionDto> Collections { get; set; } = new List<BadgeCollectionDto>();
}

public class BadgeCollectionDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Metric { get; set; } = string.Empty;
    public string Style { get; set; } = string.Empty;
    public bool Secret { get; set; }
    public IEnumerable<BadgeRewardDto> Rewards { get; set; } = new List<BadgeRewardDto>();
}

public class BadgeRewardDto
{
    public BadgeRewardDto() { }

    public BadgeRewardDto(int value, string label, string? image = null, string? emoji = null)
    {
        Value = value;
        Label = label;
        Image = image ?? string.Empty;
        Emoji = emoji ?? string.Empty;
    }

    public int Value { get; set; }
    public string Label { get; set; } = string.Empty;
    public string LockedLabel { get; set; } = string.Empty;
    public string Hint { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Requirement { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public string Emoji { get; set; } = string.Empty;
}

public class LearnerProgressDto
{
    public int OverallPercent { get; set; }
    public int WeeklyDelta { get; set; }
    public IEnumerable<TopicProgressDto> Topics { get; set; } = new List<TopicProgressDto>();
    public IEnumerable<CheckpointDto> Checkpoints { get; set; } = new List<CheckpointDto>();
    public string ReportUrl { get; set; } = string.Empty;
    public MotivationDto Motivation { get; set; } = new();
}

public class TopicProgressDto
{
    public TopicProgressDto() { }

    public TopicProgressDto(string title, int percent, string? note = null)
    {
        Title = title;
        Percent = percent;
        Note = note ?? string.Empty;
    }

    public string Title { get; set; } = string.Empty;
    public int Percent { get; set; }
    public string Note { get; set; } = string.Empty;
}

public class CheckpointDto
{
    public CheckpointDto() { }

    public CheckpointDto(string title, string note, string cta, bool primary = false)
    {
        Title = title;
        Note = note;
        Cta = cta;
        Primary = primary;
    }

    public string Title { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public string Cta { get; set; } = string.Empty;
    public bool Primary { get; set; }
}

public class MotivationDto
{
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
}

public class LearnerClassesDto
{
    public bool HasEnrollment { get; set; }
    public LearnerClassInfo ClassInfo { get; set; } = new();
    public IEnumerable<AnnouncementDto> Announcements { get; set; } = new List<AnnouncementDto>();
    public IEnumerable<TopicProgressDto> OngoingTopics { get; set; } = new List<TopicProgressDto>();
    public IEnumerable<ClassAssignmentDto> Assignments { get; set; } = new List<ClassAssignmentDto>();
    public IEnumerable<ClassModuleAssignmentDto> ClassModules { get; set; } = new List<ClassModuleAssignmentDto>();
    public IEnumerable<ModuleCatalogueSectionDto> Catalogue { get; set; } = new List<ModuleCatalogueSectionDto>();
}

public class CommunityFeedDto
{
    public IEnumerable<CommunityThreadDto> Threads { get; set; } = new List<CommunityThreadDto>();
    public IEnumerable<CommunityTagDto> TrendingTags { get; set; } = new List<CommunityTagDto>();
    public CommunityThreadFiltersDto Filters { get; set; } = new();
    public string? NextCursor { get; set; }
}

public class CommunityThreadDetailDto
{
    public CommunityThreadDto Thread { get; set; } = new();
    public IEnumerable<CommunityReplyDto> Replies { get; set; } = new List<CommunityReplyDto>();
    public string? NextCursor { get; set; }
}

public class CommunityThreadDto
{
    public long ThreadId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string FormLevel { get; set; } = string.Empty;
    public string PrimaryTag { get; set; } = string.Empty;
    public int ReplyCount { get; set; }
    public string LastReplyLabel { get; set; } = string.Empty;
    public string CreatedLabel { get; set; } = string.Empty;
    public CommunityAuthorDto Author { get; set; } = new();
}

public class CommunityThreadFiltersDto
{
    public IEnumerable<string> AvailableCategories { get; set; } = new List<string>();
    public string ActiveCategory { get; set; } = string.Empty;
    public string ActiveTag { get; set; } = string.Empty;
}

public class CommunityAuthorDto
{
    public string LearnerId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
}

public class CommunityTagDto
{
    public string Slug { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public int UsageCount { get; set; }
}

public class CommunityReplyDto
{
    public long ReplyId { get; set; }
    public string Body { get; set; } = string.Empty;
    public string CreatedLabel { get; set; } = string.Empty;
    public CommunityAuthorDto Author { get; set; } = new();
}

public class CommunityProfileCardDto
{
    public string LearnerId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = string.Empty;
    public string Motto { get; set; } = string.Empty;
    public int Level { get; set; }
    public int Xp { get; set; }
    public string Rank { get; set; } = "Learner";
    public int StreakDays { get; set; }
    public BadgeChipDto? FeaturedBadge { get; set; }
}

public class BadgeChipDto
{
    public string Id { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string Style { get; set; } = "level";
}

public class LearnerClassInfo
{
    public string Title { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string TeacherName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string GradeLevel { get; set; } = string.Empty;
}

public class AnnouncementDto
{
    public AnnouncementDto() { }

    public AnnouncementDto(string title, string detail, string timestamp)
    {
        Title = title;
        Detail = detail;
        Timestamp = timestamp;
    }

    public string Title { get; set; } = string.Empty;
    public string Detail { get; set; } = string.Empty;
    public string Timestamp { get; set; } = string.Empty;
}

public class ClassAssignmentDto
{
    public ClassAssignmentDto() { }

    public ClassAssignmentDto(string title, string due, int percent, string status)
    {
        Title = title;
        DueDate = due;
        CompletionPercent = percent;
        Status = status;
    }

    public string Title { get; set; } = string.Empty;
    public string DueDate { get; set; } = string.Empty;
    public int CompletionPercent { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class ClassModuleAssignmentDto
{
    public string ModuleId { get; set; } = string.Empty;
    public string Number { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Grade { get; set; } = string.Empty;
    public IEnumerable<string> Lessons { get; set; } = new List<string>();
    public string Link { get; set; } = string.Empty;
    public string AssignedAt { get; set; } = string.Empty;
    public string DueDate { get; set; } = string.Empty;
}

public class LearnerPastPapersDto
{
    public IEnumerable<PastPaperDto> Papers { get; set; } = new List<PastPaperDto>();
    public IEnumerable<ChecklistItemDto> Checklist { get; set; } = new List<ChecklistItemDto>();
    public TipDto Tip { get; set; } = new();
}

public class PastPaperDto
{
    public PastPaperDto() { }

    public PastPaperDto(string title, string details, string resource)
    {
        Title = title;
        Details = details;
        Resource = resource;
    }

    public string Title { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public string Resource { get; set; } = string.Empty;
}

public class ChecklistItemDto
{
    public ChecklistItemDto() { }

    public ChecklistItemDto(string title, string detail, bool primary = false)
    {
        Title = title;
        Detail = detail;
        Primary = primary;
    }

    public string Title { get; set; } = string.Empty;
    public string Detail { get; set; } = string.Empty;
    public bool Primary { get; set; }
}

public class TipDto
{
    public string Title { get; set; } = string.Empty;
    public string Badge { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
}

public class LearnerProfilePayload
{
    public LearnerProfileDto Profile { get; set; } = new();
    public ContactInfoDto Contact { get; set; } = new();
    public SchoolInfoDto School { get; set; } = new();
    public IEnumerable<NotificationPreferenceDto> Notifications { get; set; } = new List<NotificationPreferenceDto>();
    public LearnerBadgeStatsDto Badges { get; set; } = new();
    public LearnerMissionDto Mission { get; set; } = new();
}

public class ContactInfoDto
{
    public string Email { get; set; } = string.Empty;
}

public class SchoolInfoDto
{
    public string School { get; set; } = string.Empty;
    public string Year { get; set; } = string.Empty;
}

public class NotificationPreferenceDto
{
    public NotificationPreferenceDto() { }

    public NotificationPreferenceDto(string title, string detail, bool primary = false)
    {
        Title = title;
        Detail = detail;
        Primary = primary;
    }

    public string Title { get; set; } = string.Empty;
    public string Detail { get; set; } = string.Empty;
    public bool Primary { get; set; }
}

#endregion


