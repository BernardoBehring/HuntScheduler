using HuntSchedule.Persistence.Entities;
using HuntSchedule.Persistence.Repositories;
using HuntSchedule.Services.Interfaces;

namespace HuntSchedule.Services.Implementations;

public class RoleService : IRoleService
{
    private readonly IUnitOfWork _unitOfWork;

    public RoleService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<Role>> GetAllAsync()
    {
        return await _unitOfWork.Roles.GetAllAsync();
    }

    public async Task<Role?> GetByIdAsync(int id)
    {
        return await _unitOfWork.Roles.GetByIdAsync(id);
    }
}
