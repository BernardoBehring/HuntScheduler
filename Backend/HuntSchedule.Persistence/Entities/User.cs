using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HuntSchedule.Persistence.Entities;

public class User
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Username { get; set; } = string.Empty;

    [Required]
    public int RoleId { get; set; }
    
    [ForeignKey("RoleId")]
    public Role? Role { get; set; }

    public int Points { get; set; } = 0;

    public ICollection<Request> Requests { get; set; } = new List<Request>();
    
    public ICollection<Character> Characters { get; set; } = new List<Character>();
}
