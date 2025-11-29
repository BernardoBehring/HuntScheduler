using Microsoft.AspNetCore.Mvc;
using HuntSchedule.Persistence.Entities;
using HuntSchedule.Services.Interfaces;
using static HuntSchedule.Services.Resources.ErrorKeys;

namespace HuntSchedule.Api.Controllers;

[ApiController]
[Route("api/point-transactions")]
public class PointTransactionsController : ControllerBase
{
    private readonly IPointTransactionService _pointTransactionService;
    private readonly IUserService _userService;
    private readonly ILocalizationService _localization;

    public PointTransactionsController(
        IPointTransactionService pointTransactionService, 
        IUserService userService,
        ILocalizationService localization)
    {
        _pointTransactionService = pointTransactionService;
        _userService = userService;
        _localization = localization;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PointTransaction>>> GetAll()
    {
        var transactions = await _pointTransactionService.GetAllAsync();
        return Ok(transactions);
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<PointTransaction>>> GetByUser(int userId)
    {
        var user = await _userService.GetByIdAsync(userId);
        if (user == null) return NotFound(_localization.GetString(UserNotFound));
        
        var transactions = await _pointTransactionService.GetByUserIdAsync(userId);
        return Ok(transactions);
    }

    [HttpGet("admin/{adminId}")]
    public async Task<ActionResult<IEnumerable<PointTransaction>>> GetByAdmin(int adminId)
    {
        var admin = await _userService.GetByIdAsync(adminId);
        if (admin == null) return NotFound(_localization.GetString(UserNotFound));
        
        var transactions = await _pointTransactionService.GetByAdminIdAsync(adminId);
        return Ok(transactions);
    }

    [HttpPost]
    public async Task<ActionResult<PointTransaction>> Create([FromBody] CreatePointTransactionDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Reason))
        {
            return BadRequest("Reason is required");
        }

        var user = await _userService.GetByIdAsync(dto.UserId);
        if (user == null) return NotFound(_localization.GetString(UserNotFound));

        var admin = await _userService.GetByIdAsync(dto.AdminId);
        if (admin == null) return NotFound("Admin not found");

        try
        {
            var transaction = await _pointTransactionService.CreateAsync(
                dto.UserId, 
                dto.AdminId, 
                dto.Amount, 
                dto.Reason);
            
            return CreatedAtAction(nameof(GetByUser), new { userId = dto.UserId }, transaction);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}

public class CreatePointTransactionDto
{
    public int UserId { get; set; }
    public int AdminId { get; set; }
    public int Amount { get; set; }
    public string Reason { get; set; } = string.Empty;
}
