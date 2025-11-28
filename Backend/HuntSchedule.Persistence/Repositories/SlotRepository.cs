using Microsoft.EntityFrameworkCore;
using HuntSchedule.Persistence.Context;
using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Persistence.Repositories;

public class SlotRepository : Repository<Slot>, ISlotRepository
{
    public SlotRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Slot>> GetByServerIdAsync(int serverId)
    {
        return await _dbSet
            .Where(s => s.ServerId == serverId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Slot>> GetAllWithServersAsync()
    {
        return await _dbSet
            .Include(s => s.Server)
            .ToListAsync();
    }
}
