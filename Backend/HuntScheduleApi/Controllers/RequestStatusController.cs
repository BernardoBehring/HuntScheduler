using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HuntScheduleApi.Data;
using HuntScheduleApi.Models;

namespace HuntScheduleApi.Controllers;

[ApiController]
[Route("api/statuses")]
public class RequestStatusController : ControllerBase
{
    private readonly AppDbContext _context;

    public RequestStatusController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RequestStatus>>> GetAll()
    {
        return await _context.RequestStatuses.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RequestStatus>> GetById(int id)
    {
        var status = await _context.RequestStatuses.FindAsync(id);
        if (status == null)
            return NotFound();
        return status;
    }

    [HttpPost]
    public async Task<ActionResult<RequestStatus>> Create(RequestStatus status)
    {
        _context.RequestStatuses.Add(status);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = status.Id }, status);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, RequestStatus status)
    {
        if (id != status.Id)
            return BadRequest();

        _context.Entry(status).State = EntityState.Modified;
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await _context.RequestStatuses.AnyAsync(s => s.Id == id))
                return NotFound();
            throw;
        }
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var status = await _context.RequestStatuses.FindAsync(id);
        if (status == null)
            return NotFound();

        _context.RequestStatuses.Remove(status);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
