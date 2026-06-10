namespace DailyPlannerApp.Models;

public sealed class AzureDevOpsOptions
{
    public required string OrganizationUrl { get; init; }
    public string? Project { get; init; }
    public required string PersonalAccessToken { get; init; }
    public string ApiVersion { get; init; } = "7.1-preview.3";
}
