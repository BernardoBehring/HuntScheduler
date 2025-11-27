using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HuntScheduleApi.Data;
using HuntScheduleApi.Models;

namespace HuntScheduleApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RequestsController : ControllerBase
{
    private readonly AppDbContext _context;

    public RequestsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Request>>> GetRequests()
    {
        return await _context.Requests
            .Include(r => r.User)
            .Include(r => r.Server)
            .Include(r => r.Respawn)
            .Include(r => r.Slot)
            .Include(r => r.Period)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Request>> GetRequest(int id)
    {
        var request = await _context.Requests
            .Include(r => r.User)
            .Include(r => r.Respawn)
            .Include(r => r.Slot)
            .Include(r => r.Period)
            .FirstOrDefaultAsync(r => r.Id == id);
        if (request == null) return NotFound();
        return request;
    }

    [HttpPost]
    public async Task<ActionResult<Request>> CreateRequest(Request request)
    {
        request.Status = "pending";
        request.CreatedAt = DateTime.UtcNow;
        _context.Requests.Add(request);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetRequest), new { id = request.Id }, request);
    }

    public class StatusUpdateDto
    {
        public string Status { get; set; } = string.Empty;
        public string? Reason { get; set; }
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] StatusUpdateDto dto)
    {
        var request = await _context.Requests.FindAsync(id);
        if (request == null) return NotFound();

        request.Status = dto.Status;
        request.RejectionReason = dto.Reason;

        if (dto.Status == "approved")
        {
            var conflicts = await _context.Requests
                .Where(r => r.Id != id
                    && r.ServerId == request.ServerId
                    && r.RespawnId == request.RespawnId
                    && r.SlotId == request.SlotId
                    && r.PeriodId == request.PeriodId
                    && r.Status == "pending")
                .ToListAsync();

            foreach (var conflict in conflicts)
            {
                conflict.Status = "rejected";
                conflict.RejectionReason = $"Conflict with approved request #{id}";
            }
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRequest(int id)
    {
        var request = await _context.Requests.FindAsync(id);
        if (request == null) return NotFound();
        _context.Requests.Remove(request);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
