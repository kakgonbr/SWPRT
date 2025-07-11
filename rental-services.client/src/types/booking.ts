
export type BookingStatus =
    | 'Pending'
    | 'Awaiting Payment'
    | 'Confirmed'
    | 'Upcoming'
    | 'Active'
    | 'Completed'
    | 'Cancelled';
export interface Booking {
    /*
     public string Id { get; set; } = null!;
        public int CustomerId { get; set; }
        public string BikeName { get; set; } = null!;
        public string BikeImageUrl { get; set; } = null!;
        public string CustomerName { get; set; } = null!;
        public string CustomerEmail { get; set; } = null!;
        public string? CustomerPhone { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public DateOnly? OrderDate { get; set; }
        public string Status { get; set; } = null!;
        public decimal PricePerDay { get; set; }
        public string? PickupLocation { get; set; }
        public string? ReturnLocation { get; set; }
        public string? PaymentMethod { get; set; }
        public string? Notes { get; set; }
        public decimal? Deposit { get; set; }
        public decimal? Tax { get; set; }
        public decimal? Discount { get; set; }
    */

    Id: string;
    CustomerId: number;
    StartDate: string;
    EndDate: string;
    OrderDate?: string;
    Status: BookingStatus;
    PricePerDay: number;
    VehicleModelId: number;
    VehicleId?: number;
    BikeName: string;
    BikeImageUrl: string;
    CustomerName: string;
    CustomerEmail: string;
    CustomerPhone?: string;
    PickupLocation?: string;
    ReturnLocation?: string;
    PaymentMethod?: string;
    Notes?: string;
    Deposit?: number;
    Tax?: number;
    Discount?: number;
}