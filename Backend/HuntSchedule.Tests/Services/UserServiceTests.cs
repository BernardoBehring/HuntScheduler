using Moq;
using Xunit;
using HuntSchedule.Services.Implementations;
using HuntSchedule.Persistence.Repositories;
using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Tests.Services;

public class UserServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IUserRepository> _mockUserRepository;
    private readonly UserService _userService;

    public UserServiceTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockUserRepository = new Mock<IUserRepository>();
        _mockUnitOfWork.Setup(uow => uow.Users).Returns(_mockUserRepository.Object);
        _userService = new UserService(_mockUnitOfWork.Object);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllUsers()
    {
        var users = new List<User>
        {
            new() { Id = 1, Username = "User1", RoleId = 1, Points = 100 },
            new() { Id = 2, Username = "User2", RoleId = 2, Points = 200 }
        };
        _mockUserRepository.Setup(r => r.GetAllWithRolesAsync()).ReturnsAsync(users);

        var result = await _userService.GetAllAsync();

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task GetByIdAsync_ExistingUser_ReturnsUser()
    {
        var user = new User { Id = 1, Username = "TestUser", RoleId = 1, Points = 100 };
        _mockUserRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(user);

        var result = await _userService.GetByIdAsync(1);

        Assert.NotNull(result);
        Assert.Equal("TestUser", result.Username);
    }

    [Fact]
    public async Task GetByIdAsync_NonExistingUser_ReturnsNull()
    {
        _mockUserRepository.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((User?)null);

        var result = await _userService.GetByIdAsync(999);

        Assert.Null(result);
    }

    [Fact]
    public async Task GetByIdWithCharactersAsync_ExistingUser_ReturnsUserWithCharacters()
    {
        var user = new User { Id = 1, Username = "TestUser", RoleId = 1, Points = 100 };
        _mockUserRepository.Setup(r => r.GetByIdWithCharactersAsync(1)).ReturnsAsync(user);

        var result = await _userService.GetByIdWithCharactersAsync(1);

        Assert.NotNull(result);
        Assert.Equal("TestUser", result.Username);
    }

    [Fact]
    public async Task CreateAsync_ValidUser_ReturnsCreatedUser()
    {
        var user = new User { Username = "NewUser", RoleId = 1, Points = 0 };
        
        _mockUserRepository.Setup(r => r.AddAsync(It.IsAny<User>())).Returns(Task.CompletedTask);
        _mockUnitOfWork.Setup(uow => uow.SaveChangesAsync()).ReturnsAsync(1);

        var result = await _userService.CreateAsync(user);

        Assert.NotNull(result);
        Assert.Equal("NewUser", result.Username);
        _mockUnitOfWork.Verify(uow => uow.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_ValidUser_CallsSaveChanges()
    {
        var user = new User { Id = 1, Username = "UpdatedUser", RoleId = 1, Points = 100 };
        _mockUnitOfWork.Setup(uow => uow.SaveChangesAsync()).ReturnsAsync(1);

        await _userService.UpdateAsync(user);

        _mockUserRepository.Verify(r => r.Update(user), Times.Once);
        _mockUnitOfWork.Verify(uow => uow.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_ExistingUser_RemovesUser()
    {
        var user = new User { Id = 1, Username = "TestUser", RoleId = 1, Points = 0 };
        _mockUserRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(user);
        _mockUnitOfWork.Setup(uow => uow.SaveChangesAsync()).ReturnsAsync(1);

        await _userService.DeleteAsync(1);

        _mockUserRepository.Verify(r => r.Remove(user), Times.Once);
        _mockUnitOfWork.Verify(uow => uow.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_NonExistingUser_DoesNotCallSaveChanges()
    {
        _mockUserRepository.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((User?)null);

        await _userService.DeleteAsync(999);

        _mockUserRepository.Verify(r => r.Remove(It.IsAny<User>()), Times.Never);
        _mockUnitOfWork.Verify(uow => uow.SaveChangesAsync(), Times.Never);
    }

    [Fact]
    public async Task UpdatePointsAsync_ExistingUser_UpdatesPoints()
    {
        var user = new User { Id = 1, Username = "TestUser", RoleId = 1, Points = 100 };
        _mockUserRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(user);
        _mockUnitOfWork.Setup(uow => uow.SaveChangesAsync()).ReturnsAsync(1);

        await _userService.UpdatePointsAsync(1, 500);

        Assert.Equal(500, user.Points);
        _mockUnitOfWork.Verify(uow => uow.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task UpdatePointsAsync_NonExistingUser_DoesNothing()
    {
        _mockUserRepository.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((User?)null);

        await _userService.UpdatePointsAsync(999, 500);

        _mockUnitOfWork.Verify(uow => uow.SaveChangesAsync(), Times.Never);
    }
}
