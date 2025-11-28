using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Services.Interfaces;

public interface IRoleService
{
    Task<IEnumerable<Role>> GetAllAsync();
    Task<Role?> GetByIdAsync(int id);
}
