using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HuntScheduleApi.Data;
using HuntScheduleApi.Models;

namespace HuntScheduleApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers()
    {
        return await _context.Users
            .Include(u => u.Role)
            .Include(u => u.Characters)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetUser(int id)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .Include(u => u.Characters)
            .FirstOrDefaultAsync(u => u.Id == id);
        if (user == null) return NotFound();
        return user;
    }

    [HttpPost]
    public async Task<ActionResult<User>> CreateUser(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
    }

    [HttpPatch("{id}/points")]
    public async Task<IActionResult> UpdatePoints(int id, [FromBody] int amount)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();

        user.Points += amount;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id}/role")]
    public async Task<IActionResult> UpdateRole(int id, [FromBody] int roleId)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();

        var role = await _context.Roles.FindAsync(roleId);
        if (role == null) return BadRequest("Role not found");

        user.RoleId = roleId;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
