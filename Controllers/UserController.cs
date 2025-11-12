using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;

/// <summary>
/// API controller for user management operations
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IConfiguration _configuration;
    
    public UserController(IConfiguration configuration)
    {
        _configuration = configuration;
        UserManagement.SetConfiguration(configuration);
    }
    
    /// <summary>
    /// Authenticates user login
    /// </summary>
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        try
        {
            var user = UserManagement.Login(request.Email, request.Password);
            
            if (user != null)
            {
                return Ok(new { success = true, user = user });
            }
            
            return Ok(new { success = false, message = "Invalid email or password" });
        }
        catch (Exception ex)
        {
            return Ok(new { success = false, error = ex.Message });
        }
    }
    
    /// <summary>
    /// Adds a new user to the system
    /// </summary>
    [HttpPost("add")]
    public IActionResult AddUser([FromBody] AddUserRequest request)
    {
        try
        {
            Console.WriteLine($"AddUser called: {request.Username}, {request.Name}, {request.Email}, {request.Usertype}");
            var result = UserManagement.AddUser(request.Username, request.Name, request.Email, request.Password, request.Usertype);
            Console.WriteLine($"AddUser result: {result}");
            return Ok(new { success = result });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"AddUser error: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return Ok(new { success = false, error = ex.Message });
        }
    }
    
    /// <summary>
    /// Retrieves all users from the system
    /// </summary>
    [HttpGet("list")]
    public IActionResult GetUsers()
    {
        var users = UserManagement.GetUsers();
        return Ok(users);
    }
    
    /// <summary>
    /// Searches users by ID and role filter
    /// </summary>
    [HttpGet("search")]
    public IActionResult SearchUsers([FromQuery] string searchId, [FromQuery] string roleFilter)
    {
        var users = UserManagement.SearchUsers(searchId ?? "", roleFilter ?? "");
        return Ok(users);
    }
    
    /// <summary>
    /// Updates an existing user
    /// </summary>
    [HttpPut("update")]
    public IActionResult UpdateUser([FromBody] UpdateUserRequest request)
    {
        var result = UserManagement.UpdateUser(request.Id, request.Username, request.Name, request.Email, request.Role);
        return Ok(new { success = result });
    }
    
    /// <summary>
    /// Deletes a user from the system
    /// </summary>
    [HttpDelete("delete/{id}")]
    public IActionResult DeleteUser(string id)
    {
        var result = UserManagement.DeleteUser(id);
        return Ok(new { success = result });
    }
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class AddUserRequest
{
    public string Username { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Usertype { get; set; } = string.Empty;
}

public class UpdateUserRequest
{
    public string Id { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}
