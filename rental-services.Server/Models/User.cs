using System;
using System.Collections.Generic;

namespace rental_services.Server.Models;

public partial class User
{
    public int UserId { get; set; }

    public string Email { get; set; } = null!;

    public string PhoneNumber { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public int Role { get; set; }

    public string? FullName { get; set; }

    public string? Address { get; set; }

    public DateOnly CreationDate { get; set; }

    public bool EmailConfirmed { get; set; }

    public DateOnly DateOfBirth { get; set; }

    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    public virtual ICollection<DriverLicense> DriverLicenses { get; set; } = new List<DriverLicense>();

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
}
