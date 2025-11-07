using MySql.Data.MySqlClient;

public class DatabaseConnection
{
    private static string connectionString = "Server=0.tcp.ap.ngrok.io;Port=12214;Database=kirakiradb;Uid=root;Pwd=Sheng#0618;";
    
    public static MySqlConnection GetConnection()
    {
        return new MySqlConnection(connectionString);
    }
    
    public static bool TestConnection()
    {
        try
        {
            using (var connection = GetConnection())
            {
                connection.Open();
                return true;
            }
        }
        catch
        {
            return false;
        }
    }
}