using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Persistence.Repositories;

public interface IRequestStatusRepository : IRepository<RequestStatus>
{
    Task<RequestStatus?> GetByNameAsync(string name);
}
