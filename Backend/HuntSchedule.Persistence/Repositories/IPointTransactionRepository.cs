using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Persistence.Repositories;

public interface IPointTransactionRepository : IRepository<PointTransaction>
{
    Task<IEnumerable<PointTransaction>> GetAllWithDetailsAsync();
    Task<IEnumerable<PointTransaction>> GetByUserIdAsync(int userId);
    Task<IEnumerable<PointTransaction>> GetByAdminIdAsync(int adminId);
}
