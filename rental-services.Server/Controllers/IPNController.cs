using Microsoft.AspNetCore.Mvc;
using static rental_services.Server.Utils.Config;
using System.Net;

namespace rental_services.Server.Controllers
{
    /// <summary>
    /// Adapted from https://github.com/kakgonbr/PRJ-TOMCAT-WEB/blob/main/src/main/java/controller/IPNServlet.java<br></br>
    /// Called only by VNPAY, although there is nothing preventing ordinary users from doing so.<br></br>
    /// Used for informing the status of a payment, sometimes this can fail, make sure there is a timeout mechanism for falling back
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class IPNController : ControllerBase
    {
        private readonly ILogger<IPNController> _logger;
        private readonly Services.IRentalService _rentalService;

        public IPNController(ILogger<IPNController> logger, Services.IRentalService rentalService)
        {
            _rentalService = rentalService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            _logger.LogInformation("IPN Received a GET request from {ip}", HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString());

            var queryParams = HttpContext.Request.Query;
            var fields = new Dictionary<string, string>(StringComparer.Ordinal);

            foreach (var param in queryParams)
            {
                var key = WebUtility.UrlEncode(param.Key);
                var value = WebUtility.UrlEncode(param.Value);

                if (!string.IsNullOrEmpty(value))
                {
                    fields[key] = value;
                }
            }

            string? secureHash = queryParams["vnp_SecureHash"];
            fields.Remove("vnp_SecureHashType");
            fields.Remove("vnp_SecureHash");

            string? txnRef = queryParams["vnp_TxnRef"];
            string? amountStr = queryParams["vnp_Amount"];
            string? payDate = queryParams["vnp_PayDate"];
            string? responseCode = queryParams["vnp_ResponseCode"];

            if (txnRef is null)
                return BadRequest("No order id");

            if (!long.TryParse(amountStr, out long rawAmount))
                return BadRequest("Invalid amount");

            var paidAmount = rawAmount / 100.0m;

            string calculatedHash = VnpConfig.HashAllFields(fields);

            bool finalPayment = !txnRef.StartsWith('f');
            int bookingId = finalPayment ? int.Parse(txnRef.Substring(1).Split("_")[0]) : int.Parse(txnRef.Split("_")[0]);

            bool success = false;
            if (string.Equals(calculatedHash, secureHash, StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogInformation("Order {OrderId}, amount {Amount}, date {Date}", txnRef, paidAmount, payDate);

                if (responseCode == "00")
                {
                    if (await _rentalService.InformPaymentSuccessAsync(bookingId, (long) decimal.Truncate(paidAmount), finalPayment))
                    {
                        _logger.LogInformation("Payment successful.");
                    }
                    else
                    {
                        _logger.LogWarning("Payment successful, but payment failed to proceed further, refunding");
                        // TODO: REFUNDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD
                        await _rentalService.HandleCancelAndRefundAsync(-1, bookingId);
                    }
                }
                else
                {
                    await _rentalService.InformPaymentFailureAsync(bookingId);
                    _logger.LogInformation("Response code is not 00");
                }
            }
            else
            {
                _logger.LogInformation("Hash doesnt match");
            }

            return Ok();
        }
    }
}
