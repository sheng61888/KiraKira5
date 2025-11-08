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

public class AddUserRequest
{
    public string Username { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
    public string Usertype { get; set; }
}

public class UpdateUserRequest
{
    public string Id { get; set; }
    public string Username { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string Role { get; set; }
}