using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Services.Interfaces;

public interface IPointClaimService
{
    Task<IEnumerable<PointClaim>> GetAllAsync();
    Task<IEnumerable<PointClaim>> GetByUserIdAsync(int userId);
    Task<IEnumerable<PointClaim>> GetPendingClaimsAsync();
    Task<PointClaim?> GetByIdAsync(int id);
    Task<PointClaim> CreateAsync(int userId, string? note, string? screenshotUrl);
    Task<PointClaim?> ApproveAsync(int claimId, int adminId, string adminResponse, int pointsAwarded);
    Task<PointClaim?> RejectAsync(int claimId, int adminId, string adminResponse);
}
