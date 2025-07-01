namespace rental_services.Server.Models.DTOs
{
    public record ShopDTO
    {
        public int Shopid { get; set; }

        public string Address { get; set; } = null!;

        public string Status { get; set; } = null!;
    }
}
