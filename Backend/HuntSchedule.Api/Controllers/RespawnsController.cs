using Microsoft.AspNetCore.Mvc;
using HuntSchedule.Persistence.Entities;
using HuntSchedule.Services.Interfaces;

namespace HuntSchedule.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RespawnsController : ControllerBase
{
    private readonly IRespawnService _respawnService;
    private readonly ILocalizationService _localization;

    public RespawnsController(IRespawnService respawnService, ILocalizationService localization)
    {
        _respawnService = respawnService;
        _localization = localization;
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
        if (respawn == null) return NotFound(_localization.GetString("RespawnNotFound"));
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
        if (id != respawn.Id) return BadRequest(_localization.GetString("IdMismatch"));
        var existing = await _respawnService.GetByIdAsync(id);
        if (existing == null) return NotFound(_localization.GetString("RespawnNotFound"));
        
        await _respawnService.UpdateAsync(respawn);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRespawn(int id)
    {
        var respawn = await _respawnService.GetByIdAsync(id);
        if (respawn == null) return NotFound(_localization.GetString("RespawnNotFound"));
        
        await _respawnService.DeleteAsync(id);
        return NoContent();
    }
}
