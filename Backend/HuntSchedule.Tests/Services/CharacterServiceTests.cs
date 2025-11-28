using Moq;
using Xunit;
using HuntSchedule.Services.Implementations;
using HuntSchedule.Services.External;
using HuntSchedule.Services.Results;
using HuntSchedule.Persistence.Repositories;
using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Tests.Services;

public class CharacterServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<ICharacterRepository> _mockCharacterRepository;
    private readonly Mock<IServerRepository> _mockServerRepository;
    private readonly Mock<IUserRepository> _mockUserRepository;
    private readonly Mock<ITibiaCharacterValidator> _mockTibiaValidator;
    private readonly CharacterService _characterService;

    public CharacterServiceTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockCharacterRepository = new Mock<ICharacterRepository>();
        _mockServerRepository = new Mock<IServerRepository>();
        _mockUserRepository = new Mock<IUserRepository>();
        _mockTibiaValidator = new Mock<ITibiaCharacterValidator>();

        _mockUnitOfWork.Setup(uow => uow.Characters).Returns(_mockCharacterRepository.Object);
        _mockUnitOfWork.Setup(uow => uow.Servers).Returns(_mockServerRepository.Object);
        _mockUnitOfWork.Setup(uow => uow.Users).Returns(_mockUserRepository.Object);

        _characterService = new CharacterService(_mockUnitOfWork.Object, _mockTibiaValidator.Object);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllCharacters()
    {
        var characters = new List<Character>
        {
            new() { Id = 1, Name = "Char1", ServerId = 1, Level = 100 },
            new() { Id = 2, Name = "Char2", ServerId = 1, Level = 200 }
        };
        _mockCharacterRepository.Setup(r => r.GetAllWithServersAsync()).ReturnsAsync(characters);

        var result = await _characterService.GetAllAsync();

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task GetByIdAsync_ExistingCharacter_ReturnsCharacter()
    {
        var character = new Character { Id = 1, Name = "TestChar", ServerId = 1, Level = 100 };
        _mockCharacterRepository.Setup(r => r.GetByIdWithServerAsync(1)).ReturnsAsync(character);

        var result = await _characterService.GetByIdAsync(1);

        Assert.NotNull(result);
        Assert.Equal("TestChar", result.Name);
    }

    [Fact]
    public async Task GetByUserIdAsync_ReturnsUserCharacters()
    {
        var characters = new List<Character>
        {
            new() { Id = 1, Name = "Char1", UserId = 1, ServerId = 1 },
            new() { Id = 2, Name = "Char2", UserId = 1, ServerId = 1 }
        };
        _mockCharacterRepository.Setup(r => r.GetByUserIdAsync(1)).ReturnsAsync(characters);

        var result = await _characterService.GetByUserIdAsync(1);

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task CreateAsync_ValidCharacter_WithTibiaValidation_ReturnsSuccess()
    {
        var character = new Character { Name = "ValidChar", ServerId = 1, UserId = 1 };
        var user = new User { Id = 1, Username = "TestUser", RoleId = 1 };
        var server = new Server { Id = 1, Name = "Antica", Region = "EU" };
        var tibiaResult = new TibiaCharacterResult
        {
            Exists = true,
            Name = "ValidChar",
            Vocation = "Knight",
            Level = 150,
            World = "Antica"
        };

        _mockUserRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(user);
        _mockServerRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(server);
        _mockServerRepository.Setup(r => r.GetByNameAsync("Antica")).ReturnsAsync(server);
        _mockTibiaValidator.Setup(v => v.ValidateCharacterAsync("ValidChar"))
            .ReturnsAsync(tibiaResult);
        _mockCharacterRepository.Setup(r => r.GetMainCharactersByUserIdAsync(1)).ReturnsAsync(new List<Character>());
        _mockCharacterRepository.Setup(r => r.AddAsync(It.IsAny<Character>())).Returns(Task.CompletedTask);
        _mockUnitOfWork.Setup(uow => uow.SaveChangesAsync()).ReturnsAsync(1);

        var result = await _characterService.CreateAsync(character);

        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal("ValidChar", result.Data.Name);
        Assert.Equal("Knight", result.Data.Vocation);
        Assert.Equal(150, result.Data.Level);
    }

    [Fact]
    public async Task CreateAsync_InvalidServer_ReturnsError()
    {
        var character = new Character { Name = "TestChar", ServerId = 999 };
        _mockServerRepository.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Server?)null);

        var result = await _characterService.CreateAsync(character);

        Assert.False(result.Success);
        Assert.Equal(ErrorCode.ServerNotFound, result.ErrorCode);
    }

    [Fact]
    public async Task CreateAsync_CharacterNotFoundOnTibia_ReturnsError()
    {
        var character = new Character { Name = "FakeChar", ServerId = 1 };
        var server = new Server { Id = 1, Name = "Antica", Region = "EU" };
        var tibiaResult = new TibiaCharacterResult { Exists = false };

        _mockServerRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(server);
        _mockTibiaValidator.Setup(v => v.ValidateCharacterAsync("FakeChar"))
            .ReturnsAsync(tibiaResult);

        var result = await _characterService.CreateAsync(character);

        Assert.False(result.Success);
        Assert.Equal(ErrorCode.CharacterNotFoundOnTibia, result.ErrorCode);
        Assert.NotNull(result.ErrorParams);
        Assert.Equal("FakeChar", result.ErrorParams["name"]);
    }

    [Fact]
    public async Task CreateAsync_WorldMismatch_ReturnsError()
    {
        var character = new Character { Name = "TestChar", ServerId = 1 };
        var server = new Server { Id = 1, Name = "Antica", Region = "EU" };
        var winteraServer = new Server { Id = 2, Name = "Wintera", Region = "SA" };
        var tibiaResult = new TibiaCharacterResult
        {
            Exists = true,
            Name = "TestChar",
            Vocation = "Knight",
            Level = 100,
            World = "Wintera"
        };

        _mockServerRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(server);
        _mockServerRepository.Setup(r => r.GetByNameAsync("Wintera")).ReturnsAsync(winteraServer);
        _mockTibiaValidator.Setup(v => v.ValidateCharacterAsync("TestChar"))
            .ReturnsAsync(tibiaResult);

        var result = await _characterService.CreateAsync(character);

        Assert.False(result.Success);
        Assert.Equal(ErrorCode.CharacterServerMismatch, result.ErrorCode);
        Assert.NotNull(result.ErrorParams);
        Assert.Equal("Wintera", result.ErrorParams["actualServer"]);
    }

    [Fact]
    public async Task SetMainCharacterAsync_ValidCharacter_SetsAsMain()
    {
        var characters = new List<Character>
        {
            new() { Id = 1, Name = "Char1", UserId = 1, ServerId = 1, IsMain = true },
            new() { Id = 2, Name = "Char2", UserId = 1, ServerId = 1, IsMain = false }
        };
        _mockCharacterRepository.Setup(r => r.GetByIdAsync(2)).ReturnsAsync(characters[1]);
        _mockCharacterRepository.Setup(r => r.GetMainCharactersByUserIdAsync(1)).ReturnsAsync(characters.Where(c => c.IsMain).ToList());
        _mockUnitOfWork.Setup(uow => uow.SaveChangesAsync()).ReturnsAsync(1);

        await _characterService.SetMainCharacterAsync(2);

        Assert.True(characters[1].IsMain);
    }

    [Fact]
    public async Task DeleteAsync_ExistingCharacter_RemovesCharacter()
    {
        var character = new Character { Id = 1, Name = "TestChar", ServerId = 1 };
        _mockCharacterRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(character);
        _mockUnitOfWork.Setup(uow => uow.SaveChangesAsync()).ReturnsAsync(1);

        await _characterService.DeleteAsync(1);

        _mockCharacterRepository.Verify(r => r.Remove(character), Times.Once);
    }
}
