namespace HuntSchedule.Services.Results;

public enum ErrorType
{
    None,
    NotFound,
    Validation,
    Conflict
}

public class ServiceResult<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? ErrorMessage { get; set; }
    public ErrorType ErrorType { get; set; } = ErrorType.None;

    public static ServiceResult<T> Ok(T data) => new() { Success = true, Data = data };
    public static ServiceResult<T> Fail(string message, ErrorType errorType = ErrorType.Validation) => 
        new() { Success = false, ErrorMessage = message, ErrorType = errorType };
}

public class ServiceResult
{
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public ErrorType ErrorType { get; set; } = ErrorType.None;

    public static ServiceResult Ok() => new() { Success = true };
    public static ServiceResult Fail(string message, ErrorType errorType = ErrorType.Validation) => 
        new() { Success = false, ErrorMessage = message, ErrorType = errorType };
}
