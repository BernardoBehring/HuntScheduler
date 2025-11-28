using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HuntScheduleApi.Data;
using HuntScheduleApi.Models;

namespace HuntScheduleApi.Controllers;

[ApiController]
[Route("api/difficulties")]
public class DifficultyController : ControllerBase
{
    private readonly AppDbContext _context;

    public DifficultyController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Difficulty>>> GetAll()
    {
        return await _context.Difficulties.OrderBy(d => d.SortOrder).ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Difficulty>> GetById(int id)
    {
        var difficulty = await _context.Difficulties.FindAsync(id);
        if (difficulty == null)
            return NotFound();
        return difficulty;
    }

    [HttpPost]
    public async Task<ActionResult<Difficulty>> Create(Difficulty difficulty)
    {
        _context.Difficulties.Add(difficulty);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = difficulty.Id }, difficulty);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Difficulty difficulty)
    {
        if (id != difficulty.Id)
            return BadRequest();

        _context.Entry(difficulty).State = EntityState.Modified;
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await _context.Difficulties.AnyAsync(d => d.Id == id))
                return NotFound();
            throw;
        }
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var difficulty = await _context.Difficulties.FindAsync(id);
        if (difficulty == null)
            return NotFound();

        _context.Difficulties.Remove(difficulty);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
