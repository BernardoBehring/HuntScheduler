using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Persistence.Repositories;

public interface IRequestRepository : IRepository<Request>
{
    Task<Request?> GetByIdWithDetailsAsync(int id);
    Task<IEnumerable<Request>> GetAllWithDetailsAsync();
    Task<IEnumerable<Request>> GetConflictingRequestsAsync(int excludeId, int serverId, int respawnId, int slotId, int periodId, int statusId);
    Task AddPartyMemberAsync(int requestId, RequestPartyMember partyMember);
}
