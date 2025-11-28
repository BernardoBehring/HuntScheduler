using Microsoft.EntityFrameworkCore;
using HuntSchedule.Persistence.Context;
using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Persistence.Repositories;

public class RequestRepository : Repository<Request>, IRequestRepository
{
    public RequestRepository(AppDbContext context) : base(context) { }

    public async Task<Request?> GetByIdWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(r => r.User)
            .Include(r => r.Server)
            .Include(r => r.Respawn)
                .ThenInclude(resp => resp!.Difficulty)
            .Include(r => r.Slot)
            .Include(r => r.Period)
            .Include(r => r.Status)
            .Include(r => r.PartyMembers)
                .ThenInclude(pm => pm.Character)
                    .ThenInclude(c => c!.Server)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<IEnumerable<Request>> GetAllWithDetailsAsync()
    {
        return await _dbSet
            .Include(r => r.User)
            .Include(r => r.Server)
            .Include(r => r.Respawn)
                .ThenInclude(resp => resp!.Difficulty)
            .Include(r => r.Slot)
            .Include(r => r.Period)
            .Include(r => r.Status)
            .Include(r => r.PartyMembers)
                .ThenInclude(pm => pm.Character)
                    .ThenInclude(c => c!.Server)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Request>> GetConflictingRequestsAsync(int excludeId, int serverId, int respawnId, int slotId, int periodId, int statusId)
    {
        return await _dbSet
            .Where(r => r.Id != excludeId
                && r.ServerId == serverId
                && r.RespawnId == respawnId
                && r.SlotId == slotId
                && r.PeriodId == periodId
                && r.StatusId == statusId)
            .ToListAsync();
    }
}
