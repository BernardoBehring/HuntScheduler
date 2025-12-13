using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Services.Interfaces;

public interface IServerService
{
    Task<IEnumerable<Server>> GetAllAsync();
    Task<IEnumerable<Server>> GetActiveAsync();
    Task<Server?> GetByIdAsync(int id);
    Task<Server?> GetByNameAsync(string name);
    Task<Server> CreateAsync(Server server);
    Task UpdateAsync(Server server);
    Task DeleteAsync(int id);
    Task<int> SyncFromTibiaDataAsync();
    Task<bool> SetActiveAsync(int id, bool isActive);
}
