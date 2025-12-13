using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HuntSchedule.Persistence.Entities;

public class Respawn
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int ServerId { get; set; }

    [ForeignKey("ServerId")]
    public Server? Server { get; set; }

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public int DifficultyId { get; set; }

    [ForeignKey("DifficultyId")]
    public Difficulty? Difficulty { get; set; }

    [Column("min_players")]
    public int MinPlayers { get; set; } = 1;
    
    public int MaxPlayers { get; set; } = 4;

    [MaxLength(20)]
    [Column("ts_code")]
    public string? TsCode { get; set; }

    [MaxLength(100)]
    [Column("city")]
    public string? City { get; set; }

    [Column("is_available")]
    public bool IsAvailable { get; set; } = true;
}
