import { useState } from 'react'
import { format, isValid } from 'date-fns'
import { parseISO } from "date-fns/parseISO"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '../ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../ui/table'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import {
    Check,
    X,
    Eye,
    MapPin,
    Calendar as CalendarIcon,
    CheckCircle2,
} from 'lucide-react'
import { type Booking, type BookingStatus } from '../../types/booking'
import RentalDetailsDialog from '../admin/RentalDetailsDialog';

interface RentalManagementTabProps {
    rentals: Booking[]
    onOpenApproval: (rental: Booking) => void
    onRejectRental: (rentalId: number) => void
}

export default function RentalManagementTab({
    rentals,
    onOpenApproval
}: RentalManagementTabProps) {
    const [rentalFilter, setRentalFilter] = useState<'all' | 'awaiting payment' | 'confirmed' | 'upcoming' | 'active' | 'completed' | 'cancelled'>('all')
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [selectedRentalForDetails, setSelectedRentalForDetails] = useState<Booking | null>(null);
    // Currency formatting function for VND
    const formatVND = (amount: number): string => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    const parseDate = (dateString: string | undefined | null): Date => {
        // Check if dateString is undefined, null, or empty
        if (!dateString || dateString.trim() === '') {
            console.warn('parseDate received invalid input:', dateString);
            return new Date(); // Return current date as fallback
        }
        //trying to parse the date to ISO format
        let date = parseISO(dateString);
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

    const getStatusBadgeVariant = (status: BookingStatus) => {
        switch (status) {
            case 'Awaiting Payment':
                return 'secondary'
            case 'Confirmed':
                return 'default'
            case 'Upcoming':
                return 'default'
            case 'Active':
                return 'default'
            case 'Completed':
                return 'outline'
            case 'Cancelled':
                return 'destructive'
            default:
                return 'outline'
        }
    }

    const getRentalStatusIcon = (status: BookingStatus) => {
        switch (status) {
            //case 'Awaiting Payment': return <Calendar className="h-3 w-3" />
            case 'Confirmed':
                return <CheckCircle2 className="h-3 w-3" />
            case 'Upcoming':
                return <CalendarIcon className="h-3 w-3" />
            case 'Active':
                return <CheckCircle2 className="h-3 w-3" />
            case 'Completed':
                return <Check className="h-3 w-3" />
            case 'Cancelled':
                return <X className="h-3 w-3" />
            default:
                return null
        }
    }

    const handleOpenViewDetails = (rental: Booking) => {
        setSelectedRentalForDetails(rental);
        setIsDetailsDialogOpen(true);
    }

    const handleCloseViewDetails = () => {
        setIsDetailsDialogOpen(false);
        setSelectedRentalForDetails(null);
    }


    const filteredRentals = rentals.filter(rental => {
        const matchesFilter = rentalFilter === 'all' || rental.status.toLowerCase().replace(' ', ' ') === rentalFilter;
        return matchesFilter
    })

    const sortedRentals = filteredRentals.sort((a, b) => {
        const statusOrder: Record<BookingStatus, number> = {
            'Awaiting Payment': 6,
            'Confirmed': 5,
            'Upcoming': 4,
            'Active': 3,
            'Completed': 2,
            'Cancelled': 1
        }

        if (a.status !== b.status) {
            return statusOrder[b.status] - statusOrder[a.status]
        }

        // Use StartDate instead of OrderDate which may not exist
        const aDate = a.orderDate || a.startDate
        const bDate = b.orderDate || b.startDate

        // Add null checks before parsing dates
        if (!aDate && !bDate) return 0;
        if (!aDate) return 1;
        if (!bDate) return -1;

        return parseDate(bDate).getTime() - parseDate(aDate).getTime();
    })

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Rental Management</CardTitle>
                            <CardDescription>
                                Monitor and manage rental bookings ({filteredRentals.length} rentals)
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={rentalFilter}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                onChange={(e) => setRentalFilter(e.target.value as any)}
                                className="px-3 py-2 border rounded-md"
                            >
                                <option value="all">All Rentals</option>
                                {/*<option value="awaiting payment">Awaiting Payment ({rentals.filter(r => r.status === 'Awaiting Payment').length})</option>*/}
                                <option value="confirmed">Confirmed
                                    ({rentals.filter(r => r.status === 'Confirmed').length})
                                </option>
                                <option value="upcoming">Upcoming
                                    ({rentals.filter(r => r.status === 'Upcoming').length})
                                </option>
                                <option value="active">Active ({rentals.filter(r => r.status === 'Active').length})
                                </option>
                                <option value="completed">Completed
                                    ({rentals.filter(r => r.status === 'Completed').length})
                                </option>
                                <option value="cancelled">Cancelled
                                    ({rentals.filter(r => r.status === 'Cancelled').length})
                                </option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Bike</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Rental Period</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Total Cost</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedRentals.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No rentals found matching your criteria
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sortedRentals.map((rental) => {
                                    const days = calculateDays(rental.startDate, rental.endDate);
                                    const totalCost = rental.pricePerDay * days;
                                    return (
                                        <TableRow
                                            key={rental.id}
                                            className={`${rental.status === 'Active' ? 'bg-yellow-50 hover:bg-yellow-100' : 'hover:bg-muted/50'}`}
                                        >
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{rental.customerName}</div>
                                                    <div
                                                        className="text-sm text-muted-foreground">{rental.customerEmail}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{rental.bikeName}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3 text-muted-foreground" />
                                                    {rental.pickupLocation}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                                                        {formatDate(rental.startDate, "MMM d")} - {formatDate(rental.endDate, "MMM d, yyyy")}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {days} days
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadgeVariant(rental.status)}
                                                    className="flex items-center gap-1 w-fit">
                                                    {getRentalStatusIcon(rental.status)}
                                                    {rental.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">{formatVND(totalCost)}</TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    {rental.status === 'Upcoming' ? (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => onOpenApproval(rental)}
                                                                className="bg-green-600 hover:bg-green-700"
                                                            >
                                                                <Check className="h-4 w-4 mr-1" />
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => onOpenApproval(rental)}
                                                            >
                                                                <X className="h-4 w-4 mr-1" />
                                                                Reject
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleOpenViewDetails(rental)}
                                                        >
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            View Details
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                }
                                )
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {selectedRentalForDetails && (
                <RentalDetailsDialog isOpen={isDetailsDialogOpen} onClose={handleCloseViewDetails}
                    rental={selectedRentalForDetails} />
            )}
        </>
    )
}