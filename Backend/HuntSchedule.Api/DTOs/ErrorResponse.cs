namespace HuntSchedule.Api.DTOs;

public class ErrorResponse
{
    public string ErrorCode { get; set; } = string.Empty;
    public Dictionary<string, string>? ErrorParams { get; set; }
}
