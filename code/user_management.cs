using System;
using System.Collections.Generic;
using MySql.Data.MySqlClient;
using Microsoft.Extensions.Configuration;

/// <summary>
/// Manages user operations in the database
/// </summary>
public class UserManagement
{
    private static IConfiguration _configuration;
    
    /// <summary>
    /// Sets the configuration for database connection
    /// </summary>
    public static void SetConfiguration(IConfiguration configuration)
    {
        _configuration = configuration;
    }
    
    /// <summary>
    /// Authenticates user login
    /// </summary>
    public static User Login(string email, string password)
    {
        string connectionString = _configuration.GetConnectionString("KiraKiraDB");
        
        try
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "SELECT uid, username, name, email, usertype FROM usertable WHERE email = @Email AND password = @Password";
                
                using (MySqlCommand command = new MySqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@Email", email);
                    command.Parameters.AddWithValue("@Password", password);
                    
                    connection.Open();
                    using (MySqlDataReader reader = command.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            return new User
                            {
                                Id = reader["uid"].ToString(),
                                Username = reader["username"].ToString(),
                                Name = reader["name"].ToString(),
                                Email = reader["email"].ToString(),
                                Role = reader["usertype"].ToString()
                            };
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error during login: {ex.Message}");
        }
        
        return null;
    }
    
    /// <summary>
    /// Adds a new user to the database
    /// </summary>
    public static bool AddUser(string username, string name, string email, string password, string usertype)
    {
        string connectionString = _configuration.GetConnectionString("KiraKiraDB");
        
        try
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                connection.Open();
                
                string uid = GenerateUserId(connection, usertype);
                string query = "INSERT INTO usertable (uid, username, name, email, password, usertype) VALUES (@Uid, @Username, @Name, @Email, @Password, @Usertype)";
                
                using (MySqlCommand command = new MySqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@Uid", uid);
                    command.Parameters.AddWithValue("@Username", username);
                    command.Parameters.AddWithValue("@Name", name);
                    command.Parameters.AddWithValue("@Email", email);
                    command.Parameters.AddWithValue("@Password", password);
                    command.Parameters.AddWithValue("@Usertype", usertype);
                    
                    bool success = command.ExecuteNonQuery() > 0;
                    
                    if (success && usertype.ToLower() == "learner")
                    {
                        LearnerInitialization.InitializeNewLearnerAsync(uid, connectionString).Wait();
                    }
                    
                    return success;
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error adding user: {ex.Message}");
            return false;
        }
    }
    
    /// <summary>
    /// Generates auto-incrementing user ID based on usertype
    /// </summary>
    private static string GenerateUserId(MySqlConnection connection, string usertype)
    {
        string prefix = usertype.ToLower() == "learner" ? "L" : (usertype.ToLower() == "admin" ? "A" : "T");
        string pattern = prefix + "%";
        int digitCount = usertype.ToLower() == "learner" ? 6 : 3;
        
        string query = $"SELECT uid FROM usertable WHERE uid LIKE @Pattern ORDER BY uid DESC LIMIT 1";
        
        using (MySqlCommand command = new MySqlCommand(query, connection))
        {
            command.Parameters.AddWithValue("@Pattern", pattern);
            var result = command.ExecuteScalar();
            
            if (result != null)
            {
                string lastId = result.ToString();
                int lastNumber = int.Parse(lastId.Substring(1));
                return prefix + (lastNumber + 1).ToString($"D{digitCount}");
            }
            else
            {
                return prefix + "1".PadLeft(digitCount, '0');
            }
        }
    }
    
    /// <summary>
    /// Retrieves all users from the database
    /// </summary>
    public static List<User> GetUsers()
    {
        string connectionString = _configuration.GetConnectionString("KiraKiraDB");
        List<User> users = new List<User>();
        
        try
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "SELECT uid, username, name, email, usertype FROM usertable";
                
                using (MySqlCommand command = new MySqlCommand(query, connection))
                {
                    connection.Open();
                    using (MySqlDataReader reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            users.Add(new User
                            {
                                Id = reader["uid"].ToString(),
                                Username = reader["username"].ToString(),
                                Name = reader["name"].ToString(),
                                Email = reader["email"].ToString(),
                                Role = reader["usertype"].ToString()
                            });
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting users: {ex.Message}");
        }
        
        return users;
    }
    
    /// <summary>
    /// Searches users by ID and role filter
    /// </summary>
    public static List<User> SearchUsers(string searchId, string roleFilter)
    {
        string connectionString = _configuration.GetConnectionString("KiraKiraDB");
        List<User> users = new List<User>();
        
        try
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "SELECT uid, username, name, email, usertype FROM usertable WHERE 1=1";
                
                if (!string.IsNullOrEmpty(searchId))
                    query += " AND uid LIKE @SearchId";
                if (!string.IsNullOrEmpty(roleFilter))
                    query += " AND LOWER(usertype) = LOWER(@RoleFilter)";
                
                using (MySqlCommand command = new MySqlCommand(query, connection))
                {
                    if (!string.IsNullOrEmpty(searchId))
                        command.Parameters.AddWithValue("@SearchId", $"%{searchId}%");
                    if (!string.IsNullOrEmpty(roleFilter))
                    {
                        command.Parameters.AddWithValue("@RoleFilter", roleFilter);
                        Console.WriteLine($"Searching for role: {roleFilter}");
                    }
                    
                    connection.Open();
                    using (MySqlDataReader reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            users.Add(new User
                            {
                                Id = reader["uid"].ToString(),
                                Username = reader["username"].ToString(),
                                Name = reader["name"].ToString(),
                                Email = reader["email"].ToString(),
                                Role = reader["usertype"].ToString()
                            });
                        }
                    }
                    Console.WriteLine($"Found {users.Count} users");
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error searching users: {ex.Message}");
        }
        
        return users;
    }
    
    /// <summary>
    /// Updates an existing user in the database
    /// </summary>
    public static bool UpdateUser(string id, string username, string name, string email, string role)
    {
        string connectionString = _configuration.GetConnectionString("KiraKiraDB");
        
        try
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "UPDATE usertable SET username = @Username, name = @Name, email = @Email, usertype = @Role WHERE uid = @Id";
                
                using (MySqlCommand command = new MySqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@Id", id);
                    command.Parameters.AddWithValue("@Username", username);
                    command.Parameters.AddWithValue("@Name", name);
                    command.Parameters.AddWithValue("@Email", email);
                    command.Parameters.AddWithValue("@Role", role);
                    
                    connection.Open();
                    return command.ExecuteNonQuery() > 0;
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error updating user: {ex.Message}");
            return false;
        }
    }
    
    /// <summary>
    /// Deletes a user from the database
    /// </summary>
    public static bool DeleteUser(string id)
    {
        string connectionString = _configuration.GetConnectionString("KiraKiraDB");
        Console.WriteLine($"DeleteUser called for ID: {id}");
        
        try
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                connection.Open();
                using (MySqlTransaction transaction = connection.BeginTransaction())
                {
                    try
                    {
                        // Delete related records - ignore errors for non-existent tables
                        string[] deleteQueries = new string[]
                        {
                            "DELETE FROM class_enrollments WHERE student_id = @Id",
                            "DELETE FROM student_module_progress WHERE student_id = @Id",
                            "DELETE FROM teacher_classes WHERE teacher_id = @Id",
                            "DELETE FROM user_sessions WHERE uid = @Id",
                            "DELETE FROM password_reset_requests WHERE uid = @Id"
                        };
                        
                        foreach (string query in deleteQueries)
                        {
                            try
                            {
                                using (MySqlCommand command = new MySqlCommand(query, connection, transaction))
                                {
                                    command.Parameters.AddWithValue("@Id", id);
                                    command.ExecuteNonQuery();
                                }
                            }
                            catch (MySqlException ex)
                            {
                                Console.WriteLine($"Skipping query (table may not exist): {query} - {ex.Message}");
                            }
                        }
                        
                        // Delete user - this must succeed
                        using (MySqlCommand command = new MySqlCommand("DELETE FROM usertable WHERE uid = @Id", connection, transaction))
                        {
                            command.Parameters.AddWithValue("@Id", id);
                            int affected = command.ExecuteNonQuery();
                            Console.WriteLine($"User deletion affected {affected} rows");
                        }
                        
                        transaction.Commit();
                        Console.WriteLine("Transaction committed successfully");
                        return true;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Transaction error: {ex.Message}");
                        transaction.Rollback();
                        throw;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error deleting user: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return false;
        }
    }
    
    /// <summary>
    /// Gets statistics for learners and teachers
    /// </summary>
    public static UserStats GetUserStats()
    {
        string connectionString = _configuration.GetConnectionString("KiraKiraDB");
        
        try
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                connection.Open();
                
                string query = "SELECT COUNT(*) FROM usertable WHERE LOWER(usertype) = @Type";
                
                int learners = 0;
                using (MySqlCommand command = new MySqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@Type", "learner");
                    learners = Convert.ToInt32(command.ExecuteScalar());
                }
                
                int teachers = 0;
                using (MySqlCommand command = new MySqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@Type", "teacher");
                    teachers = Convert.ToInt32(command.ExecuteScalar());
                }
                
                return new UserStats { Learners = learners, Teachers = teachers };
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting user stats: {ex.Message}");
            return new UserStats();
        }
    }

    /// <summary>
    /// Updates user password
    /// </summary>
    public static bool UpdatePassword(string email, string newPassword)
    {
        string connectionString = _configuration.GetConnectionString("KiraKiraDB");
        
        try
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "UPDATE usertable SET password = @Password WHERE email = @Email";
                
                using (MySqlCommand command = new MySqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@Email", email);
                    command.Parameters.AddWithValue("@Password", newPassword);
                    
                    connection.Open();
                    int rowsAffected = command.ExecuteNonQuery();
                    Console.WriteLine($"UpdatePassword: {rowsAffected} rows affected for email {email}");
                    return rowsAffected > 0;
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error updating password: {ex.Message}");
            return false;
        }
    }
}

/// <summary>
/// Represents a user entity
/// </summary>
public class User
{
    public string Id { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

/// <summary>
/// Represents user statistics
/// </summary>
public class UserStats
{
    public int Learners { get; set; }
    public int Teachers { get; set; }
}
