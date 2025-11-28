using Microsoft.AspNetCore.Mvc;
using HuntSchedule.Persistence.Entities;
using HuntSchedule.Services.Interfaces;

namespace HuntScheduleApi.Controllers;

[ApiController]
[Route("api/statuses")]
public class RequestStatusController : ControllerBase
{
    private readonly IRequestStatusService _requestStatusService;

    public RequestStatusController(IRequestStatusService requestStatusService)
    {
        _requestStatusService = requestStatusService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RequestStatus>>> GetAll()
    {
        var statuses = await _requestStatusService.GetAllAsync();
        return Ok(statuses);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RequestStatus>> GetById(int id)
    {
        var status = await _requestStatusService.GetByIdAsync(id);
        if (status == null) return NotFound();
        return status;
    }
}
