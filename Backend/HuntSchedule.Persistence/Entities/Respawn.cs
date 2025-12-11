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

    public int MinPlayers { get; set; } = 1;
    
    public int MaxPlayers { get; set; } = 4;
}
