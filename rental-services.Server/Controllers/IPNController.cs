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

        public IPNController(ILogger<IPNController> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        public IActionResult Get()
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

            bool success = false;
            if (string.Equals(calculatedHash, secureHash, StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogInformation("Order {OrderId}, amount {Amount}, date {Date}", txnRef, paidAmount, payDate);

                if (IsOrderValid(txnRef, paidAmount))
                {
                    if (responseCode == "00")
                    {
                        // TODO
                        _logger.LogInformation("Order is valid, response code valid");
                    }
                    else
                    {
                        // TODO
                        _logger.LogInformation("Order is valid, response code invalid");
                    }
                }
                else
                {
                    // TODO
                    _logger.LogInformation("Order is invalid");
                }
            }
            else
            {
                // TODO
                _logger.LogInformation("Hash doesnt match");
            }

            return Ok();
        }

        private bool IsOrderValid(string orderId, decimal paidAmount)
        {
            // TODO
            return true;
        }
    }
}
