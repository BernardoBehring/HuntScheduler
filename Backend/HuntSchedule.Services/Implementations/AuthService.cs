using HuntSchedule.Persistence.Repositories;
using HuntSchedule.Services.Interfaces;
using BCrypt.Net;

namespace HuntSchedule.Services.Implementations;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;

    public AuthService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> ValidateCredentialsAsync(string username, string password)
    {
        var user = await _unitOfWork.Users.GetByUsernameAsync(username);
        if (user == null) return false;
        
        return BCrypt.Net.BCrypt.Verify(password, user.Password);
    }

    public async Task<int?> GetUserIdByUsernameAsync(string username)
    {
        var user = await _unitOfWork.Users.GetByUsernameAsync(username);
        return user?.Id;
    }

    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }
}
