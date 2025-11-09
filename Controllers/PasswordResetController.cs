using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using System.Data;

namespace KiraKira5.Controllers
{
    /// <summary>
    /// Handles password reset requests and approvals
    /// </summary>
    [ApiController]
    [Route("api/passwordreset")]
    public class PasswordResetController : ControllerBase
    {
        private readonly string connectionString;

        public PasswordResetController(IConfiguration configuration)
        {
            connectionString = configuration.GetConnectionString("KiraKiraDB");
        }

        /// <summary>
        /// Submit a password reset request
        /// </summary>
        [HttpPost("request")]
        public async Task<IActionResult> RequestPasswordReset([FromBody] PasswordResetRequest request)
        {
            try
            {
                using var connection = new MySqlConnection(connectionString);
                await connection.OpenAsync();

                var checkUserCmd = new MySqlCommand(
                    "SELECT COUNT(*) FROM usertable WHERE email = @Email", connection);
                checkUserCmd.Parameters.AddWithValue("@Email", request.Email);
                
                var userExists = Convert.ToInt32(await checkUserCmd.ExecuteScalarAsync()) > 0;
                if (!userExists)
                {
                    return Ok(new { success = false, message = "Email not found" });
                }

                var insertCmd = new MySqlCommand(
                    "INSERT INTO password_reset_requests (email, request_date, status) VALUES (@Email, @RequestDate, @Status)", 
                    connection);
                insertCmd.Parameters.AddWithValue("@Email", request.Email);
                insertCmd.Parameters.AddWithValue("@RequestDate", DateTime.Now);
                insertCmd.Parameters.AddWithValue("@Status", "Pending");

                await insertCmd.ExecuteNonQueryAsync();
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Get all password reset requests
        /// </summary>
        [HttpGet("requests")]
        public async Task<IActionResult> GetPasswordResetRequests()
        {
            try
            {
                using var connection = new MySqlConnection(connectionString);
                await connection.OpenAsync();

                var cmd = new MySqlCommand(
                    "SELECT request_id, email, request_date, status FROM password_reset_requests ORDER BY request_date DESC", 
                    connection);
                
                var requests = new List<object>();
                using var reader = await cmd.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    requests.Add(new
                    {
                        RequestId = reader.GetInt32("request_id"),
                        Email = reader.GetString("email"),
                        RequestDate = reader.GetDateTime("request_date"),
                        Status = reader.GetString("status")
                    });
                }

                return Ok(new { success = true, requests });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Approve password reset and update user password
        /// </summary>
        [HttpPost("approve")]
        public async Task<IActionResult> ApprovePasswordReset([FromBody] ApproveResetRequest request)
        {
            try
            {
                using var connection = new MySqlConnection(connectionString);
                await connection.OpenAsync();

                var getEmailCmd = new MySqlCommand(
                    "SELECT email FROM password_reset_requests WHERE request_id = @RequestId", connection);
                getEmailCmd.Parameters.AddWithValue("@RequestId", request.RequestId);
                var email = (await getEmailCmd.ExecuteScalarAsync())?.ToString();

                if (string.IsNullOrEmpty(email))
                {
                    return Ok(new { success = false, message = "Request not found" });
                }

                var updatePasswordCmd = new MySqlCommand(
                    "UPDATE usertable SET password = @Password WHERE email = @Email", connection);
                updatePasswordCmd.Parameters.AddWithValue("@Password", request.NewPassword);
                updatePasswordCmd.Parameters.AddWithValue("@Email", email);
                await updatePasswordCmd.ExecuteNonQueryAsync();

                var updateStatusCmd = new MySqlCommand(
                    "UPDATE password_reset_requests SET status = @Status WHERE request_id = @RequestId", connection);
                updateStatusCmd.Parameters.AddWithValue("@Status", "Approved");
                updateStatusCmd.Parameters.AddWithValue("@RequestId", request.RequestId);
                await updateStatusCmd.ExecuteNonQueryAsync();

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Reject password reset request
        /// </summary>
        [HttpPost("reject")]
        public async Task<IActionResult> RejectPasswordReset([FromBody] RejectResetRequest request)
        {
            try
            {
                using var connection = new MySqlConnection(connectionString);
                await connection.OpenAsync();

                var cmd = new MySqlCommand(
                    "UPDATE password_reset_requests SET status = @Status WHERE request_id = @RequestId", connection);
                cmd.Parameters.AddWithValue("@Status", "Rejected");
                cmd.Parameters.AddWithValue("@RequestId", request.RequestId);
                await cmd.ExecuteNonQueryAsync();

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }

    public class PasswordResetRequest
    {
        public string Email { get; set; }
    }

    public class ApproveResetRequest
    {
        public int RequestId { get; set; }
        public string NewPassword { get; set; }
    }

    public class RejectResetRequest
    {
        public int RequestId { get; set; }
    }
}
