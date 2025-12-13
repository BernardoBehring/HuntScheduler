namespace HuntSchedule.Services.Interfaces;

public interface INotificationService
{
    Task SendRequestApprovalNotificationAsync(
        string? userEmail,
        string? userWhatsapp,
        string userName,
        string respawnName,
        string slotTime,
        string periodName,
        string? language = null);

    Task SendRequestRejectionNotificationAsync(
        string? userEmail,
        string? userWhatsapp,
        string userName,
        string respawnName,
        string slotTime,
        string periodName,
        string? rejectionReason,
        string? language = null);
}
