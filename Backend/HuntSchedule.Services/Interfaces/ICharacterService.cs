using HuntSchedule.Persistence.Entities;
using HuntSchedule.Services.Results;

namespace HuntSchedule.Services.Interfaces;

public interface ICharacterService
{
    Task<IEnumerable<Character>> GetAllAsync();
    Task<Character?> GetByIdAsync(int id);
    Task<IEnumerable<Character>> GetByUserIdAsync(int userId);
    Task<ServiceResult<Character>> CreateAsync(Character character);
    Task<ServiceResult<Character>> UpdateAsync(int id, Character character);
    Task DeleteAsync(int id);
    Task SetMainCharacterAsync(int id);
}
