using HuntSchedule.Persistence.Entities;
using HuntSchedule.Persistence.Repositories;
using HuntSchedule.Services.DTOs;
using HuntSchedule.Services.Interfaces;
using HuntSchedule.Services.Results;

namespace HuntSchedule.Services.Implementations;

public class RespawnService : IRespawnService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILocalizationService _localization;

    public RespawnService(IUnitOfWork unitOfWork, ILocalizationService localization)
    {
        _unitOfWork = unitOfWork;
        _localization = localization;
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

    public async Task<ServiceResult<CopyRespawnsResultDto>> CopyRespawnsAsync(CopyRespawnsDto dto)
    {
        if (dto.SourceServerId == dto.TargetServerId)
        {
            return ServiceResult<CopyRespawnsResultDto>.Fail(
                _localization.GetString(Resources.ErrorKeys.SourceTargetSameServer),
                ErrorType.Validation);
        }

        var sourceServer = await _unitOfWork.Servers.GetByIdAsync(dto.SourceServerId);
        if (sourceServer == null)
        {
            return ServiceResult<CopyRespawnsResultDto>.Fail(
                _localization.GetString(Resources.ErrorKeys.ServerNotFound),
                ErrorType.NotFound);
        }

        var targetServer = await _unitOfWork.Servers.GetByIdAsync(dto.TargetServerId);
        if (targetServer == null)
        {
            return ServiceResult<CopyRespawnsResultDto>.Fail(
                _localization.GetString(Resources.ErrorKeys.ServerNotFound),
                ErrorType.NotFound);
        }

        var sourceRespawns = await _unitOfWork.Respawns.GetByServerIdAsync(dto.SourceServerId);
        var sourceList = sourceRespawns.ToList();

        if (!sourceList.Any())
        {
            return ServiceResult<CopyRespawnsResultDto>.Fail(
                _localization.GetString(Resources.ErrorKeys.NoRespawnsToCopy),
                ErrorType.Validation);
        }

        var deletedCount = 0;
        
        if (dto.OverwriteExisting)
        {
            var targetRespawns = await _unitOfWork.Respawns.GetByServerIdAsync(dto.TargetServerId);
            var targetList = targetRespawns.ToList();
            deletedCount = targetList.Count;
            
            foreach (var respawn in targetList)
            {
                _unitOfWork.Respawns.Remove(respawn);
            }
        }

        var newRespawns = sourceList.Select(r => new Respawn
        {
            ServerId = dto.TargetServerId,
            Name = r.Name,
            DifficultyId = r.DifficultyId,
            MinPlayers = r.MinPlayers,
            MaxPlayers = r.MaxPlayers,
            TsCode = r.TsCode,
            City = r.City,
            IsAvailable = r.IsAvailable
        }).ToList();

        foreach (var respawn in newRespawns)
        {
            await _unitOfWork.Respawns.AddAsync(respawn);
        }

        await _unitOfWork.SaveChangesAsync();

        return ServiceResult<CopyRespawnsResultDto>.Ok(new CopyRespawnsResultDto
        {
            CopiedCount = newRespawns.Count,
            DeletedCount = deletedCount,
            Message = $"Successfully copied {newRespawns.Count} respawns"
        });
    }
}
