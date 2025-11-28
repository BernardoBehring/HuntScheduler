using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Tests.Helpers;

public static class TestDataBuilder
{
    public static Role CreateRole(string name = "user")
    {
        return new Role { Name = name };
    }

    public static User CreateUser(string username = "TestUser", int roleId = 1, int points = 0)
    {
        return new User { Username = username, RoleId = roleId, Points = points };
    }

    public static Server CreateServer(string name = "Antica", string region = "EU")
    {
        return new Server { Name = name, Region = region };
    }

    public static Character CreateCharacter(
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
            Name = name,
            ServerId = serverId,
            UserId = userId,
            Vocation = vocation,
            Level = level,
            IsMain = isMain,
            IsExternal = isExternal
        };
    }

    public static Difficulty CreateDifficulty(string name = "Medium", int sortOrder = 2)
    {
        return new Difficulty { Name = name, SortOrder = sortOrder };
    }

    public static Respawn CreateRespawn(
        string name = "Test Respawn",
        int serverId = 1,
        int difficultyId = 1,
        int maxPlayers = 4)
    {
        return new Respawn
        {
            Name = name,
            ServerId = serverId,
            DifficultyId = difficultyId,
            MaxPlayers = maxPlayers
        };
    }

    public static Slot CreateSlot(
        int serverId = 1,
        string startTime = "08:00",
        string endTime = "12:00")
    {
        return new Slot
        {
            ServerId = serverId,
            StartTime = startTime,
            EndTime = endTime
        };
    }

    public static SchedulePeriod CreatePeriod(
        string name = "Week 1",
        int serverId = 1,
        DateTime? startDate = null,
        DateTime? endDate = null,
        bool isActive = true)
    {
        var start = startDate ?? DateTime.UtcNow;
        return new SchedulePeriod
        {
            Name = name,
            ServerId = serverId,
            StartDate = start,
            EndDate = endDate ?? start.AddDays(7),
            IsActive = isActive
        };
    }

    public static RequestStatus CreateRequestStatus(string name = "pending")
    {
        return new RequestStatus { Name = name };
    }

    public static Request CreateRequest(
        int userId = 1,
        int serverId = 1,
        int respawnId = 1,
        int slotId = 1,
        int periodId = 1,
        int statusId = 1)
    {
        return new Request
        {
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
