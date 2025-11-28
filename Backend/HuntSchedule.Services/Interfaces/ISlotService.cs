using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Services.Interfaces;

public interface ISlotService
{
    Task<IEnumerable<Slot>> GetAllAsync();
    Task<Slot?> GetByIdAsync(int id);
    Task<IEnumerable<Slot>> GetByServerIdAsync(int serverId);
    Task<Slot> CreateAsync(Slot slot);
    Task UpdateAsync(Slot slot);
    Task DeleteAsync(int id);
}
