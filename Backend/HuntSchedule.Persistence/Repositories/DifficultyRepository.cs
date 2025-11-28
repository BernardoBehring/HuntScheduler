using HuntSchedule.Persistence.Context;
using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Persistence.Repositories;

public class DifficultyRepository : Repository<Difficulty>, IDifficultyRepository
{
    public DifficultyRepository(AppDbContext context) : base(context) { }
}
