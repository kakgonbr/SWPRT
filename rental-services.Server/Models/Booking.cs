using System;
using System.Collections.Generic;

namespace rental_services.Server.Models;

public partial class Booking
{
    public int BookingId { get; set; }

    public int VehicleId { get; set; }

    public int UserId { get; set; }

    public DateOnly StartDate { get; set; }

    public DateOnly EndDate { get; set; }

    public string Status { get; set; } = null!;

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual User User { get; set; } = null!;

    public virtual Vehicle Vehicle { get; set; } = null!;

    public virtual ICollection<Peripheral> Peripherals { get; set; } = new List<Peripheral>();
}
