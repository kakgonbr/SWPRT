using System;
using System.Collections.Generic;

namespace rental_services.Server.Models;

public partial class VehicleType
{
    public int VehicleTypeId { get; set; }

    public string VehicleTypeName { get; set; } = null!;

    public int CylinderVolumeCm3 { get; set; }

    public virtual ICollection<VehicleModel> VehicleModels { get; set; } = new List<VehicleModel>();

    public virtual ICollection<DriverLicenseType> LicenseTypes { get; set; } = new List<DriverLicenseType>();
}
