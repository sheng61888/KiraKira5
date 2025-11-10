using MySql.Data.MySqlClient;

/// <summary>
/// Service for community thread operations
/// </summary>
public class CommunityService
{
    /// <summary>
    /// Gets all community threads with user information
    /// </summary>
    public static async Task<List<AdminCommunityThreadDto>> GetAllThreadsAsync(IConfiguration configuration)
    {
        string connectionString = configuration.GetConnectionString("KiraKiraDB");
        var threads = new List<AdminCommunityThreadDto>();

        try
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                await connection.OpenAsync();
                string query = @"
                    SELECT 
                        ct.thread_id, ct.title, ct.body, ct.category, ct.primary_tag, ct.created_at,
                        ct.uid, u.username,
                        (SELECT COUNT(*) FROM community_replies WHERE thread_id = ct.thread_id) as reply_count
                    FROM community_threads ct
                    LEFT JOIN usertable u ON ct.uid = u.uid
                    ORDER BY ct.created_at DESC";

                using (MySqlCommand command = new MySqlCommand(query, connection))
                using (var reader = (MySqlDataReader)await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        threads.Add(new AdminCommunityThreadDto
                        {
                            ThreadId = reader.GetInt32("thread_id"),
                            Title = reader.GetString("title"),
                            Body = reader.GetString("body"),
                            Category = reader.IsDBNull(reader.GetOrdinal("category")) ? "General" : reader.GetString("category"),
                            PrimaryTag = reader.IsDBNull(reader.GetOrdinal("primary_tag")) ? "" : reader.GetString("primary_tag"),
                            CreatedAt = reader.GetDateTime("created_at"),
                            Username = reader.IsDBNull(reader.GetOrdinal("username")) ? "Unknown" : reader.GetString("username"),
                            ReplyCount = reader.GetInt32("reply_count")
                        });
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting threads: {ex.Message}");
        }

        return threads;
    }

    /// <summary>
    /// Deletes a thread and its replies
    /// </summary>
    public static async Task<bool> DeleteThreadAsync(IConfiguration configuration, int threadId)
    {
        string connectionString = configuration.GetConnectionString("KiraKiraDB");

        try
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                await connection.OpenAsync();
                string query = "DELETE FROM community_threads WHERE thread_id = @threadId";

                using (MySqlCommand command = new MySqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@threadId", threadId);
                    int rowsAffected = await command.ExecuteNonQueryAsync();
                    return rowsAffected > 0;
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error deleting thread: {ex.Message}");
            return false;
        }
    }

    /// <summary>
    /// Gets all replies for a specific thread
    /// </summary>
    public static async Task<List<AdminCommunityReplyDto>> GetThreadRepliesAsync(IConfiguration configuration, int threadId)
    {
        string connectionString = configuration.GetConnectionString("KiraKiraDB");
        var replies = new List<AdminCommunityReplyDto>();

        try
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                await connection.OpenAsync();
                string query = @"
                    SELECT cr.reply_id, cr.body, cr.created_at, cr.uid, u.username
                    FROM community_replies cr
                    LEFT JOIN usertable u ON cr.uid = u.uid
                    WHERE cr.thread_id = @threadId
                    ORDER BY cr.created_at DESC";

                using (MySqlCommand command = new MySqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@threadId", threadId);
                    using (var reader = (MySqlDataReader)await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            replies.Add(new AdminCommunityReplyDto
                            {
                                ReplyId = reader.GetInt32("reply_id"),
                                Body = reader.GetString("body"),
                                CreatedAt = reader.GetDateTime("created_at"),
                                Username = reader.IsDBNull(reader.GetOrdinal("username")) ? "Unknown" : reader.GetString("username")
                            });
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting replies: {ex.Message}");
        }

        return replies;
    }

    /// <summary>
    /// Deletes a reply
    /// </summary>
    public static async Task<bool> DeleteReplyAsync(IConfiguration configuration, int replyId)
    {
        string connectionString = configuration.GetConnectionString("KiraKiraDB");

        try
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                await connection.OpenAsync();
                using (var transaction = await connection.BeginTransactionAsync())
                {
                    try
                    {
                        string getThreadQuery = "SELECT thread_id FROM community_replies WHERE reply_id = @replyId";
                        int threadId = 0;
                        
                        using (MySqlCommand getCommand = new MySqlCommand(getThreadQuery, connection, transaction))
                        {
                            getCommand.Parameters.AddWithValue("@replyId", replyId);
                            var result = await getCommand.ExecuteScalarAsync();
                            if (result != null) threadId = Convert.ToInt32(result);
                        }

                        string deleteQuery = "DELETE FROM community_replies WHERE reply_id = @replyId";
                        using (MySqlCommand deleteCommand = new MySqlCommand(deleteQuery, connection, transaction))
                        {
                            deleteCommand.Parameters.AddWithValue("@replyId", replyId);
                            int rowsAffected = await deleteCommand.ExecuteNonQueryAsync();
                            
                            if (rowsAffected > 0 && threadId > 0)
                            {
                                string updateQuery = "UPDATE community_threads SET reply_count = GREATEST(0, reply_count - 1) WHERE thread_id = @threadId";
                                using (MySqlCommand updateCommand = new MySqlCommand(updateQuery, connection, transaction))
                                {
                                    updateCommand.Parameters.AddWithValue("@threadId", threadId);
                                    await updateCommand.ExecuteNonQueryAsync();
                                }
                            }
                            
                            await transaction.CommitAsync();
                            return rowsAffected > 0;
                        }
                    }
                    catch
                    {
                        await transaction.RollbackAsync();
                        throw;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error deleting reply: {ex.Message}");
            return false;
        }
    }
}

/// <summary>
/// DTO for admin community thread data
/// </summary>
public class AdminCommunityThreadDto
{
    public int ThreadId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string PrimaryTag { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string Username { get; set; } = string.Empty;
    public int ReplyCount { get; set; }
}

/// <summary>
/// DTO for admin community reply data
/// </summary>
public class AdminCommunityReplyDto
{
    public int ReplyId { get; set; }
    public string Body { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string Username { get; set; } = string.Empty;
}
