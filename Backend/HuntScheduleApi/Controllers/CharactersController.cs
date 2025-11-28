using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HuntScheduleApi.Data;
using HuntScheduleApi.Models;

namespace HuntScheduleApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CharactersController : ControllerBase
{
    private readonly AppDbContext _context;

    public CharactersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Character>>> GetCharacters()
    {
        return await _context.Characters
            .Include(c => c.Server)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Character>> GetCharacter(int id)
    {
        var character = await _context.Characters
            .Include(c => c.Server)
            .FirstOrDefaultAsync(c => c.Id == id);
        if (character == null) return NotFound();
        return character;
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<Character>>> GetCharactersByUser(int userId)
    {
        return await _context.Characters
            .Include(c => c.Server)
            .Where(c => c.UserId == userId)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Character>> CreateCharacter(Character character)
    {
        var user = await _context.Users.FindAsync(character.UserId);
        if (user == null) return BadRequest("User not found");

        var server = await _context.Servers.FindAsync(character.ServerId);
        if (server == null) return BadRequest("Server not found");

        if (character.IsMain)
        {
            var existingMain = await _context.Characters
                .Where(c => c.UserId == character.UserId && c.IsMain)
                .ToListAsync();
            foreach (var c in existingMain)
            {
                c.IsMain = false;
            }
        }

        _context.Characters.Add(character);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetCharacter), new { id = character.Id }, character);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCharacter(int id, Character character)
    {
        if (id != character.Id) return BadRequest();

        if (character.IsMain)
        {
            var existingMain = await _context.Characters
                .Where(c => c.UserId == character.UserId && c.IsMain && c.Id != id)
                .ToListAsync();
            foreach (var c in existingMain)
            {
                c.IsMain = false;
            }
        }

        _context.Entry(character).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id}/set-main")]
    public async Task<IActionResult> SetMainCharacter(int id)
    {
        var character = await _context.Characters.FindAsync(id);
        if (character == null) return NotFound();

        var existingMain = await _context.Characters
            .Where(c => c.UserId == character.UserId && c.IsMain)
            .ToListAsync();
        foreach (var c in existingMain)
        {
            c.IsMain = false;
        }

        character.IsMain = true;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCharacter(int id)
    {
        var character = await _context.Characters.FindAsync(id);
        if (character == null) return NotFound();
        _context.Characters.Remove(character);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
