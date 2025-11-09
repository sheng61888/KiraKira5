using Microsoft.Extensions.Configuration;
using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Data.Common;
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
}

/// <summary>
/// Temporary implementation backed by sample data. Replace with DB queries next.
/// </summary>
public class LearnerService : ILearnerService
{
    private readonly IConfiguration _configuration;
    private readonly string _connectionString;
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
        var topics = await FetchTopicsAsync(learnerId);
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
        var topics = (await FetchTopicsAsync(learnerId)).Take(3).ToList();
        if (!topics.Any())
        {
            topics = moduleSnapshot.Catalogue
                .SelectMany(section => section.Modules)
                .Take(3)
                .Select(module => new TopicProgressDto(module.Title, module.ProgressPercent ?? 0, string.Empty))
                .ToList();
        }

        var assignments = await FetchClassAssignmentsAsync(learnerId, classInfo.Code);

        return new LearnerClassesDto
        {
            HasEnrollment = true,
            ClassInfo = classInfo,
            Announcements = announcements,
            OngoingTopics = topics,
            Assignments = assignments,
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

    public async Task<LearnerProfilePayload> GetProfileAsync(string learnerId)
    {
        var record = await FetchLearnerAsync(learnerId);
        var profile = await FetchProfileDtoAsync(learnerId, record);
        var streak = await FetchStreakDtoAsync(learnerId, profile);
        var notifications = await FetchNotificationPreferencesAsync(learnerId);
        var badges = await BuildBadgeStatsAsync(learnerId, profile, streak);

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
            Badges = badges
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

    private static LearnerBadgeStatsDto SampleBadgeStats()
    {
        return new LearnerBadgeStatsDto
        {
            Stats = new Dictionary<string, int>
            {
                { "level", 3 },
                { "streak", 7 },
                { "cats", 2 },
                { "ghibli", 1 },
                { "hidden", 0 }
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
                    new BadgeRewardDto(1, "Bronze Paw", "../images/level/bronze.png"),
                    new BadgeRewardDto(3, "Silver Whisker", "../images/level/silver.png"),
                    new BadgeRewardDto(5, "Gold Guardian", "../images/level/gold.png"),
                    new BadgeRewardDto(8, "Rainbow Sage", "../images/level/rainbow.png")
                }
            },
            new BadgeCollectionDto
            {
                Id = "streak",
                Title = "Streak Sparks",
                Description = "Keep the flame alive with consecutive study days.",
                Metric = "streak",
                Style = "streak",
                Rewards = new List<BadgeRewardDto>
                {
                    new BadgeRewardDto(0, "Dormant Seed", "../images/streak/0.png"),
                    new BadgeRewardDto(1, "Day 1 Sprout", "../images/streak/1.png"),
                    new BadgeRewardDto(3, "Day 3 Leaves", "../images/streak/3.png"),
                    new BadgeRewardDto(7, "Full Bloom", "../images/streak/7.png")
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
                    new ModuleCardDto("01", "Quadratic Functions and Equations in One Variable", new List<string> { "Quadratic Functions", "Quadratic Equations" }, "lesson-form4-01.html", 100),
                    new ModuleCardDto("02", "Number Bases", new List<string> { "Number Bases" }, "lesson-form4-02.html", 62),
                    new ModuleCardDto("03", "Logical Reasoning", new List<string> { "Statements", "Arguments" }, "lesson-form4-03.html", 35),
                    new ModuleCardDto("04", "Operations on Sets", new List<string> { "Intersection of Sets", "Union of Sets", "Combined Operations on Sets" }, "lesson-form4-04.html"),
                    new ModuleCardDto("05", "Network in Graph Theory", new List<string> { "Network" }, "lesson-form4-05.html")
                }
            },
            new ModuleCatalogueSectionDto
            {
                Grade = "Form 5",
                Title = "Form 5 Mathematics (KSSM)",
                Description = "Exam-focused topics that complete the SPM Modern Math syllabus.",
                Modules = new List<ModuleCardDto>
                {
                    new ModuleCardDto("01", "Variation", new List<string> { "Direct Variation", "Inverse Variation", "Joint Variation" }),
                    new ModuleCardDto("02", "Matrices", new List<string> { "Matrices", "Basic Operations on Matrices" }),
                    new ModuleCardDto("03", "Consumer Mathematics: Insurance", new List<string> { "Risk and Insurance Protection" }),
                    new ModuleCardDto("04", "Consumer Mathematics: Taxation", new List<string> { "Taxation" })
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

    private async Task<LearnerProfileDto> FetchProfileDtoAsync(string learnerId, LearnerRecord? identity)
    {
        var profile = BuildProfile(learnerId, identity);
        const string sql = @"SELECT full_name, school, grade_year, motto, avatar_url, level, xp
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
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to load learner_profile for {learnerId}: {ex.Message}");
        }

        profile.AvatarUrl = NormalizeAvatarPath(profile.AvatarUrl);
        return profile;
    }

    private static LearnerProfileDto BuildProfile(string learnerId, LearnerRecord? record)
    {
        return new LearnerProfileDto
        {
            LearnerId = record?.LearnerId ?? learnerId,
            Name = record?.Name ?? record?.Username ?? "Learner",
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

    private async Task<LearnerStreakDto> FetchStreakDtoAsync(string learnerId, LearnerProfileDto profile)
    {
        var streak = new LearnerStreakDto
        {
            Current = 0,
            Longest = 0,
            XpToNextLevel = Math.Max(0, 1000 - profile.Xp),
            Status = "Start your streak",
            LevelLabel = $"Level {profile.Level} • {profile.Xp} XP"
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
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to load learner_streak for {learnerId}: {ex.Message}");
        }

        streak.Status = streak.Current > 0 ? $"🔥 {streak.Current}-day streak" : "Ready to start your streak";
        streak.LevelLabel = $"Level {profile.Level} • {profile.Xp} XP";

        return streak;
    }

    private async Task<LearnerModuleSnapshot> BuildModuleSnapshotAsync(string learnerId)
    {
        var catalogue = SampleModules().ToList();
        var progress = await FetchModuleProgressAsync(learnerId);
        var allModules = new List<ModuleCardDto>();

        foreach (var section in catalogue)
        {
            foreach (var module in section.Modules)
            {
                var keys = new List<string>
                {
                    module.Link ?? string.Empty,
                    module.Number,
                    $"{section.Grade?.Replace(" ", string.Empty).ToLowerInvariant()}-{module.Number}"
                };

                foreach (var key in keys.Where(k => !string.IsNullOrWhiteSpace(k)))
                {
                    if (progress.TryGetValue(key, out var state))
                    {
                        module.ProgressPercent = state.ProgressPercent;
                        break;
                    }
                }

                allModules.Add(module);
            }
        }

        var activeModules = allModules
            .Where(m => (m.ProgressPercent ?? 0) > 0)
            .OrderByDescending(m => m.ProgressPercent)
            .ThenBy(m => m.Number)
            .Take(3)
            .ToList();

        if (!activeModules.Any())
        {
            activeModules = allModules.Take(3).ToList();
        }

        return new LearnerModuleSnapshot
        {
            ActiveModules = activeModules,
            Catalogue = catalogue
        };
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

        badgeStats.Stats["level"] = profile.Level;
        badgeStats.Stats["streak"] = streak.Current;

        if (modules != null)
        {
            var completed = modules.Catalogue
                .SelectMany(section => section.Modules)
                .Count(module => (module.ProgressPercent ?? 0) >= 95);
            var inProgress = modules.Catalogue
                .SelectMany(section => section.Modules)
                .Count(module => (module.ProgressPercent ?? 0) >= 35 && (module.ProgressPercent ?? 0) < 95);

            badgeStats.Stats["cats"] = completed;
            badgeStats.Stats["ghibli"] = inProgress;
        }

        var earnedBadgeMetrics = await FetchLearnerBadgeMetricsAsync(learnerId);
        foreach (var kvp in earnedBadgeMetrics)
        {
            var key = kvp.Key?.Trim().ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(key))
            {
                continue;
            }

            badgeStats.Stats[key] = kvp.Value;
        }

        return badgeStats;
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

    private async Task<List<TopicProgressDto>> FetchTopicsAsync(string learnerId)
    {
        var topics = new List<TopicProgressDto>();
        const string sql = @"SELECT topic_code, percent, coach_note
                             FROM learner_topics_progress
                             WHERE uid = @Uid
                             ORDER BY COALESCE(updated_at, CURRENT_TIMESTAMP) DESC";

        try
        {
            await using var connection = await OpenConnectionAsync();
            if (connection == null)
            {
                return topics;
            }

            await using var command = new MySqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Uid", learnerId);

            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var title = reader["topic_code"]?.ToString() ?? "Topic";
                var percent = SafeToInt(reader["percent"], 0);
                var note = reader["coach_note"]?.ToString() ?? string.Empty;
                topics.Add(new TopicProgressDto(title, percent, note));
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LearnerService] Failed to load learner_topics_progress for {learnerId}: {ex.Message}");
        }

        return topics;
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
                                    c.coach_name
                             FROM learner_classes lc
                             LEFT JOIN classes c ON c.class_code = lc.class_code
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
                var title = reader["title"]?.ToString() ?? "Your class";
                var coach = reader["coach_name"]?.ToString();
                if (!string.IsNullOrWhiteSpace(coach))
                {
                    title = $"{title} - {coach}";
                }

                return new LearnerClassInfo
                {
                    Code = reader["class_code"]?.ToString() ?? string.Empty,
                    Title = title
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

    public string Number { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public List<string> Lessons { get; set; } = new();
    public string Link { get; set; } = string.Empty;
    public int? ProgressPercent { get; set; }
}

public class LearnerBadgeStatsDto
{
    public Dictionary<string, int> Stats { get; set; } = new();
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
    public IEnumerable<ModuleCatalogueSectionDto> Catalogue { get; set; } = new List<ModuleCatalogueSectionDto>();
}

public class LearnerClassInfo
{
    public string Title { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
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
