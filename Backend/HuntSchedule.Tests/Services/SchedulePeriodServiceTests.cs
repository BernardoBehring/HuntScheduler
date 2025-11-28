using Moq;
using Xunit;
using HuntSchedule.Services.Implementations;
using HuntSchedule.Persistence.Repositories;
using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Tests.Services;

public class SchedulePeriodServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<ISchedulePeriodRepository> _mockPeriodRepository;
    private readonly SchedulePeriodService _periodService;

    public SchedulePeriodServiceTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockPeriodRepository = new Mock<ISchedulePeriodRepository>();
        _mockUnitOfWork.Setup(uow => uow.SchedulePeriods).Returns(_mockPeriodRepository.Object);
        _periodService = new SchedulePeriodService(_mockUnitOfWork.Object);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllPeriods()
    {
        var periods = new List<SchedulePeriod>
        {
            new() { Id = 1, Name = "Week 1", ServerId = 1, StartDate = DateTime.UtcNow, EndDate = DateTime.UtcNow.AddDays(7), IsActive = true },
            new() { Id = 2, Name = "Week 2", ServerId = 1, StartDate = DateTime.UtcNow.AddDays(7), EndDate = DateTime.UtcNow.AddDays(14), IsActive = false }
        };
        _mockPeriodRepository.Setup(r => r.GetAllWithServersAsync()).ReturnsAsync(periods);

        var result = await _periodService.GetAllAsync();

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task GetByIdAsync_ExistingPeriod_ReturnsPeriod()
    {
        var period = new SchedulePeriod { Id = 1, Name = "Week 1", ServerId = 1, StartDate = DateTime.UtcNow, EndDate = DateTime.UtcNow.AddDays(7), IsActive = true };
        _mockPeriodRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(period);

        var result = await _periodService.GetByIdAsync(1);

        Assert.NotNull(result);
        Assert.Equal("Week 1", result.Name);
    }

    [Fact]
    public async Task GetByServerIdAsync_ReturnsServerPeriods()
    {
        var periods = new List<SchedulePeriod>
        {
            new() { Id = 1, Name = "Week 1", ServerId = 1, StartDate = DateTime.UtcNow, EndDate = DateTime.UtcNow.AddDays(7), IsActive = true },
            new() { Id = 2, Name = "Week 2", ServerId = 1, StartDate = DateTime.UtcNow.AddDays(7), EndDate = DateTime.UtcNow.AddDays(14), IsActive = false }
        };
        _mockPeriodRepository.Setup(r => r.GetByServerIdAsync(1)).ReturnsAsync(periods);

        var result = await _periodService.GetByServerIdAsync(1);

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task CreateAsync_ValidPeriod_ReturnsCreatedPeriod()
    {
        var startDate = DateTime.UtcNow;
        var period = new SchedulePeriod
        {
            Name = "Week 3",
            ServerId = 1,
            StartDate = startDate,
            EndDate = startDate.AddDays(7),
            IsActive = false
        };

        _mockPeriodRepository.Setup(r => r.AddAsync(It.IsAny<SchedulePeriod>())).Returns(Task.CompletedTask);
        _mockUnitOfWork.Setup(uow => uow.SaveChangesAsync()).ReturnsAsync(1);

        var result = await _periodService.CreateAsync(period);

        Assert.NotNull(result);
        Assert.Equal("Week 3", result.Name);
    }

    [Fact]
    public async Task UpdateAsync_ValidPeriod_CallsSaveChanges()
    {
        var period = new SchedulePeriod { Id = 1, Name = "UpdatedPeriod", ServerId = 1, StartDate = DateTime.UtcNow, EndDate = DateTime.UtcNow.AddDays(7), IsActive = true };
        _mockUnitOfWork.Setup(uow => uow.SaveChangesAsync()).ReturnsAsync(1);

        await _periodService.UpdateAsync(period);

        _mockPeriodRepository.Verify(r => r.Update(period), Times.Once);
        _mockUnitOfWork.Verify(uow => uow.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_ExistingPeriod_RemovesPeriod()
    {
        var period = new SchedulePeriod { Id = 1, Name = "Week 1", ServerId = 1, StartDate = DateTime.UtcNow, EndDate = DateTime.UtcNow.AddDays(7), IsActive = false };
        _mockPeriodRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(period);
        _mockUnitOfWork.Setup(uow => uow.SaveChangesAsync()).ReturnsAsync(1);

        await _periodService.DeleteAsync(1);

        _mockPeriodRepository.Verify(r => r.Remove(period), Times.Once);
    }
}
