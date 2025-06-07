import { useState } from 'react'
import { format } from 'date-fns'
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
    Clock,
    CheckCircle2,
} from 'lucide-react'

interface Rental {
    id: string
    customerId: string
    customerName: string
    customerEmail: string
    bikeName: string
    bikeId: string
    startDate: string
    endDate: string
    status: 'pending' | 'active' | 'completed' | 'cancelled'
    totalCost: number
    location: string
    orderDate: string
}

interface RentalManagementTabProps {
    rentals: Rental[]
    onOpenApproval: (rental: Rental) => void
    onRejectRental: (rentalId: string) => void
}

export default function RentalManagementTab({
    rentals,
    onOpenApproval,
    onRejectRental
}: RentalManagementTabProps) {
    const [rentalFilter, setRentalFilter] = useState<'all' | 'pending' | 'active' | 'completed' | 'cancelled'>('all')

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'pending': return 'secondary'
            case 'active': return 'default'
            case 'completed': return 'outline'
            case 'cancelled': return 'destructive'
            default: return 'outline'
        }
    }

    const getRentalStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="h-3 w-3" />
            case 'active': return <CheckCircle2 className="h-3 w-3" />
            case 'completed': return <Check className="h-3 w-3" />
            case 'cancelled': return <X className="h-3 w-3" />
            default: return null
        }
    }

    const filteredRentals = rentals.filter(rental => {
        const matchesFilter = rentalFilter === 'all' || rental.status === rentalFilter
        return matchesFilter
    })

    const sortedRentals = filteredRentals.sort((a, b) => {
        const statusOrder = { pending: 4, active: 3, completed: 2, cancelled: 1 }

        if (a.status !== b.status) {
            return statusOrder[b.status] - statusOrder[a.status]
        }

        return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
    })

    return (
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
                            onChange={(e) => setRentalFilter(e.target.value as any)}
                            className="px-3 py-2 border rounded-md"
                        >
                            <option value="all">All Rentals</option>
                            <option value="pending">Pending Approval ({rentals.filter(r => r.status === 'pending').length})</option>
                            <option value="active">Active ({rentals.filter(r => r.status === 'active').length})</option>
                            <option value="completed">Completed ({rentals.filter(r => r.status === 'completed').length})</option>
                            <option value="cancelled">Cancelled ({rentals.filter(r => r.status === 'cancelled').length})</option>
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
                            sortedRentals.map((rental) => (
                                <TableRow
                                    key={rental.id}
                                    className={`${rental.status === 'pending' ? 'bg-yellow-50 hover:bg-yellow-100' : 'hover:bg-muted/50'}`}
                                >
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{rental.customerName}</div>
                                            <div className="text-sm text-muted-foreground">{rental.customerEmail}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{rental.bikeName}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3 text-muted-foreground" />
                                            {rental.location}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <div className="flex items-center gap-1">
                                                <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                                                {format(new Date(rental.startDate), "MMM d")} - {format(new Date(rental.endDate), "MMM d, yyyy")}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {Math.ceil((new Date(rental.endDate).getTime() - new Date(rental.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusBadgeVariant(rental.status)} className="flex items-center gap-1 w-fit">
                                            {getRentalStatusIcon(rental.status)}
                                            {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">${rental.totalCost}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {rental.status === 'pending' ? (
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
                                                        onClick={() => onRejectRental(rental.id)}
                                                    >
                                                        <X className="h-4 w-4 mr-1" />
                                                        Reject
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => onOpenApproval(rental)}
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View Details
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}