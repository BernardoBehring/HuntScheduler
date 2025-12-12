namespace HuntSchedule.Services.DTOs;

public class PartyMemberDto
{
    public int? CharacterId { get; set; }
    public string? CharacterName { get; set; }
    public string? RoleInParty { get; set; }
    public bool IsLeader { get; set; } = false;
}
