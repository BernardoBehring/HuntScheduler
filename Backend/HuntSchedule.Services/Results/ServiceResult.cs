namespace HuntSchedule.Services.Results;

public class ServiceResult<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? ErrorCode { get; set; }
    public Dictionary<string, string>? ErrorParams { get; set; }

    public static ServiceResult<T> Ok(T data) => new() { Success = true, Data = data };
    
    public static ServiceResult<T> Fail(string errorCode, Dictionary<string, string>? errorParams = null) => 
        new() { Success = false, ErrorCode = errorCode, ErrorParams = errorParams };
}

public class ServiceResult
{
    public bool Success { get; set; }
    public string? ErrorCode { get; set; }
    public Dictionary<string, string>? ErrorParams { get; set; }

    public static ServiceResult Ok() => new() { Success = true };
    
    public static ServiceResult Fail(string errorCode, Dictionary<string, string>? errorParams = null) => 
        new() { Success = false, ErrorCode = errorCode, ErrorParams = errorParams };
}
