using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

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
    
    [HttpPost("add")]
    public IActionResult AddUser([FromBody] AddUserRequest request)
    {
        Console.WriteLine($"API called with: {request.Username}, {request.Name}, {request.Email}");
        var result = UserManagement.AddUser(request.Username, request.Name, request.Email, request.Password, request.Usertype);
        Console.WriteLine($"Result: {result}");
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