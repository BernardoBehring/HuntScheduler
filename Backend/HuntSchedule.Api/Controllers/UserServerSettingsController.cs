using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HuntSchedule.Persistence.Context;
using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Api.Controllers;

[ApiController]
[Route("api/user-server-settings")]
public class UserServerSettingsController : ControllerBase
{
    private readonly AppDbContext _context;

    public UserServerSettingsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<UserServerSettings>>> GetByUser(int userId)
    {
        var settings = await _context.UserServerSettings
            .Include(s => s.Server)
            .Where(s => s.UserId == userId)
            .ToListAsync();
        return Ok(settings);
    }

    [HttpGet("user/{userId}/server/{serverId}")]
    public async Task<ActionResult<UserServerSettings>> GetByUserAndServer(int userId, int serverId)
    {
        var settings = await _context.UserServerSettings
            .Include(s => s.Server)
            .FirstOrDefaultAsync(s => s.UserId == userId && s.ServerId == serverId);
        
        if (settings == null)
        {
            return Ok(new UserServerSettings { UserId = userId, ServerId = serverId });
        }
        return Ok(settings);
    }

    [HttpPut("user/{userId}/server/{serverId}")]
    public async Task<IActionResult> UpdateOrCreate(int userId, int serverId, [FromBody] UpdateUserServerSettingsDto dto)
    {
        var settings = await _context.UserServerSettings
            .FirstOrDefaultAsync(s => s.UserId == userId && s.ServerId == serverId);
        
        if (settings == null)
        {
            settings = new UserServerSettings
            {
                UserId = userId,
                ServerId = serverId,
                TsDescription = dto.TsDescription
            };
            _context.UserServerSettings.Add(settings);
        }
        else
        {
            settings.TsDescription = dto.TsDescription;
        }
        
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

public class UpdateUserServerSettingsDto
{
    public string? TsDescription { get; set; }
}
