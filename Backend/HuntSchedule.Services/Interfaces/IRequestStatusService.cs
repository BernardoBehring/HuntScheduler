using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Services.Interfaces;

public interface IRequestStatusService
{
    Task<IEnumerable<RequestStatus>> GetAllAsync();
    Task<RequestStatus?> GetByIdAsync(int id);
    Task<RequestStatus?> GetByNameAsync(string name);
}
