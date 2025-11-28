using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HuntScheduleApi.Data;
using HuntScheduleApi.Models;
using HuntScheduleApi.Services;

namespace HuntScheduleApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RequestsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ITibiaCharacterValidator _tibiaValidator;

    public RequestsController(AppDbContext context, ITibiaCharacterValidator tibiaValidator)
    {
        _context = context;
        _tibiaValidator = tibiaValidator;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Request>>> GetRequests()
    {
        return await _context.Requests
            .Include(r => r.User)
            .Include(r => r.Server)
            .Include(r => r.Respawn)
                .ThenInclude(resp => resp!.Difficulty)
            .Include(r => r.Slot)
            .Include(r => r.Period)
            .Include(r => r.Status)
            .Include(r => r.PartyMembers)
                .ThenInclude(pm => pm.Character)
                    .ThenInclude(c => c!.Server)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Request>> GetRequest(int id)
    {
        var request = await _context.Requests
            .Include(r => r.User)
            .Include(r => r.Server)
            .Include(r => r.Respawn)
                .ThenInclude(resp => resp!.Difficulty)
            .Include(r => r.Slot)
            .Include(r => r.Period)
            .Include(r => r.Status)
            .Include(r => r.PartyMembers)
                .ThenInclude(pm => pm.Character)
                    .ThenInclude(c => c!.Server)
            .FirstOrDefaultAsync(r => r.Id == id);
        if (request == null) return NotFound();
        return request;
    }

    public class PartyMemberDto
    {
        public int? CharacterId { get; set; }
        public string? CharacterName { get; set; }
        public string? RoleInParty { get; set; }
    }

    public class CreateRequestDto
    {
        public int UserId { get; set; }
        public int ServerId { get; set; }
        public int RespawnId { get; set; }
        public int SlotId { get; set; }
        public int PeriodId { get; set; }
        public List<PartyMemberDto> PartyMembers { get; set; } = new();
    }

    [HttpPost]
    public async Task<ActionResult<Request>> CreateRequest(CreateRequestDto dto)
    {
        var server = await _context.Servers.FindAsync(dto.ServerId);
        if (server == null) return BadRequest("Server not found");

        var pendingStatus = await _context.RequestStatuses.FirstOrDefaultAsync(s => s.Name == "pending");
        
        var request = new Request
        {
            UserId = dto.UserId,
            ServerId = dto.ServerId,
            RespawnId = dto.RespawnId,
            SlotId = dto.SlotId,
            PeriodId = dto.PeriodId,
            StatusId = pendingStatus?.Id ?? 1,
            CreatedAt = DateTime.UtcNow
        };

        _context.Requests.Add(request);
        await _context.SaveChangesAsync();

        foreach (var pm in dto.PartyMembers)
        {
            Character? character = null;

            if (pm.CharacterId.HasValue)
            {
                character = await _context.Characters.FindAsync(pm.CharacterId.Value);
                if (character == null) return BadRequest($"Character with ID {pm.CharacterId} not found");
            }
            else if (!string.IsNullOrEmpty(pm.CharacterName))
            {
                character = await _context.Characters
                    .FirstOrDefaultAsync(c => c.Name.ToLower() == pm.CharacterName.ToLower() && c.ServerId == dto.ServerId);

                if (character == null)
                {
                    var tibiaResult = await _tibiaValidator.ValidateCharacterAsync(pm.CharacterName);
                    
                    if (tibiaResult == null || !tibiaResult.Exists)
                    {
                        return BadRequest($"Character '{pm.CharacterName}' not found on Tibia.com");
                    }

                    var tibiaServer = await _context.Servers
                        .FirstOrDefaultAsync(s => s.Name.ToLower() == tibiaResult.World.ToLower());

                    if (tibiaServer == null)
                    {
                        return BadRequest($"Character '{pm.CharacterName}' is on server '{tibiaResult.World}' which is not configured in our system");
                    }

                    if (tibiaServer.Id != dto.ServerId)
                    {
                        return BadRequest($"Character '{pm.CharacterName}' is on server '{tibiaResult.World}', but this request is for server '{server.Name}'");
                    }

                    character = new Character
                    {
                        Name = tibiaResult.Name,
                        ServerId = tibiaServer.Id,
                        Vocation = tibiaResult.Vocation,
                        Level = tibiaResult.Level,
                        IsExternal = true,
                        ExternalVerifiedAt = DateTime.UtcNow
                    };
                    _context.Characters.Add(character);
                    await _context.SaveChangesAsync();
                }
            }

            if (character != null)
            {
                var partyMember = new RequestPartyMember
                {
                    RequestId = request.Id,
                    CharacterId = character.Id,
                    RoleInParty = pm.RoleInParty
                };
                _context.RequestPartyMembers.Add(partyMember);
            }
        }

        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetRequest), new { id = request.Id }, request);
    }

    public class StatusUpdateDto
    {
        public int StatusId { get; set; }
        public string? Reason { get; set; }
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] StatusUpdateDto dto)
    {
        var request = await _context.Requests.FindAsync(id);
        if (request == null) return NotFound();

        request.StatusId = dto.StatusId;
        request.RejectionReason = dto.Reason;

        var approvedStatus = await _context.RequestStatuses.FirstOrDefaultAsync(s => s.Name == "approved");
        var rejectedStatus = await _context.RequestStatuses.FirstOrDefaultAsync(s => s.Name == "rejected");
        var pendingStatus = await _context.RequestStatuses.FirstOrDefaultAsync(s => s.Name == "pending");

        if (approvedStatus != null && dto.StatusId == approvedStatus.Id && pendingStatus != null && rejectedStatus != null)
        {
            var conflicts = await _context.Requests
                .Where(r => r.Id != id
                    && r.ServerId == request.ServerId
                    && r.RespawnId == request.RespawnId
                    && r.SlotId == request.SlotId
                    && r.PeriodId == request.PeriodId
                    && r.StatusId == pendingStatus.Id)
                .ToListAsync();

            foreach (var conflict in conflicts)
            {
                conflict.StatusId = rejectedStatus.Id;
                conflict.RejectionReason = $"Conflict with approved request #{id}";
            }
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRequest(int id)
    {
        var request = await _context.Requests.FindAsync(id);
        if (request == null) return NotFound();
        _context.Requests.Remove(request);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
