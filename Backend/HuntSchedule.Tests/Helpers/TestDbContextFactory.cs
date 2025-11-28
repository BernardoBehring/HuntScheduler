using Microsoft.EntityFrameworkCore;
using HuntSchedule.Persistence.Context;

namespace HuntSchedule.Tests.Helpers;

public static class TestDbContextFactory
{
    public static AppDbContext CreateInMemoryContext(string? databaseName = null)
    {
        var dbName = databaseName ?? Guid.NewGuid().ToString();
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .EnableSensitiveDataLogging()
            .Options;

        var context = new AppDbContext(options);
        return context;
    }
}
