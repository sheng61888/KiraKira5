using Microsoft.Extensions.Configuration;
using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
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
}

/// <summary>
/// Temporary implementation backed by sample data. Replace with DB queries next.
/// </summary>
public class LearnerService : ILearnerService
{
    private readonly IConfiguration _configuration;
    private readonly string _connectionString;

    public LearnerService(IConfiguration configuration)
    {
        _configuration = configuration;
        _connectionString = _configuration.GetConnectionString("KiraKiraDB") ?? string.Empty;
    }

    public async Task<LearnerDashboardDto> GetDashboardAsync(string learnerId)
    {
        var learnerRecord = await FetchLearnerAsync(learnerId);
        var profile = BuildProfile(learnerId, learnerRecord);
        var modules = SampleModules();
        var badgeStats = SampleBadgeStats();
        return new LearnerDashboardDto
        {
            Profile = profile,
            Mission = new LearnerMissionDto
            {
                Badge = $"{profile.Name}'s path",
                Grade = "Form 4",
                Title = "Your mission briefing",
                Mood = "Let’s stack some easy wins with Algebra drills today.",
                Confidence = 45,
                Mode = "Momentum mode",
                WantsVideos = true
            },
            Streak = new LearnerStreakDto
            {
                Current = 7,
                Longest = 14,
                XpToNextLevel = 350,
                Status = "🔥 7-day streak",
                LevelLabel = "Level 3 • 1200 XP"
            },
            HighlightStats = new List<LearnerHighlightStat>
            {
                new LearnerHighlightStat { Label = "XP to next level", Value = "350", Detail = "Keep up the streak to level up by Friday.", ProgressPercent = 72 },
                new LearnerHighlightStat { Label = "Weekly focus", Value = "Algebra", Detail = "3 / 5 focus sessions completed.", ProgressPercent = 60 },
                new LearnerHighlightStat { Label = "Upcoming", Value = "4:30 PM", Detail = "Coordinate Geometry class with Mr. Tan.", Chip = "Starts in 2h 15m" }
            },
            Modules = new LearnerModuleSnapshot
            {
                ActiveModules = modules.SelectMany(m => m.Modules).Take(3).ToList(),
                Catalogue = modules.ToList()
            },
            Badges = badgeStats
        };
    }

    public Task<LearnerProgressDto> GetProgressAsync(string learnerId)
    {
        return Task.FromResult(new LearnerProgressDto
        {
            OverallPercent = 75,
            WeeklyDelta = 8,
            Topics = new List<TopicProgressDto>
            {
                new TopicProgressDto("Algebra Basics", 100, "Completed 🎉 — ready for mastery quiz."),
                new TopicProgressDto("Quadratic Equations", 65, "In progress — review mistakes from last drill."),
                new TopicProgressDto("Coordinate Geometry", 45, "In progress — live class today will push this to 60%."),
                new TopicProgressDto("Statistics", 25, "Just started — plan a catch-up session this weekend.")
            },
            Checkpoints = new List<CheckpointDto>
            {
                new CheckpointDto("Finish Quadratics drill", "Score ≥ 80% to stay on track.", "Open"),
                new CheckpointDto("Upload Geometry notes", "Coach Tan leaves feedback in 24h.", "Upload"),
                new CheckpointDto("Schedule Statistics catch-up", "Pick a weekend slot.", "Book", true)
            },
            ReportUrl = "/reports/learner-progress.pdf",
            Motivation = new MotivationDto
            {
                Title = "You're doing amazing! 🐾",
                Body = "Keep going — every problem solved brings you closer to mastery!"
            }
        });
    }

