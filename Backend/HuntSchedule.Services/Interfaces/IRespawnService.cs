using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Services.Interfaces;

public interface IRespawnService
{
    Task<IEnumerable<Respawn>> GetAllAsync();
    Task<Respawn?> GetByIdAsync(int id);
    Task<IEnumerable<Respawn>> GetByServerIdAsync(int serverId);
    Task<Respawn> CreateAsync(Respawn respawn);
    Task UpdateAsync(Respawn respawn);
    Task DeleteAsync(int id);
}
