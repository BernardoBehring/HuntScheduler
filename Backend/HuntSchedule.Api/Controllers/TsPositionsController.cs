using Microsoft.AspNetCore.Mvc;
using HuntSchedule.Persistence.Entities;
using HuntSchedule.Services.Interfaces;

namespace HuntSchedule.Api.Controllers;

[ApiController]
[Route("api/ts-positions")]
public class TsPositionsController : ControllerBase
{
    private readonly ITsPositionService _tsPositionService;

    public TsPositionsController(ITsPositionService tsPositionService)
    {
        _tsPositionService = tsPositionService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TsPosition>>> GetAll()
    {
        var positions = await _tsPositionService.GetAllAsync();
        return Ok(positions);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TsPosition>> GetById(int id)
    {
        var position = await _tsPositionService.GetByIdAsync(id);
        if (position == null) return NotFound();
        return position;
    }
}
