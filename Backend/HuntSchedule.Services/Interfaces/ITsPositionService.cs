using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Services.Interfaces;

public interface ITsPositionService
{
    Task<IEnumerable<TsPosition>> GetAllAsync();
    Task<TsPosition?> GetByIdAsync(int id);
}
