using Xunit;
using HuntSchedule.Persistence.Repositories;
using HuntSchedule.Persistence.Entities;
using HuntSchedule.Tests.Helpers;

namespace HuntSchedule.Tests.Repositories;

public class SchedulePeriodRepositoryTests
{
    [Fact]
    public async Task GetAllAsync_ReturnsAllPeriods()
    {
        using var context = TestDbContextFactory.CreateInMemoryContext();
        var server = TestDataBuilder.CreateServer();
        context.Servers.Add(server);
        await context.SaveChangesAsync();

        context.SchedulePeriods.AddRange(
            TestDataBuilder.CreatePeriod("Week 1", server.Id),
            TestDataBuilder.CreatePeriod("Week 2", server.Id)
        );
        await context.SaveChangesAsync();

        var repository = new SchedulePeriodRepository(context);
        var result = await repository.GetAllAsync();

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task GetByServerIdAsync_ReturnsServerPeriods()
    {
        using var context = TestDbContextFactory.CreateInMemoryContext();
        var server1 = TestDataBuilder.CreateServer("Antica");
        var server2 = TestDataBuilder.CreateServer("Wintera", "SA");
        context.Servers.AddRange(server1, server2);
        await context.SaveChangesAsync();

        context.SchedulePeriods.AddRange(
            TestDataBuilder.CreatePeriod("Week 1", server1.Id),
            TestDataBuilder.CreatePeriod("Week 2", server1.Id),
            TestDataBuilder.CreatePeriod("Week 1", server2.Id)
        );
        await context.SaveChangesAsync();

        var repository = new SchedulePeriodRepository(context);
        var result = await repository.GetByServerIdAsync(server1.Id);

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task AddAsync_AddsPeriodToDatabase()
    {
        using var context = TestDbContextFactory.CreateInMemoryContext();
        var server = TestDataBuilder.CreateServer();
        context.Servers.Add(server);
        await context.SaveChangesAsync();

        var repository = new SchedulePeriodRepository(context);
        var period = new SchedulePeriod
        {
            Name = "Week 3",
            ServerId = server.Id,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(7),
            IsActive = false
        };

        await repository.AddAsync(period);
        await context.SaveChangesAsync();

        Assert.True(period.Id > 0);
        Assert.Equal(1, context.SchedulePeriods.Count());
    }

    [Fact]
    public async Task Remove_RemovesPeriodFromDatabase()
    {
        using var context = TestDbContextFactory.CreateInMemoryContext();
        var server = TestDataBuilder.CreateServer();
        context.Servers.Add(server);
        await context.SaveChangesAsync();

        var period = TestDataBuilder.CreatePeriod("Week 1", server.Id);
        context.SchedulePeriods.Add(period);
        await context.SaveChangesAsync();

        var repository = new SchedulePeriodRepository(context);
        repository.Remove(period);
        await context.SaveChangesAsync();

        Assert.Equal(0, context.SchedulePeriods.Count());
    }
}
