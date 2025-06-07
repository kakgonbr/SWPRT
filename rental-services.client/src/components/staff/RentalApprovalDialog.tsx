import { format } from 'date-fns'
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
import { Check, X, Calendar as CalendarIcon, Clock, CheckCircle2 } from 'lucide-react'

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

interface RentalApprovalDialogProps {
    isOpen: boolean
    onClose: () => void
    selectedRental: Rental | null
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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {selectedRental?.status === 'pending' ? 'Approve Rental Pickup' : 'Rental Details'}
                    </DialogTitle>
                    <DialogDescription>
                        {selectedRental?.status === 'pending'
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
                                    <p><strong>Order Date:</strong> {format(new Date(selectedRental.orderDate), "MMM d, yyyy HH:mm")}</p>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">Rental Information</h4>
                                <div className="space-y-1 text-sm">
                                    <p><strong>Bike:</strong> {selectedRental.bikeName}</p>
                                    <p><strong>Location:</strong> {selectedRental.location}</p>
                                    <p><strong>Total Cost:</strong> ${selectedRental.totalCost}</p>
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

                        {selectedRental.status === 'pending' && (
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
                    {selectedRental?.status === 'pending' && (
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