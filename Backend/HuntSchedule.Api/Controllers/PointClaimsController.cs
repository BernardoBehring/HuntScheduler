using Microsoft.AspNetCore.Mvc;
using HuntSchedule.Persistence.Entities;
using HuntSchedule.Services.Interfaces;
using static HuntSchedule.Services.Resources.ErrorKeys;

namespace HuntSchedule.Api.Controllers;

[ApiController]
[Route("api/point-claims")]
public class PointClaimsController : ControllerBase
{
    private readonly IPointClaimService _pointClaimService;
    private readonly IUserService _userService;
    private readonly ILocalizationService _localization;

    public PointClaimsController(
        IPointClaimService pointClaimService, 
        IUserService userService,
        ILocalizationService localization)
    {
        _pointClaimService = pointClaimService;
        _userService = userService;
        _localization = localization;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PointClaim>>> GetAll()
    {
        var claims = await _pointClaimService.GetAllAsync();
        return Ok(claims);
    }

    [HttpGet("pending")]
    public async Task<ActionResult<IEnumerable<PointClaim>>> GetPending()
    {
        var claims = await _pointClaimService.GetPendingClaimsAsync();
        return Ok(claims);
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<PointClaim>>> GetByUser(int userId)
    {
        var user = await _userService.GetByIdAsync(userId);
        if (user == null) return NotFound(_localization.GetString(UserNotFound));
        
        var claims = await _pointClaimService.GetByUserIdAsync(userId);
        return Ok(claims);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PointClaim>> GetById(int id)
    {
        var claim = await _pointClaimService.GetByIdAsync(id);
        if (claim == null) return NotFound("Claim not found");
        
        return Ok(claim);
    }

    [HttpPost]
    public async Task<ActionResult<PointClaim>> Create([FromBody] CreatePointClaimDto dto)
    {
        var user = await _userService.GetByIdAsync(dto.UserId);
        if (user == null) return NotFound(_localization.GetString(UserNotFound));

        try
        {
            var claim = await _pointClaimService.CreateAsync(
                dto.UserId,
                dto.Note,
                dto.ScreenshotUrl);
            
            return CreatedAtAction(nameof(GetById), new { id = claim.Id }, claim);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id}/approve")]
    public async Task<ActionResult<PointClaim>> Approve(int id, [FromBody] ReviewClaimDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.AdminResponse))
        {
            return BadRequest("Admin response is required");
        }

        if (!dto.PointsAwarded.HasValue || dto.PointsAwarded <= 0)
        {
            return BadRequest("Points to award must be greater than 0");
        }

        var admin = await _userService.GetByIdAsync(dto.AdminId);
        if (admin == null) return NotFound("Admin not found");

        try
        {
            var claim = await _pointClaimService.ApproveAsync(id, dto.AdminId, dto.AdminResponse, dto.PointsAwarded.Value);
            if (claim == null) return NotFound("Claim not found");
            
            return Ok(claim);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id}/reject")]
    public async Task<ActionResult<PointClaim>> Reject(int id, [FromBody] ReviewClaimDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.AdminResponse))
        {
            return BadRequest("Admin response is required");
        }

        var admin = await _userService.GetByIdAsync(dto.AdminId);
        if (admin == null) return NotFound("Admin not found");

        try
        {
            var claim = await _pointClaimService.RejectAsync(id, dto.AdminId, dto.AdminResponse);
            if (claim == null) return NotFound("Claim not found");
            
            return Ok(claim);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}

public class CreatePointClaimDto
{
    public int UserId { get; set; }
    public string? Note { get; set; }
    public string? ScreenshotUrl { get; set; }
}

public class ReviewClaimDto
{
    public int AdminId { get; set; }
    public string AdminResponse { get; set; } = string.Empty;
    public int? PointsAwarded { get; set; }
}
