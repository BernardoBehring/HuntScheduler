using System.ComponentModel.DataAnnotations;

namespace HuntScheduleApi.Models;

public class Role
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    public ICollection<User> Users { get; set; } = new List<User>();
}
