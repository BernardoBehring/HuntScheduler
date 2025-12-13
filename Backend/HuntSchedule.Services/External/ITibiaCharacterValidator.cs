namespace HuntSchedule.Services.External;

public interface ITibiaCharacterValidator
{
    Task<TibiaCharacterResult?> ValidateCharacterAsync(string characterName);
    Task<List<TibiaWorld>?> GetAllWorldsAsync();
}
