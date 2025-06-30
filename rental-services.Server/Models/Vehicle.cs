using System;
using System.Collections.Generic;

namespace rental_services.Server.Models;

public partial class Vehicle
{
    public int VehicleId { get; set; }

    public int ModelId { get; set; }

    public string Condition { get; set; } = null!;

    public int ShopId { get; set; }

    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    public virtual VehicleModel Model { get; set; } = null!;

    public virtual Shop Shop { get; set; } = null!;
}
