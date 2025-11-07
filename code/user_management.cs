using System;
using MySql.Data.MySqlClient;
using Microsoft.Extensions.Configuration;

public class UserManagement
{
    private static IConfiguration _configuration;
    
    public static void SetConfiguration(IConfiguration configuration)
    {
        _configuration = configuration;
    }
    
    public static bool AddUser(string username, string name, string email, string password, string usertype)
    {
        string connectionString = _configuration.GetConnectionString("KiraKiraDB");
        Console.WriteLine($"Connection string: {connectionString}");
        
        try
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                string uid = Guid.NewGuid().ToString();
                string query = "INSERT INTO usertable (uid, username, name, email, password, usertype) VALUES (@Uid, @Username, @Name, @Email, @Password, @Usertype)";
                Console.WriteLine($"Executing query: {query}");
                
                using (MySqlCommand command = new MySqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@Uid", uid);
                    command.Parameters.AddWithValue("@Username", username);
                    command.Parameters.AddWithValue("@Name", name);
                    command.Parameters.AddWithValue("@Email", email);
                    command.Parameters.AddWithValue("@Password", password);
                    command.Parameters.AddWithValue("@Usertype", usertype);
                    
                    connection.Open();
                    Console.WriteLine("Database connection opened");
                    int rowsAffected = command.ExecuteNonQuery();
                    Console.WriteLine($"Rows affected: {rowsAffected}");
                    return rowsAffected > 0;
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return false;
        }
    }
}