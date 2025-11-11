using MySql.Data.MySqlClient;

/// <summary>
/// Service for admin dashboard operations
/// </summary>
public class AdminService
{
    /// <summary>
    /// Gets the total count of users from the database
    /// </summary>
    public static async Task<int> GetTotalUsersAsync(IConfiguration configuration)
    {
        string connectionString = configuration.GetConnectionString("KiraKiraDB");
        
        try
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                await connection.OpenAsync();
                string query = "SELECT COUNT(*) FROM usertable";
                
                using (MySqlCommand command = new MySqlCommand(query, connection))
                {
                    var result = await command.ExecuteScalarAsync();
                    return Convert.ToInt32(result);
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting total users: {ex.Message}");
            return 0;
        }
    }

    /// <summary>
    /// Gets user analytics by role
    /// </summary>
    public static async Task<object> GetUserAnalyticsAsync(IConfiguration configuration)
    {
        string connectionString = configuration.GetConnectionString("KiraKiraDB");
        
        try
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                await connection.OpenAsync();
                string query = "SELECT usertype, COUNT(*) as count FROM usertable GROUP BY usertype";
                
                var analytics = new Dictionary<string, int>();
                using (MySqlCommand command = new MySqlCommand(query, connection))
                using (var reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        analytics[reader.GetString(0)] = reader.GetInt32(1);
                    }
                }
                return analytics;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting user analytics: {ex.Message}");
            return new Dictionary<string, int>();
        }
    }

    /// <summary>
    /// Gets community activity statistics
    /// </summary>
    public static async Task<object> GetCommunityStatsAsync(IConfiguration configuration)
    {
        string connectionString = configuration.GetConnectionString("KiraKiraDB");
        
        try
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                await connection.OpenAsync();
                
                var stats = new Dictionary<string, object>();
                
                // Total threads
                string threadsQuery = "SELECT COUNT(*) FROM community_threads";
                using (MySqlCommand cmd = new MySqlCommand(threadsQuery, connection))
                {
                    stats["totalThreads"] = Convert.ToInt32(await cmd.ExecuteScalarAsync());
                }
                
                // Total replies
                string repliesQuery = "SELECT COUNT(*) FROM community_replies";
                using (MySqlCommand cmd = new MySqlCommand(repliesQuery, connection))
                {
                    stats["totalReplies"] = Convert.ToInt32(await cmd.ExecuteScalarAsync());
                }
                
                // Most active users
                string activeUsersQuery = @"
                    SELECT u.username, COUNT(*) as activity_count 
                    FROM (
                        SELECT uid FROM community_threads
                        UNION ALL
                        SELECT uid FROM community_replies
                    ) as activities
                    JOIN usertable u ON activities.uid = u.uid
                    GROUP BY u.username
                    ORDER BY activity_count DESC
                    LIMIT 5";
                
                var activeUsers = new List<object>();
                using (MySqlCommand cmd = new MySqlCommand(activeUsersQuery, connection))
                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        activeUsers.Add(new { 
                            username = reader.GetString(0),
                            activityCount = reader.GetInt32(1)
                        });
                    }
                }
                stats["mostActiveUsers"] = activeUsers;
                
                return stats;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting community stats: {ex.Message}");
            return new Dictionary<string, object>();
        }
    }


}
