using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Persistence.Repositories;

public interface IPointClaimRepository : IRepository<PointClaim>
{
    Task<IEnumerable<PointClaim>> GetAllWithDetailsAsync();
    Task<IEnumerable<PointClaim>> GetByUserIdAsync(int userId);
    Task<IEnumerable<PointClaim>> GetPendingClaimsAsync();
    Task<PointClaim?> GetByIdWithDetailsAsync(int id);
}
