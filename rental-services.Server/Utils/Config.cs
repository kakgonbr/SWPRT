using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;

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

        /// <summary>
        /// Adapted from https://github.com/kakgonbr/PRJ-TOMCAT-WEB/blob/main/src/main/java/config/VNPConfig.java
        /// </summary>
        public static class VnpConfig
        {
            public static readonly string VnpPayUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
            public static readonly string VnpReturnUrl = Environment.GetEnvironmentVariable("VNP_RETURN");
            public static readonly string VnpTmnCode = Environment.GetEnvironmentVariable("VNP_TMN");
            public static readonly string SecretKey = Environment.GetEnvironmentVariable("VNP_SECRET");
            public static readonly string VnpApiUrl = "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction";
            public static readonly int PAYMENT_TIMEOUT_MIN = 15;
            public static readonly int PAYMENT_MAX_TRIES = 3;

            public static string Md5(string message) => Hash(message, MD5.Create());
            public static string Sha256(string message) => Hash(message, SHA256.Create());

            private static string Hash(string message, HashAlgorithm alg)
            {
                if (message is null) return string.Empty;

                var bytes = Encoding.UTF8.GetBytes(message);
                var hash = alg.ComputeHash(bytes);
                return ToLowerHex(hash);
            }

            public static string HashAllFields(IDictionary<string, string> fields)
            {
                if (fields is null) throw new ArgumentNullException(nameof(fields));

                var sb = new StringBuilder();

                foreach (var kvp in fields
                                     .Where(p => !string.IsNullOrEmpty(p.Value))
                                     .OrderBy(p => p.Key, StringComparer.Ordinal))
                {
                    sb.Append(kvp.Key)
                      .Append('=')
                      .Append(kvp.Value)
                      .Append('&');
                }

                if (sb.Length > 0) sb.Length--;

                return HmacSha512(SecretKey, sb.ToString());
            }

            public static string HmacSha512(string key, string data)
            {
                if (key is null || data is null) throw new ArgumentNullException();

                using var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(key));
                var result = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
                return ToLowerHex(result);
            }

            public static string GetIpAddress(HttpContext context)
            {
                if (context == null) return "Invalid IP: context is null";

                var ip = context.Request.Headers["X-Forwarded-For"].FirstOrDefault()
                         ?? context.Connection.RemoteIpAddress?.ToString()
                         ?? "Unknown";

                return ip;
            }

            /// <summary>
            /// Generate a numeric string of the requested length.<br></br>
            /// FOR TESTING ONLY, USE PAYMENT ID FOR PAYMENT IDENTIFICATION
            /// </summary>
            public static string GetRandomNumber(int length)
            {
                if (length <= 0) throw new ArgumentOutOfRangeException(nameof(length));

                const string digits = "0123456789";
                var buffer = new byte[length];
                RandomNumberGenerator.Fill(buffer);

                var sb = new StringBuilder(length);
                foreach (var b in buffer)
                    sb.Append(digits[b % digits.Length]);

                return sb.ToString();
            }

            private static string ToLowerHex(byte[] bytes)
            {
                var sb = new StringBuilder(bytes.Length * 2);
                foreach (var b in bytes)
                    sb.Append(b.ToString("x2"));   // lower‑case hex
                return sb.ToString();
            }
        }
    }
}
