import type { Booking } from "./booking"

export interface Payment {
    paymentId: number
    bookingId: number
    amountPaid: number
    paymentDate: Date
    booking?: Booking
}