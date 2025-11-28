using Microsoft.AspNetCore.Mvc;
using HuntSchedule.Services.Interfaces;

namespace HuntSchedule.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IUserService _userService;
    private readonly ILocalizationService _localization;

    public AuthController(IAuthService authService, IUserService userService, ILocalizationService localization)
    {
        _authService = authService;
        _userService = userService;
        _localization = localization;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
        {
            return BadRequest(new { message = "Username and password required" });
        }

        var isValid = await _authService.ValidateCredentialsAsync(request.Username, request.Password);
        if (!isValid)
        {
            return Unauthorized(new { message = "Invalid credentials" });
        }

        var userId = await _authService.GetUserIdByUsernameAsync(request.Username);
        if (userId == null)
        {
            return Unauthorized(new { message = "Invalid credentials" });
        }

        HttpContext.Session.SetInt32("UserId", userId.Value);

        var user = await _userService.GetByIdWithCharactersAsync(userId.Value);
        return Ok(user);
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        HttpContext.Session.Clear();
        return Ok(new { message = "Logged out" });
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = HttpContext.Session.GetInt32("UserId");
        if (userId == null)
        {
            return Unauthorized(new { message = "Not authenticated" });
        }

        var user = await _userService.GetByIdWithCharactersAsync(userId.Value);
        if (user == null)
        {
            return Unauthorized(new { message = "User not found" });
        }

        return Ok(user);
    }
}

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
