using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Persistence.Repositories;

public interface ICharacterRepository : IRepository<Character>
{
    Task<Character?> GetByIdWithServerAsync(int id);
    Task<IEnumerable<Character>> GetAllWithServersAsync();
    Task<IEnumerable<Character>> GetByUserIdAsync(int userId);
    Task<Character?> GetByNameAndServerAsync(string name, int serverId);
    Task<IEnumerable<Character>> GetMainCharactersByUserIdAsync(int userId);
}
