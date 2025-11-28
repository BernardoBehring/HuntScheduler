using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Services.Interfaces;

public interface IDifficultyService
{
    Task<IEnumerable<Difficulty>> GetAllAsync();
    Task<Difficulty?> GetByIdAsync(int id);
}
