using Moq;
using Xunit;
using HuntSchedule.Services.Implementations;
using HuntSchedule.Persistence.Repositories;
using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Tests.Services;

public class RespawnServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IRespawnRepository> _mockRespawnRepository;
    private readonly RespawnService _respawnService;

    public RespawnServiceTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockRespawnRepository = new Mock<IRespawnRepository>();
        _mockUnitOfWork.Setup(uow => uow.Respawns).Returns(_mockRespawnRepository.Object);
        _respawnService = new RespawnService(_mockUnitOfWork.Object);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllRespawns()
    {
        var respawns = new List<Respawn>
        {
            new() { Id = 1, Name = "Respawn1", ServerId = 1, DifficultyId = 1, MaxPlayers = 4 },
            new() { Id = 2, Name = "Respawn2", ServerId = 1, DifficultyId = 2, MaxPlayers = 6 }
        };
        _mockRespawnRepository.Setup(r => r.GetAllWithDifficultyAsync()).ReturnsAsync(respawns);

        var result = await _respawnService.GetAllAsync();

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task GetByIdAsync_ExistingRespawn_ReturnsRespawn()
    {
        var respawn = new Respawn { Id = 1, Name = "TestRespawn", ServerId = 1, DifficultyId = 1, MaxPlayers = 4 };
        _mockRespawnRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(respawn);

        var result = await _respawnService.GetByIdAsync(1);

        Assert.NotNull(result);
        Assert.Equal("TestRespawn", result.Name);
    }

    [Fact]
    public async Task GetByServerIdAsync_ReturnsServerRespawns()
    {
        var respawns = new List<Respawn>
        {
            new() { Id = 1, Name = "Respawn1", ServerId = 1, DifficultyId = 1, MaxPlayers = 4 },
            new() { Id = 2, Name = "Respawn2", ServerId = 1, DifficultyId = 2, MaxPlayers = 6 }
        };
        _mockRespawnRepository.Setup(r => r.GetByServerIdAsync(1)).ReturnsAsync(respawns);

        var result = await _respawnService.GetByServerIdAsync(1);

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task CreateAsync_ValidRespawn_ReturnsCreatedRespawn()
    {
        var respawn = new Respawn { Name = "NewRespawn", ServerId = 1, DifficultyId = 1, MaxPlayers = 4 };

        _mockRespawnRepository.Setup(r => r.AddAsync(It.IsAny<Respawn>())).Returns(Task.CompletedTask);
        _mockUnitOfWork.Setup(uow => uow.SaveChangesAsync()).ReturnsAsync(1);

        var result = await _respawnService.CreateAsync(respawn);

        Assert.NotNull(result);
        Assert.Equal("NewRespawn", result.Name);
        Assert.Equal(4, result.MaxPlayers);
    }

    [Fact]
    public async Task UpdateAsync_ValidRespawn_CallsSaveChanges()
    {
        var respawn = new Respawn { Id = 1, Name = "UpdatedRespawn", ServerId = 1, DifficultyId = 1, MaxPlayers = 6 };
        _mockUnitOfWork.Setup(uow => uow.SaveChangesAsync()).ReturnsAsync(1);

        await _respawnService.UpdateAsync(respawn);

        _mockRespawnRepository.Verify(r => r.Update(respawn), Times.Once);
        _mockUnitOfWork.Verify(uow => uow.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_ExistingRespawn_RemovesRespawn()
    {
        var respawn = new Respawn { Id = 1, Name = "TestRespawn", ServerId = 1, DifficultyId = 1, MaxPlayers = 4 };
        _mockRespawnRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(respawn);
        _mockUnitOfWork.Setup(uow => uow.SaveChangesAsync()).ReturnsAsync(1);

        await _respawnService.DeleteAsync(1);

        _mockRespawnRepository.Verify(r => r.Remove(respawn), Times.Once);
    }
}
