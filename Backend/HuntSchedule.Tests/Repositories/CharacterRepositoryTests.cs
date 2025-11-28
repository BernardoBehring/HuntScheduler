using Xunit;
using HuntSchedule.Persistence.Repositories;
using HuntSchedule.Persistence.Entities;
using HuntSchedule.Tests.Helpers;

namespace HuntSchedule.Tests.Repositories;

public class CharacterRepositoryTests
{
    [Fact]
    public async Task GetAllAsync_ReturnsAllCharacters()
    {
        using var context = TestDbContextFactory.CreateInMemoryContext();
        var server = TestDataBuilder.CreateServer();
        context.Servers.Add(server);
        await context.SaveChangesAsync();

        context.Characters.AddRange(
            TestDataBuilder.CreateCharacter("Char1", server.Id),
            TestDataBuilder.CreateCharacter("Char2", server.Id)
        );
        await context.SaveChangesAsync();

        var repository = new CharacterRepository(context);
        var result = await repository.GetAllAsync();

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task GetByUserIdAsync_ReturnsUserCharacters()
    {
        using var context = TestDbContextFactory.CreateInMemoryContext();
        var role = TestDataBuilder.CreateRole();
        context.Roles.Add(role);
        await context.SaveChangesAsync();

        var user = TestDataBuilder.CreateUser("TestUser", role.Id);
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var server = TestDataBuilder.CreateServer();
        context.Servers.Add(server);
        await context.SaveChangesAsync();

        context.Characters.AddRange(
            TestDataBuilder.CreateCharacter("Char1", server.Id, user.Id),
            TestDataBuilder.CreateCharacter("Char2", server.Id, user.Id),
            TestDataBuilder.CreateCharacter("Char3", server.Id, null)
        );
        await context.SaveChangesAsync();

        var repository = new CharacterRepository(context);
        var result = await repository.GetByUserIdAsync(user.Id);

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task GetMainCharactersByUserIdAsync_ReturnsMainCharacters()
    {
        using var context = TestDbContextFactory.CreateInMemoryContext();
        var role = TestDataBuilder.CreateRole();
        context.Roles.Add(role);
        await context.SaveChangesAsync();

        var user = TestDataBuilder.CreateUser("TestUser", role.Id);
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var server = TestDataBuilder.CreateServer();
        context.Servers.Add(server);
        await context.SaveChangesAsync();

        context.Characters.AddRange(
            TestDataBuilder.CreateCharacter("Char1", server.Id, user.Id, isMain: false),
            TestDataBuilder.CreateCharacter("MainChar", server.Id, user.Id, isMain: true)
        );
        await context.SaveChangesAsync();

        var repository = new CharacterRepository(context);
        var result = await repository.GetMainCharactersByUserIdAsync(user.Id);

        Assert.Single(result);
        Assert.Equal("MainChar", result.First().Name);
        Assert.True(result.First().IsMain);
    }

    [Fact]
    public async Task GetByNameAndServerAsync_ReturnsMatchingCharacter()
    {
        using var context = TestDbContextFactory.CreateInMemoryContext();
        var server = TestDataBuilder.CreateServer();
        context.Servers.Add(server);
        await context.SaveChangesAsync();

        var character = TestDataBuilder.CreateCharacter("UniqueChar", server.Id);
        context.Characters.Add(character);
        await context.SaveChangesAsync();

        var repository = new CharacterRepository(context);
        var result = await repository.GetByNameAndServerAsync("UniqueChar", server.Id);

        Assert.NotNull(result);
        Assert.Equal("UniqueChar", result.Name);
    }
}
