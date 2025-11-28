using Microsoft.EntityFrameworkCore;
using HuntSchedule.Persistence.Context;
using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Persistence.Repositories;

public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(AppDbContext context) : base(context) { }

    public async Task<User?> GetByIdWithCharactersAsync(int id)
    {
        return await _dbSet
            .Include(u => u.Role)
            .Include(u => u.Characters)
                .ThenInclude(c => c.Server)
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<IEnumerable<User>> GetAllWithRolesAsync()
    {
        return await _dbSet
            .Include(u => u.Role)
            .Include(u => u.Characters)
                .ThenInclude(c => c.Server)
            .ToListAsync();
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        return await _dbSet
            .Include(u => u.Role)
            .Include(u => u.Characters)
                .ThenInclude(c => c.Server)
            .FirstOrDefaultAsync(u => u.Username == username);
    }
}
