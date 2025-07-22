using System;
using System.Collections.Generic;

namespace rental_services.Server.Models;

public partial class Peripheral
{
    public int PeripheralId { get; set; }

    public string Name { get; set; } = null!;

    public long RatePerDay { get; set; }

    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    public virtual ICollection<VehicleModel> Models { get; set; } = new List<VehicleModel>();
}
