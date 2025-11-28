using Microsoft.EntityFrameworkCore;
using HuntSchedule.Persistence.Context;
using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Persistence.Repositories;

public class RespawnRepository : Repository<Respawn>, IRespawnRepository
{
    public RespawnRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Respawn>> GetAllWithDifficultyAsync()
    {
        return await _dbSet
            .Include(r => r.Difficulty)
            .Include(r => r.Server)
            .ToListAsync();
    }

    public async Task<IEnumerable<Respawn>> GetByServerIdAsync(int serverId)
    {
        return await _dbSet
            .Include(r => r.Difficulty)
            .Where(r => r.ServerId == serverId)
            .ToListAsync();
    }
}
