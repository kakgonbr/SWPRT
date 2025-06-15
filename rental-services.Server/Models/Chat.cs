using System;
using System.Collections.Generic;

namespace rental_services.Server.Models;

public partial class Chat
{
    public int ChatId { get; set; }

    public int UserId { get; set; }

    public int? StaffId { get; set; }

    public string Status { get; set; } = null!;

    public string Priority { get; set; } = null!;

    public DateTime OpenTime { get; set; }

    public string Subject { get; set; } = null!;

    public virtual ICollection<ChatMessage> ChatMessages { get; set; } = new List<ChatMessage>();

    public virtual User? Staff { get; set; }

    public virtual User User { get; set; } = null!;
}
