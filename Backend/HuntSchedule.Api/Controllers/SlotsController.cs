using Microsoft.AspNetCore.Mvc;
using HuntSchedule.Persistence.Entities;
using HuntSchedule.Services.Interfaces;
using static HuntSchedule.Services.Resources.ErrorKeys;

namespace HuntSchedule.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SlotsController : ControllerBase
{
    private readonly ISlotService _slotService;
    private readonly ILocalizationService _localization;

    public SlotsController(ISlotService slotService, ILocalizationService localization)
    {
        _slotService = slotService;
        _localization = localization;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Slot>>> GetSlots()
    {
        var slots = await _slotService.GetAllAsync();
        return Ok(slots);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Slot>> GetSlot(int id)
    {
        var slot = await _slotService.GetByIdAsync(id);
        if (slot == null) return NotFound(_localization.GetString(SlotNotFound));
        return slot;
    }

    [HttpPost]
    public async Task<ActionResult<Slot>> CreateSlot(Slot slot)
    {
        var createdSlot = await _slotService.CreateAsync(slot);
        return CreatedAtAction(nameof(GetSlot), new { id = createdSlot.Id }, createdSlot);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSlot(int id)
    {
        var slot = await _slotService.GetByIdAsync(id);
        if (slot == null) return NotFound(_localization.GetString(SlotNotFound));
        
        await _slotService.DeleteAsync(id);
        return NoContent();
    }
}
