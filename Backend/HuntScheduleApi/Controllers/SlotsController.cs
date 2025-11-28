using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HuntScheduleApi.Data;
using HuntScheduleApi.Models;

namespace HuntScheduleApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SlotsController : ControllerBase
{
    private readonly AppDbContext _context;

    public SlotsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Slot>>> GetSlots()
    {
        return await _context.Slots
            .Include(s => s.Server)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Slot>> GetSlot(int id)
    {
        var slot = await _context.Slots
            .Include(s => s.Server)
            .FirstOrDefaultAsync(s => s.Id == id);
        if (slot == null) return NotFound();
        return slot;
    }

    [HttpPost]
    public async Task<ActionResult<Slot>> CreateSlot(Slot slot)
    {
        _context.Slots.Add(slot);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetSlot), new { id = slot.Id }, slot);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSlot(int id)
    {
        var slot = await _context.Slots.FindAsync(id);
        if (slot == null) return NotFound();
        _context.Slots.Remove(slot);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
