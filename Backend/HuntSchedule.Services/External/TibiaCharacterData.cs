using System.Text.Json.Serialization;

namespace HuntSchedule.Services.External;

public class TibiaCharacterData
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
    
    [JsonPropertyName("world")]
    public string World { get; set; } = string.Empty;
    
    [JsonPropertyName("vocation")]
    public string? Vocation { get; set; }
    
    [JsonPropertyName("level")]
    public int Level { get; set; }
}
