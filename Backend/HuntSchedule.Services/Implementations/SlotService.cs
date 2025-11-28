using HuntSchedule.Persistence.Entities;
using HuntSchedule.Persistence.Repositories;
using HuntSchedule.Services.Interfaces;

namespace HuntSchedule.Services.Implementations;

public class SlotService : ISlotService
{
    private readonly IUnitOfWork _unitOfWork;

    public SlotService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<Slot>> GetAllAsync()
    {
        return await _unitOfWork.Slots.GetAllWithServersAsync();
    }

    public async Task<Slot?> GetByIdAsync(int id)
    {
        return await _unitOfWork.Slots.GetByIdAsync(id);
    }

    public async Task<IEnumerable<Slot>> GetByServerIdAsync(int serverId)
    {
        return await _unitOfWork.Slots.GetByServerIdAsync(serverId);
    }

    public async Task<Slot> CreateAsync(Slot slot)
    {
        await _unitOfWork.Slots.AddAsync(slot);
        await _unitOfWork.SaveChangesAsync();
        return slot;
    }

    public async Task UpdateAsync(Slot slot)
    {
        _unitOfWork.Slots.Update(slot);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var slot = await _unitOfWork.Slots.GetByIdAsync(id);
        if (slot != null)
        {
            _unitOfWork.Slots.Remove(slot);
            await _unitOfWork.SaveChangesAsync();
        }
    }
}
