using rental_services.Server.Models.DTOs;
using System.Threading.Tasks;

namespace rental_services.Server.Services
{
    public interface IOcrService
    {
        Task ProcessGplxDataAsync(string userSub, GplxData gplxData);
    }
} 