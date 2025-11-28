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
                .ThenInclude(resp => resp!.Difficulty)
            .Include(r => r.Slot)
            .Include(r => r.Period)
            .Include(r => r.Status)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Request>> GetRequest(int id)
    {
        var request = await _context.Requests
            .Include(r => r.User)
            .Include(r => r.Server)
            .Include(r => r.Respawn)
                .ThenInclude(resp => resp!.Difficulty)
            .Include(r => r.Slot)
            .Include(r => r.Period)
            .Include(r => r.Status)
            .FirstOrDefaultAsync(r => r.Id == id);
        if (request == null) return NotFound();
        return request;
    }

    [HttpPost]
    public async Task<ActionResult<Request>> CreateRequest(Request request)
    {
        var pendingStatus = await _context.RequestStatuses.FirstOrDefaultAsync(s => s.Name == "pending");
        request.StatusId = pendingStatus?.Id ?? 1;
        request.CreatedAt = DateTime.UtcNow;
        _context.Requests.Add(request);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetRequest), new { id = request.Id }, request);
    }

    public class StatusUpdateDto
    {
        public int StatusId { get; set; }
        public string? Reason { get; set; }
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] StatusUpdateDto dto)
    {
        var request = await _context.Requests.FindAsync(id);
        if (request == null) return NotFound();

        request.StatusId = dto.StatusId;
        request.RejectionReason = dto.Reason;

        var approvedStatus = await _context.RequestStatuses.FirstOrDefaultAsync(s => s.Name == "approved");
        var rejectedStatus = await _context.RequestStatuses.FirstOrDefaultAsync(s => s.Name == "rejected");
        var pendingStatus = await _context.RequestStatuses.FirstOrDefaultAsync(s => s.Name == "pending");

        if (approvedStatus != null && dto.StatusId == approvedStatus.Id && pendingStatus != null && rejectedStatus != null)
        {
            var conflicts = await _context.Requests
                .Where(r => r.Id != id
                    && r.ServerId == request.ServerId
                    && r.RespawnId == request.RespawnId
                    && r.SlotId == request.SlotId
                    && r.PeriodId == request.PeriodId
                    && r.StatusId == pendingStatus.Id)
                .ToListAsync();

            foreach (var conflict in conflicts)
            {
                conflict.StatusId = rejectedStatus.Id;
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
