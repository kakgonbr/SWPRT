using System;
using System.Collections.Generic;

namespace rental_services.Server.Models;

public partial class Shop
{
    public int Shopid { get; set; }

    public string Address { get; set; } = null!;

    public string Status { get; set; } = null!;

    public virtual ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
}
