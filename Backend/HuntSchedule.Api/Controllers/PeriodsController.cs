using Microsoft.AspNetCore.Mvc;
using HuntSchedule.Persistence.Entities;
using HuntSchedule.Services.Interfaces;

namespace HuntSchedule.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PeriodsController : ControllerBase
{
    private readonly ISchedulePeriodService _periodService;
    private readonly ILocalizationService _localization;

    public PeriodsController(ISchedulePeriodService periodService, ILocalizationService localization)
    {
        _periodService = periodService;
        _localization = localization;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SchedulePeriod>>> GetPeriods()
    {
        var periods = await _periodService.GetAllAsync();
        return Ok(periods);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SchedulePeriod>> GetPeriod(int id)
    {
        var period = await _periodService.GetByIdAsync(id);
        if (period == null) return NotFound(_localization.GetString("PeriodNotFound"));
        return period;
    }

    [HttpPost]
    public async Task<ActionResult<SchedulePeriod>> CreatePeriod(SchedulePeriod period)
    {
        var createdPeriod = await _periodService.CreateAsync(period);
        return CreatedAtAction(nameof(GetPeriod), new { id = createdPeriod.Id }, createdPeriod);
    }

    [HttpPatch("{id}/toggle")]
    public async Task<IActionResult> TogglePeriod(int id)
    {
        var period = await _periodService.GetByIdAsync(id);
        if (period == null) return NotFound(_localization.GetString("PeriodNotFound"));

        period.IsActive = !period.IsActive;
        await _periodService.UpdateAsync(period);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePeriod(int id)
    {
        var period = await _periodService.GetByIdAsync(id);
        if (period == null) return NotFound(_localization.GetString("PeriodNotFound"));
        
        await _periodService.DeleteAsync(id);
        return NoContent();
    }
}
