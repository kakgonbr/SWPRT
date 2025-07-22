
namespace rental_services.Server.Services
{
    public interface IVNPayService
    {
        static abstract string GetLink(string ipAddr, string? bankCode, long amount, string? locale, string txnRef);
        static abstract Task<bool> IssueRefundAsync(string ipAddr, string transactionType, string txnRef, long amount, string transactionDate, string createBy);
        static abstract Task<Dictionary<string, string>> QueryAsync(string ipAddr, string txnRef, string transDate);
        static abstract Task<Dictionary<string, string>> RefundAsync(string ipAddr, string transactionType, string txnRef, long amount, string transactionDate, string createBy);
    }
}