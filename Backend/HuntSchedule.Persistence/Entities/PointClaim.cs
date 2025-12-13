using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HuntSchedule.Persistence.Entities;

public class PointClaim
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [ForeignKey("UserId")]
    public User? User { get; set; }

    public int? PointsAwarded { get; set; }

    [MaxLength(500)]
    public string? Note { get; set; }

    [MaxLength(2000)]
    public string? ScreenshotUrl { get; set; }

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "pending";

    public int? ReviewedByAdminId { get; set; }

    [ForeignKey("ReviewedByAdminId")]
    public User? ReviewedByAdmin { get; set; }

    [MaxLength(500)]
    public string? AdminResponse { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ReviewedAt { get; set; }
}
