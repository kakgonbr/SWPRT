using System.Net;
using System.Net.Mail;

namespace rental_services.Server.Utils
{
    public static class EmailService
    {
        private static readonly string FROM_EMAIL = "vanbi12092004@gmail.com";
        private static readonly string APP_PASSWORD = "lhbt bqhr qjvw wnjl"; 
        private static readonly string SMTP_HOST = "smtp.gmail.com";
        private static readonly int SMTP_PORT = 587;

        public static void SendEmail(string toEmail, string subject, string content)
        {
            try
            {
                var message = new MailMessage();
                message.From = new MailAddress(FROM_EMAIL);
                message.To.Add(toEmail);
                message.Subject = subject;
                message.Body = content;
                message.IsBodyHtml = false; 

                var smtpClient = new SmtpClient(SMTP_HOST)
                {
                    Port = SMTP_PORT,
                    Credentials = new NetworkCredential(FROM_EMAIL, APP_PASSWORD),
                    EnableSsl = true
                };

                smtpClient.Send(message);
                Console.WriteLine($"✅ Email sent successfully to {toEmail}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error sending email to {toEmail}: {ex.Message}");
            }
        }
    }
}