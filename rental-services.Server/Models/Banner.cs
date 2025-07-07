using System;
using System.Collections.Generic;

namespace rental_services.Server.Models;

public partial class Banner
{
    public int BannerId { get; set; }

    public string Title { get; set; } = null!;

    public string Message { get; set; } = null!;

    public DateTime StartTime { get; set; }

    public DateTime EndTime { get; set; }

    public string ButtonText { get; set; } = null!;

    public string ButtonLink { get; set; } = null!;

    public string Type { get; set; } = null!;

    public string Background { get; set; } = null!;

    public string TextColor { get; set; } = null!;

    public int Priority { get; set; }

    public bool IsActive { get; set; }

    public bool ShowOnce { get; set; }
}
