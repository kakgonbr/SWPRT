using System;
using System.Collections.Generic;

namespace rental_services.Server.Models;

public partial class Payment
{
    public int PaymentId { get; set; }

    public int BookingId { get; set; }

    public long AmountPaid { get; set; }

    public DateOnly PaymentDate { get; set; }

    public virtual Booking Booking { get; set; } = null!;
}
