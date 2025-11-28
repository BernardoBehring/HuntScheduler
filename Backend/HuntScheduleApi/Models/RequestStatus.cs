using System.ComponentModel.DataAnnotations;

namespace HuntScheduleApi.Models;

public class RequestStatus
{
    public int Id { get; set; }
    
    [Required]
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    public string? Color { get; set; }
}
