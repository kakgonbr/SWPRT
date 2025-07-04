
namespace rental_services.Server.Services
{
    public interface IMaintenanceService
    {
        DateTime? End { get; }
        bool IsActive { get; }
        DateTime? Start { get; }
        string? Message { get; }

        void ClearMaintenancePeriod();
        bool SetMaintenancePeriod(DateTime start, DateTime end, string? message = null);
    }
}