using HuntSchedule.Persistence.Entities;
using HuntSchedule.Persistence.Repositories;
using HuntSchedule.Services.Interfaces;

namespace HuntSchedule.Services.Implementations;

public class SchedulePeriodService : ISchedulePeriodService
{
    private readonly IUnitOfWork _unitOfWork;

    public SchedulePeriodService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<SchedulePeriod>> GetAllAsync()
    {
        return await _unitOfWork.SchedulePeriods.GetAllWithServersAsync();
    }

    public async Task<SchedulePeriod?> GetByIdAsync(int id)
    {
        return await _unitOfWork.SchedulePeriods.GetByIdAsync(id);
    }

    public async Task<IEnumerable<SchedulePeriod>> GetByServerIdAsync(int serverId)
    {
        return await _unitOfWork.SchedulePeriods.GetByServerIdAsync(serverId);
    }

    public async Task<SchedulePeriod> CreateAsync(SchedulePeriod period)
    {
        await _unitOfWork.SchedulePeriods.AddAsync(period);
        await _unitOfWork.SaveChangesAsync();
        return period;
    }

    public async Task UpdateAsync(SchedulePeriod period)
    {
        _unitOfWork.SchedulePeriods.Update(period);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var period = await _unitOfWork.SchedulePeriods.GetByIdAsync(id);
        if (period != null)
        {
            _unitOfWork.SchedulePeriods.Remove(period);
            await _unitOfWork.SaveChangesAsync();
        }
    }
}
