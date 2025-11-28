using Microsoft.AspNetCore.Mvc;
using HuntSchedule.Persistence.Entities;
using HuntSchedule.Services.Interfaces;

namespace HuntSchedule.Api.Controllers;

[ApiController]
[Route("api/difficulties")]
public class DifficultyController : ControllerBase
{
    private readonly IDifficultyService _difficultyService;

    public DifficultyController(IDifficultyService difficultyService)
    {
        _difficultyService = difficultyService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Difficulty>>> GetAll()
    {
        var difficulties = await _difficultyService.GetAllAsync();
        return Ok(difficulties);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Difficulty>> GetById(int id)
    {
        var difficulty = await _difficultyService.GetByIdAsync(id);
        if (difficulty == null) return NotFound();
        return difficulty;
    }
}
