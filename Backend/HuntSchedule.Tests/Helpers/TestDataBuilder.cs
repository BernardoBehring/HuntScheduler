using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Tests.Helpers;

public static class TestDataBuilder
{
    public static Role CreateRole(int id = 1, string name = "user")
    {
        return new Role { Id = id, Name = name };
    }

    public static User CreateUser(int id = 1, string name = "TestUser", int roleId = 1, int points = 0)
    {
        return new User { Id = id, Name = name, RoleId = roleId, Points = points };
    }

    public static Server CreateServer(int id = 1, string name = "Antica")
    {
        return new Server { Id = id, Name = name };
    }

    public static Character CreateCharacter(
        int id = 1,
        string name = "TestCharacter",
        int serverId = 1,
        int? userId = null,
        string? vocation = "Knight",
        int level = 100,
        bool isMain = false,
        bool isExternal = false)
    {
        return new Character
        {
            Id = id,
            Name = name,
            ServerId = serverId,
            UserId = userId,
            Vocation = vocation,
            Level = level,
            IsMain = isMain,
            IsExternal = isExternal
        };
    }

    public static Difficulty CreateDifficulty(int id = 1, string name = "Medium", int sortOrder = 2)
    {
        return new Difficulty { Id = id, Name = name, SortOrder = sortOrder };
    }

    public static Respawn CreateRespawn(
        int id = 1,
        string name = "Test Respawn",
        int serverId = 1,
        int difficultyId = 1,
        int maxPlayers = 4)
    {
        return new Respawn
        {
            Id = id,
            Name = name,
            ServerId = serverId,
            DifficultyId = difficultyId,
            MaxPlayers = maxPlayers
        };
    }

    public static Slot CreateSlot(
        int id = 1,
        string name = "Morning",
        int serverId = 1,
        TimeSpan? startTime = null,
        TimeSpan? endTime = null)
    {
        return new Slot
        {
            Id = id,
            Name = name,
            ServerId = serverId,
            StartTime = startTime ?? new TimeSpan(8, 0, 0),
            EndTime = endTime ?? new TimeSpan(12, 0, 0)
        };
    }

    public static SchedulePeriod CreatePeriod(
        int id = 1,
        string name = "Week 1",
        int serverId = 1,
        DateTime? startDate = null,
        DateTime? endDate = null,
        bool isActive = true)
    {
        var start = startDate ?? DateTime.UtcNow;
        return new SchedulePeriod
        {
            Id = id,
            Name = name,
            ServerId = serverId,
            StartDate = start,
            EndDate = endDate ?? start.AddDays(7),
            IsActive = isActive
        };
    }

    public static RequestStatus CreateRequestStatus(int id = 1, string name = "pending")
    {
        return new RequestStatus { Id = id, Name = name };
    }

    public static Request CreateRequest(
        int id = 1,
        int userId = 1,
        int serverId = 1,
        int respawnId = 1,
        int slotId = 1,
        int periodId = 1,
        int statusId = 1)
    {
        return new Request
        {
            Id = id,
            UserId = userId,
            ServerId = serverId,
            RespawnId = respawnId,
            SlotId = slotId,
            PeriodId = periodId,
            StatusId = statusId,
            CreatedAt = DateTime.UtcNow
        };
    }
}
