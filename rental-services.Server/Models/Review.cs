using System;
using System.Collections.Generic;

namespace rental_services.Server.Models;

public partial class Review
{
    public int ReviewId { get; set; }

    public int UserId { get; set; }

    public int ModelId { get; set; }

    public int Rate { get; set; }

    public string? Comment { get; set; }

    public virtual VehicleModel Model { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
