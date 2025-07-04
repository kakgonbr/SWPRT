namespace rental_services.Server.Services
{
    /// <summary>
    /// Register as a singleton.
    /// </summary>
    public class MaintenanceService : IMaintenanceService
    {
        public DateTime? Start { get; private set; } = null;
        public DateTime? End { get; private set; } = null;
        public string? Message { get; private set; }
        public bool IsActive => Start is not null && End is not null;

        public MaintenanceService()
        {
        }

        public bool SetMaintenancePeriod(DateTime start, DateTime end, string? message = null)
        {
            if (start >= end)
            {
                return false;
            }

            if (string.IsNullOrWhiteSpace(message))
            {
                message = $"Expected Maintenance period from {start} to {end}. Services will be unavailable.";
            }

            Message = message;
            Start = start;
            End = end;

            return true;
        }

        public void ClearMaintenancePeriod()
        {
            Start = null;
            End = null;
        }
    }
}
