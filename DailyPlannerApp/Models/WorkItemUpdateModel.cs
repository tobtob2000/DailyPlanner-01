namespace DailyPlannerApp.Models;

public sealed class WorkItemUpdateModel
{
    public Dictionary<string, object?>? Fields { get; init; }
    public string? Comment { get; init; }

    public object[] ToPatchDocument()
    {
        if (Fields is null || Fields.Count == 0)
        {
            throw new InvalidOperationException("At least one field must be provided for an update.");
        }

        var ops = new List<Dictionary<string, object?>>();

        foreach (var field in Fields)
        {
            ops.Add(new Dictionary<string, object?>
            {
                ["op"] = "add",
                ["path"] = $"/fields/{field.Key}",
                ["value"] = field.Value
            });
        }

        if (!string.IsNullOrWhiteSpace(Comment))
        {
            ops.Add(new Dictionary<string, object?>
            {
                ["op"] = "add",
                ["path"] = "/fields/System.History",
                ["value"] = Comment
            });
        }

        return ops.ToArray();
    }
}
