using Moq;
using Xunit;
using Microsoft.EntityFrameworkCore.Storage;
using HuntSchedule.Services.Implementations;
using HuntSchedule.Services.External;
using HuntSchedule.Services.DTOs;
using HuntSchedule.Services.Results;
using HuntSchedule.Persistence.Repositories;
using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Tests.Services;

public class RequestServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IRequestRepository> _mockRequestRepository;
    private readonly Mock<IRequestStatusRepository> _mockStatusRepository;
    private readonly Mock<IServerRepository> _mockServerRepository;
    private readonly Mock<ICharacterRepository> _mockCharacterRepository;
    private readonly Mock<ITibiaCharacterValidator> _mockTibiaValidator;
    private readonly Mock<IDbContextTransaction> _mockTransaction;
    private readonly RequestService _requestService;

    public RequestServiceTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockRequestRepository = new Mock<IRequestRepository>();
        _mockStatusRepository = new Mock<IRequestStatusRepository>();
        _mockServerRepository = new Mock<IServerRepository>();
        _mockCharacterRepository = new Mock<ICharacterRepository>();
        _mockTibiaValidator = new Mock<ITibiaCharacterValidator>();
        _mockTransaction = new Mock<IDbContextTransaction>();

        _mockUnitOfWork.Setup(uow => uow.Requests).Returns(_mockRequestRepository.Object);
        _mockUnitOfWork.Setup(uow => uow.RequestStatuses).Returns(_mockStatusRepository.Object);
        _mockUnitOfWork.Setup(uow => uow.Servers).Returns(_mockServerRepository.Object);
        _mockUnitOfWork.Setup(uow => uow.Characters).Returns(_mockCharacterRepository.Object);
        _mockUnitOfWork.Setup(uow => uow.BeginTransactionAsync()).ReturnsAsync(_mockTransaction.Object);

        _requestService = new RequestService(_mockUnitOfWork.Object, _mockTibiaValidator.Object);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllRequests()
    {
        var requests = new List<Request>
        {
            new() { Id = 1, UserId = 1, ServerId = 1, RespawnId = 1, SlotId = 1, PeriodId = 1, StatusId = 1 },
            new() { Id = 2, UserId = 2, ServerId = 1, RespawnId = 2, SlotId = 2, PeriodId = 1, StatusId = 1 }
        };
        _mockRequestRepository.Setup(r => r.GetAllWithDetailsAsync()).ReturnsAsync(requests);

        var result = await _requestService.GetAllAsync();

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task GetByIdAsync_ExistingRequest_ReturnsRequest()
    {
        var request = new Request { Id = 1, UserId = 1, ServerId = 1, RespawnId = 1, SlotId = 1, PeriodId = 1, StatusId = 1 };
        _mockRequestRepository.Setup(r => r.GetByIdWithDetailsAsync(1)).ReturnsAsync(request);

        var result = await _requestService.GetByIdAsync(1);

        Assert.NotNull(result);
        Assert.Equal(1, result.Id);
    }

    [Fact]
    public async Task CreateAsync_ValidRequest_ReturnsCreatedRequest()
    {
        var dto = new CreateRequestDto
        {
            UserId = 1,
            ServerId = 1,
            RespawnId = 1,
            SlotId = 1,
            PeriodId = 1,
            PartyMembers = new List<PartyMemberDto>
            {
                new() { CharacterId = 1, RoleInParty = "EK" },
                new() { CharacterId = 2, RoleInParty = "ED" }
            }
        };
        var server = new Server { Id = 1, Name = "Antica" };
        var pendingStatus = new RequestStatus { Id = 1, Name = "pending" };
        var characters = new List<Character>
        {
            new() { Id = 1, Name = "Char1", ServerId = 1 },
            new() { Id = 2, Name = "Char2", ServerId = 1 }
        };
        var createdRequest = new Request { Id = 1, UserId = 1, ServerId = 1, RespawnId = 1, SlotId = 1, PeriodId = 1, StatusId = 1 };

        _mockServerRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(server);
        _mockStatusRepository.Setup(r => r.GetByNameAsync("pending")).ReturnsAsync(pendingStatus);
        _mockCharacterRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(characters[0]);
        _mockCharacterRepository.Setup(r => r.GetByIdAsync(2)).ReturnsAsync(characters[1]);
        _mockRequestRepository.Setup(r => r.AddAsync(It.IsAny<Request>())).Returns(Task.CompletedTask);
        _mockRequestRepository.Setup(r => r.AddPartyMemberAsync(It.IsAny<int>(), It.IsAny<RequestPartyMember>())).Returns(Task.CompletedTask);
        _mockRequestRepository.Setup(r => r.GetByIdWithDetailsAsync(It.IsAny<int>())).ReturnsAsync(createdRequest);
        _mockUnitOfWork.Setup(uow => uow.SaveChangesAsync()).ReturnsAsync(1);

        var result = await _requestService.CreateAsync(dto);

        Assert.True(result.Success);
        Assert.NotNull(result.Data);
    }

    [Fact]
    public async Task CreateAsync_InvalidServer_ReturnsError()
    {
        var dto = new CreateRequestDto
        {
            UserId = 1,
            ServerId = 999,
            RespawnId = 1,
            SlotId = 1,
            PeriodId = 1,
            PartyMembers = new List<PartyMemberDto>()
        };
        _mockServerRepository.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Server?)null);

        var result = await _requestService.CreateAsync(dto);

        Assert.False(result.Success);
        Assert.Equal(ErrorCode.ServerNotFound, result.ErrorCode);
    }

    [Fact]
    public async Task UpdateStatusAsync_ValidRequest_UpdatesStatus()
    {
        var request = new Request { Id = 1, UserId = 1, ServerId = 1, RespawnId = 1, SlotId = 1, PeriodId = 1, StatusId = 1 };
        var dto = new StatusUpdateDto { StatusId = 2, Reason = null };
        var approvedStatus = new RequestStatus { Id = 2, Name = "approved" };
        var rejectedStatus = new RequestStatus { Id = 3, Name = "rejected" };
        var pendingStatus = new RequestStatus { Id = 1, Name = "pending" };

        _mockRequestRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(request);
        _mockStatusRepository.Setup(r => r.GetByNameAsync("approved")).ReturnsAsync(approvedStatus);
        _mockStatusRepository.Setup(r => r.GetByNameAsync("rejected")).ReturnsAsync(rejectedStatus);
        _mockStatusRepository.Setup(r => r.GetByNameAsync("pending")).ReturnsAsync(pendingStatus);
        _mockRequestRepository.Setup(r => r.GetConflictingRequestsAsync(1, 1, 1, 1, 1, 1)).ReturnsAsync(new List<Request>());
        _mockUnitOfWork.Setup(uow => uow.SaveChangesAsync()).ReturnsAsync(1);

        var result = await _requestService.UpdateStatusAsync(1, dto);

        Assert.True(result.Success);
        Assert.Equal(2, request.StatusId);
    }

    [Fact]
    public async Task UpdateStatusAsync_NonExistingRequest_ReturnsError()
    {
        var dto = new StatusUpdateDto { StatusId = 2 };
        _mockRequestRepository.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Request?)null);

        var result = await _requestService.UpdateStatusAsync(999, dto);

        Assert.False(result.Success);
        Assert.Equal(ErrorCode.RequestNotFound, result.ErrorCode);
    }

    [Fact]
    public async Task DeleteAsync_ExistingRequest_RemovesRequest()
    {
        var request = new Request { Id = 1, UserId = 1, ServerId = 1, RespawnId = 1, SlotId = 1, PeriodId = 1, StatusId = 1 };
        _mockRequestRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(request);
        _mockUnitOfWork.Setup(uow => uow.SaveChangesAsync()).ReturnsAsync(1);

        await _requestService.DeleteAsync(1);

        _mockRequestRepository.Verify(r => r.Remove(request), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_NonExistingRequest_DoesNotCallSaveChanges()
    {
        _mockRequestRepository.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Request?)null);

        await _requestService.DeleteAsync(999);

        _mockRequestRepository.Verify(r => r.Remove(It.IsAny<Request>()), Times.Never);
        _mockUnitOfWork.Verify(uow => uow.SaveChangesAsync(), Times.Never);
    }
}
