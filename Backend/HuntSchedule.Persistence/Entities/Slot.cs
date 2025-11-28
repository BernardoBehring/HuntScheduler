using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HuntSchedule.Persistence.Entities;

public class Slot
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int ServerId { get; set; }

    [ForeignKey("ServerId")]
    public Server? Server { get; set; }

    [Required]
    [MaxLength(10)]
    public string StartTime { get; set; } = string.Empty;

    [Required]
    [MaxLength(10)]
    public string EndTime { get; set; } = string.Empty;
}
