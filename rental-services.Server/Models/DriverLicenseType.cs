using System;
using System.Collections.Generic;

namespace rental_services.Server.Models;

public partial class DriverLicenseType
{
    public int LicenseTypeId { get; set; }

    public string LicenseTypeCode { get; set; } = null!;

    public virtual ICollection<DriverLicense> DriverLicenses { get; set; } = new List<DriverLicense>();

    public virtual ICollection<VehicleType> VehicleTypes { get; set; } = new List<VehicleType>();
}
