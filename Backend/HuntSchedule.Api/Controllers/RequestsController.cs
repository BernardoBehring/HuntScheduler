using Microsoft.AspNetCore.Mvc;
using HuntSchedule.Persistence.Entities;
using HuntSchedule.Services.Interfaces;
using HuntSchedule.Services.DTOs;

namespace HuntSchedule.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RequestsController : ControllerBase
{
    private readonly IRequestService _requestService;

    public RequestsController(IRequestService requestService)
    {
        _requestService = requestService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Request>>> GetRequests()
    {
        var requests = await _requestService.GetAllAsync();
        return Ok(requests);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Request>> GetRequest(int id)
    {
        var request = await _requestService.GetByIdAsync(id);
        if (request == null) return NotFound();
        return request;
    }

    [HttpPost]
    public async Task<ActionResult<Request>> CreateRequest(CreateRequestDto dto)
    {
        var result = await _requestService.CreateAsync(dto);
        if (!result.Success) return BadRequest(result.ErrorMessage);
        return CreatedAtAction(nameof(GetRequest), new { id = result.Data!.Id }, result.Data);
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] StatusUpdateDto dto)
    {
        var result = await _requestService.UpdateStatusAsync(id, dto);
        if (!result.Success)
        {
            if (result.ErrorMessage == "Request not found") return NotFound();
            return BadRequest(result.ErrorMessage);
        }
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRequest(int id)
    {
        var request = await _requestService.GetByIdAsync(id);
        if (request == null) return NotFound();
        
        await _requestService.DeleteAsync(id);
        return NoContent();
    }
}
