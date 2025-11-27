using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HuntScheduleApi.Data;
using HuntScheduleApi.Models;

namespace HuntScheduleApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServersController : ControllerBase
{
    private readonly AppDbContext _context;

    public ServersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Server>>> GetServers()
    {
        return await _context.Servers.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Server>> GetServer(int id)
    {
        var server = await _context.Servers.FindAsync(id);
        if (server == null) return NotFound();
        return server;
    }

    [HttpPost]
    public async Task<ActionResult<Server>> CreateServer(Server server)
    {
        _context.Servers.Add(server);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetServer), new { id = server.Id }, server);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateServer(int id, Server server)
    {
        if (id != server.Id) return BadRequest();
        _context.Entry(server).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteServer(int id)
    {
        var server = await _context.Servers.FindAsync(id);
        if (server == null) return NotFound();
        _context.Servers.Remove(server);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
