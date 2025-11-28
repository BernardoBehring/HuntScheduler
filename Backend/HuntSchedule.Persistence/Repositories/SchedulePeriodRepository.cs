using Microsoft.EntityFrameworkCore;
using HuntSchedule.Persistence.Context;
using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Persistence.Repositories;

public class SchedulePeriodRepository : Repository<SchedulePeriod>, ISchedulePeriodRepository
{
    public SchedulePeriodRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<SchedulePeriod>> GetByServerIdAsync(int serverId)
    {
        return await _dbSet
            .Where(p => p.ServerId == serverId)
            .ToListAsync();
    }

    public async Task<IEnumerable<SchedulePeriod>> GetAllWithServersAsync()
    {
        return await _dbSet
            .Include(p => p.Server)
            .ToListAsync();
    }
}
