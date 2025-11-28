using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Services.Interfaces;

public interface ISchedulePeriodService
{
    Task<IEnumerable<SchedulePeriod>> GetAllAsync();
    Task<SchedulePeriod?> GetByIdAsync(int id);
    Task<IEnumerable<SchedulePeriod>> GetByServerIdAsync(int serverId);
    Task<SchedulePeriod> CreateAsync(SchedulePeriod period);
    Task UpdateAsync(SchedulePeriod period);
    Task DeleteAsync(int id);
}
