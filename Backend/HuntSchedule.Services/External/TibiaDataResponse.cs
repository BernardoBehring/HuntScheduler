using System.Text.Json.Serialization;

namespace HuntSchedule.Services.External;

public class TibiaDataResponse
{
    [JsonPropertyName("character")]
    public TibiaCharactersData? Characters { get; set; }
}
