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

    /// <summary>
    /// Gets registered users with optional role, year, and month filters
    /// </summary>
    public static async Task<List<object>> GetRegisteredUsersAsync(IConfiguration configuration, string role = null, string year = null, string month = null)
    {
        string connectionString = configuration.GetConnectionString("KiraKiraDB");
        
        try
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                await connection.OpenAsync();
                
                string query = "SELECT username, name, email, usertype, registration_date FROM usertable WHERE 1=1";
                
                if (!string.IsNullOrEmpty(role))
                {
                    query += " AND usertype = @role";
                }
                
                if (!string.IsNullOrEmpty(year))
                {
                    query += " AND YEAR(registration_date) = @year";
                }
                
                if (!string.IsNullOrEmpty(month))
                {
                    query += " AND MONTH(registration_date) = @month";
                }
                
                query += " ORDER BY registration_date DESC";
                
                var users = new List<object>();
                using (MySqlCommand cmd = new MySqlCommand(query, connection))
                {
                    if (!string.IsNullOrEmpty(role))
                    {
                        cmd.Parameters.AddWithValue("@role", role);
                    }
                    if (!string.IsNullOrEmpty(year))
                    {
                        cmd.Parameters.AddWithValue("@year", year);
                    }
                    if (!string.IsNullOrEmpty(month))
                    {
                        cmd.Parameters.AddWithValue("@month", month);
                    }
                    
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            users.Add(new {
                                username = reader.GetString(0),
                                name = reader.GetString(1),
                                email = reader.GetString(2),
                                usertype = reader.GetString(3),
                                registrationDate = reader.IsDBNull(4) ? (DateTime?)null : reader.GetDateTime(4)
                            });
                        }
                    }
                }
                
                return users;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting registered users: {ex.Message}");
            return new List<object>();
        }
    }
    
    /// <summary>
    /// Tracks a website visit
    /// </summary>
    public static async Task TrackVisitAsync(IConfiguration configuration)
    {
        string connectionString = configuration.GetConnectionString("KiraKiraDB");
        
        try
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                await connection.OpenAsync();
                string query = "INSERT INTO website_visits (visit_date) VALUES (NOW())";
                
                using (MySqlCommand command = new MySqlCommand(query, connection))
                {
                    await command.ExecuteNonQueryAsync();
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error tracking visit: {ex.Message}");
        }
    }
    
    /// <summary>
    /// Gets website visit statistics grouped by date
    /// </summary>
    public static async Task<List<object>> GetVisitStatsAsync(IConfiguration configuration, string year = null, string month = null)
    {
        string connectionString = configuration.GetConnectionString("KiraKiraDB");
        
        try
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                await connection.OpenAsync();
                string query = "SELECT DATE(visit_date) as date, COUNT(*) as count FROM website_visits WHERE 1=1";
                
                if (!string.IsNullOrEmpty(year))
                {
                    query += " AND YEAR(visit_date) = @year";
                }
                
                if (!string.IsNullOrEmpty(month))
                {
                    query += " AND MONTH(visit_date) = @month";
                }
                
                if (string.IsNullOrEmpty(year) && string.IsNullOrEmpty(month))
                {
                    query += " AND visit_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
                }
                
                query += " GROUP BY DATE(visit_date) ORDER BY date";
                
                var stats = new List<object>();
                using (MySqlCommand command = new MySqlCommand(query, connection))
                {
                    if (!string.IsNullOrEmpty(year))
                    {
                        command.Parameters.AddWithValue("@year", year);
                    }
                    if (!string.IsNullOrEmpty(month))
                    {
                        command.Parameters.AddWithValue("@month", month);
                    }
                    
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            stats.Add(new {
                                date = reader.GetDateTime(0).ToString("yyyy-MM-dd"),
                                count = reader.GetInt32(1)
                            });
                        }
                    }
                }
                return stats;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting visit stats: {ex.Message}");
            return new List<object>();
        }
    }
}
