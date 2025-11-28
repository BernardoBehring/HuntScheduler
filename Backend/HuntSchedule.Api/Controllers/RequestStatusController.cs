using Microsoft.AspNetCore.Mvc;
using HuntSchedule.Persistence.Entities;
using HuntSchedule.Services.Interfaces;

namespace HuntSchedule.Api.Controllers;

[ApiController]
[Route("api/statuses")]
public class RequestStatusController : ControllerBase
{
    private readonly IRequestStatusService _requestStatusService;
    private readonly ILocalizationService _localization;

    public RequestStatusController(IRequestStatusService requestStatusService, ILocalizationService localization)
    {
        _requestStatusService = requestStatusService;
        _localization = localization;
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
        if (status == null) return NotFound(_localization.GetString("StatusNotFound"));
        return status;
    }
}
