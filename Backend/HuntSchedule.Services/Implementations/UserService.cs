using HuntSchedule.Persistence.Entities;
using HuntSchedule.Persistence.Repositories;
using HuntSchedule.Services.Interfaces;

namespace HuntSchedule.Services.Implementations;

public class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;

    public UserService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        return await _unitOfWork.Users.GetAllWithRolesAsync();
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        return await _unitOfWork.Users.GetByIdAsync(id);
    }

    public async Task<User?> GetByIdWithCharactersAsync(int id)
    {
        return await _unitOfWork.Users.GetByIdWithCharactersAsync(id);
    }

    public async Task<User> CreateAsync(User user)
    {
        await _unitOfWork.Users.AddAsync(user);
        await _unitOfWork.SaveChangesAsync();
        return user;
    }

    public async Task UpdateAsync(User user)
    {
        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id);
        if (user != null)
        {
            _unitOfWork.Users.Remove(user);
            await _unitOfWork.SaveChangesAsync();
        }
    }

    public async Task UpdatePointsAsync(int id, int points)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id);
        if (user != null)
        {
            user.Points = points;
            await _unitOfWork.SaveChangesAsync();
        }
    }
}
