using Microsoft.EntityFrameworkCore;
using HuntSchedule.Persistence.Context;
using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Persistence.Repositories;

public class PointClaimRepository : Repository<PointClaim>, IPointClaimRepository
{
    public PointClaimRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<PointClaim>> GetAllWithDetailsAsync()
    {
        return await _context.PointClaims
            .Include(pc => pc.User)
            .Include(pc => pc.ReviewedByAdmin)
            .OrderByDescending(pc => pc.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<PointClaim>> GetByUserIdAsync(int userId)
    {
        return await _context.PointClaims
            .Include(pc => pc.User)
            .Include(pc => pc.ReviewedByAdmin)
            .Where(pc => pc.UserId == userId)
            .OrderByDescending(pc => pc.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<PointClaim>> GetPendingClaimsAsync()
    {
        return await _context.PointClaims
            .Include(pc => pc.User)
            .Where(pc => pc.Status == "pending")
            .OrderBy(pc => pc.CreatedAt)
            .ToListAsync();
    }

    public async Task<PointClaim?> GetByIdWithDetailsAsync(int id)
    {
        return await _context.PointClaims
            .Include(pc => pc.User)
            .Include(pc => pc.ReviewedByAdmin)
            .FirstOrDefaultAsync(pc => pc.Id == id);
    }
}
