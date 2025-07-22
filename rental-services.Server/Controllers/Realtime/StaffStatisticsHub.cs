using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace rental_services.Server.Controllers.Realtime
{
    [Authorize (Roles = Utils.Config.Role.Staff)]
    public class StaffStatisticsHub : Hub
    {
        
    }
}
