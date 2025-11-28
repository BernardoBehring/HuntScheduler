using HuntSchedule.Persistence.Entities;
using HuntSchedule.Services.DTOs;
using HuntSchedule.Services.Results;

namespace HuntSchedule.Services.Interfaces;

public interface IRequestService
{
    Task<IEnumerable<Request>> GetAllAsync();
    Task<Request?> GetByIdAsync(int id);
    Task<ServiceResult<Request>> CreateAsync(CreateRequestDto dto);
    Task<ServiceResult> UpdateStatusAsync(int id, StatusUpdateDto dto);
    Task DeleteAsync(int id);
}
