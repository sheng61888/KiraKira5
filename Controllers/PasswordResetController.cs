using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using System.Data;

namespace KiraKira5.Controllers
{
    /// <summary>
    /// Handles password reset requests with OTP verification
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
        /// Generate a 6-digit OTP
        /// </summary>
        private string GenerateOTP()
        {
            return new Random().Next(100000, 999999).ToString();
        }

        /// <summary>
        /// Submit a password reset request and generate OTP
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

                var otp = GenerateOTP();
                var otpExpiry = DateTime.Now.AddMinutes(15);

                var insertCmd = new MySqlCommand(
                    "INSERT INTO password_reset_requests (email, request_date, status, otp, otp_expiry) VALUES (@Email, @RequestDate, @Status, @OTP, @OTPExpiry)", 
                    connection);
                insertCmd.Parameters.AddWithValue("@Email", request.Email);
                insertCmd.Parameters.AddWithValue("@RequestDate", DateTime.Now);
                insertCmd.Parameters.AddWithValue("@Status", "Active");
                insertCmd.Parameters.AddWithValue("@OTP", otp);
                insertCmd.Parameters.AddWithValue("@OTPExpiry", otpExpiry);

                await insertCmd.ExecuteNonQueryAsync();

                var notificationCmd = new MySqlCommand(
                    "INSERT INTO notifications (user_email, title, body, kind, created_at) VALUES (@Email, @Title, @Body, @Kind, @CreatedAt)",
                    connection);
                notificationCmd.Parameters.AddWithValue("@Email", request.Email);
                notificationCmd.Parameters.AddWithValue("@Title", "Password Reset OTP");
                notificationCmd.Parameters.AddWithValue("@Body", $"Your OTP is: {otp}. Valid for 15 minutes.");
                notificationCmd.Parameters.AddWithValue("@Kind", "info");
                notificationCmd.Parameters.AddWithValue("@CreatedAt", DateTime.Now);
                await notificationCmd.ExecuteNonQueryAsync();

                return Ok(new { success = true, message = "OTP sent to your notifications." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Get all password reset requests with OTP
        /// </summary>
        [HttpGet("requests")]
        public async Task<IActionResult> GetPasswordResetRequests()
        {
            try
            {
                using var connection = new MySqlConnection(connectionString);
                await connection.OpenAsync();

                var cmd = new MySqlCommand(
                    "SELECT request_id, email, request_date, status, otp, otp_expiry FROM password_reset_requests ORDER BY request_date DESC", 
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
                        Status = reader.GetString("status"),
                        OTP = reader.IsDBNull(reader.GetOrdinal("otp")) ? null : reader.GetString("otp"),
                        OTPExpiry = reader.IsDBNull(reader.GetOrdinal("otp_expiry")) ? (DateTime?)null : reader.GetDateTime("otp_expiry")
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
        /// Verify OTP and reset password
        /// </summary>
        [HttpPost("verify")]
        public async Task<IActionResult> VerifyOTP([FromBody] VerifyOTPRequest request)
        {
            try
            {
                using var connection = new MySqlConnection(connectionString);
                await connection.OpenAsync();

                var cmd = new MySqlCommand(
                    "SELECT request_id, email, otp, otp_expiry, status FROM password_reset_requests WHERE email = @Email ORDER BY request_date DESC LIMIT 1", 
                    connection);
                cmd.Parameters.AddWithValue("@Email", request.Email);

                int requestId;
                string email;
                string storedOTP;
                DateTime otpExpiry;
                string status;

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (!await reader.ReadAsync())
                    {
                        return Ok(new { success = false, message = "No reset request found" });
                    }

                    requestId = reader.GetInt32("request_id");
                    email = reader.GetString("email");
                    storedOTP = reader.IsDBNull(reader.GetOrdinal("otp")) ? null : reader.GetString("otp");
                    otpExpiry = reader.IsDBNull(reader.GetOrdinal("otp_expiry")) ? DateTime.MinValue : reader.GetDateTime("otp_expiry");
                    status = reader.GetString("status");
                }

                if (status != "Active")
                {
                    return Ok(new { success = false, message = "Reset request is no longer active" });
                }

                if (storedOTP != request.OTP)
                {
                    return Ok(new { success = false, message = "Invalid OTP" });
                }

                if (DateTime.Now > otpExpiry)
                {
                    return Ok(new { success = false, message = "OTP has expired" });
                }

                var updatePasswordCmd = new MySqlCommand(
                    "UPDATE usertable SET password = @Password WHERE email = @Email", connection);
                updatePasswordCmd.Parameters.AddWithValue("@Password", request.NewPassword);
                updatePasswordCmd.Parameters.AddWithValue("@Email", email);
                await updatePasswordCmd.ExecuteNonQueryAsync();

                var updateStatusCmd = new MySqlCommand(
                    "UPDATE password_reset_requests SET status = @Status WHERE request_id = @RequestId", connection);
                updateStatusCmd.Parameters.AddWithValue("@Status", "Completed");
                updateStatusCmd.Parameters.AddWithValue("@RequestId", requestId);
                await updateStatusCmd.ExecuteNonQueryAsync();

                return Ok(new { success = true, message = "Password reset successful" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }



        /// <summary>
        /// Delete password reset request
        /// </summary>
        [HttpDelete("delete/{requestId}")]
        public async Task<IActionResult> DeletePasswordReset(int requestId)
        {
            try
            {
                using var connection = new MySqlConnection(connectionString);
                await connection.OpenAsync();

                var cmd = new MySqlCommand(
                    "DELETE FROM password_reset_requests WHERE request_id = @RequestId", connection);
                cmd.Parameters.AddWithValue("@RequestId", requestId);
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

    public class VerifyOTPRequest
    {
        public string Email { get; set; }
        public string OTP { get; set; }
        public string NewPassword { get; set; }
    }
}
