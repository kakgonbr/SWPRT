import { format, isValid } from 'date-fns'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Check, X, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react'
import type { Booking, BookingStatus } from '../../types/booking'
import { parseISO } from 'date-fns/parseISO'

interface RentalApprovalDialogProps {
    isOpen: boolean
    onClose: () => void
    selectedRental: Booking | undefined
    onApprove: (rentalId: string) => void
    onReject: (rentalId: string) => void
    isLoading: boolean
}

export default function RentalApprovalDialog({
    isOpen,
    onClose,
    selectedRental,
    onApprove,
    onReject,
    isLoading
}: RentalApprovalDialogProps) {
    const getStatusBadgeVariant = (status: BookingStatus) => {
        switch (status) {
            case 'Awaiting Payment': return 'secondary'
            case 'Confirmed': return 'default'
            case 'Upcoming': return 'default'
            case 'Active': return 'default'
            case 'Completed': return 'outline'
            case 'Cancelled': return 'destructive'
            default: return 'outline'
        }
    }

    const getRentalStatusIcon = (status: BookingStatus) => {
        switch (status) {
            //case 'Awaiting Payment': return <Calendar className="h-3 w-3" />
            case 'Confirmed': return <CheckCircle2 className="h-3 w-3" />
            case 'Upcoming': return <CalendarIcon className="h-3 w-3" />
            case 'Active': return <CheckCircle2 className="h-3 w-3" />
            case 'Completed': return <Check className="h-3 w-3" />
            case 'Cancelled': return <X className="h-3 w-3" />
            default: return null
        }
    }

    const parseDate = (dateString: string | undefined | null): Date => {
        console.log(`og date: ${selectedRental?.startDate}`);

        // Check if dateString is undefined, null, or empty
        if (!dateString || dateString.trim() === '') {
            console.warn('parseDate received invalid input:', dateString);
            return new Date(); // Return current date as fallback
        }

        //trying to parse the date to ISO format
        let date = parseISO(dateString);
        console.log(`iso parsed date: ${date}`);

        if (!isValid(date)) {
            date = new Date(dateString);
            console.log(`new date: ${date}`);
        }

        if (!isValid(date)) {
            const parts = dateString.split('-');
            if (parts.length === 3) {
                date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            }
            console.log(`manual parse date: ${date}`);
        }

        // If all attempts fail, return current date as fallback
        if (!isValid(date)) {
            console.error('All date parsing attempts failed for:', dateString);
            return new Date();
        }

        return date;
    }

    const formatDate = (dateString: string, formatString: string): string => {
        try {
            const date = parseDate(dateString);
            return format(date, formatString);
        } catch (error) {
            console.error(`error formating date: ${dateString}`, error);
            return dateString || 'Invalid Date';
        }
    }

    const calculateDays = (startDateStr: string, endDateStr: string): number => {
        try {
            const startDate = parseDate(startDateStr);
            const endDate = parseDate(endDateStr);
            const diffTime = endDate.getTime() - startDate.getTime();
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        } catch (error) {
            console.error(`error calculate days between start and end dates: ${error}`);
            return 1;
        }
    }

    const formatVND = (amount: number): string => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    const totalCost = selectedRental
        ? formatVND(selectedRental.pricePerDay * calculateDays(selectedRental.startDate, selectedRental.endDate))
        : formatVND(0);
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {selectedRental?.status === 'Upcoming' ? 'Approve Rental Pickup' : 'Rental Details'}
                    </DialogTitle>
                    <DialogDescription>
                        {selectedRental?.status === 'Active'
                            ? 'Confirm that the customer has picked up the bike and all requirements are met.'
                            : 'View detailed information about this rental.'
                        }
                    </DialogDescription>
                </DialogHeader>

                {selectedRental && (
                    <div className="space-y-4">
                        {/* Customer Information */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-medium mb-2">Customer Information</h4>
                                <div className="space-y-1 text-sm">
                                    <p><strong>Name:</strong> {selectedRental.customerName}</p>
                                    <p><strong>Email:</strong> {selectedRental.customerEmail}</p>
                                    <p><strong>Order Date:</strong>{formatDate(selectedRental.startDate, "MMM d, yyyy HH:mm")}</p>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">Rental Information</h4>
                                <div className="space-y-1 text-sm">
                                    <p><strong>Bike:</strong> {selectedRental.bikeName}</p>
                                    <p><strong>Location:</strong> {selectedRental.pickupLocation}</p>
                                    <p><strong>Total Cost:</strong> ${totalCost}</p>
                                </div>
                            </div>
                        </div>

                        {/* Rental Period */}
                        <div>
                            <h4 className="font-medium mb-2">Rental Period</h4>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                    <span><strong>Start:</strong> {format(new Date(selectedRental.startDate), "MMM d, yyyy")}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                    <span><strong>End:</strong> {format(new Date(selectedRental.endDate), "MMM d, yyyy")}</span>
                                </div>
                                <div>
                                    <strong>Duration:</strong> {Math.ceil((new Date(selectedRental.endDate).getTime() - new Date(selectedRental.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <h4 className="font-medium mb-2">Current Status</h4>
                            <Badge variant={getStatusBadgeVariant(selectedRental.status)} className="flex items-center gap-1 w-fit">
                                {getRentalStatusIcon(selectedRental.status)}
                                {selectedRental.status.charAt(0).toUpperCase() + selectedRental.status.slice(1)}
                            </Badge>
                        </div>

                        {selectedRental.status === 'Upcoming' && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <h4 className="font-medium text-yellow-800 mb-2">Approval Checklist</h4>
                                <ul className="text-sm text-yellow-700 space-y-1">
                                    <li>✓ Customer ID verified</li>
                                    <li>✓ Driving license checked</li>
                                    <li>✓ Payment processed</li>
                                    <li>✓ Bike condition documented</li>
                                    <li>✓ Safety equipment provided</li>
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                    {selectedRental?.status === 'Upcoming' && (
                        <>
                            <Button
                                variant="destructive"
                                onClick={() => selectedRental && onReject(selectedRental.id)}
                                disabled={isLoading}
                            >
                                <X className="h-4 w-4 mr-2" />
                                Reject Rental
                            </Button>
                            <Button
                                onClick={() => selectedRental && onApprove(selectedRental.id)}
                                disabled={isLoading}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <Check className="h-4 w-4 mr-2" />
                                {isLoading ? 'Approving...' : 'Approve Pickup'}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}