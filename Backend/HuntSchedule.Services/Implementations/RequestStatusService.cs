using HuntSchedule.Persistence.Entities;
using HuntSchedule.Persistence.Repositories;
using HuntSchedule.Services.Interfaces;

namespace HuntSchedule.Services.Implementations;

public class RequestStatusService : IRequestStatusService
{
    private readonly IUnitOfWork _unitOfWork;

    public RequestStatusService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<RequestStatus>> GetAllAsync()
    {
        return await _unitOfWork.RequestStatuses.GetAllAsync();
    }

    public async Task<RequestStatus?> GetByIdAsync(int id)
    {
        return await _unitOfWork.RequestStatuses.GetByIdAsync(id);
    }

    public async Task<RequestStatus?> GetByNameAsync(string name)
    {
        return await _unitOfWork.RequestStatuses.GetByNameAsync(name);
    }
}
