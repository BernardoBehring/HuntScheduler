using Microsoft.EntityFrameworkCore;
using HuntSchedule.Persistence.Context;
using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Persistence.Repositories;

public class RequestStatusRepository : Repository<RequestStatus>, IRequestStatusRepository
{
    public RequestStatusRepository(AppDbContext context) : base(context) { }

    public async Task<RequestStatus?> GetByNameAsync(string name)
    {
        return await _dbSet.FirstOrDefaultAsync(s => s.Name == name);
    }
}
