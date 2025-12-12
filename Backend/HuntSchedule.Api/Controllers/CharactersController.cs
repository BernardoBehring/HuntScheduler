using Microsoft.AspNetCore.Mvc;
using HuntSchedule.Persistence.Entities;
using HuntSchedule.Services.Interfaces;
using HuntSchedule.Services.Results;
using HuntSchedule.Services.External;
using static HuntSchedule.Services.Resources.ErrorKeys;

namespace HuntSchedule.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CharactersController : ControllerBase
{
    private readonly ICharacterService _characterService;
    private readonly ILocalizationService _localization;
    private readonly ITibiaCharacterValidator _tibiaValidator;

    public CharactersController(ICharacterService characterService, ILocalizationService localization, ITibiaCharacterValidator tibiaValidator)
    {
        _characterService = characterService;
        _localization = localization;
        _tibiaValidator = tibiaValidator;
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
        if (character == null) return NotFound(_localization.GetString(CharacterNotFound));
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
        if (!result.Success)
        {
            if (result.ErrorType == ErrorType.NotFound) return NotFound(result.ErrorMessage);
            return BadRequest(result.ErrorMessage);
        }
        return CreatedAtAction(nameof(GetCharacter), new { id = result.Data!.Id }, result.Data);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCharacter(int id, Character character)
    {
        var result = await _characterService.UpdateAsync(id, character);
        if (!result.Success) 
        {
            if (result.ErrorType == ErrorType.NotFound) return NotFound(result.ErrorMessage);
            return BadRequest(result.ErrorMessage);
        }
        return NoContent();
    }

    [HttpPatch("{id}/set-main")]
    public async Task<IActionResult> SetMainCharacter(int id)
    {
        var character = await _characterService.GetByIdAsync(id);
        if (character == null) return NotFound(_localization.GetString(CharacterNotFound));

        await _characterService.SetMainCharacterAsync(id);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCharacter(int id)
    {
        var character = await _characterService.GetByIdAsync(id);
        if (character == null) return NotFound(_localization.GetString(CharacterNotFound));
        
        await _characterService.DeleteAsync(id);
        return NoContent();
    }

    [HttpPost("validate")]
    public async Task<ActionResult<ValidateCharactersResponse>> ValidateCharacters([FromBody] ValidateCharactersRequest request)
    {
        var results = new List<CharacterValidationResult>();
        
        foreach (var name in request.CharacterNames)
        {
            var tibiaResult = await _tibiaValidator.ValidateCharacterAsync(name);
            
            if (tibiaResult == null || !tibiaResult.Exists)
            {
                results.Add(new CharacterValidationResult
                {
                    Name = name,
                    IsValid = false,
                    ErrorMessage = _localization.GetString(CharacterNotFoundOnTibia, name)
                });
            }
            else if (!string.IsNullOrEmpty(request.ExpectedWorld) && 
                     !string.Equals(tibiaResult.World, request.ExpectedWorld, StringComparison.OrdinalIgnoreCase))
            {
                results.Add(new CharacterValidationResult
                {
                    Name = tibiaResult.Name,
                    IsValid = false,
                    ErrorMessage = _localization.GetString(CharacterServerMismatch, tibiaResult.Name, tibiaResult.World, request.ExpectedWorld),
                    World = tibiaResult.World,
                    Vocation = tibiaResult.Vocation,
                    Level = tibiaResult.Level
                });
            }
            else
            {
                results.Add(new CharacterValidationResult
                {
                    Name = tibiaResult.Name,
                    IsValid = true,
                    World = tibiaResult.World,
                    Vocation = tibiaResult.Vocation,
                    Level = tibiaResult.Level
                });
            }
        }
        
        return Ok(new ValidateCharactersResponse
        {
            Results = results,
            AllValid = results.All(r => r.IsValid)
        });
    }
}

public class ValidateCharactersRequest
{
    public List<string> CharacterNames { get; set; } = new();
    public string? ExpectedWorld { get; set; }
}

public class ValidateCharactersResponse
{
    public List<CharacterValidationResult> Results { get; set; } = new();
    public bool AllValid { get; set; }
}

public class CharacterValidationResult
{
    public string Name { get; set; } = string.Empty;
    public bool IsValid { get; set; }
    public string? ErrorMessage { get; set; }
    public string? World { get; set; }
    public string? Vocation { get; set; }
    public int? Level { get; set; }
}
