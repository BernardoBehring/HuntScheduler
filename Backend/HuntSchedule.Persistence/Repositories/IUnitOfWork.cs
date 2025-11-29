using Microsoft.EntityFrameworkCore.Storage;

namespace HuntSchedule.Persistence.Repositories;

public interface IUnitOfWork : IDisposable
{
    IUserRepository Users { get; }
    IRoleRepository Roles { get; }
    ICharacterRepository Characters { get; }
    IServerRepository Servers { get; }
    IRespawnRepository Respawns { get; }
    ISlotRepository Slots { get; }
    ISchedulePeriodRepository SchedulePeriods { get; }
    IRequestRepository Requests { get; }
    IRequestStatusRepository RequestStatuses { get; }
    IDifficultyRepository Difficulties { get; }
    IPointTransactionRepository PointTransactions { get; }
    IPointClaimRepository PointClaims { get; }
    
    Task<int> SaveChangesAsync();
    Task<IDbContextTransaction> BeginTransactionAsync();
}
