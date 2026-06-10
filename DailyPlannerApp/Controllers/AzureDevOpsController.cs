using DailyPlannerApp.Models;
using DailyPlannerApp.Services;
using Microsoft.AspNetCore.Mvc;

namespace DailyPlannerApp.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AzureDevOpsController : ControllerBase
{
    private readonly AzureDevOpsService _azureDevOpsService;

    public AzureDevOpsController(AzureDevOpsService azureDevOpsService)
    {
        _azureDevOpsService = azureDevOpsService;
    }

    [HttpGet("workitems/{id}")]
    public async Task<IActionResult> GetWorkItem(int id, [FromQuery] string? project = null)
    {
        var workItem = await _azureDevOpsService.GetWorkItemAsync(id, project);
        return Ok(workItem);
    }

    [HttpPatch("workitems/{id}")]
    public async Task<IActionResult> UpdateWorkItem(int id, [FromBody] WorkItemUpdateModel model, [FromQuery] string? project = null)
    {
        if (model?.Fields is null || model.Fields.Count == 0)
        {
            return BadRequest(new { error = "Fields are required for an update." });
        }

        var updatedWorkItem = await _azureDevOpsService.UpdateWorkItemAsync(id, model, project);
        return Ok(updatedWorkItem);
    }
}
