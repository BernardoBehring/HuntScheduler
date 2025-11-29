using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HuntSchedule.Persistence.Entities;

public class SchedulePeriod
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
    public string StartDate { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string EndDate { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
}
