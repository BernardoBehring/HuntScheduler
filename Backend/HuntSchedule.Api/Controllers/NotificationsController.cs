using Microsoft.AspNetCore.Mvc;
using HuntSchedule.Services.Interfaces;
using System.Text.Json;

namespace HuntSchedule.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly ILogger<NotificationsController> _logger;

    public NotificationsController(ILogger<NotificationsController> logger)
    {
        _logger = logger;
    }

    [HttpPost("send")]
    public async Task<IActionResult> SendNotification([FromBody] NotificationRequest request)
    {
        try
        {
            if (!string.IsNullOrEmpty(request.Email))
            {
                _logger.LogInformation("Would send email to {Email} for {Type}", request.Email, request.Type);
            }

            if (!string.IsNullOrEmpty(request.Whatsapp))
            {
                _logger.LogInformation("Would send WhatsApp to {Whatsapp} for {Type}", request.Whatsapp, request.Type);
            }

            return Ok(new { success = true, message = "Notification queued" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send notification");
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }
}

public class NotificationRequest
{
    public string Type { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Whatsapp { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string RespawnName { get; set; } = string.Empty;
    public string SlotTime { get; set; } = string.Empty;
    public string PeriodName { get; set; } = string.Empty;
    public string? RejectionReason { get; set; }
}
