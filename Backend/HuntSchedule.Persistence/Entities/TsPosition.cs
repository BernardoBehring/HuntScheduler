using System.ComponentModel.DataAnnotations;

namespace HuntSchedule.Persistence.Entities;

public class TsPosition
{
    public int Id { get; set; }
    
    [Required]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    public string Color { get; set; } = string.Empty;
    
    public int SortOrder { get; set; }
}
