using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace HuntSchedule.Persistence.Entities;

public class RequestPartyMember
{
    public int Id { get; set; }
    
    [Required]
    public int RequestId { get; set; }
    
    [JsonIgnore]
    [ForeignKey("RequestId")]
    public Request? Request { get; set; }
    
    public int? CharacterId { get; set; }
    
    [ForeignKey("CharacterId")]
    public Character? Character { get; set; }

    [MaxLength(100)]
    public string? CharacterName { get; set; }
    
    [MaxLength(50)]
    public string? RoleInParty { get; set; }

    public bool IsLeader { get; set; } = false;
}
