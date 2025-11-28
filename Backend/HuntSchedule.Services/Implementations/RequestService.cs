using HuntSchedule.Persistence.Entities;
using HuntSchedule.Persistence.Repositories;
using HuntSchedule.Services.DTOs;
using HuntSchedule.Services.External;
using HuntSchedule.Services.Interfaces;
using HuntSchedule.Services.Results;
using static HuntSchedule.Services.Results.ErrorCode;

namespace HuntSchedule.Services.Implementations;

public class RequestService : IRequestService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITibiaCharacterValidator _tibiaValidator;

    public RequestService(IUnitOfWork unitOfWork, ITibiaCharacterValidator tibiaValidator)
    {
        _unitOfWork = unitOfWork;
        _tibiaValidator = tibiaValidator;
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
        if (server == null) return ServiceResult<Request>.Fail(ServerNotFound);

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
                        return ServiceResult<Request>.Fail(CharacterNotFound, 
                            new Dictionary<string, string> { { "id", pm.CharacterId.ToString()! } });
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
                            return ServiceResult<Request>.Fail(CharacterNotFoundOnTibia, 
                                new Dictionary<string, string> { { "name", pm.CharacterName } });
                        }

                        var tibiaServer = await _unitOfWork.Servers.GetByNameAsync(tibiaResult.World);

                        if (tibiaServer == null)
                        {
                            await transaction.RollbackAsync();
                            return ServiceResult<Request>.Fail(CharacterServerNotConfigured, 
                                new Dictionary<string, string> { { "name", pm.CharacterName }, { "world", tibiaResult.World } });
                        }

                        if (tibiaServer.Id != dto.ServerId)
                        {
                            await transaction.RollbackAsync();
                            return ServiceResult<Request>.Fail(CharacterServerMismatch, 
                                new Dictionary<string, string> { { "name", pm.CharacterName }, { "actualServer", tibiaResult.World }, { "selectedServer", server.Name } });
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
        if (request == null) return ServiceResult.Fail(RequestNotFound);

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
                conflict.RejectionReason = $"{ConflictWithApprovedRequest}|id={id}";
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
