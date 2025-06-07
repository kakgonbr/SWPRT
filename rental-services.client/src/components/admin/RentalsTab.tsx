import { useState } from 'react'
import { Eye, Search, Filter } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select'
import { MOCK_RENTALS } from '../../lib/mock-data'
import { format } from 'date-fns'
import RentalDetailsDialog from './RentalDetailsDialog '

export interface Rental {
    id: string
    bikeName: string
    bikeImageUrl: string
    // customerName: string
    // customerEmail: string
    customerPhone?: string
    startDate: Date
    endDate: Date
    orderDate: Date
    totalPrice: number
    status: 'Upcoming' | 'Active' | 'Completed' | 'Cancelled'
    pickupLocation?: string
    returnLocation?: string
    paymentMethod?: string
    paymentStatus?: 'Pending' | 'Paid' | 'Failed' | 'Refunded'
    notes?: string
    pricePerDay?: number
    totalDays?: number
    deposit?: number
    tax?: number
    discount?: number
}

export default function RentalsTab() {
    const [rentals] = useState<Rental[]>(MOCK_RENTALS)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
    const [selectedRental, setSelectedRental] = useState<Rental | null>(null)

    // Filter rentals based on search term and status
    const filteredRentals = rentals.filter(rental => {
        const matchesSearch =
            rental.bikeName.toLowerCase().includes(searchTerm.toLowerCase())
        // rental.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        // rental.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === 'all' || rental.status === statusFilter

        return matchesSearch && matchesStatus
    })

    const handleViewDetails = (rental: Rental) => {
        setSelectedRental(rental)
        setIsDetailsDialogOpen(true)
    }

    const handleCloseDetails = () => {
        setIsDetailsDialogOpen(false)
        setSelectedRental(null)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return 'default'
            case 'Completed': return 'secondary'
            case 'Upcoming': return 'outline'
            case 'Cancelled': return 'destructive'
            default: return 'outline'
        }
    }

    const getPaymentStatusColor = (status?: string) => {
        switch (status) {
            case 'Paid': return 'default'
            case 'Pending': return 'outline'
            case 'Failed': return 'destructive'
            case 'Refunded': return 'secondary'
            default: return 'outline'
        }
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Rental Management</CardTitle>
                            <CardDescription>Monitor and manage all rentals</CardDescription>
                        </div>
                        <Badge variant="outline" className="text-sm">
                            {filteredRentals.length} rental{filteredRentals.length !== 1 ? 's' : ''}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Search and Filter Controls */}
                    <div className="flex gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search by bike name, customer name, or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-48">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="Upcoming">Upcoming</SelectItem>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Rentals List */}
                    <div className="space-y-4">
                        {filteredRentals.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'No rentals found matching your criteria.'
                                    : 'No rentals available.'}
                            </div>
                        ) : (
                            filteredRentals.map((rental) => (
                                <div key={rental.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <img
                                            src={rental.bikeImageUrl.split('"')[0]}
                                            alt={rental.bikeName}
                                            className="w-16 h-16 object-cover rounded"
                                            onError={(e) => {
                                                e.currentTarget.src = '/placeholder-bike.png'
                                            }}
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-sm">{rental.bikeName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Customer: {rental.customerPhone}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(rental.startDate, 'MMM d')} - {format(rental.endDate, 'MMM d, yyyy')}
                                            </p>
                                            <p className="text-sm font-medium text-green-600">
                                                ${rental.totalPrice.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="text-right">
                                            <Badge variant={getStatusColor(rental.status)} className="mb-1">
                                                {rental.status}
                                            </Badge>
                                            {rental.paymentStatus && (
                                                <div>
                                                    <Badge
                                                        variant={getPaymentStatusColor(rental.paymentStatus)}
                                                        className="text-xs"
                                                    >
                                                        {rental.paymentStatus}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewDetails(rental)}
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            Details
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Rental Details Dialog */}
            <RentalDetailsDialog
                isOpen={isDetailsDialogOpen}
                onClose={handleCloseDetails}
                rental={selectedRental}
            />
        </>
    )
}