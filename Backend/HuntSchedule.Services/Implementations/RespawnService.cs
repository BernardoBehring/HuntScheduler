using HuntSchedule.Persistence.Entities;
using HuntSchedule.Persistence.Repositories;
using HuntSchedule.Services.Interfaces;

namespace HuntSchedule.Services.Implementations;

public class RespawnService : IRespawnService
{
    private readonly IUnitOfWork _unitOfWork;

    public RespawnService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<Respawn>> GetAllAsync()
    {
        return await _unitOfWork.Respawns.GetAllWithDifficultyAsync();
    }

    public async Task<Respawn?> GetByIdAsync(int id)
    {
        return await _unitOfWork.Respawns.GetByIdAsync(id);
    }

    public async Task<IEnumerable<Respawn>> GetByServerIdAsync(int serverId)
    {
        return await _unitOfWork.Respawns.GetByServerIdAsync(serverId);
    }

    public async Task<Respawn> CreateAsync(Respawn respawn)
    {
        await _unitOfWork.Respawns.AddAsync(respawn);
        await _unitOfWork.SaveChangesAsync();
        return respawn;
    }

    public async Task UpdateAsync(Respawn respawn)
    {
        var existingRespawn = await _unitOfWork.Respawns.GetByIdAsync(respawn.Id);
        if (existingRespawn != null)
        {
            existingRespawn.Name = respawn.Name;
            existingRespawn.ServerId = respawn.ServerId;
            existingRespawn.DifficultyId = respawn.DifficultyId;
            existingRespawn.MinPlayers = respawn.MinPlayers;
            existingRespawn.MaxPlayers = respawn.MaxPlayers;
            existingRespawn.TsCode = respawn.TsCode;
            existingRespawn.City = respawn.City;
            existingRespawn.IsAvailable = respawn.IsAvailable;
        }
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var respawn = await _unitOfWork.Respawns.GetByIdAsync(id);
        if (respawn != null)
        {
            _unitOfWork.Respawns.Remove(respawn);
            await _unitOfWork.SaveChangesAsync();
        }
    }
}
