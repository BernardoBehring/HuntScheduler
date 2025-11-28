using System.Text.Json.Serialization;

namespace HuntSchedule.Services.External;

public class TibiaDataResponse
{
    [JsonPropertyName("characters")]
    public TibiaCharactersData? Characters { get; set; }
}
