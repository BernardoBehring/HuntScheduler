using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace HuntScheduleApi.Models;

public class Character
{
    public int Id { get; set; }
    
    [Required]
    public int UserId { get; set; }
    
    [JsonIgnore]
    [ForeignKey("UserId")]
    public User? User { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(50)]
    public string? World { get; set; }
    
    [MaxLength(50)]
    public string? Vocation { get; set; }
    
    public int Level { get; set; } = 1;
    
    public bool IsMain { get; set; } = false;
}
