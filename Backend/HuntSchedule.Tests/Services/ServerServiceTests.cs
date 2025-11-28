using Moq;
using Xunit;
using HuntSchedule.Services.Implementations;
using HuntSchedule.Persistence.Repositories;
using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Tests.Services;

public class ServerServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IServerRepository> _mockServerRepository;
    private readonly ServerService _serverService;

    public ServerServiceTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockServerRepository = new Mock<IServerRepository>();
        _mockUnitOfWork.Setup(uow => uow.Servers).Returns(_mockServerRepository.Object);
        _serverService = new ServerService(_mockUnitOfWork.Object);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllServers()
    {
        var servers = new List<Server>
        {
            new() { Id = 1, Name = "Antica", Region = "EU" },
            new() { Id = 2, Name = "Wintera", Region = "SA" }
        };
        _mockServerRepository.Setup(r => r.GetAllAsync()).ReturnsAsync(servers);

        var result = await _serverService.GetAllAsync();

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task GetByIdAsync_ExistingServer_ReturnsServer()
    {
        var server = new Server { Id = 1, Name = "Antica", Region = "EU" };
        _mockServerRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(server);

        var result = await _serverService.GetByIdAsync(1);

        Assert.NotNull(result);
        Assert.Equal("Antica", result.Name);
    }

    [Fact]
    public async Task CreateAsync_ValidServer_ReturnsCreatedServer()
    {
        var server = new Server { Name = "NewServer", Region = "NA" };

        _mockServerRepository.Setup(r => r.AddAsync(It.IsAny<Server>())).Returns(Task.CompletedTask);
        _mockUnitOfWork.Setup(uow => uow.SaveChangesAsync()).ReturnsAsync(1);

        var result = await _serverService.CreateAsync(server);

        Assert.NotNull(result);
        Assert.Equal("NewServer", result.Name);
    }

    [Fact]
    public async Task UpdateAsync_ValidServer_CallsSaveChanges()
    {
        var server = new Server { Id = 1, Name = "UpdatedServer", Region = "EU" };
        _mockUnitOfWork.Setup(uow => uow.SaveChangesAsync()).ReturnsAsync(1);

        await _serverService.UpdateAsync(server);

        _mockServerRepository.Verify(r => r.Update(server), Times.Once);
        _mockUnitOfWork.Verify(uow => uow.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_ExistingServer_RemovesServer()
    {
        var server = new Server { Id = 1, Name = "TestServer", Region = "EU" };
        _mockServerRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(server);
        _mockUnitOfWork.Setup(uow => uow.SaveChangesAsync()).ReturnsAsync(1);

        await _serverService.DeleteAsync(1);

        _mockServerRepository.Verify(r => r.Remove(server), Times.Once);
    }
}
