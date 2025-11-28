using Microsoft.AspNetCore.Mvc;
using HuntSchedule.Persistence.Entities;
using HuntSchedule.Services.Interfaces;

namespace HuntSchedule.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RespawnsController : ControllerBase
{
    private readonly IRespawnService _respawnService;

    public RespawnsController(IRespawnService respawnService)
    {
        _respawnService = respawnService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Respawn>>> GetRespawns()
    {
        var respawns = await _respawnService.GetAllAsync();
        return Ok(respawns);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Respawn>> GetRespawn(int id)
    {
        var respawn = await _respawnService.GetByIdAsync(id);
        if (respawn == null) return NotFound();
        return respawn;
    }

    [HttpPost]
    public async Task<ActionResult<Respawn>> CreateRespawn(Respawn respawn)
    {
        var createdRespawn = await _respawnService.CreateAsync(respawn);
        return CreatedAtAction(nameof(GetRespawn), new { id = createdRespawn.Id }, createdRespawn);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRespawn(int id, Respawn respawn)
    {
        if (id != respawn.Id) return BadRequest();
        var existing = await _respawnService.GetByIdAsync(id);
        if (existing == null) return NotFound();
        
        await _respawnService.UpdateAsync(respawn);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRespawn(int id)
    {
        var respawn = await _respawnService.GetByIdAsync(id);
        if (respawn == null) return NotFound();
        
        await _respawnService.DeleteAsync(id);
        return NoContent();
    }
}
