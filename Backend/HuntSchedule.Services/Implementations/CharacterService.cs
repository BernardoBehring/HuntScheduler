using HuntSchedule.Persistence.Entities;
using HuntSchedule.Persistence.Repositories;
using HuntSchedule.Services.External;
using HuntSchedule.Services.Interfaces;
using HuntSchedule.Services.Results;

namespace HuntSchedule.Services.Implementations;

public class CharacterService : ICharacterService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITibiaCharacterValidator _tibiaValidator;

    public CharacterService(IUnitOfWork unitOfWork, ITibiaCharacterValidator tibiaValidator)
    {
        _unitOfWork = unitOfWork;
        _tibiaValidator = tibiaValidator;
    }

    public async Task<IEnumerable<Character>> GetAllAsync()
    {
        return await _unitOfWork.Characters.GetAllWithServersAsync();
    }

    public async Task<Character?> GetByIdAsync(int id)
    {
        return await _unitOfWork.Characters.GetByIdWithServerAsync(id);
    }

    public async Task<IEnumerable<Character>> GetByUserIdAsync(int userId)
    {
        return await _unitOfWork.Characters.GetByUserIdAsync(userId);
    }

    public async Task<ServiceResult<Character>> CreateAsync(Character character)
    {
        if (character.UserId.HasValue)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(character.UserId.Value);
            if (user == null) return ServiceResult<Character>.Fail("User not found");
        }

        var server = await _unitOfWork.Servers.GetByIdAsync(character.ServerId);
        if (server == null) return ServiceResult<Character>.Fail("Server not found");

        var tibiaResult = await _tibiaValidator.ValidateCharacterAsync(character.Name);
        if (tibiaResult == null || !tibiaResult.Exists)
        {
            return ServiceResult<Character>.Fail($"Character '{character.Name}' not found on Tibia.com");
        }

        var tibiaServer = await _unitOfWork.Servers.GetByNameAsync(tibiaResult.World);
        if (tibiaServer == null)
        {
            return ServiceResult<Character>.Fail($"Character '{character.Name}' is on server '{tibiaResult.World}' which is not configured in our system");
        }

        if (tibiaServer.Id != character.ServerId)
        {
            return ServiceResult<Character>.Fail($"Character '{character.Name}' is on server '{tibiaResult.World}', but you selected '{server.Name}'");
        }

        character.Name = tibiaResult.Name;
        character.Vocation = tibiaResult.Vocation;
        character.Level = tibiaResult.Level;

        if (character.IsMain && character.UserId.HasValue)
        {
            var existingMain = await _unitOfWork.Characters.GetMainCharactersByUserIdAsync(character.UserId.Value);
            foreach (var c in existingMain)
            {
                c.IsMain = false;
            }
        }

        await _unitOfWork.Characters.AddAsync(character);
        await _unitOfWork.SaveChangesAsync();
        return ServiceResult<Character>.Ok(character);
    }

    public async Task<ServiceResult<Character>> UpdateAsync(int id, Character character)
    {
        if (id != character.Id) return ServiceResult<Character>.Fail("ID mismatch");

        var existingCharacter = await _unitOfWork.Characters.GetByIdAsync(id);
        if (existingCharacter == null) return ServiceResult<Character>.Fail("Character not found");

        if (character.UserId.HasValue)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(character.UserId.Value);
            if (user == null) return ServiceResult<Character>.Fail("User not found");
        }

        var server = await _unitOfWork.Servers.GetByIdAsync(character.ServerId);
        if (server == null) return ServiceResult<Character>.Fail("Server not found");

        bool nameChanged = !string.Equals(existingCharacter.Name, character.Name, StringComparison.OrdinalIgnoreCase);
        bool serverChanged = existingCharacter.ServerId != character.ServerId;

        if (nameChanged || serverChanged)
        {
            var tibiaResult = await _tibiaValidator.ValidateCharacterAsync(character.Name);
            if (tibiaResult == null || !tibiaResult.Exists)
            {
                return ServiceResult<Character>.Fail($"Character '{character.Name}' not found on Tibia.com");
            }

            var tibiaServer = await _unitOfWork.Servers.GetByNameAsync(tibiaResult.World);
            if (tibiaServer == null)
            {
                return ServiceResult<Character>.Fail($"Character '{character.Name}' is on server '{tibiaResult.World}' which is not configured in our system");
            }

            if (tibiaServer.Id != character.ServerId)
            {
                return ServiceResult<Character>.Fail($"Character '{character.Name}' is on server '{tibiaResult.World}', but you selected '{server.Name}'");
            }

            existingCharacter.Name = tibiaResult.Name;
            existingCharacter.Vocation = tibiaResult.Vocation;
            existingCharacter.Level = tibiaResult.Level;
        }

        existingCharacter.UserId = character.UserId;
        existingCharacter.ServerId = character.ServerId;
        existingCharacter.IsMain = character.IsMain;
        existingCharacter.IsExternal = character.IsExternal;
        existingCharacter.ExternalVerifiedAt = character.ExternalVerifiedAt;

        if (character.IsMain && character.UserId.HasValue)
        {
            var existingMain = (await _unitOfWork.Characters.GetMainCharactersByUserIdAsync(character.UserId.Value))
                .Where(c => c.Id != id);
            foreach (var c in existingMain)
            {
                c.IsMain = false;
            }
        }

        await _unitOfWork.SaveChangesAsync();
        return ServiceResult<Character>.Ok(existingCharacter);
    }

    public async Task DeleteAsync(int id)
    {
        var character = await _unitOfWork.Characters.GetByIdAsync(id);
        if (character != null)
        {
            _unitOfWork.Characters.Remove(character);
            await _unitOfWork.SaveChangesAsync();
        }
    }

    public async Task SetMainCharacterAsync(int id)
    {
        var character = await _unitOfWork.Characters.GetByIdAsync(id);
        if (character != null && character.UserId.HasValue)
        {
            var existingMain = await _unitOfWork.Characters.GetMainCharactersByUserIdAsync(character.UserId.Value);
            foreach (var c in existingMain)
            {
                c.IsMain = false;
            }
            character.IsMain = true;
            await _unitOfWork.SaveChangesAsync();
        }
    }
}
