namespace HuntSchedule.Services.Interfaces;

public interface IAuthService
{
    Task<bool> ValidateCredentialsAsync(string username, string password);
    Task<int?> GetUserIdByUsernameAsync(string username);
    string HashPassword(string password);
}
