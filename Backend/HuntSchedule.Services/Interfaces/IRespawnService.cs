using HuntSchedule.Persistence.Entities;
using HuntSchedule.Services.DTOs;
using HuntSchedule.Services.Results;

namespace HuntSchedule.Services.Interfaces;

public interface IRespawnService
{
    Task<IEnumerable<Respawn>> GetAllAsync();
    Task<Respawn?> GetByIdAsync(int id);
    Task<IEnumerable<Respawn>> GetByServerIdAsync(int serverId);
    Task<Respawn> CreateAsync(Respawn respawn);
    Task UpdateAsync(Respawn respawn);
    Task DeleteAsync(int id);
    Task<ServiceResult<CopyRespawnsResultDto>> CopyRespawnsAsync(CopyRespawnsDto dto);
}
