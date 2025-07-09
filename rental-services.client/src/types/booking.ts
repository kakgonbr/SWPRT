import type {User, VehicleModelDTO} from "../lib/types.ts";

//public string Id { get; set; } = null!;
//        public int CustomerId { get; set; }
//        public string BikeName { get; set; } = null!;
//        public string BikeImageUrl { get; set; } = null!;
//        public string CustomerName { get; set; } = null!;
//        public string CustomerEmail { get; set; } = null!;
//        public string ? CustomerPhone { get; set; }
//        public DateOnly StartDate { get; set; }
//        public DateOnly EndDate { get; set; }
//        public DateOnly ? OrderDate { get; set; }
//        public string Status { get; set; } = null!;
//        public decimal PricePerDay { get; set; }
//        public string ? PickupLocation { get; set; }
//        public string ? ReturnLocation { get; set; }
//        public string ? PaymentMethod { get; set; }
//        public string ? Notes { get; set; }
//        public decimal ? Deposit { get; set; }
//        public decimal ? Tax { get; set; }
//        public decimal ? Discount { get; set; }
export interface Booking {
    bookingId: string;
    vehicleId: number;
    customerId: number;
    startDate: Date;
    endDate: Date;
    orderDate?: Date;
    status: string;
    pricePerDay: number;
    user?: User;
    vehicle?: VehicleModelDTO;
    vehicleName: string;
    vehicleImgURL: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    pickupLocation?: string;
    returnLocation?: string;
    paymentMethod?: string;
    notes?: string;
    deposit?: number;
    tax?: number;
    discount?: number;
}