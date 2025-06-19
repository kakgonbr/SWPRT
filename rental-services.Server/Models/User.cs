using System;
using System.Collections.Generic;

namespace rental_services.Server.Models;

public partial class User
{
    public int UserId { get; set; }

    public string Sub { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string PhoneNumber { get; set; } = null!;

    public string? PasswordHash { get; set; }

    public string Role { get; set; } = "Customer";

    public string? FullName { get; set; }

    public string? Address { get; set; }

    public DateOnly CreationDate { get; set; }

    public bool EmailConfirmed { get; set; }

    public DateOnly? DateOfBirth { get; set; }

    public bool IsActive { get; set; } = true;

    public string? GoogleuserId { get; set; }

    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    public virtual ICollection<ChatMessage> ChatMessages { get; set; } = new List<ChatMessage>();

    public virtual ICollection<Chat> ChatStaffs { get; set; } = new List<Chat>();

    public virtual ICollection<Chat> ChatUsers { get; set; } = new List<Chat>();

    public virtual ICollection<DriverLicense> DriverLicenses { get; set; } = new List<DriverLicense>();

    public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();

    public virtual ICollection<Report> Reports { get; set; } = new List<Report>();

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
}
