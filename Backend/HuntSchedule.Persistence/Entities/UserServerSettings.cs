using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HuntSchedule.Persistence.Entities;

[Table("user_server_settings")]
public class UserServerSettings
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [Column("user_id")]
    public int UserId { get; set; }

    [ForeignKey("UserId")]
    public User? User { get; set; }

    [Required]
    [Column("server_id")]
    public int ServerId { get; set; }

    [ForeignKey("ServerId")]
    public Server? Server { get; set; }

    [Column("ts_description")]
    public string? TsDescription { get; set; }
}
