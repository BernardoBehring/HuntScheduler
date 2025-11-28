using HuntSchedule.Persistence.Entities;
using HuntSchedule.Persistence.Repositories;
using HuntSchedule.Services.Interfaces;

namespace HuntSchedule.Services.Implementations;

public class ServerService : IServerService
{
    private readonly IUnitOfWork _unitOfWork;

    public ServerService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<Server>> GetAllAsync()
    {
        return await _unitOfWork.Servers.GetAllAsync();
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
}
