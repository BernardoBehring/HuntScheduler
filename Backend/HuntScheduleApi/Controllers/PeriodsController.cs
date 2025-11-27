using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HuntScheduleApi.Data;
using HuntScheduleApi.Models;

namespace HuntScheduleApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PeriodsController : ControllerBase
{
    private readonly AppDbContext _context;

    public PeriodsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SchedulePeriod>>> GetPeriods()
    {
        return await _context.SchedulePeriods.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SchedulePeriod>> GetPeriod(int id)
    {
        var period = await _context.SchedulePeriods.FindAsync(id);
        if (period == null) return NotFound();
        return period;
    }

    [HttpPost]
    public async Task<ActionResult<SchedulePeriod>> CreatePeriod(SchedulePeriod period)
    {
        _context.SchedulePeriods.Add(period);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetPeriod), new { id = period.Id }, period);
    }

    [HttpPatch("{id}/toggle")]
    public async Task<IActionResult> TogglePeriod(int id)
    {
        var period = await _context.SchedulePeriods.FindAsync(id);
        if (period == null) return NotFound();

        period.IsActive = !period.IsActive;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePeriod(int id)
    {
        var period = await _context.SchedulePeriods.FindAsync(id);
        if (period == null) return NotFound();
        _context.SchedulePeriods.Remove(period);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
