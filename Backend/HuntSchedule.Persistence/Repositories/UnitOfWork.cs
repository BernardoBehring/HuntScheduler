using Microsoft.EntityFrameworkCore.Storage;
using HuntSchedule.Persistence.Context;

namespace HuntSchedule.Persistence.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;
    
    private IUserRepository? _users;
    private IRoleRepository? _roles;
    private ICharacterRepository? _characters;
    private IServerRepository? _servers;
    private IRespawnRepository? _respawns;
    private ISlotRepository? _slots;
    private ISchedulePeriodRepository? _schedulePeriods;
    private IRequestRepository? _requests;
    private IRequestStatusRepository? _requestStatuses;
    private IDifficultyRepository? _difficulties;
    private IPointTransactionRepository? _pointTransactions;

    public UnitOfWork(AppDbContext context)
    {
        _context = context;
    }

    public IUserRepository Users => _users ??= new UserRepository(_context);
    public IRoleRepository Roles => _roles ??= new RoleRepository(_context);
    public ICharacterRepository Characters => _characters ??= new CharacterRepository(_context);
    public IServerRepository Servers => _servers ??= new ServerRepository(_context);
    public IRespawnRepository Respawns => _respawns ??= new RespawnRepository(_context);
    public ISlotRepository Slots => _slots ??= new SlotRepository(_context);
    public ISchedulePeriodRepository SchedulePeriods => _schedulePeriods ??= new SchedulePeriodRepository(_context);
    public IRequestRepository Requests => _requests ??= new RequestRepository(_context);
    public IRequestStatusRepository RequestStatuses => _requestStatuses ??= new RequestStatusRepository(_context);
    public IDifficultyRepository Difficulties => _difficulties ??= new DifficultyRepository(_context);
    public IPointTransactionRepository PointTransactions => _pointTransactions ??= new PointTransactionRepository(_context);

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public async Task<IDbContextTransaction> BeginTransactionAsync()
    {
        return await _context.Database.BeginTransactionAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
