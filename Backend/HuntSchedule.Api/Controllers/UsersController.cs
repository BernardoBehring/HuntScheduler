using Microsoft.AspNetCore.Mvc;
using HuntSchedule.Persistence.Entities;
using HuntSchedule.Services.Interfaces;
using HuntSchedule.Api.DTOs;
using static HuntSchedule.Services.Results.ErrorCode;

namespace HuntSchedule.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IRoleService _roleService;

    public UsersController(IUserService userService, IRoleService roleService)
    {
        _userService = userService;
        _roleService = roleService;
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
        if (user == null) return NotFound();
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
        if (user == null) return NotFound();

        await _userService.UpdatePointsAsync(id, user.Points + amount);
        return NoContent();
    }

    [HttpPatch("{id}/role")]
    public async Task<IActionResult> UpdateRole(int id, [FromBody] int roleId)
    {
        var user = await _userService.GetByIdAsync(id);
        if (user == null) return NotFound();

        var role = await _roleService.GetByIdAsync(roleId);
        if (role == null) return BadRequest(new ErrorResponse { ErrorCode = RoleNotFound });

        user.RoleId = roleId;
        await _userService.UpdateAsync(user);
        return NoContent();
    }
}
