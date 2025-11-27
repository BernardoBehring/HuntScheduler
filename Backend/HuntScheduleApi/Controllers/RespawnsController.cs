using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HuntScheduleApi.Data;
using HuntScheduleApi.Models;

namespace HuntScheduleApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RespawnsController : ControllerBase
{
    private readonly AppDbContext _context;

    public RespawnsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Respawn>>> GetRespawns()
    {
        return await _context.Respawns.Include(r => r.Server).ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Respawn>> GetRespawn(int id)
    {
        var respawn = await _context.Respawns.Include(r => r.Server).FirstOrDefaultAsync(r => r.Id == id);
        if (respawn == null) return NotFound();
        return respawn;
    }

    [HttpPost]
    public async Task<ActionResult<Respawn>> CreateRespawn(Respawn respawn)
    {
        _context.Respawns.Add(respawn);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetRespawn), new { id = respawn.Id }, respawn);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRespawn(int id, Respawn respawn)
    {
        if (id != respawn.Id) return BadRequest();
        _context.Entry(respawn).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRespawn(int id)
    {
        var respawn = await _context.Respawns.FindAsync(id);
        if (respawn == null) return NotFound();
        _context.Respawns.Remove(respawn);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
