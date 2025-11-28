using Microsoft.EntityFrameworkCore;
using HuntSchedule.Persistence.Context;
using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Persistence.Repositories;

public class CharacterRepository : Repository<Character>, ICharacterRepository
{
    public CharacterRepository(AppDbContext context) : base(context) { }

    public async Task<Character?> GetByIdWithServerAsync(int id)
    {
        return await _dbSet
            .Include(c => c.Server)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<IEnumerable<Character>> GetAllWithServersAsync()
    {
        return await _dbSet
            .Include(c => c.Server)
            .ToListAsync();
    }

    public async Task<IEnumerable<Character>> GetByUserIdAsync(int userId)
    {
        return await _dbSet
            .Include(c => c.Server)
            .Where(c => c.UserId == userId)
            .ToListAsync();
    }

    public async Task<Character?> GetByNameAndServerAsync(string name, int serverId)
    {
        return await _dbSet
            .FirstOrDefaultAsync(c => c.Name.ToLower() == name.ToLower() && c.ServerId == serverId);
    }

    public async Task<IEnumerable<Character>> GetMainCharactersByUserIdAsync(int userId)
    {
        return await _dbSet
            .Where(c => c.UserId == userId && c.IsMain)
            .ToListAsync();
    }
}
