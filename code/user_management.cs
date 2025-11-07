using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Web.Script.Serialization;
using System.Web.Services;

/// <summary>
/// User management service for KiraKira admin panel
/// </summary>
public partial class UserManagement : System.Web.UI.Page
{
    private readonly string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["KiraKiraDB"].ConnectionString;

    /// <summary>
    /// Gets all users from the database
    /// </summary>
    [WebMethod]
    public static string GetUsers()
    {
        var users = new List<User>();
        string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["KiraKiraDB"].ConnectionString;

        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            string query = "SELECT uid, username, name, email, usertype FROM usertable ORDER BY uid";
            using (SqlCommand command = new SqlCommand(query, connection))
            {
                connection.Open();
                using (SqlDataReader reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        users.Add(new User
                        {
                            Id = reader.GetString("uid"),
                            Username = reader.GetString("username"),
                            Name = reader.GetString("name"),
                            Email = reader.GetString("email"),
                            Role = reader.GetString("usertype")
                        });
                    }
                }
            }
        }

        return new JavaScriptSerializer().Serialize(users);
    }

    /// <summary>
    /// Searches users by ID and role
    /// </summary>
    [WebMethod]
    public static string SearchUsers(string searchId, string roleFilter)
    {
        var users = new List<User>();
        string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["KiraKiraDB"].ConnectionString;

        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            string query = "SELECT uid, username, name, email, usertype FROM usertable WHERE 1=1";
            var parameters = new List<SqlParameter>();

            if (!string.IsNullOrEmpty(searchId))
            {
                query += " AND uid LIKE @SearchId";
                parameters.Add(new SqlParameter("@SearchId", "%" + searchId + "%"));
            }

            if (!string.IsNullOrEmpty(roleFilter))
            {
                query += " AND usertype = @Role";
                parameters.Add(new SqlParameter("@Role", roleFilter));
            }

            query += " ORDER BY uid";

            using (SqlCommand command = new SqlCommand(query, connection))
            {
                command.Parameters.AddRange(parameters.ToArray());
                connection.Open();
                using (SqlDataReader reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        users.Add(new User
                        {
                            Id = reader.GetString("uid"),
                            Username = reader.GetString("username"),
                            Name = reader.GetString("name"),
                            Email = reader.GetString("email"),
                            Role = reader.GetString("usertype")
                        });
                    }
                }
            }
        }

        return new JavaScriptSerializer().Serialize(users);
    }

    /// <summary>
    /// Adds a new user to the database
    /// </summary>
    [WebMethod]
    public static bool AddUser(string username, string name, string email, string password, string role)
    {
        string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["KiraKiraDB"].ConnectionString;

        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            string uid = Guid.NewGuid().ToString();
            string query = "INSERT INTO usertable (uid, username, name, email, password, usertype) VALUES (@Uid, @Username, @Name, @Email, @Password, @Role)";
            using (SqlCommand command = new SqlCommand(query, connection))
            {
                command.Parameters.AddWithValue("@Uid", uid);
                command.Parameters.AddWithValue("@Username", username);
                command.Parameters.AddWithValue("@Name", name);
                command.Parameters.AddWithValue("@Email", email);
                command.Parameters.AddWithValue("@Password", password);
                command.Parameters.AddWithValue("@Role", role);

                connection.Open();
                return command.ExecuteNonQuery() > 0;
            }
        }
    }

    /// <summary>
    /// Updates an existing user in the database
    /// </summary>
    [WebMethod]
    public static bool UpdateUser(string id, string username, string name, string email, string role)
    {
        string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["KiraKiraDB"].ConnectionString;

        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            string query = "UPDATE usertable SET username = @Username, name = @Name, email = @Email, usertype = @Role WHERE uid = @Id";
            using (SqlCommand command = new SqlCommand(query, connection))
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

    /// <summary>
    /// Deletes a user from the database
    /// </summary>
    [WebMethod]
    public static bool DeleteUser(string id)
    {
        string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["KiraKiraDB"].ConnectionString;

        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            string query = "DELETE FROM usertable WHERE uid = @Id";
            using (SqlCommand command = new SqlCommand(query, connection))
            {
                command.Parameters.AddWithValue("@Id", id);

                connection.Open();
                return command.ExecuteNonQuery() > 0;
            }
        }
    }
}

/// <summary>
/// User data model
/// </summary>
public class User
{
    public string Id { get; set; }
    public string Username { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string Role { get; set; }
}