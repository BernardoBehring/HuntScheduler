namespace HuntScheduleApi.Services;

public interface ITibiaCharacterValidator
{
    Task<TibiaCharacterResult?> ValidateCharacterAsync(string characterName);
}

public class TibiaCharacterResult
{
    public string Name { get; set; } = string.Empty;
    public string World { get; set; } = string.Empty;
    public string? Vocation { get; set; }
    public int Level { get; set; }
    public bool Exists { get; set; }
}
