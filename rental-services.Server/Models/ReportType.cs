using System;
using System.Collections.Generic;

namespace rental_services.Server.Models;

public partial class ReportType
{
    public int ReportTypeId { get; set; }

    public string Description { get; set; } = null!;

    public virtual ICollection<Report> Reports { get; set; } = new List<Report>();
}
