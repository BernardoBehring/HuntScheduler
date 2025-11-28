using Xunit;
using HuntSchedule.Persistence.Repositories;
using HuntSchedule.Persistence.Entities;
using HuntSchedule.Persistence.Context;
using HuntSchedule.Tests.Helpers;

namespace HuntSchedule.Tests.Repositories;

public class RequestRepositoryTests
{
    private async Task<(int roleId, int userId, int serverId, int difficultyId, int respawnId, int slotId, int periodId, int statusId)> SeedRequiredEntities(AppDbContext context)
    {
        var role = TestDataBuilder.CreateRole();
        context.Roles.Add(role);
        await context.SaveChangesAsync();

        var user = TestDataBuilder.CreateUser("TestUser", role.Id);
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var server = TestDataBuilder.CreateServer();
        context.Servers.Add(server);
        await context.SaveChangesAsync();

        var difficulty = TestDataBuilder.CreateDifficulty();
        context.Difficulties.Add(difficulty);
        await context.SaveChangesAsync();

        var respawn = TestDataBuilder.CreateRespawn("Test Respawn", server.Id, difficulty.Id);
        context.Respawns.Add(respawn);
        await context.SaveChangesAsync();

        var slot = TestDataBuilder.CreateSlot(server.Id);
        context.Slots.Add(slot);
        await context.SaveChangesAsync();

        var period = TestDataBuilder.CreatePeriod("Week 1", server.Id);
        context.SchedulePeriods.Add(period);
        await context.SaveChangesAsync();

        var status = TestDataBuilder.CreateRequestStatus();
        context.RequestStatuses.Add(status);
        await context.SaveChangesAsync();

        return (role.Id, user.Id, server.Id, difficulty.Id, respawn.Id, slot.Id, period.Id, status.Id);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllRequests()
    {
        using var context = TestDbContextFactory.CreateInMemoryContext();
        var (_, userId, serverId, _, respawnId, slotId, periodId, statusId) = await SeedRequiredEntities(context);
        
        context.Requests.AddRange(
            TestDataBuilder.CreateRequest(userId, serverId, respawnId, slotId, periodId, statusId),
            TestDataBuilder.CreateRequest(userId, serverId, respawnId, slotId, periodId, statusId)
        );
        await context.SaveChangesAsync();

        var repository = new RequestRepository(context);
        var result = await repository.GetAllAsync();

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task GetByIdAsync_ExistingRequest_ReturnsRequest()
    {
        using var context = TestDbContextFactory.CreateInMemoryContext();
        var (_, userId, serverId, _, respawnId, slotId, periodId, statusId) = await SeedRequiredEntities(context);
        
        var request = TestDataBuilder.CreateRequest(userId, serverId, respawnId, slotId, periodId, statusId);
        context.Requests.Add(request);
        await context.SaveChangesAsync();

        var repository = new RequestRepository(context);
        var result = await repository.GetByIdAsync(request.Id);

        Assert.NotNull(result);
        Assert.Equal(request.Id, result.Id);
    }

    [Fact]
    public async Task AddAsync_AddsRequestToDatabase()
    {
        using var context = TestDbContextFactory.CreateInMemoryContext();
        var (_, userId, serverId, _, respawnId, slotId, periodId, statusId) = await SeedRequiredEntities(context);

        var repository = new RequestRepository(context);
        var request = new Request
        {
            UserId = userId,
            ServerId = serverId,
            RespawnId = respawnId,
            SlotId = slotId,
            PeriodId = periodId,
            StatusId = statusId,
            CreatedAt = DateTime.UtcNow
        };

        await repository.AddAsync(request);
        await context.SaveChangesAsync();

        Assert.True(request.Id > 0);
        Assert.Equal(1, context.Requests.Count());
    }

    [Fact]
    public async Task Remove_RemovesRequestFromDatabase()
    {
        using var context = TestDbContextFactory.CreateInMemoryContext();
        var (_, userId, serverId, _, respawnId, slotId, periodId, statusId) = await SeedRequiredEntities(context);
        
        var request = TestDataBuilder.CreateRequest(userId, serverId, respawnId, slotId, periodId, statusId);
        context.Requests.Add(request);
        await context.SaveChangesAsync();

        var repository = new RequestRepository(context);
        repository.Remove(request);
        await context.SaveChangesAsync();

        Assert.Equal(0, context.Requests.Count());
    }
}
