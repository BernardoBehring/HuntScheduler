using HuntSchedule.Persistence.Entities;
using HuntSchedule.Persistence.Repositories;
using HuntSchedule.Services.External;
using HuntSchedule.Services.Interfaces;

namespace HuntSchedule.Services.Implementations;

public class ServerService : IServerService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITibiaCharacterValidator _tibiaValidator;

    public ServerService(IUnitOfWork unitOfWork, ITibiaCharacterValidator tibiaValidator)
    {
        _unitOfWork = unitOfWork;
        _tibiaValidator = tibiaValidator;
    }

    public async Task<IEnumerable<Server>> GetAllAsync()
    {
        return await _unitOfWork.Servers.GetAllAsync();
    }

    public async Task<IEnumerable<Server>> GetActiveAsync()
    {
        var servers = await _unitOfWork.Servers.GetAllAsync();
        return servers.Where(s => s.IsActive);
    }

    public async Task<Server?> GetByIdAsync(int id)
    {
        return await _unitOfWork.Servers.GetByIdAsync(id);
    }

    public async Task<Server?> GetByNameAsync(string name)
    {
        return await _unitOfWork.Servers.GetByNameAsync(name);
    }

    public async Task<Server> CreateAsync(Server server)
    {
        await _unitOfWork.Servers.AddAsync(server);
        await _unitOfWork.SaveChangesAsync();
        return server;
    }

    public async Task UpdateAsync(Server server)
    {
        _unitOfWork.Servers.Update(server);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var server = await _unitOfWork.Servers.GetByIdAsync(id);
        if (server != null)
        {
            _unitOfWork.Servers.Remove(server);
            await _unitOfWork.SaveChangesAsync();
        }
    }

    public async Task<int> SyncFromTibiaDataAsync()
    {
        var worlds = await _tibiaValidator.GetAllWorldsAsync();
        if (worlds == null || worlds.Count == 0)
        {
            return 0;
        }

        var existingServers = await _unitOfWork.Servers.GetAllAsync();
        var existingDict = existingServers.ToDictionary(s => s.Name.Trim().ToLowerInvariant());
        var tibiaWorldNames = new HashSet<string>(worlds.Select(w => w.Name.Trim().ToLowerInvariant()));
        int addedCount = 0;

        foreach (var world in worlds)
        {
            var key = world.Name.Trim().ToLowerInvariant();
            if (existingDict.TryGetValue(key, out var existing))
            {
                existing.Region = world.Location;
                existing.PvpType = world.PvpType;
                _unitOfWork.Servers.Update(existing);
            }
            else
            {
                var newServer = new Server
                {
                    Name = world.Name.Trim(),
                    Region = world.Location,
                    PvpType = world.PvpType,
                    IsActive = false
                };
                await _unitOfWork.Servers.AddAsync(newServer);
                addedCount++;
            }
        }

        foreach (var existing in existingServers)
        {
            var key = existing.Name.Trim().ToLowerInvariant();
            if (!tibiaWorldNames.Contains(key) && existing.IsActive)
            {
                existing.IsActive = false;
                _unitOfWork.Servers.Update(existing);
            }
        }

        await _unitOfWork.SaveChangesAsync();
        return addedCount;
    }

    public async Task<bool> SetActiveAsync(int id, bool isActive)
    {
        var server = await _unitOfWork.Servers.GetByIdAsync(id);
        if (server == null)
        {
            return false;
        }

        server.IsActive = isActive;
        _unitOfWork.Servers.Update(server);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }
}
