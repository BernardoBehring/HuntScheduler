using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HuntScheduleApi.Data;
using HuntScheduleApi.Models;
using HuntScheduleApi.Services;

namespace HuntScheduleApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CharactersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ITibiaCharacterValidator _tibiaValidator;

    public CharactersController(AppDbContext context, ITibiaCharacterValidator tibiaValidator)
    {
        _context = context;
        _tibiaValidator = tibiaValidator;
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
        if (character.UserId.HasValue)
        {
            var user = await _context.Users.FindAsync(character.UserId.Value);
            if (user == null) return BadRequest("User not found");
        }

        var server = await _context.Servers.FindAsync(character.ServerId);
        if (server == null) return BadRequest("Server not found");

        var tibiaResult = await _tibiaValidator.ValidateCharacterAsync(character.Name);
        if (tibiaResult == null || !tibiaResult.Exists)
        {
            return BadRequest($"Character '{character.Name}' not found on Tibia.com");
        }

        var tibiaServer = await _context.Servers
            .FirstOrDefaultAsync(s => s.Name.ToLower() == tibiaResult.World.ToLower());
        
        if (tibiaServer == null)
        {
            return BadRequest($"Character '{character.Name}' is on server '{tibiaResult.World}' which is not configured in our system");
        }

        if (tibiaServer.Id != character.ServerId)
        {
            return BadRequest($"Character '{character.Name}' is on server '{tibiaResult.World}', but you selected '{server.Name}'");
        }

        character.Name = tibiaResult.Name;
        character.Vocation = tibiaResult.Vocation;
        character.Level = tibiaResult.Level;

        if (character.IsMain && character.UserId.HasValue)
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

        var existingCharacter = await _context.Characters.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);
        if (existingCharacter == null) return NotFound();

        if (character.UserId.HasValue)
        {
            var user = await _context.Users.FindAsync(character.UserId.Value);
            if (user == null) return BadRequest("User not found");
        }

        var server = await _context.Servers.FindAsync(character.ServerId);
        if (server == null) return BadRequest("Server not found");

        bool nameChanged = !string.Equals(existingCharacter.Name, character.Name, StringComparison.OrdinalIgnoreCase);
        bool serverChanged = existingCharacter.ServerId != character.ServerId;
        
        if (nameChanged || serverChanged)
        {
            var tibiaResult = await _tibiaValidator.ValidateCharacterAsync(character.Name);
            if (tibiaResult == null || !tibiaResult.Exists)
            {
                return BadRequest($"Character '{character.Name}' not found on Tibia.com");
            }

            var tibiaServer = await _context.Servers
                .FirstOrDefaultAsync(s => s.Name.ToLower() == tibiaResult.World.ToLower());
            
            if (tibiaServer == null)
            {
                return BadRequest($"Character '{character.Name}' is on server '{tibiaResult.World}' which is not configured in our system");
            }

            if (tibiaServer.Id != character.ServerId)
            {
                return BadRequest($"Character '{character.Name}' is on server '{tibiaResult.World}', but you selected '{server.Name}'");
            }

            character.Name = tibiaResult.Name;
            character.Vocation = tibiaResult.Vocation;
            character.Level = tibiaResult.Level;
        }

        if (character.IsMain && character.UserId.HasValue)
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
