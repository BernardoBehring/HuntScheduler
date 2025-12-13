namespace HuntSchedule.Services.DTOs;

public class CopyRespawnsDto
{
    public int SourceServerId { get; set; }
    public int TargetServerId { get; set; }
    public bool OverwriteExisting { get; set; } = false;
}

public class CopyRespawnsResultDto
{
    public int CopiedCount { get; set; }
    public int DeletedCount { get; set; }
    public string Message { get; set; } = string.Empty;
}
