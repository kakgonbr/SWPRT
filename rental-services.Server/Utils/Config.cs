using System.Runtime.InteropServices;

namespace rental_services.Server.Utils
{
    public static class Config
    {
        public static class Role
        {
            public const string Customer = "Customer";
            public const string Staff = "Staff";
            public const string Admin = "Admin";
        }

        public static class BookingStatus
        {
            public const string Pending = "Pending";
            public const string AwaitingPayment = "Awaiting Payment";
            public const string Confirmed = "Confirmed";
            public const string Upcomming = "Upcomming";
            public const string Active = "Active";
            public const string Completed = "Completed";
            public const string Cancelled = "Cancelled";

            public static readonly string[] AllStatuses =
            {
                Pending, AwaitingPayment, Confirmed, Upcomming, Active, Completed, Cancelled
            };

            public static bool IsValid(string status)
            {
                return AllStatuses.Contains(status);
            }

            public static bool CanTransitionTo(string currentStatus, string targetStatus)
            {
                return currentStatus switch
                {
                    Pending => targetStatus is AwaitingPayment or Confirmed or Cancelled,
                    AwaitingPayment => targetStatus is Confirmed or Cancelled,
                    Confirmed => targetStatus is Upcomming or Cancelled,
                    Upcomming => targetStatus is Active or Cancelled,
                    Active => targetStatus is Completed or Cancelled,
                    Completed => false,
                    Cancelled => false,
                    _ => false
                };
            }
        }

        public static class Image
        {
            public static string ImagePath = RuntimeInformation.IsOSPlatform(OSPlatform.Windows) ? @"C:\images" : "/var/www/images";
            public static TimeSpan CleanupInterval = TimeSpan.FromDays(3);
        }
    }
}
