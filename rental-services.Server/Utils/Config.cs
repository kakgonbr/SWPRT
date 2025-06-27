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

        public static class Image
        {
            public static string ImagePath = RuntimeInformation.IsOSPlatform(OSPlatform.Windows) ? @"C:\images" : "/var/www/images";
            public static TimeSpan CleanupInterval = TimeSpan.FromDays(3);
        }
    }
}
