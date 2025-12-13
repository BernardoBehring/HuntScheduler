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
            .Include(s => s.TsPosition)
            .Where(s => s.UserId == userId)
            .ToListAsync();
        return Ok(settings);
    }

    [HttpGet("user/{userId}/server/{serverId}")]
    public async Task<ActionResult<UserServerSettings>> GetByUserAndServer(int userId, int serverId)
    {
        var settings = await _context.UserServerSettings
            .Include(s => s.Server)
            .Include(s => s.TsPosition)
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
                TsDescription = dto.TsDescription,
                TsPositionId = dto.TsPositionId
            };
            _context.UserServerSettings.Add(settings);
        }
        else
        {
            if (dto.TsDescription != null)
            {
                settings.TsDescription = dto.TsDescription;
            }
            if (dto.TsPositionId.HasValue || dto.ClearTsPosition)
            {
                settings.TsPositionId = dto.TsPositionId;
            }
        }
        
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

public class UpdateUserServerSettingsDto
{
    public string? TsDescription { get; set; }
    public int? TsPositionId { get; set; }
    public bool ClearTsPosition { get; set; } = false;
}
