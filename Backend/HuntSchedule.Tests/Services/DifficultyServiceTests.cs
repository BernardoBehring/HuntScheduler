using Moq;
using Xunit;
using HuntSchedule.Services.Implementations;
using HuntSchedule.Persistence.Repositories;
using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Tests.Services;

public class DifficultyServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IDifficultyRepository> _mockDifficultyRepository;
    private readonly DifficultyService _difficultyService;

    public DifficultyServiceTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockDifficultyRepository = new Mock<IDifficultyRepository>();
        _mockUnitOfWork.Setup(uow => uow.Difficulties).Returns(_mockDifficultyRepository.Object);
        _difficultyService = new DifficultyService(_mockUnitOfWork.Object);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllDifficulties()
    {
        var difficulties = new List<Difficulty>
        {
            new() { Id = 1, Name = "Easy", SortOrder = 1 },
            new() { Id = 2, Name = "Medium", SortOrder = 2 },
            new() { Id = 3, Name = "Hard", SortOrder = 3 }
        };
        _mockDifficultyRepository.Setup(r => r.GetAllAsync()).ReturnsAsync(difficulties);

        var result = await _difficultyService.GetAllAsync();

        Assert.Equal(3, result.Count());
    }

    [Fact]
    public async Task GetByIdAsync_ExistingDifficulty_ReturnsDifficulty()
    {
        var difficulty = new Difficulty { Id = 1, Name = "Medium", SortOrder = 2 };
        _mockDifficultyRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(difficulty);

        var result = await _difficultyService.GetByIdAsync(1);

        Assert.NotNull(result);
        Assert.Equal("Medium", result.Name);
    }

    [Fact]
    public async Task GetByIdAsync_NonExistingDifficulty_ReturnsNull()
    {
        _mockDifficultyRepository.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Difficulty?)null);

        var result = await _difficultyService.GetByIdAsync(999);

        Assert.Null(result);
    }
}
