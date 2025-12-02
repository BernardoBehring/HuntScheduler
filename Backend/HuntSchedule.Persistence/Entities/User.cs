using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace HuntSchedule.Persistence.Entities;

public class User
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    [JsonIgnore]
    public string Password { get; set; } = string.Empty;

    [Required]
    public int RoleId { get; set; }
    
    [ForeignKey("RoleId")]
    public Role? Role { get; set; }

    public int Points { get; set; } = 0;

    [MaxLength(255)]
    [Column("email")]
    public string? Email { get; set; }

    [MaxLength(50)]
    [Column("whatsapp")]
    public string? Whatsapp { get; set; }

    public ICollection<Request> Requests { get; set; } = new List<Request>();
    
    public ICollection<Character> Characters { get; set; } = new List<Character>();
    
    public ICollection<PointTransaction> PointTransactions { get; set; } = new List<PointTransaction>();
}
