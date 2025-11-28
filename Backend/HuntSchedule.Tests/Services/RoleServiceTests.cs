using Moq;
using Xunit;
using HuntSchedule.Services.Implementations;
using HuntSchedule.Persistence.Repositories;
using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Tests.Services;

public class RoleServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IRoleRepository> _mockRoleRepository;
    private readonly RoleService _roleService;

    public RoleServiceTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockRoleRepository = new Mock<IRoleRepository>();
        _mockUnitOfWork.Setup(uow => uow.Roles).Returns(_mockRoleRepository.Object);
        _roleService = new RoleService(_mockUnitOfWork.Object);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllRoles()
    {
        var roles = new List<Role>
        {
            new() { Id = 1, Name = "admin" },
            new() { Id = 2, Name = "user" }
        };
        _mockRoleRepository.Setup(r => r.GetAllAsync()).ReturnsAsync(roles);

        var result = await _roleService.GetAllAsync();

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task GetByIdAsync_ExistingRole_ReturnsRole()
    {
        var role = new Role { Id = 1, Name = "admin" };
        _mockRoleRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(role);

        var result = await _roleService.GetByIdAsync(1);

        Assert.NotNull(result);
        Assert.Equal("admin", result.Name);
    }

    [Fact]
    public async Task GetByIdAsync_NonExistingRole_ReturnsNull()
    {
        _mockRoleRepository.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Role?)null);

        var result = await _roleService.GetByIdAsync(999);

        Assert.Null(result);
    }
}
