using HuntSchedule.Persistence.Entities;
using HuntSchedule.Persistence.Repositories;
using HuntSchedule.Services.Interfaces;

namespace HuntSchedule.Services.Implementations;

public class TsPositionService : ITsPositionService
{
    private readonly IUnitOfWork _unitOfWork;

    public TsPositionService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<TsPosition>> GetAllAsync()
    {
        return await _unitOfWork.TsPositions.GetAllAsync();
    }

    public async Task<TsPosition?> GetByIdAsync(int id)
    {
        return await _unitOfWork.TsPositions.GetByIdAsync(id);
    }
}
