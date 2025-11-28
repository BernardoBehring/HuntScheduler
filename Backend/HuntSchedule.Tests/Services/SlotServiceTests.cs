using Moq;
using Xunit;
using HuntSchedule.Services.Implementations;
using HuntSchedule.Persistence.Repositories;
using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Tests.Services;

public class SlotServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<ISlotRepository> _mockSlotRepository;
    private readonly SlotService _slotService;

    public SlotServiceTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockSlotRepository = new Mock<ISlotRepository>();
        _mockUnitOfWork.Setup(uow => uow.Slots).Returns(_mockSlotRepository.Object);
        _slotService = new SlotService(_mockUnitOfWork.Object);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllSlots()
    {
        var slots = new List<Slot>
        {
            new() { Id = 1, ServerId = 1, StartTime = "08:00", EndTime = "12:00" },
            new() { Id = 2, ServerId = 1, StartTime = "12:00", EndTime = "18:00" }
        };
        _mockSlotRepository.Setup(r => r.GetAllWithServersAsync()).ReturnsAsync(slots);

        var result = await _slotService.GetAllAsync();

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task GetByIdAsync_ExistingSlot_ReturnsSlot()
    {
        var slot = new Slot { Id = 1, ServerId = 1, StartTime = "08:00", EndTime = "12:00" };
        _mockSlotRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(slot);

        var result = await _slotService.GetByIdAsync(1);

        Assert.NotNull(result);
        Assert.Equal("08:00", result.StartTime);
    }

    [Fact]
    public async Task GetByServerIdAsync_ReturnsServerSlots()
    {
        var slots = new List<Slot>
        {
            new() { Id = 1, ServerId = 1, StartTime = "08:00", EndTime = "12:00" },
            new() { Id = 2, ServerId = 1, StartTime = "12:00", EndTime = "18:00" }
        };
        _mockSlotRepository.Setup(r => r.GetByServerIdAsync(1)).ReturnsAsync(slots);

        var result = await _slotService.GetByServerIdAsync(1);

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task CreateAsync_ValidSlot_ReturnsCreatedSlot()
    {
        var slot = new Slot
        {
            ServerId = 1,
            StartTime = "18:00",
            EndTime = "22:00"
        };

        _mockSlotRepository.Setup(r => r.AddAsync(It.IsAny<Slot>())).Returns(Task.CompletedTask);
        _mockUnitOfWork.Setup(uow => uow.SaveChangesAsync()).ReturnsAsync(1);

        var result = await _slotService.CreateAsync(slot);

        Assert.NotNull(result);
        Assert.Equal("18:00", result.StartTime);
    }

    [Fact]
    public async Task UpdateAsync_ValidSlot_CallsSaveChanges()
    {
        var slot = new Slot { Id = 1, ServerId = 1, StartTime = "09:00", EndTime = "13:00" };
        _mockUnitOfWork.Setup(uow => uow.SaveChangesAsync()).ReturnsAsync(1);

        await _slotService.UpdateAsync(slot);

        _mockSlotRepository.Verify(r => r.Update(slot), Times.Once);
        _mockUnitOfWork.Verify(uow => uow.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_ExistingSlot_RemovesSlot()
    {
        var slot = new Slot { Id = 1, ServerId = 1, StartTime = "08:00", EndTime = "12:00" };
        _mockSlotRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(slot);
        _mockUnitOfWork.Setup(uow => uow.SaveChangesAsync()).ReturnsAsync(1);

        await _slotService.DeleteAsync(1);

        _mockSlotRepository.Verify(r => r.Remove(slot), Times.Once);
    }
}