    public async Task<LearnerClassesDto> GetClassesAsync(string learnerId)
    {
        var learnerRecord = await FetchLearnerAsync(learnerId);
        var modules = SampleModules();
        return new LearnerClassesDto
        {
            HasEnrollment = learnerRecord != null,
            ClassInfo = new LearnerClassInfo
            {
                Title = "Form 5 Mathematics - Mr. Tan",
                Code = "MATH2025-A1"
            },
            Announcements = new List<AnnouncementDto>
            {
                new AnnouncementDto("Mock exam review uploaded", "Check the shared drive for official answers.", "1h ago"),
                new AnnouncementDto("Bring geometry sets tomorrow", "We’re constructing loci in class.", "4h ago"),
                new AnnouncementDto("Clinic slots open", "Book a 1:1 for tricky probability questions.", "Yesterday")
            },
            OngoingTopics = new List<TopicProgressDto>
            {
                new TopicProgressDto("Linear Functions", 80),
                new TopicProgressDto("Quadratic Equations", 40),
                new TopicProgressDto("Coordinate Geometry", 10)
            },
            Assignments = new List<ClassAssignmentDto>
            {
                new ClassAssignmentDto("Algebra Practice Set", "Oct 20, 2025", 100, "Completed"),
                new ClassAssignmentDto("Quadratic Quiz", "Oct 25, 2025", 60, "In progress")
            },
            Catalogue = modules.ToList()
        };
    }

    public async Task<LearnerClassesDto> JoinClassAsync(string learnerId, string classCode)
    {
        // Eventually persist enrollment; for now just echo back an enrolled dashboard.
        var data = await GetClassesAsync(learnerId);
        data.HasEnrollment = true;
        data.ClassInfo.Code = classCode;
        return data;
    }

    public Task<LearnerPastPapersDto> GetPastPapersAsync(string learnerId, string year, string type, string topic)
    {
        var papers = new List<PastPaperDto>
        {
            new PastPaperDto("SPM Mathematics 2023 Paper 2", "Structured · 45 marks · Moderate difficulty", "resources/SPM_Math_2023_P2.pdf"),
            new PastPaperDto("SPM Mathematics 2022 Paper 1", "Objective · 40 marks · Easy difficulty", "resources/SPM_Math_2022_P1.pdf"),
            new PastPaperDto("SPM Mathematics 2021 Paper 2", "Structured · 45 marks · Hard difficulty", "resources/SPM_Math_2021_P2.pdf")
        };

        return Task.FromResult(new LearnerPastPapersDto
        {
            Papers = papers,
            Checklist = new List<ChecklistItemDto>
            {
                new ChecklistItemDto("Complete 2 timed papers", "Recommended pace: 1 per week"),
                new ChecklistItemDto("Review marking scheme", "Highlight careless mistakes"),
                new ChecklistItemDto("Log reflections", "Capture what to improve next time", true)
            },
            Tip = new TipDto
            {
                Title = "Streak tip",
                Badge = "After each paper",
                Body = "Snap a photo of one “aha!” solution and drop it into your learning journal—reflection boosts retention by 30%."
            }
        });
    }

    public async Task<LearnerProfilePayload> GetProfileAsync(string learnerId)
    {
        var badgeStats = SampleBadgeStats();
        var record = await FetchLearnerAsync(learnerId);
        var profile = BuildProfile(learnerId, record);
        return new LearnerProfilePayload
        {
            Profile = profile,
            Contact = new ContactInfoDto
            {
                Email = record?.Email ?? "aina123@gmail.com"
            },
            School = new SchoolInfoDto
            {
                School = "SMK Taman Melati",
                Year = "Form 5"
            },
            Notifications = new List<NotificationPreferenceDto>
            {
                new NotificationPreferenceDto("Daily streak nudges", "Sent at 8:00 PM GMT+8"),
                new NotificationPreferenceDto("Coach feedback alerts", "Push + email"),
                new NotificationPreferenceDto("Exam countdown", "Weekly digest on Fridays", true)
            },
            Badges = badgeStats
        };
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

    private static LearnerProfileDto BuildProfile(string learnerId, LearnerRecord? record)
    {
        return new LearnerProfileDto
        {
            LearnerId = record?.LearnerId ?? learnerId,
            Name = record?.Name ?? "Aina",
            AvatarUrl = "/images/profile-cat.png",
            Motto = "Learning one formula at a time.",
            Level = 3,
            Xp = 1200,
            Rank = "Gold Learner"
        };
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
    public string Rank { get; set; } = string.Empty;
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
