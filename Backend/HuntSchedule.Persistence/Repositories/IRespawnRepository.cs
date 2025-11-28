using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Persistence.Repositories;

public interface IRespawnRepository : IRepository<Respawn>
{
    Task<IEnumerable<Respawn>> GetAllWithDifficultyAsync();
    Task<IEnumerable<Respawn>> GetByServerIdAsync(int serverId);
}
