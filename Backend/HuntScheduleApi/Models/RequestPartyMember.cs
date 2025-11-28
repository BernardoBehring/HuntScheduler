using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace HuntScheduleApi.Models;

public class RequestPartyMember
{
    public int Id { get; set; }
    
    [Required]
    public int RequestId { get; set; }
    
    [JsonIgnore]
    [ForeignKey("RequestId")]
    public Request? Request { get; set; }
    
    [Required]
    public int CharacterId { get; set; }
    
    [ForeignKey("CharacterId")]
    public Character? Character { get; set; }
    
    [MaxLength(50)]
    public string? RoleInParty { get; set; }
}
