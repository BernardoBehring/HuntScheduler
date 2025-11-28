using Microsoft.AspNetCore.Mvc;
using HuntSchedule.Persistence.Entities;
using HuntSchedule.Services.Interfaces;

namespace HuntScheduleApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServersController : ControllerBase
{
    private readonly IServerService _serverService;

    public ServersController(IServerService serverService)
    {
        _serverService = serverService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Server>>> GetServers()
    {
        var servers = await _serverService.GetAllAsync();
        return Ok(servers);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Server>> GetServer(int id)
    {
        var server = await _serverService.GetByIdAsync(id);
        if (server == null) return NotFound();
        return server;
    }

    [HttpPost]
    public async Task<ActionResult<Server>> CreateServer(Server server)
    {
        var createdServer = await _serverService.CreateAsync(server);
        return CreatedAtAction(nameof(GetServer), new { id = createdServer.Id }, createdServer);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateServer(int id, Server server)
    {
        if (id != server.Id) return BadRequest();
        var existing = await _serverService.GetByIdAsync(id);
        if (existing == null) return NotFound();
        
        await _serverService.UpdateAsync(server);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteServer(int id)
    {
        var server = await _serverService.GetByIdAsync(id);
        if (server == null) return NotFound();
        
        await _serverService.DeleteAsync(id);
        return NoContent();
    }
}
