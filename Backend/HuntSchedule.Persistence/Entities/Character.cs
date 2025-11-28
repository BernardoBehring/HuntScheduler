using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace HuntSchedule.Persistence.Entities;

public class Character
{
    public int Id { get; set; }
    
    public int? UserId { get; set; }
    
    [JsonIgnore]
    [ForeignKey("UserId")]
    public User? User { get; set; }
    
    [Required]
    public int ServerId { get; set; }
    
    [ForeignKey("ServerId")]
    public Server? Server { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(50)]
    public string? Vocation { get; set; }
    
    public int Level { get; set; } = 1;
    
    public bool IsMain { get; set; } = false;
    
    public bool IsExternal { get; set; } = false;
    
    public DateTime? ExternalVerifiedAt { get; set; }
}
