using static rental_services.Server.Utils.Config;
using System.Globalization;
using System.Net;
using System.Runtime.InteropServices;
using System.Text;

namespace rental_services.Server.Services
{
    public static class VNPayService
    {
        private const string VnpVersion = "2.1.0";
        private const string VnpCommand = "pay";
        private const string OrderType = "other";

        /// <summary>
        /// Adapted from https://github.com/kakgonbr/PRJ-TOMCAT-WEB/blob/main/src/main/java/service/vnpay/PortalService.java
        /// </summary>
        /// <param name="ipAddr">Client IP address</param>
        /// <param name="bankCode">Blank lets the user choose.  Otherwise e.g. VNPAYQR, VNBANK, INTCARD</param>
        /// <param name="amount">Already multiplied by 100</param>
        /// <param name="locale">"vn" or "en"</param>
        /// <param name="txnRef">Order ID, MUST NOT MATCH IDs SENT TO VNPAY IN THE PAST 24 HOUTS. FOR TESTING, USE RANDOM ID INSTEAD</param>
        /// <returns>The full payment URL to redirect the user to</returns>
        /// <exception cref="ArgumentException">If required parameters are missing/invalid</exception>
        public static string GetLink(
            string ipAddr,
            string? bankCode,
            long amount,
            string? locale,
            string txnRef)
        {
            if (string.IsNullOrWhiteSpace(ipAddr)) throw new ArgumentException("IP address is required", nameof(ipAddr));
            if (string.IsNullOrWhiteSpace(txnRef)) throw new ArgumentException("Transaction reference is required", nameof(txnRef));
            if (amount <= 0) throw new ArgumentException("Amount must be positive", nameof(amount));

            var p = new Dictionary<string, string>(StringComparer.Ordinal)
            {
                ["vnp_Version"] = VnpVersion,
                ["vnp_Command"] = VnpCommand,
                ["vnp_TmnCode"] = VnpConfig.VnpTmnCode,
                ["vnp_Amount"] = amount.ToString(),
                ["vnp_CurrCode"] = "VND",
                ["vnp_TxnRef"] = txnRef,
                ["vnp_OrderInfo"] = $"Thanh toan don hang:{txnRef}",
                ["vnp_OrderType"] = OrderType,
                ["vnp_ReturnUrl"] = VnpConfig.VnpReturnUrl,
                ["vnp_IpAddr"] = ipAddr
            };

            if (!string.IsNullOrWhiteSpace(bankCode))
                p["vnp_BankCode"] = bankCode;

            p["vnp_Locale"] = !string.IsNullOrWhiteSpace(locale) ? locale : "vn";

            var gmt7 = GetGmtPlus7Now();
            p["vnp_CreateDate"] = gmt7.ToString("yyyyMMddHHmmss", CultureInfo.InvariantCulture);
            p["vnp_ExpireDate"] = gmt7.AddMinutes(5).ToString("yyyyMMddHHmmss", CultureInfo.InvariantCulture);

            var sortedKeys = p.Keys.OrderBy(k => k, StringComparer.Ordinal).ToList();

            var hashSb = new StringBuilder();
            var querySb = new StringBuilder();

            for (int i = 0; i < sortedKeys.Count; i++)
            {
                var k = sortedKeys[i];
                var v = p[k];

                string encKey = UrlEncodeAscii(k);   // query uses encoded key
                string encValue = UrlEncodeAscii(v);   // both hash & query use encoded value

                // ‑‑ hash data: raw key, encoded value
                hashSb.Append(k).Append('=').Append(encValue);

                // ‑‑ query: encoded key, encoded value
                querySb.Append(encKey).Append('=').Append(encValue);

                if (i < sortedKeys.Count - 1)
                {
                    hashSb.Append('&');
                    querySb.Append('&');
                }
            }

            var secureHash = VnpConfig.HmacSha512(VnpConfig.SecretKey, hashSb.ToString());

            querySb.Append("&vnp_SecureHash=").Append(secureHash);

            var paymentUrl = $"{VnpConfig.VnpPayUrl}?{querySb}";
            return paymentUrl;
        }

        private static string UrlEncodeAscii(string value) =>
            WebUtility.UrlEncode(value ?? string.Empty);

        private static DateTime GetGmtPlus7Now()
        {
            string tzId = RuntimeInformation.IsOSPlatform(OSPlatform.Windows)
                          ? "SE Asia Standard Time"
                          : "Etc/GMT-7";

            var tzInfo = TimeZoneInfo.FindSystemTimeZoneById(tzId);
            return TimeZoneInfo.ConvertTime(DateTime.UtcNow, tzInfo);
        }
    }
}
