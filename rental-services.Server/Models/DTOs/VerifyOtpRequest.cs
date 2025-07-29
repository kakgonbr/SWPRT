namespace rental_services.Server.Models.DTOs
{
    public class VerifyOtpRequest
    {
        public string Email { get; set; }
        public string Otp { get; set; }
    }
}
