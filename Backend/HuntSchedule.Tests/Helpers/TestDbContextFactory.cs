using Microsoft.EntityFrameworkCore;
using HuntSchedule.Persistence.Context;

namespace HuntSchedule.Tests.Helpers;

public static class TestDbContextFactory
{
    public static AppDbContext CreateInMemoryContext(string databaseName)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: databaseName)
            .Options;

        var context = new AppDbContext(options);
        context.Database.EnsureCreated();
        return context;
    }

    public static AppDbContext CreateInMemoryContext()
    {
        return CreateInMemoryContext(Guid.NewGuid().ToString());
    }
}
