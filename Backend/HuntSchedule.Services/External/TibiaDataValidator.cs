using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace HuntSchedule.Services.External;

public class TibiaDataValidator : ITibiaCharacterValidator
{
    private readonly HttpClient _httpClient;
    private readonly IMemoryCache _cache;
    private readonly ILogger<TibiaDataValidator> _logger;
    private const string API_BASE_URL = "https://api.tibiadata.com/v4";
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(10);

    public TibiaDataValidator(HttpClient httpClient, IMemoryCache cache, ILogger<TibiaDataValidator> logger)
    {
        _httpClient = httpClient;
        _cache = cache;
        _logger = logger;
    }

    public async Task<TibiaCharacterResult?> ValidateCharacterAsync(string characterName)
    {
        var cacheKey = $"tibia_char_{characterName.ToLowerInvariant()}";
        
        if (_cache.TryGetValue(cacheKey, out TibiaCharacterResult? cachedResult))
        {
            return cachedResult;
        }

        try
        {
            var encodedName = Uri.EscapeDataString(characterName);
            var response = await _httpClient.GetAsync($"{API_BASE_URL}/character/{encodedName}");
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("TibiaData API returned {StatusCode} for character {Name}", response.StatusCode, characterName);
                return null;
            }

            var content = await response.Content.ReadAsStringAsync();
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var apiResponse = JsonSerializer.Deserialize<TibiaDataResponse>(content, options);

            if (apiResponse?.Characters?.Character == null || string.IsNullOrEmpty(apiResponse.Characters.Character.Name))
            {
                var notFoundResult = new TibiaCharacterResult { Exists = false, Name = characterName };
                _cache.Set(cacheKey, notFoundResult, CacheDuration);
                return notFoundResult;
            }

            var charData = apiResponse.Characters.Character;
            var result = new TibiaCharacterResult
            {
                Name = charData.Name,
                World = charData.World,
                Vocation = charData.Vocation,
                Level = charData.Level,
                Exists = true
            };

            _cache.Set(cacheKey, result, CacheDuration);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating character {Name} with TibiaData API", characterName);
            return null;
        }
    }

    public async Task<List<TibiaWorld>?> GetAllWorldsAsync()
    {
        const string cacheKey = "tibia_worlds";
        
        if (_cache.TryGetValue(cacheKey, out List<TibiaWorld>? cachedWorlds))
        {
            return cachedWorlds;
        }

        try
        {
            var response = await _httpClient.GetAsync($"{API_BASE_URL}/worlds");
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("TibiaData API returned {StatusCode} for worlds", response.StatusCode);
                return null;
            }

            var content = await response.Content.ReadAsStringAsync();
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var apiResponse = JsonSerializer.Deserialize<TibiaWorldsResponse>(content, options);

            var worlds = apiResponse?.Worlds?.RegularWorlds ?? new List<TibiaWorld>();
            _cache.Set(cacheKey, worlds, TimeSpan.FromHours(1));
            return worlds;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching worlds from TibiaData API");
            return null;
        }
    }
}
