using System.Text.Json.Serialization;

namespace HuntSchedule.Services.External;

public class TibiaCharactersData
{
    [JsonPropertyName("character")]
    public TibiaCharacterData? Character { get; set; }
}
