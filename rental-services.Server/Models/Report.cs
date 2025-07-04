using System;
using System.Collections.Generic;

namespace rental_services.Server.Models;

public partial class Report
{
    public int ReportId { get; set; }

    public int UserId { get; set; }

    public int TypeId { get; set; }

    public string Title { get; set; } = null!;

    public string Body { get; set; } = null!;

    public string ImagePath { get; set; } = null!;

    public DateTime ReportTime { get; set; }

    public virtual ReportType Type { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
