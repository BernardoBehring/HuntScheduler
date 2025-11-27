using System.ComponentModel.DataAnnotations;

namespace HuntScheduleApi.Models;

public class Slot
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(10)]
    public string StartTime { get; set; } = string.Empty;

    [Required]
    [MaxLength(10)]
    public string EndTime { get; set; } = string.Empty;
}
