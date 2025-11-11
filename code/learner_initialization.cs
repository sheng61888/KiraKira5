using MySql.Data.MySqlClient;
using System;
using System.Threading.Tasks;

/// <summary>
/// Initializes new learner records with default progress values
/// </summary>
public static class LearnerInitialization
{
    /// <summary>
    /// Creates initial records for a new learner with 0% progress
    /// </summary>
    public static async Task InitializeNewLearnerAsync(string learnerId, string connectionString)
    {
        await using var connection = new MySqlConnection(connectionString);
        await connection.OpenAsync();

        await CreateLearnerProfileAsync(connection, learnerId);
        await CreateLearnerStreakAsync(connection, learnerId);
        await CreateLearnerMissionAsync(connection, learnerId);
    }

    private static async Task CreateLearnerProfileAsync(MySqlConnection connection, string learnerId)
    {
        const string sql = @"INSERT IGNORE INTO learner_profile (uid, level, xp, motto, avatar_url)
                             VALUES (@Uid, 1, 0, 'Learning one formula at a time.', '/images/profile-cat.jpg')";
        
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@Uid", learnerId);
        await command.ExecuteNonQueryAsync();
    }

    private static async Task CreateLearnerStreakAsync(MySqlConnection connection, string learnerId)
    {
        const string sql = @"INSERT IGNORE INTO learner_streak (uid, current_streak, longest_streak, xp_to_next_level, last_activity_on, last_activity_source)
                             VALUES (@Uid, 0, 0, 1000, NULL, NULL)";
        
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@Uid", learnerId);
        await command.ExecuteNonQueryAsync();
    }

    private static async Task CreateLearnerMissionAsync(MySqlConnection connection, string learnerId)
    {
        const string sql = @"INSERT IGNORE INTO learner_mission (uid, grade, readiness_percent, mission_title, mission_mood, mission_mode, wants_videos)
                             VALUES (@Uid, 'Form 4', 0, 'Start your learning journey', 'Welcome! Let''s begin with the basics.', 'Getting started', 1)";
        
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@Uid", learnerId);
        await command.ExecuteNonQueryAsync();
    }
}
