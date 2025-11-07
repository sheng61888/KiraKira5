using System;
using Microsoft.Data.SqlClient;
using System.Configuration;

public class UserManagement
{
    public static bool AddUser(string username, string name, string email, string password, string usertype)
    {
        string connectionString = ConfigurationManager.ConnectionStrings["KiraKiraDB"].ConnectionString;
        
        try
        {
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                string uid = Guid.NewGuid().ToString();
                string query = "INSERT INTO usertable (uid, username, name, email, password, usertype) VALUES (@Uid, @Username, @Name, @Email, @Password, @Usertype)";
                
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@Uid", uid);
                    command.Parameters.AddWithValue("@Username", username);
                    command.Parameters.AddWithValue("@Name", name);
                    command.Parameters.AddWithValue("@Email", email);
                    command.Parameters.AddWithValue("@Password", password);
                    command.Parameters.AddWithValue("@Usertype", usertype);
                    
                    connection.Open();
                    return command.ExecuteNonQuery() > 0;
                }
            }
        }
        catch
        {
            return false;
        }
    }
}