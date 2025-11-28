using Xunit;
using HuntSchedule.Persistence.Repositories;
using HuntSchedule.Persistence.Entities;
using HuntSchedule.Tests.Helpers;

namespace HuntSchedule.Tests.Repositories;

public class UserRepositoryTests
{
    [Fact]
    public async Task GetAllAsync_ReturnsAllUsers()
    {
        using var context = TestDbContextFactory.CreateInMemoryContext();
        var role = TestDataBuilder.CreateRole();
        context.Roles.Add(role);
        await context.SaveChangesAsync();

        context.Users.AddRange(
            TestDataBuilder.CreateUser("User1", role.Id),
            TestDataBuilder.CreateUser("User2", role.Id)
        );
        await context.SaveChangesAsync();

        var repository = new UserRepository(context);
        var result = await repository.GetAllAsync();

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task GetByIdAsync_ExistingUser_ReturnsUser()
    {
        using var context = TestDbContextFactory.CreateInMemoryContext();
        var role = TestDataBuilder.CreateRole();
        context.Roles.Add(role);
        await context.SaveChangesAsync();

        var user = TestDataBuilder.CreateUser("TestUser", role.Id);
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var repository = new UserRepository(context);
        var result = await repository.GetByIdAsync(user.Id);

        Assert.NotNull(result);
        Assert.Equal("TestUser", result.Username);
    }

    [Fact]
    public async Task GetByIdAsync_NonExistingUser_ReturnsNull()
    {
        using var context = TestDbContextFactory.CreateInMemoryContext();
        var repository = new UserRepository(context);

        var result = await repository.GetByIdAsync(999);

        Assert.Null(result);
    }

    [Fact]
    public async Task AddAsync_AddsUserToDatabase()
    {
        using var context = TestDbContextFactory.CreateInMemoryContext();
        var role = TestDataBuilder.CreateRole();
        context.Roles.Add(role);
        await context.SaveChangesAsync();

        var repository = new UserRepository(context);
        var user = new User { Username = "NewUser", RoleId = role.Id, Points = 0 };

        await repository.AddAsync(user);
        await context.SaveChangesAsync();

        Assert.True(user.Id > 0);
        Assert.Equal(1, context.Users.Count());
    }

    [Fact]
    public async Task Remove_RemovesUserFromDatabase()
    {
        using var context = TestDbContextFactory.CreateInMemoryContext();
        var role = TestDataBuilder.CreateRole();
        context.Roles.Add(role);
        await context.SaveChangesAsync();

        var user = TestDataBuilder.CreateUser("TestUser", role.Id);
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var repository = new UserRepository(context);
        repository.Remove(user);
        await context.SaveChangesAsync();

        Assert.Equal(0, context.Users.Count());
    }

    [Fact]
    public async Task Update_ModifiesUserInDatabase()
    {
        using var context = TestDbContextFactory.CreateInMemoryContext();
        var role = TestDataBuilder.CreateRole();
        context.Roles.Add(role);
        await context.SaveChangesAsync();

        var user = TestDataBuilder.CreateUser("OldName", role.Id);
        context.Users.Add(user);
        await context.SaveChangesAsync();

        user.Username = "UpdatedName";
        user.Points = 500;
        var repository = new UserRepository(context);
        repository.Update(user);
        await context.SaveChangesAsync();

        var updatedUser = await context.Users.FindAsync(user.Id);
        Assert.NotNull(updatedUser);
        Assert.Equal("UpdatedName", updatedUser.Username);
        Assert.Equal(500, updatedUser.Points);
    }
}
