using System.Globalization;
using System.Resources;
using HuntSchedule.Services.Interfaces;

namespace HuntSchedule.Services.Implementations;

public class LocalizationService : ILocalizationService
{
    private readonly ResourceManager _resourceManager;

    public LocalizationService()
    {
        _resourceManager = new ResourceManager(
            "HuntSchedule.Services.Resources.ErrorMessages",
            typeof(LocalizationService).Assembly);
    }

    public string GetString(string key)
    {
        try
        {
            var value = _resourceManager.GetString(key, CultureInfo.CurrentUICulture);
            return value ?? key;
        }
        catch
        {
            return key;
        }
    }

    public string GetString(string key, params object[] args)
    {
        var template = GetString(key);
        try
        {
            return string.Format(template, args);
        }
        catch
        {
            return template;
        }
    }
}
