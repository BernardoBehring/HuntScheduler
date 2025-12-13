using Microsoft.AspNetCore.Mvc;
using HuntSchedule.Persistence.Entities;
using HuntSchedule.Services.Interfaces;
using static HuntSchedule.Services.Resources.ErrorKeys;

namespace HuntSchedule.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IRoleService _roleService;
    private readonly ILocalizationService _localization;

    public UsersController(IUserService userService, IRoleService roleService, ILocalizationService localization)
    {
        _userService = userService;
        _roleService = roleService;
        _localization = localization;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers()
    {
        var users = await _userService.GetAllAsync();
        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetUser(int id)
    {
        var user = await _userService.GetByIdWithCharactersAsync(id);
        if (user == null) return NotFound(_localization.GetString(UserNotFound));
        return user;
    }

    [HttpPost]
    public async Task<ActionResult<User>> CreateUser(User user)
    {
        var createdUser = await _userService.CreateAsync(user);
        return CreatedAtAction(nameof(GetUser), new { id = createdUser.Id }, createdUser);
    }

    [HttpPatch("{id}/points")]
    public async Task<IActionResult> UpdatePoints(int id, [FromBody] int amount)
    {
        var user = await _userService.GetByIdAsync(id);
        if (user == null) return NotFound(_localization.GetString(UserNotFound));

        await _userService.UpdatePointsAsync(id, user.Points + amount);
        return NoContent();
    }

    [HttpPatch("{id}/role")]
    public async Task<IActionResult> UpdateRole(int id, [FromBody] int roleId)
    {
        var user = await _userService.GetByIdAsync(id);
        if (user == null) return NotFound(_localization.GetString(UserNotFound));

        var role = await _roleService.GetByIdAsync(roleId);
        if (role == null) return NotFound(_localization.GetString(RoleNotFound));

        user.RoleId = roleId;
        await _userService.UpdateAsync(user);
        return NoContent();
    }

    [HttpPatch("{id}/profile")]
    public async Task<IActionResult> UpdateProfile(int id, [FromBody] UpdateProfileDto dto)
    {
        var user = await _userService.GetByIdAsync(id);
        if (user == null) return NotFound(_localization.GetString(UserNotFound));

        user.Email = dto.Email;
        user.Whatsapp = dto.Whatsapp;
        user.TsDescription = dto.TsDescription;
        await _userService.UpdateAsync(user);
        return NoContent();
    }
}

public class UpdateProfileDto
{
    public string? Email { get; set; }
    public string? Whatsapp { get; set; }
    public string? TsDescription { get; set; }
}
