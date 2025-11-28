using Microsoft.AspNetCore.Mvc;
using HuntSchedule.Persistence.Entities;
using HuntSchedule.Services.Interfaces;

namespace HuntSchedule.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CharactersController : ControllerBase
{
    private readonly ICharacterService _characterService;

    public CharactersController(ICharacterService characterService)
    {
        _characterService = characterService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Character>>> GetCharacters()
    {
        var characters = await _characterService.GetAllAsync();
        return Ok(characters);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Character>> GetCharacter(int id)
    {
        var character = await _characterService.GetByIdAsync(id);
        if (character == null) return NotFound();
        return character;
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<Character>>> GetCharactersByUser(int userId)
    {
        var characters = await _characterService.GetByUserIdAsync(userId);
        return Ok(characters);
    }

    [HttpPost]
    public async Task<ActionResult<Character>> CreateCharacter(Character character)
    {
        var result = await _characterService.CreateAsync(character);
        if (!result.Success) return BadRequest(result.ErrorMessage);
        return CreatedAtAction(nameof(GetCharacter), new { id = result.Data!.Id }, result.Data);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCharacter(int id, Character character)
    {
        var result = await _characterService.UpdateAsync(id, character);
        if (!result.Success) 
        {
            if (result.ErrorMessage == "Character not found") return NotFound();
            return BadRequest(result.ErrorMessage);
        }
        return NoContent();
    }

    [HttpPatch("{id}/set-main")]
    public async Task<IActionResult> SetMainCharacter(int id)
    {
        var character = await _characterService.GetByIdAsync(id);
        if (character == null) return NotFound();

        await _characterService.SetMainCharacterAsync(id);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCharacter(int id)
    {
        var character = await _characterService.GetByIdAsync(id);
        if (character == null) return NotFound();
        
        await _characterService.DeleteAsync(id);
        return NoContent();
    }
}
