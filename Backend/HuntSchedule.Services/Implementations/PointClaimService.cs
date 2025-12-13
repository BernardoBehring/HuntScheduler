using HuntSchedule.Persistence.Entities;
using HuntSchedule.Persistence.Repositories;
using HuntSchedule.Services.Interfaces;

namespace HuntSchedule.Services.Implementations;

public class PointClaimService : IPointClaimService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPointTransactionService _pointTransactionService;

    public PointClaimService(IUnitOfWork unitOfWork, IPointTransactionService pointTransactionService)
    {
        _unitOfWork = unitOfWork;
        _pointTransactionService = pointTransactionService;
    }

    public async Task<IEnumerable<PointClaim>> GetAllAsync()
    {
        return await _unitOfWork.PointClaims.GetAllWithDetailsAsync();
    }

    public async Task<IEnumerable<PointClaim>> GetByUserIdAsync(int userId)
    {
        return await _unitOfWork.PointClaims.GetByUserIdAsync(userId);
    }

    public async Task<IEnumerable<PointClaim>> GetPendingClaimsAsync()
    {
        return await _unitOfWork.PointClaims.GetPendingClaimsAsync();
    }

    public async Task<PointClaim?> GetByIdAsync(int id)
    {
        return await _unitOfWork.PointClaims.GetByIdWithDetailsAsync(id);
    }

    public async Task<PointClaim> CreateAsync(int userId, string? note, string? screenshotUrl)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null)
        {
            throw new ArgumentException($"User with ID {userId} not found");
        }

        var claim = new PointClaim
        {
            UserId = userId,
            Note = note,
            ScreenshotUrl = screenshotUrl,
            Status = "pending",
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.PointClaims.AddAsync(claim);
        await _unitOfWork.SaveChangesAsync();

        claim.User = user;
        return claim;
    }

    public async Task<PointClaim?> ApproveAsync(int claimId, int adminId, string adminResponse, int pointsAwarded)
    {
        using var transaction = await _unitOfWork.BeginTransactionAsync();
        try
        {
            var claim = await _unitOfWork.PointClaims.GetByIdWithDetailsAsync(claimId);
            if (claim == null)
            {
                return null;
            }

            if (claim.Status != "pending")
            {
                throw new InvalidOperationException("This claim has already been reviewed");
            }

            claim.Status = "approved";
            claim.ReviewedByAdminId = adminId;
            claim.AdminResponse = adminResponse;
            claim.PointsAwarded = pointsAwarded;
            claim.ReviewedAt = DateTime.UtcNow;

            _unitOfWork.PointClaims.Update(claim);

            await _pointTransactionService.CreateAsync(
                claim.UserId, 
                adminId, 
                pointsAwarded, 
                $"Claim approved: {adminResponse}"
            );

            await _unitOfWork.SaveChangesAsync();
            await transaction.CommitAsync();

            claim.ReviewedByAdmin = await _unitOfWork.Users.GetByIdAsync(adminId);
            return claim;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<PointClaim?> RejectAsync(int claimId, int adminId, string adminResponse)
    {
        var claim = await _unitOfWork.PointClaims.GetByIdWithDetailsAsync(claimId);
        if (claim == null)
        {
            return null;
        }

        if (claim.Status != "pending")
        {
            throw new InvalidOperationException("This claim has already been reviewed");
        }

        claim.Status = "rejected";
        claim.ReviewedByAdminId = adminId;
        claim.AdminResponse = adminResponse;
        claim.ReviewedAt = DateTime.UtcNow;

        _unitOfWork.PointClaims.Update(claim);
        await _unitOfWork.SaveChangesAsync();

        claim.ReviewedByAdmin = await _unitOfWork.Users.GetByIdAsync(adminId);
        return claim;
    }
}
