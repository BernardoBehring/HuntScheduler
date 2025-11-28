using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Persistence.Repositories;

public interface ISchedulePeriodRepository : IRepository<SchedulePeriod>
{
    Task<IEnumerable<SchedulePeriod>> GetByServerIdAsync(int serverId);
    Task<IEnumerable<SchedulePeriod>> GetAllWithServersAsync();
}
