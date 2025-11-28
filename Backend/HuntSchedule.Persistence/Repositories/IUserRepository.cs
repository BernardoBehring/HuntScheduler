using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Persistence.Repositories;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByIdWithCharactersAsync(int id);
    Task<IEnumerable<User>> GetAllWithRolesAsync();
}
