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
}
