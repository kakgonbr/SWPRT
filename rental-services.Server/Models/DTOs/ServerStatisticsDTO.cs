namespace rental_services.Server.Models.DTOs
{
    public record ServerStatisticsDTO
    {
        public int TotalUsers { get; set; }
        public int NewUsers { get; set; }
        public int TotalBikes { get; set; }
        public int AvailableBikes { get; set; }
        public int ActiveRentals { get; set; }
        public decimal MonthlyRevenue { get; set; }
    }
}
