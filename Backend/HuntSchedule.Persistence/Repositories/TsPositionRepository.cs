using HuntSchedule.Persistence.Context;
using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Persistence.Repositories;

public class TsPositionRepository : Repository<TsPosition>, ITsPositionRepository
{
    public TsPositionRepository(AppDbContext context) : base(context) { }
}
