using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HuntSchedule.Persistence.Entities;

public class Request
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [ForeignKey("UserId")]
    public User? User { get; set; }

    [Required]
    public int ServerId { get; set; }

    [ForeignKey("ServerId")]
    public Server? Server { get; set; }

    [Required]
    public int RespawnId { get; set; }

    [ForeignKey("RespawnId")]
    public Respawn? Respawn { get; set; }

    [Required]
    public int SlotId { get; set; }

    [ForeignKey("SlotId")]
    public Slot? Slot { get; set; }

    [Required]
    public int PeriodId { get; set; }

    [ForeignKey("PeriodId")]
    public SchedulePeriod? Period { get; set; }

    [Required]
    public int StatusId { get; set; }

    [ForeignKey("StatusId")]
    public RequestStatus? Status { get; set; }

    public int? LeaderCharacterId { get; set; }

    [ForeignKey("LeaderCharacterId")]
    public Character? LeaderCharacter { get; set; }

    public ICollection<RequestPartyMember> PartyMembers { get; set; } = new List<RequestPartyMember>();

    [MaxLength(500)]
    public string? RejectionReason { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
