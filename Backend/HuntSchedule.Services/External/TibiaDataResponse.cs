using System.Text.Json.Serialization;

namespace HuntSchedule.Services.External;

public class TibiaDataResponse
{
    [JsonPropertyName("character")]
    public TibiaCharactersData? Characters { get; set; }
}

public class TibiaWorldsResponse
{
    [JsonPropertyName("worlds")]
    public TibiaWorldsData? Worlds { get; set; }
}

public class TibiaWorldsData
{
    [JsonPropertyName("regular_worlds")]
    public List<TibiaWorld>? RegularWorlds { get; set; }
}

public class TibiaWorld
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
    
    [JsonPropertyName("location")]
    public string Location { get; set; } = string.Empty;
    
    [JsonPropertyName("pvp_type")]
    public string PvpType { get; set; } = string.Empty;
    
    [JsonPropertyName("players_online")]
    public int PlayersOnline { get; set; }
    
    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;
}
