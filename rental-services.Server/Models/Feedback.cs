using System;
using System.Collections.Generic;

namespace rental_services.Server.Models;

public partial class Feedback
{
    public int FeedBackId { get; set; }

    public int UserId { get; set; }

    public string Title { get; set; } = null!;

    public string Body { get; set; } = null!;

    public string ImagePath { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
