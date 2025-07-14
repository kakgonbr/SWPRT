using System;
using System.Collections.Generic;

namespace rental_services.Server.Models;

public partial class ChatMessage
{
    public int ChatMessageId { get; set; }

    public int ChatId { get; set; }

    public int SenderId { get; set; }

    public string Content { get; set; } = null!;

    public DateTime SendTime { get; set; }

    public bool IsRead { get; set; }

    public virtual Chat Chat { get; set; } = null!;

    public virtual User Sender { get; set; } = null!;
}
