using System.ComponentModel.DataAnnotations;

namespace HuntScheduleApi.Models;

public class Server
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(10)]
    public string Region { get; set; } = string.Empty;

    public ICollection<Respawn> Respawns { get; set; } = new List<Respawn>();
}
