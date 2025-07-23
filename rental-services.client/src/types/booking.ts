
export type BookingStatus =
    | 'Awaiting Payment'
    | 'Confirmed'
    | 'Upcoming'
    | 'Active'
    | 'Completed'
    | 'Cancelled';
export interface Booking {
    id: string;
    customerId: number;
    startDate: string;
    endDate: string;
    orderDate?: string;
    status: BookingStatus;
    pricePerDay: number;
    vehicleModelId: number;
    bikeId?: number;
    bikeName: string;
    bikeImageUrl: string;
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