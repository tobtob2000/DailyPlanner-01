using DailyPlannerApp.Models;
using Microsoft.Extensions.Options;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace DailyPlannerApp.Services;

public sealed class AzureDevOpsService
{
    private readonly HttpClient _httpClient;
    private readonly AzureDevOpsOptions _options;

    public AzureDevOpsService(HttpClient httpClient, IOptions<AzureDevOpsOptions> options)
    {
        _httpClient = httpClient;
        _options = options.Value;
    }

    private string GetBaseUrl() => _options.OrganizationUrl.TrimEnd('/');

    private string GetProjectSegment(string? project) => string.IsNullOrWhiteSpace(project) ? string.Empty : $"/{project}";

    public async Task<JsonElement> GetWorkItemAsync(int id, string? project = null, CancellationToken cancellationToken = default)
    {
        var projectSegment = GetProjectSegment(project ?? _options.Project);
        var url = $"{GetBaseUrl()}{projectSegment}/_apis/wit/workitems/{id}?api-version={_options.ApiVersion}";

        using var response = await _httpClient.GetAsync(url, cancellationToken);
        response.EnsureSuccessStatusCode();

        using var responseStream = await response.Content.ReadAsStreamAsync(cancellationToken);
        return await JsonSerializer.DeserializeAsync<JsonElement>(responseStream, cancellationToken: cancellationToken);
    }

    public async Task<JsonElement> UpdateWorkItemAsync(int id, WorkItemUpdateModel model, string? project = null, CancellationToken cancellationToken = default)
    {
        if (model is null)
        {
            throw new ArgumentNullException(nameof(model));
        }

        var projectSegment = GetProjectSegment(project ?? _options.Project);
        var url = $"{GetBaseUrl()}{projectSegment}/_apis/wit/workitems/{id}?api-version={_options.ApiVersion}";
        var patchDocument = model.ToPatchDocument();
        var content = new StringContent(JsonSerializer.Serialize(patchDocument), Encoding.UTF8, "application/json-patch+json");

        using var request = new HttpRequestMessage(new HttpMethod("PATCH"), url)
        {
            Content = content
        };

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();

        using var responseStream = await response.Content.ReadAsStreamAsync(cancellationToken);
        return await JsonSerializer.DeserializeAsync<JsonElement>(responseStream, cancellationToken: cancellationToken);
    }
}
