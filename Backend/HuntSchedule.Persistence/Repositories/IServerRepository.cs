using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Persistence.Repositories;

public interface IServerRepository : IRepository<Server>
{
    Task<Server?> GetByNameAsync(string name);
}
