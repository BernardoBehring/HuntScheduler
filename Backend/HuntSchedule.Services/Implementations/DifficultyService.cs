using HuntSchedule.Persistence.Entities;
using HuntSchedule.Persistence.Repositories;
using HuntSchedule.Services.Interfaces;

namespace HuntSchedule.Services.Implementations;

public class DifficultyService : IDifficultyService
{
    private readonly IUnitOfWork _unitOfWork;

    public DifficultyService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<Difficulty>> GetAllAsync()
    {
        return await _unitOfWork.Difficulties.GetAllAsync();
    }

    public async Task<Difficulty?> GetByIdAsync(int id)
    {
        return await _unitOfWork.Difficulties.GetByIdAsync(id);
    }
}
