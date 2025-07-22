using System;
using System.Collections.Generic;

namespace rental_services.Server.Models;

public partial class Payment
{
    public string PaymentId { get; set; } = null!;

    public int BookingId { get; set; }

    public long AmountPaid { get; set; }

    public DateTime PaymentDate { get; set; }

    public virtual Booking Booking { get; set; } = null!;
}
