using Microsoft.EntityFrameworkCore;
using HuntSchedule.Persistence.Entities;

namespace HuntSchedule.Persistence.Context;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<Character> Characters { get; set; }
    public DbSet<Server> Servers { get; set; }
    public DbSet<Respawn> Respawns { get; set; }
    public DbSet<Slot> Slots { get; set; }
    public DbSet<SchedulePeriod> SchedulePeriods { get; set; }
    public DbSet<Request> Requests { get; set; }
    public DbSet<RequestPartyMember> RequestPartyMembers { get; set; }
    public DbSet<RequestStatus> RequestStatuses { get; set; }
    public DbSet<Difficulty> Difficulties { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<RequestPartyMember>()
            .HasIndex(rpm => new { rpm.RequestId, rpm.CharacterId })
            .IsUnique();

        modelBuilder.Entity<Character>()
            .HasOne(c => c.User)
            .WithMany(u => u.Characters)
            .HasForeignKey(c => c.UserId)
            .IsRequired(false);

        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Name = "admin", Description = "Guild administrator with full access" },
            new Role { Id = 2, Name = "user", Description = "Regular guild member" }
        );

        modelBuilder.Entity<User>().HasData(
            new User { Id = 1, Username = "AdminUser", RoleId = 1, Points = 1000 },
            new User { Id = 2, Username = "HunterElite", RoleId = 2, Points = 150 },
            new User { Id = 3, Username = "PaladinMaster", RoleId = 2, Points = 80 },
            new User { Id = 4, Username = "DruidHealer", RoleId = 2, Points = 200 }
        );

        modelBuilder.Entity<Character>().HasData(
            new Character { Id = 1, UserId = 1, ServerId = 1, Name = "Admin Knight", Vocation = "Elite Knight", Level = 500, IsMain = true },
            new Character { Id = 2, UserId = 2, ServerId = 1, Name = "Hunter Elite", Vocation = "Royal Paladin", Level = 450, IsMain = true },
            new Character { Id = 3, UserId = 2, ServerId = 1, Name = "Hunter Alt", Vocation = "Master Sorcerer", Level = 320, IsMain = false },
            new Character { Id = 4, UserId = 3, ServerId = 1, Name = "Paladin Master", Vocation = "Royal Paladin", Level = 380, IsMain = true },
            new Character { Id = 5, UserId = 4, ServerId = 1, Name = "Druid Healer", Vocation = "Elder Druid", Level = 420, IsMain = true },
            new Character { Id = 6, UserId = 4, ServerId = 2, Name = "Druid Backup", Vocation = "Elder Druid", Level = 280, IsMain = false }
        );

        modelBuilder.Entity<Server>().HasData(
            new Server { Id = 1, Name = "Antica", Region = "EU" },
            new Server { Id = 2, Name = "Wintera", Region = "NA" }
        );

        modelBuilder.Entity<RequestStatus>().HasData(
            new RequestStatus { Id = 1, Name = "pending", Description = "Awaiting admin approval", Color = "yellow" },
            new RequestStatus { Id = 2, Name = "approved", Description = "Request approved", Color = "green" },
            new RequestStatus { Id = 3, Name = "rejected", Description = "Request rejected", Color = "red" },
            new RequestStatus { Id = 4, Name = "cancelled", Description = "Request cancelled by user", Color = "gray" }
        );

        modelBuilder.Entity<Difficulty>().HasData(
            new Difficulty { Id = 1, Name = "easy", Description = "Beginner friendly", Color = "green", SortOrder = 1 },
            new Difficulty { Id = 2, Name = "medium", Description = "Intermediate challenge", Color = "yellow", SortOrder = 2 },
            new Difficulty { Id = 3, Name = "hard", Description = "Advanced players", Color = "orange", SortOrder = 3 },
            new Difficulty { Id = 4, Name = "nightmare", Description = "Elite players only", Color = "red", SortOrder = 4 }
        );

        modelBuilder.Entity<Respawn>().HasData(
            new Respawn { Id = 1, ServerId = 1, Name = "Library - Fire", DifficultyId = 3, MaxPlayers = 5 },
            new Respawn { Id = 2, ServerId = 1, Name = "Soul War - Crater", DifficultyId = 4, MaxPlayers = 5 },
            new Respawn { Id = 3, ServerId = 1, Name = "Cobras", DifficultyId = 2, MaxPlayers = 4 },
            new Respawn { Id = 4, ServerId = 2, Name = "Rotten Blood - Jaded", DifficultyId = 4, MaxPlayers = 5 }
        );

        modelBuilder.Entity<Slot>().HasData(
            new Slot { Id = 1, ServerId = 1, StartTime = "18:00", EndTime = "20:00" },
            new Slot { Id = 2, ServerId = 1, StartTime = "20:00", EndTime = "22:00" },
            new Slot { Id = 3, ServerId = 1, StartTime = "22:00", EndTime = "00:00" },
            new Slot { Id = 4, ServerId = 2, StartTime = "18:00", EndTime = "20:00" },
            new Slot { Id = 5, ServerId = 2, StartTime = "20:00", EndTime = "22:00" }
        );

        modelBuilder.Entity<SchedulePeriod>().HasData(
            new SchedulePeriod { Id = 1, ServerId = 1, Name = "Week 48 - Nov Rotation", StartDate = new DateTime(2024, 11, 27, 0, 0, 0, DateTimeKind.Utc), EndDate = new DateTime(2024, 12, 4, 0, 0, 0, DateTimeKind.Utc), IsActive = true },
            new SchedulePeriod { Id = 2, ServerId = 1, Name = "Week 49 - Dec Rotation", StartDate = new DateTime(2024, 12, 4, 0, 0, 0, DateTimeKind.Utc), EndDate = new DateTime(2024, 12, 11, 0, 0, 0, DateTimeKind.Utc), IsActive = false },
            new SchedulePeriod { Id = 3, ServerId = 2, Name = "Week 48 - Wintera", StartDate = new DateTime(2024, 11, 27, 0, 0, 0, DateTimeKind.Utc), EndDate = new DateTime(2024, 12, 4, 0, 0, 0, DateTimeKind.Utc), IsActive = true }
        );
    }
}
