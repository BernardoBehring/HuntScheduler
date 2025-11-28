namespace HuntSchedule.Services.Results;

public static class ErrorCode
{
    public const string UserNotFound = "error.user_not_found";
    public const string ServerNotFound = "error.server_not_found";
    public const string CharacterNotFound = "error.character_not_found";
    public const string RequestNotFound = "error.request_not_found";
    public const string RoleNotFound = "error.role_not_found";
    public const string RespawnNotFound = "error.respawn_not_found";
    public const string SlotNotFound = "error.slot_not_found";
    public const string PeriodNotFound = "error.period_not_found";
    public const string IdMismatch = "error.id_mismatch";
    public const string CharacterNotFoundOnTibia = "error.character_not_found_on_tibia";
    public const string CharacterServerNotConfigured = "error.character_server_not_configured";
    public const string CharacterServerMismatch = "error.character_server_mismatch";
    public const string ConflictWithApprovedRequest = "error.conflict_with_approved_request";
}
