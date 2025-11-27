using Microsoft.EntityFrameworkCore;
using HuntScheduleApi.Models;

namespace HuntScheduleApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Server> Servers { get; set; }
    public DbSet<Respawn> Respawns { get; set; }
    public DbSet<Slot> Slots { get; set; }
    public DbSet<SchedulePeriod> SchedulePeriods { get; set; }
    public DbSet<Request> Requests { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>().HasData(
            new User { Id = 1, Username = "AdminUser", Role = "admin", Points = 1000 },
            new User { Id = 2, Username = "HunterElite", Role = "user", Points = 150 },
            new User { Id = 3, Username = "PaladinMaster", Role = "user", Points = 80 },
            new User { Id = 4, Username = "DruidHealer", Role = "user", Points = 200 }
        );

        modelBuilder.Entity<Server>().HasData(
            new Server { Id = 1, Name = "Antica", Region = "EU" },
            new Server { Id = 2, Name = "Wintera", Region = "NA" }
        );

        modelBuilder.Entity<Respawn>().HasData(
            new Respawn { Id = 1, ServerId = 1, Name = "Library - Fire", Difficulty = "hard", MaxPlayers = 5 },
            new Respawn { Id = 2, ServerId = 1, Name = "Soul War - Crater", Difficulty = "nightmare", MaxPlayers = 5 },
            new Respawn { Id = 3, ServerId = 1, Name = "Cobras", Difficulty = "medium", MaxPlayers = 4 },
            new Respawn { Id = 4, ServerId = 2, Name = "Rotten Blood - Jaded", Difficulty = "nightmare", MaxPlayers = 5 }
        );

        modelBuilder.Entity<Slot>().HasData(
            new Slot { Id = 1, StartTime = "18:00", EndTime = "20:00" },
            new Slot { Id = 2, StartTime = "20:00", EndTime = "22:00" },
            new Slot { Id = 3, StartTime = "22:00", EndTime = "00:00" }
        );

        modelBuilder.Entity<SchedulePeriod>().HasData(
            new SchedulePeriod { Id = 1, Name = "Week 48 - Nov Rotation", StartDate = new DateTime(2024, 11, 27, 0, 0, 0, DateTimeKind.Utc), EndDate = new DateTime(2024, 12, 4, 0, 0, 0, DateTimeKind.Utc), IsActive = true },
            new SchedulePeriod { Id = 2, Name = "Week 49 - Dec Rotation", StartDate = new DateTime(2024, 12, 4, 0, 0, 0, DateTimeKind.Utc), EndDate = new DateTime(2024, 12, 11, 0, 0, 0, DateTimeKind.Utc), IsActive = false }
        );
    }
}
