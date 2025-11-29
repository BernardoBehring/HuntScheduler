using Microsoft.EntityFrameworkCore;
using HuntSchedule.Persistence.Context;
using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Persistence.Repositories;

public class PointTransactionRepository : Repository<PointTransaction>, IPointTransactionRepository
{
    public PointTransactionRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<PointTransaction>> GetAllWithDetailsAsync()
    {
        return await _context.PointTransactions
            .Include(pt => pt.User)
            .Include(pt => pt.Admin)
            .OrderByDescending(pt => pt.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<PointTransaction>> GetByUserIdAsync(int userId)
    {
        return await _context.PointTransactions
            .Include(pt => pt.User)
            .Include(pt => pt.Admin)
            .Where(pt => pt.UserId == userId)
            .OrderByDescending(pt => pt.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<PointTransaction>> GetByAdminIdAsync(int adminId)
    {
        return await _context.PointTransactions
            .Include(pt => pt.User)
            .Include(pt => pt.Admin)
            .Where(pt => pt.AdminId == adminId)
            .OrderByDescending(pt => pt.CreatedAt)
            .ToListAsync();
    }
}
