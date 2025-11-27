using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HuntScheduleApi.Models;

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
    [MaxLength(20)]
    public string Difficulty { get; set; } = "medium";

    public int MaxPlayers { get; set; } = 4;
}
