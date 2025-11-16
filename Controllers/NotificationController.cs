using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;

namespace KiraKira5.Controllers
{
    /// <summary>
    /// Handles user notifications
    /// </summary>
    [ApiController]
    [Route("api/notifications")]
    public class NotificationController : ControllerBase
    {
        private readonly string connectionString;

        public NotificationController(IConfiguration configuration)
        {
            connectionString = configuration.GetConnectionString("KiraKiraDB");
        }

        /// <summary>
        /// Get notifications for a user
        /// </summary>
        [HttpGet("{email}")]
        public async Task<IActionResult> GetNotifications(string email)
        {
            try
            {
                using var connection = new MySqlConnection(connectionString);
                await connection.OpenAsync();

                var cmd = new MySqlCommand(
                    "SELECT notification_id, title, body, kind, is_read, created_at FROM notifications WHERE user_email = @Email ORDER BY created_at DESC LIMIT 50",
                    connection);
                cmd.Parameters.AddWithValue("@Email", email);

                var notifications = new List<object>();
                using var reader = await cmd.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    notifications.Add(new
                    {
                        Id = reader.GetInt32(0),
                        Title = reader.GetString(1),
                        Body = reader.GetString(2),
                        Kind = reader.GetString(3),
                        IsRead = reader.GetBoolean(4),
                        Timestamp = reader.GetDateTime(5)
                    });
                }

                return Ok(new { success = true, notifications });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Create a notification
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateNotification([FromBody] CreateNotificationRequest request)
        {
            try
            {
                using var connection = new MySqlConnection(connectionString);
                await connection.OpenAsync();

                var cmd = new MySqlCommand(
                    "INSERT INTO notifications (user_email, title, body, kind, created_at) VALUES (@Email, @Title, @Body, @Kind, @CreatedAt)",
                    connection);
                cmd.Parameters.AddWithValue("@Email", request.Email);
                cmd.Parameters.AddWithValue("@Title", request.Title);
                cmd.Parameters.AddWithValue("@Body", request.Body);
                cmd.Parameters.AddWithValue("@Kind", request.Kind ?? "info");
                cmd.Parameters.AddWithValue("@CreatedAt", DateTime.Now);

                await cmd.ExecuteNonQueryAsync();
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }

    public class CreateNotificationRequest
    {
        public string Email { get; set; }
        public string Title { get; set; }
        public string Body { get; set; }
        public string Kind { get; set; }
    }
}
