using Moq;
using Xunit;
using HuntSchedule.Services.Implementations;
using HuntSchedule.Persistence.Repositories;
using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Tests.Services;

public class RequestStatusServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IRequestStatusRepository> _mockStatusRepository;
    private readonly RequestStatusService _statusService;

    public RequestStatusServiceTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockStatusRepository = new Mock<IRequestStatusRepository>();
        _mockUnitOfWork.Setup(uow => uow.RequestStatuses).Returns(_mockStatusRepository.Object);
        _statusService = new RequestStatusService(_mockUnitOfWork.Object);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllStatuses()
    {
        var statuses = new List<RequestStatus>
        {
            new() { Id = 1, Name = "pending" },
            new() { Id = 2, Name = "approved" },
            new() { Id = 3, Name = "rejected" }
        };
        _mockStatusRepository.Setup(r => r.GetAllAsync()).ReturnsAsync(statuses);

        var result = await _statusService.GetAllAsync();

        Assert.Equal(3, result.Count());
    }

    [Fact]
    public async Task GetByIdAsync_ExistingStatus_ReturnsStatus()
    {
        var status = new RequestStatus { Id = 1, Name = "pending" };
        _mockStatusRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(status);

        var result = await _statusService.GetByIdAsync(1);

        Assert.NotNull(result);
        Assert.Equal("pending", result.Name);
    }

    [Fact]
    public async Task GetByIdAsync_NonExistingStatus_ReturnsNull()
    {
        _mockStatusRepository.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((RequestStatus?)null);

        var result = await _statusService.GetByIdAsync(999);

        Assert.Null(result);
    }
}
