using Microsoft.AspNetCore.Mvc;
using HuntSchedule.Persistence.Entities;
using HuntSchedule.Services.Interfaces;
using static HuntSchedule.Services.Resources.ErrorKeys;

namespace HuntSchedule.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RolesController : ControllerBase
{
    private readonly IRoleService _roleService;
    private readonly ILocalizationService _localization;

    public RolesController(IRoleService roleService, ILocalizationService localization)
    {
        _roleService = roleService;
        _localization = localization;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Role>>> GetRoles()
    {
        var roles = await _roleService.GetAllAsync();
        return Ok(roles);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Role>> GetRole(int id)
    {
        var role = await _roleService.GetByIdAsync(id);
        if (role == null) return NotFound(_localization.GetString(RoleNotFound));
        return role;
    }
}
