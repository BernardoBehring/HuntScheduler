using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using HuntSchedule.Persistence.Context;

namespace HuntSchedule.Persistence.Repositories;

public class Repository<T> : IRepository<T> where T : class
{
    protected readonly AppDbContext _context;
    protected readonly DbSet<T> _dbSet;

    public Repository(AppDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public virtual async Task<T?> GetByIdAsync(int id)
    {
        return await _dbSet.FindAsync(id);
    }

    public virtual async Task<IEnumerable<T>> GetAllAsync()
    {
        return await _dbSet.ToListAsync();
    }

    public virtual async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
    {
        return await _dbSet.Where(predicate).ToListAsync();
    }

    public virtual async Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate)
    {
        return await _dbSet.FirstOrDefaultAsync(predicate);
    }

    public virtual async Task AddAsync(T entity)
    {
        await _dbSet.AddAsync(entity);
    }

    public virtual void Update(T entity)
    {
        var entry = _context.Entry(entity);
        if (entry.State == EntityState.Detached)
        {
            var keyProperty = _context.Model.FindEntityType(typeof(T))?.FindPrimaryKey()?.Properties.FirstOrDefault();
            if (keyProperty != null)
            {
                var keyValue = keyProperty.PropertyInfo?.GetValue(entity);
                var trackedEntity = _context.ChangeTracker.Entries<T>()
                    .FirstOrDefault(e => keyProperty.PropertyInfo?.GetValue(e.Entity)?.Equals(keyValue) == true);
                
                if (trackedEntity != null)
                {
                    trackedEntity.CurrentValues.SetValues(entity);
                    trackedEntity.State = EntityState.Modified;
                    return;
                }
            }
            _dbSet.Attach(entity);
        }
        entry.State = EntityState.Modified;
    }

    public virtual void Remove(T entity)
    {
        _dbSet.Remove(entity);
    }
}
