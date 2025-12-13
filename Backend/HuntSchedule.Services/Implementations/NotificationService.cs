using System.Net.Http.Json;
using HuntSchedule.Services.Interfaces;
using Microsoft.Extensions.Logging;

namespace HuntSchedule.Services.Implementations;

public class NotificationService : INotificationService
{
    private readonly ILogger<NotificationService> _logger;
    private readonly IHttpClientFactory _httpClientFactory;

    public NotificationService(ILogger<NotificationService> logger, IHttpClientFactory httpClientFactory)
    {
        _logger = logger;
        _httpClientFactory = httpClientFactory;
    }

    public async Task SendRequestApprovalNotificationAsync(
        string? userEmail,
        string? userWhatsapp,
        string userName,
        string respawnName,
        string slotTime,
        string periodName,
        string? language = null)
    {
        if (string.IsNullOrEmpty(userEmail) && string.IsNullOrEmpty(userWhatsapp))
        {
            _logger.LogInformation("No contact info for user {UserName}, skipping notifications", userName);
            return;
        }

        try
        {
            var client = _httpClientFactory.CreateClient("Notifications");
            var payload = new
            {
                type = "approval",
                email = userEmail,
                whatsapp = userWhatsapp,
                userName,
                respawnName,
                slotTime,
                periodName,
                language = language ?? "en"
            };

            var response = await client.PostAsJsonAsync("/api/notifications/send", payload);
            
            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Approval notification sent to {UserName}", userName);
            }
            else
            {
                _logger.LogWarning("Failed to send approval notification: {Status}", response.StatusCode);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending approval notification to {UserName}", userName);
        }
    }

    public async Task SendRequestRejectionNotificationAsync(
        string? userEmail,
        string? userWhatsapp,
        string userName,
        string respawnName,
        string slotTime,
        string periodName,
        string? rejectionReason,
        string? language = null)
    {
        if (string.IsNullOrEmpty(userEmail) && string.IsNullOrEmpty(userWhatsapp))
        {
            _logger.LogInformation("No contact info for user {UserName}, skipping notifications", userName);
            return;
        }

        try
        {
            var client = _httpClientFactory.CreateClient("Notifications");
            var payload = new
            {
                type = "rejection",
                email = userEmail,
                whatsapp = userWhatsapp,
                userName,
                respawnName,
                slotTime,
                periodName,
                rejectionReason,
                language = language ?? "en"
            };

            var response = await client.PostAsJsonAsync("/api/notifications/send", payload);
            
            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Rejection notification sent to {UserName}", userName);
            }
            else
            {
                _logger.LogWarning("Failed to send rejection notification: {Status}", response.StatusCode);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending rejection notification to {UserName}", userName);
        }
    }
}
