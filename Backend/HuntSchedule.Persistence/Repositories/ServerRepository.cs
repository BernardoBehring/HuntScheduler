using Microsoft.EntityFrameworkCore;
using HuntSchedule.Persistence.Context;
using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Persistence.Repositories;

public class ServerRepository : Repository<Server>, IServerRepository
{
    public ServerRepository(AppDbContext context) : base(context) { }

    public async Task<Server?> GetByNameAsync(string name)
    {
        return await _dbSet.FirstOrDefaultAsync(s => s.Name.ToLower() == name.ToLower());
    }
}
