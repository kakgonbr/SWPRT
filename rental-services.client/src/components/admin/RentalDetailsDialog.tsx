import { useState } from 'react'
import {
    Calendar, MapPin, Phone, FileText, DollarSign,
    //X,
    Mail
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog'
import { Badge } from '../ui/badge'
//import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { format, differenceInDays } from 'date-fns'
import { type Booking } from '../../types/booking'

interface RentalDetailsDialogProps {
    isOpen: boolean
    onClose: () => void
    rental: Booking
}

export default function RentalDetailsDialog({
    isOpen,
    onClose,
    rental
}: RentalDetailsDialogProps) {
    const [imgError, setImgError] = useState(false);

    if (!rental) return null

    const formatVND = (amount: number): string => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    const totalDays = differenceInDays(rental.endDate, rental.startDate) + 1
    const pricePerDay = rental.pricePerDay ?? 0;
    const totalPrice = formatVND(pricePerDay * totalDays);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return 'default'
            case 'Completed': return 'secondary'
            case 'Upcoming': return 'outline'
            case 'Cancelled': return 'destructive'
            default: return 'outline'
        }
    }

    //const getPaymentStatusColor = (status?: string) => {
    //    switch (status) {
    //        case 'Paid': return 'default'
    //        case 'Pending': return 'outline'
    //        case 'Failed': return 'destructive'
    //        case 'Refunded': return 'secondary'
    //        default: return 'outline'
    //    }
    //}

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl">Rental Details</DialogTitle>
                            <DialogDescription>
                                Rental ID: {rental.id}
                            </DialogDescription>
                        </div>
                        {/*<Button variant="ghost" size="icon" onClick={onClose}>*/}
                        {/*    <X className="h-4 w-4" />*/}
                        {/*</Button>*/}
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Bike Information */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                            <FileText className="h-5 w-5 mr-2" />
                            Bike Information
                        </h3>
                        <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                            {imgError ? (
                                <img
                                    src="/images/placeholder-bike.png"
                                    alt={rental.bikeName}
                                    className="w-20 h-20 object-cover rounded"
                                />
                            ) : (
                                <img
                                    src={`images/` + rental.bikeImageUrl.split('"')[0]}
                                    alt={rental.bikeName}
                                    className="w-20 h-20 object-cover rounded"
                                    onError={() => setImgError(true)}
                                />
                            )}
                            <div>
                                <p className="text-lg font-medium">{rental.bikeName}</p>
                                <p className="text-sm text-muted-foreground">
                                    ${formatVND(pricePerDay)} per day
                                </p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Customer Information */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <span className="font-medium">Name:</span>
                                    <span>{rental.customerName}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{rental.customerEmail}</span>
                                </div>
                                {rental.customerPhone && (
                                    <div className="flex items-center space-x-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{rental.customerPhone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Rental Period */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                            <Calendar className="h-5 w-5 mr-2" />
                            Rental Period
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                                <p className="text-sm">{format(rental.startDate, 'EEEE, MMMM d, yyyy')}</p>
                                <p className="text-xs text-muted-foreground">{format(rental.startDate, 'h:mm a')}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">End Date</p>
                                <p className="text-sm">{format(rental.endDate, 'EEEE, MMMM d, yyyy')}</p>
                                <p className="text-xs text-muted-foreground">{format(rental.endDate, 'h:mm a')}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Duration</p>
                                <p className="text-sm font-medium">{totalDays} day{totalDays !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Location Information */}
                    {(rental.pickupLocation || rental.returnLocation) && (
                        <>
                            <div>
                                <h3 className="text-lg font-semibold mb-3 flex items-center">
                                    <MapPin className="h-5 w-5 mr-2" />
                                    Location Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {rental.pickupLocation && (
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">Pickup Location</p>
                                            <p className="text-sm">{rental.pickupLocation}</p>
                                        </div>
                                    )}
                                    {rental.returnLocation && (
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">Return Location</p>
                                            <p className="text-sm">{rental.returnLocation}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Separator />
                        </>
                    )}

                    {/* Payment Information */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                            <DollarSign className="h-5 w-5 mr-2" />
                            Payment Information
                        </h3>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Price per day:</span>
                                        <span>${formatVND(pricePerDay)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Duration:</span>
                                        <span>{totalDays} day{totalDays !== 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>${totalPrice}</span>
                                    </div>
                                    {rental.tax && (
                                        <div className="flex justify-between">
                                            <span>Tax:</span>
                                            <span>${rental.tax.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {rental.discount && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount:</span>
                                            <span>-${rental.discount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {rental.deposit && (
                                        <div className="flex justify-between">
                                            <span>Security Deposit:</span>
                                            <span>${formatVND(rental.deposit)}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between font-semibold text-lg">
                                        <span>Total Amount:</span>
                                        <span>${totalPrice}</span>
                                    </div>
                                    {rental.paymentMethod && (
                                        <div className="flex justify-between">
                                            <span>Payment Method:</span>
                                            <span className="capitalize">{rental.paymentMethod}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span>Order Date:</span>
                                        <span>{rental.orderDate ? format(rental.orderDate, 'MMM d, yyyy') : 'Not paid'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Status Information */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Status Information</h3>
                        <div className="flex items-center space-x-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Rental Status</p>
                                <Badge variant={getStatusColor(rental.status)}>
                                    {rental.status}
                                </Badge>
                            </div>
                            {/*{rental.paymentStatus && (*/}
                            {/*    <div>*/}
                            {/*        <p className="text-sm font-medium text-muted-foreground mb-1">Payment Status</p>*/}
                            {/*        <Badge variant={getPaymentStatusColor(rental.paymentStatus)}>*/}
                            {/*            {rental.paymentStatus}*/}
                            {/*        </Badge>*/}
                            {/*    </div>*/}
                            {/*)}*/}
                        </div>
                    </div>

                    {/* Notes */}
                    {rental.notes && (
                        <>
                            <Separator />
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Notes</h3>
                                <div className="p-3 bg-muted/50 rounded-lg">
                                    <p className="text-sm">{rental.notes}</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}