namespace HuntSchedule.Services.DTOs;

public class CreateRequestDto
{
    public int UserId { get; set; }
    public int ServerId { get; set; }
    public int RespawnId { get; set; }
    public int SlotId { get; set; }
    public int PeriodId { get; set; }
    public List<PartyMemberDto> PartyMembers { get; set; } = new();
}
