using HuntSchedule.Persistence.Entities;
using HuntSchedule.Persistence.Repositories;
using HuntSchedule.Services.Interfaces;

namespace HuntSchedule.Services.Implementations;

public class PointTransactionService : IPointTransactionService
{
    private readonly IUnitOfWork _unitOfWork;

    public PointTransactionService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<PointTransaction>> GetAllAsync()
    {
        return await _unitOfWork.PointTransactions.GetAllWithDetailsAsync();
    }

    public async Task<IEnumerable<PointTransaction>> GetByUserIdAsync(int userId)
    {
        return await _unitOfWork.PointTransactions.GetByUserIdAsync(userId);
    }

    public async Task<IEnumerable<PointTransaction>> GetByAdminIdAsync(int adminId)
    {
        return await _unitOfWork.PointTransactions.GetByAdminIdAsync(adminId);
    }

    public async Task<PointTransaction> CreateAsync(int userId, int adminId, int amount, string reason)
    {
        using var transaction = await _unitOfWork.BeginTransactionAsync();
        try
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null)
            {
                throw new ArgumentException($"User with ID {userId} not found");
            }

            user.Points += amount;
            _unitOfWork.Users.Update(user);

            var pointTransaction = new PointTransaction
            {
                UserId = userId,
                AdminId = adminId,
                Amount = amount,
                Reason = reason,
                BalanceAfter = user.Points,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.PointTransactions.AddAsync(pointTransaction);
            await _unitOfWork.SaveChangesAsync();
            await transaction.CommitAsync();

            pointTransaction.User = user;
            pointTransaction.Admin = await _unitOfWork.Users.GetByIdAsync(adminId);

            return pointTransaction;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}
