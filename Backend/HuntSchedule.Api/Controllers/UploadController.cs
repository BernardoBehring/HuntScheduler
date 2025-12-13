using Microsoft.AspNetCore.Mvc;

namespace HuntSchedule.Api.Controllers;

[ApiController]
[Route("api/upload")]
public class UploadController : ControllerBase
{
    private readonly IWebHostEnvironment _env;
    private const long MaxFileSize = 5 * 1024 * 1024;
    private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };

    public UploadController(IWebHostEnvironment env)
    {
        _env = env;
    }

    [HttpPost("screenshot")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<ActionResult<UploadResult>> UploadScreenshot(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file provided");
        }

        if (file.Length > MaxFileSize)
        {
            return BadRequest("File size exceeds 5MB limit");
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(extension))
        {
            return BadRequest($"Invalid file type. Allowed types: {string.Join(", ", AllowedExtensions)}");
        }

        var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads", "screenshots");
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var uniqueFileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var url = $"/uploads/screenshots/{uniqueFileName}";

        return Ok(new UploadResult { Url = url, FileName = uniqueFileName });
    }
}

public class UploadResult
{
    public string Url { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
}
