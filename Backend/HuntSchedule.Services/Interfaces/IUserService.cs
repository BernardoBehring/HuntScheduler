using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Services.Interfaces;

public interface IUserService
{
    Task<IEnumerable<User>> GetAllAsync();
    Task<User?> GetByIdAsync(int id);
    Task<User?> GetByIdWithCharactersAsync(int id);
    Task<User> CreateAsync(User user);
    Task UpdateAsync(User user);
    Task DeleteAsync(int id);
    Task UpdatePointsAsync(int id, int points);
}
