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
                    
                    return command.ExecuteNonQuery() > 0;
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
        string prefix = usertype.ToLower() == "learner" ? "L" : "T";
        string pattern = usertype.ToLower() == "learner" ? "L%" : "T%";
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
                    query += " AND usertype = @RoleFilter";
                
                using (MySqlCommand command = new MySqlCommand(query, connection))
                {
                    if (!string.IsNullOrEmpty(searchId))
                        command.Parameters.AddWithValue("@SearchId", $"%{searchId}%");
                    if (!string.IsNullOrEmpty(roleFilter))
                        command.Parameters.AddWithValue("@RoleFilter", roleFilter);
                    
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
        
        try
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string query = "DELETE FROM usertable WHERE uid = @Id";
                
                using (MySqlCommand command = new MySqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@Id", id);
                    
                    connection.Open();
                    return command.ExecuteNonQuery() > 0;
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error deleting user: {ex.Message}");
            return false;
        }
    }
}

/// <summary>
/// Represents a user entity
/// </summary>
public class User
{
    public string Id { get; set; }
    public string Username { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string Role { get; set; }
}