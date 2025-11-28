using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Persistence.Repositories;

public interface ISlotRepository : IRepository<Slot>
{
    Task<IEnumerable<Slot>> GetByServerIdAsync(int serverId);
    Task<IEnumerable<Slot>> GetAllWithServersAsync();
}
