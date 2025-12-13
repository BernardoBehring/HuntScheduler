using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Services.Interfaces;

public interface IPointTransactionService
{
    Task<IEnumerable<PointTransaction>> GetAllAsync();
    Task<IEnumerable<PointTransaction>> GetByUserIdAsync(int userId);
    Task<IEnumerable<PointTransaction>> GetByAdminIdAsync(int adminId);
    Task<PointTransaction> CreateAsync(int userId, int adminId, int amount, string reason);
    Task<PointTransaction> CreateWithTransactionAsync(int userId, int adminId, int amount, string reason);
}
