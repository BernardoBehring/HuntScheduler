using System.ComponentModel.DataAnnotations;

namespace HuntSchedule.Persistence.Entities;

public class Difficulty
{
    public int Id { get; set; }
    
    [Required]
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    public string? Color { get; set; }
    
    public int SortOrder { get; set; }
}
