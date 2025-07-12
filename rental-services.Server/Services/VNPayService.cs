using static rental_services.Server.Utils.Config;
using System.Globalization;
using System.Net;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json;

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
        /// <param name="txnRef">Order ID, CAN BE ID OF DATABASE'S PAYMENT RECORD, MUST NOT MATCH IDs SENT TO VNPAY IN THE PAST 24 HOURS. FOR TESTING, USE RANDOM ID INSTEAD</param>
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
            p["vnp_ExpireDate"] = gmt7.AddMinutes(VnpConfig.PAYMENT_TIMEOUT_MIN).ToString("yyyyMMddHHmmss", CultureInfo.InvariantCulture);

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

        private static readonly HttpClient _httpClient = new HttpClient();

        /// <summary>
        /// Adapted from https://github.com/kakgonbr/PRJ-TOMCAT-WEB/blob/main/src/main/java/service/vnpay/QueryService.java<br></br>
        /// See https://sandbox.vnpayment.vn/apis/docs/truy-van-hoan-tien/querydr&refund.html<br></br>
        /// Use to get a map of response parameters returned by VNPAY
        /// </summary>
        /// <param name="ipAddr">Client IP address</param>
        /// <param name="txnRef">Transaction reference (order ID)</param>
        /// <param name="transDate">Transaction date in yyyyMMddHHmmss format, MUST MATCH</param>
        /// <returns>Response from VNPAY as a dictionary</returns>
        public static async Task<Dictionary<string, string>> QueryAsync(string ipAddr, string txnRef, string transDate)
        {
            string requestId = VnpConfig.GetRandomNumber(8);
            string version = "2.1.0";
            string command = "querydr";
            string tmnCode = VnpConfig.VnpTmnCode;
            string orderInfo = $"Kiem tra ket qua GD OrderId:{txnRef}";
            string createDate = GetGmtPlus7Now().ToString("yyyyMMddHHmmss", CultureInfo.InvariantCulture);

            var vnpParams = new Dictionary<string, string>
            {
                ["vnp_RequestId"] = requestId,
                ["vnp_Version"] = version,
                ["vnp_Command"] = command,
                ["vnp_TmnCode"] = tmnCode,
                ["vnp_TxnRef"] = txnRef,
                ["vnp_OrderInfo"] = orderInfo,
                ["vnp_TransactionDate"] = transDate,
                ["vnp_CreateDate"] = createDate,
                ["vnp_IpAddr"] = ipAddr
            };

            string hashData = string.Join("|", requestId, version, command, tmnCode, txnRef, transDate, createDate, ipAddr, orderInfo);
            string secureHash = VnpConfig.HmacSha512(VnpConfig.SecretKey, hashData);

            vnpParams["vnp_SecureHash"] = secureHash;

            string jsonPayload = JsonSerializer.Serialize(vnpParams);

            var requestContent = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            var request = new HttpRequestMessage(HttpMethod.Post, VnpConfig.VnpApiUrl)
            {
                Content = requestContent
            };

            HttpResponseMessage response = await _httpClient.SendAsync(request);

            string responseContent = await response.Content.ReadAsStringAsync();

            Console.WriteLine($"Sent POST to {VnpConfig.VnpApiUrl}");
            Console.WriteLine($"Payload: {jsonPayload}");
            Console.WriteLine($"Response code: {response.StatusCode}");
            Console.WriteLine($"Response body: {responseContent}");

            var result = JsonSerializer.Deserialize<Dictionary<string, string>>(responseContent);
            return result ?? new Dictionary<string, string>();
        }

        /// <summary>
        /// Adapted from https://github.com/kakgonbr/PRJ-TOMCAT-WEB/blob/main/src/main/java/service/vnpay/RefundService.java<br></br>
        /// See https://sandbox.vnpayment.vn/apis/docs/truy-van-hoan-tien/querydr&refund.html
        /// </summary>
        /// <param name="ipAddr">Client's IP address</param>
        /// <param name="transactionType">"02" = refund full, "03" = refund partial</param>
        /// <param name="txnRef">Your order ID</param>
        /// <param name="amount">Refund amount (multiply by 100 before passing in)</param>
        /// <param name="transactionDate">Original payment date (format yyyyMMddHHmmss)</param>
        /// <param name="createBy">The user triggering the refund (admin username, etc.)</param>
        /// <returns>Dictionary from VNPAY's JSON response</returns>
        public static async Task<Dictionary<string, string>> RefundAsync(
            string ipAddr,
            string transactionType,
            string txnRef,
            long amount,
            string transactionDate,
            string createBy)
        {
            string requestId = VnpConfig.GetRandomNumber(8);
            string version = "2.1.1";
            string command = "refund";
            string tmnCode = VnpConfig.VnpTmnCode;
            string orderInfo = $"Hoan tien GD OrderId:{txnRef}";
            string amountStr = amount.ToString();
            string transactionNo = "";
            string createDate = GetGmtPlus7Now().ToString("yyyyMMddHHmmss", CultureInfo.InvariantCulture);

            var vnpParams = new Dictionary<string, string>
            {
                ["vnp_RequestId"] = requestId,
                ["vnp_Version"] = version,
                ["vnp_Command"] = command,
                ["vnp_TmnCode"] = tmnCode,
                ["vnp_TransactionType"] = transactionType,
                ["vnp_TxnRef"] = txnRef,
                ["vnp_Amount"] = amountStr,
                ["vnp_OrderInfo"] = orderInfo,
                ["vnp_TransactionDate"] = transactionDate,
                ["vnp_CreateBy"] = createBy,
                ["vnp_CreateDate"] = createDate,
                ["vnp_IpAddr"] = ipAddr
            };

            if (!string.IsNullOrEmpty(transactionNo))
                vnpParams["vnp_TransactionNo"] = transactionNo;

            string hashData = string.Join("|", requestId, version, command, tmnCode,
                transactionType, txnRef, amountStr, transactionNo, transactionDate,
                createBy, createDate, ipAddr, orderInfo);

            string secureHash = VnpConfig.HmacSha512(VnpConfig.SecretKey, hashData);
            vnpParams["vnp_SecureHash"] = secureHash;

            string jsonPayload = JsonSerializer.Serialize(vnpParams);

            var requestContent = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(VnpConfig.VnpApiUrl, requestContent);

            string responseText = await response.Content.ReadAsStringAsync();

            Console.WriteLine($"[VNPAY Refund] POST {VnpConfig.VnpApiUrl}");
            Console.WriteLine($"Payload: {jsonPayload}");
            Console.WriteLine($"Response: {response.StatusCode}");
            Console.WriteLine($"Body: {responseText}");

            var result = JsonSerializer.Deserialize<Dictionary<string, string>>(responseText);
            return result ?? new Dictionary<string, string>();
        }

        /// <summary>
        /// Wrapper
        /// </summary>
        /// <param name="ipAddr"></param>
        /// <param name="transactionType"></param>
        /// <param name="txnRef"></param>
        /// <param name="amount"></param>
        /// <param name="transactionDate"></param>
        /// <param name="createBy"></param>
        /// <returns></returns>
        public static async Task<bool> IssueRefundAsync(
            string ipAddr,
            string transactionType,
            string txnRef,
            long amount,
            string transactionDate,
            string createBy)
        {
            return (await RefundAsync(ipAddr, transactionType, txnRef, amount, transactionDate, createBy))["vnp_ResponseCode"].Equals("00");
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
