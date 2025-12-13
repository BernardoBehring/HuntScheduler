using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HuntSchedule.Persistence.Entities;

public class Server
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Region { get; set; } = string.Empty;

    [Column("pvp_type")]
    [MaxLength(50)]
    public string? PvpType { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = false;

    public ICollection<Respawn> Respawns { get; set; } = new List<Respawn>();
}
