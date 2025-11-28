using HuntSchedule.Persistence.Entities;
using HuntSchedule.Persistence.Repositories;
using HuntSchedule.Services.DTOs;
using HuntSchedule.Services.External;
using HuntSchedule.Services.Interfaces;
using HuntSchedule.Services.Results;
using static HuntSchedule.Services.Results.ErrorType;
using static HuntSchedule.Services.Resources.ErrorKeys;

namespace HuntSchedule.Services.Implementations;

public class RequestService : IRequestService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITibiaCharacterValidator _tibiaValidator;
    private readonly ILocalizationService _localization;

    public RequestService(IUnitOfWork unitOfWork, ITibiaCharacterValidator tibiaValidator, ILocalizationService localization)
    {
        _unitOfWork = unitOfWork;
        _tibiaValidator = tibiaValidator;
        _localization = localization;
    }

    public async Task<IEnumerable<Request>> GetAllAsync()
    {
        return await _unitOfWork.Requests.GetAllWithDetailsAsync();
    }

    public async Task<Request?> GetByIdAsync(int id)
    {
        return await _unitOfWork.Requests.GetByIdWithDetailsAsync(id);
    }

    public async Task<ServiceResult<Request>> CreateAsync(CreateRequestDto dto)
    {
        var server = await _unitOfWork.Servers.GetByIdAsync(dto.ServerId);
        if (server == null) return ServiceResult<Request>.Fail(_localization.GetString(ServerNotFound), NotFound);

        var pendingStatus = await _unitOfWork.RequestStatuses.GetByNameAsync("pending");

        using var transaction = await _unitOfWork.BeginTransactionAsync();

        try
        {
            var resolvedPartyMembers = new List<(Character character, string? role)>();

            foreach (var pm in dto.PartyMembers)
            {
                Character? character = null;

                if (pm.CharacterId.HasValue)
                {
                    character = await _unitOfWork.Characters.GetByIdAsync(pm.CharacterId.Value);
                    if (character == null)
                    {
                        await transaction.RollbackAsync();
                        return ServiceResult<Request>.Fail(_localization.GetString(CharacterNotFound), NotFound);
                    }
                }
                else if (!string.IsNullOrEmpty(pm.CharacterName))
                {
                    character = await _unitOfWork.Characters.GetByNameAndServerAsync(pm.CharacterName, dto.ServerId);

                    if (character == null)
                    {
                        var tibiaResult = await _tibiaValidator.ValidateCharacterAsync(pm.CharacterName);

                        if (tibiaResult == null || !tibiaResult.Exists)
                        {
                            await transaction.RollbackAsync();
                            return ServiceResult<Request>.Fail(_localization.GetString(CharacterNotFoundOnTibia, pm.CharacterName), Validation);
                        }

                        var tibiaServer = await _unitOfWork.Servers.GetByNameAsync(tibiaResult.World);

                        if (tibiaServer == null)
                        {
                            await transaction.RollbackAsync();
                            return ServiceResult<Request>.Fail(_localization.GetString(CharacterServerNotConfigured, pm.CharacterName, tibiaResult.World), Validation);
                        }

                        if (tibiaServer.Id != dto.ServerId)
                        {
                            await transaction.RollbackAsync();
                            return ServiceResult<Request>.Fail(_localization.GetString(CharacterServerMismatch, pm.CharacterName, tibiaResult.World, server.Name), Validation);
                        }

                        character = new Character
                        {
                            Name = tibiaResult.Name,
                            ServerId = tibiaServer.Id,
                            Vocation = tibiaResult.Vocation,
                            Level = tibiaResult.Level,
                            IsExternal = true,
                            ExternalVerifiedAt = DateTime.UtcNow
                        };
                        await _unitOfWork.Characters.AddAsync(character);
                    }
                }

                if (character != null)
                {
                    resolvedPartyMembers.Add((character, pm.RoleInParty));
                }
            }

            var request = new Request
            {
                UserId = dto.UserId,
                ServerId = dto.ServerId,
                RespawnId = dto.RespawnId,
                SlotId = dto.SlotId,
                PeriodId = dto.PeriodId,
                StatusId = pendingStatus?.Id ?? 1,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Requests.AddAsync(request);
            await _unitOfWork.SaveChangesAsync();

            foreach (var (character, role) in resolvedPartyMembers)
            {
                var partyMember = new RequestPartyMember
                {
                    RequestId = request.Id,
                    CharacterId = character.Id,
                    RoleInParty = role
                };
                await _unitOfWork.Requests.AddPartyMemberAsync(request.Id, partyMember);
            }

            await _unitOfWork.SaveChangesAsync();
            await transaction.CommitAsync();

            var createdRequest = await _unitOfWork.Requests.GetByIdWithDetailsAsync(request.Id);
            return ServiceResult<Request>.Ok(createdRequest!);
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<ServiceResult> UpdateStatusAsync(int id, StatusUpdateDto dto)
    {
        var request = await _unitOfWork.Requests.GetByIdAsync(id);
        if (request == null) return ServiceResult.Fail(_localization.GetString(RequestNotFound), NotFound);

        request.StatusId = dto.StatusId;
        request.RejectionReason = dto.Reason;

        var approvedStatus = await _unitOfWork.RequestStatuses.GetByNameAsync("approved");
        var rejectedStatus = await _unitOfWork.RequestStatuses.GetByNameAsync("rejected");
        var pendingStatus = await _unitOfWork.RequestStatuses.GetByNameAsync("pending");

        if (approvedStatus != null && dto.StatusId == approvedStatus.Id && pendingStatus != null && rejectedStatus != null)
        {
            var conflicts = await _unitOfWork.Requests.GetConflictingRequestsAsync(
                id, request.ServerId, request.RespawnId, request.SlotId, request.PeriodId, pendingStatus.Id);

            foreach (var conflict in conflicts)
            {
                conflict.StatusId = rejectedStatus.Id;
                conflict.RejectionReason = _localization.GetString(ConflictWithApprovedRequest, id);
            }
        }

        await _unitOfWork.SaveChangesAsync();
        return ServiceResult.Ok();
    }

    public async Task DeleteAsync(int id)
    {
        var request = await _unitOfWork.Requests.GetByIdAsync(id);
        if (request != null)
        {
            _unitOfWork.Requests.Remove(request);
            await _unitOfWork.SaveChangesAsync();
        }
    }
}
