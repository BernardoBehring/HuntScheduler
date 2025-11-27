using System.ComponentModel.DataAnnotations;

namespace HuntScheduleApi.Models;

public class User
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Role { get; set; } = "user";

    public int Points { get; set; } = 0;

    public ICollection<Request> Requests { get; set; } = new List<Request>();
}
