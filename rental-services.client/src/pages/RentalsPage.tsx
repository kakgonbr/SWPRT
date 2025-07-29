// src/pages/RentalsPage.tsx
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
    History,
    CalendarClock,
    Bike as BikeIcon,
    CalendarCheck2,
    CalendarX2,
    DollarSign,
    X,
    AlertTriangle,
    Bug // Add this import
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Badge } from '../components/ui/badge'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../components/ui/alert-dialog'
import { useToast } from '../contexts/toast-context'
import { format, differenceInHours } from 'date-fns'
import { useAuth } from '../contexts/auth-context'
//import { MOCK_RENTALS } from '../lib/mock-data'
//import type { Rental } from '../lib/types'
//import ReportIssueDialog from '../components/customer/ReportIssueDialog'

const API = import.meta.env.VITE_API_BASE_URL;

export interface Peripheral {
    peripheralId: number
    name?: string | null
    ratePerDay?: number | null
}

export interface Rental {
    id: string
    bikeName: string
    vehicleModelId: number
    bikeImageUrl: string
    customerName: string
    customerEmail: string
    customerPhone?: string
    startDate: Date
    endDate: Date
    orderDate?: Date
    status: 'Awaiting Payment' | 'Upcoming' | 'Active' | 'Completed' | 'Cancelled'
    pricePerDay: number
    peripherals: Peripheral[]
    pickupLocation?: string
    returnLocation?: string
    paymentMethod?: string
    notes?: string
    deposit?: number
    tax?: number
    discount?: number

    totalPrice?: number
}

export default function RentalsPage() {
    const navigate = useNavigate()
    const { user, isAuthenticated, loading } = useAuth()
    const { toast } = useToast()
    const [rentals, setRentals] = useState<Rental[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [cancellingRental, setCancellingRental] = useState<string | null>(null)
    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [rentalToCancel, setRentalToCancel] = useState<Rental | null>(null)
    // Add report dialog state
    //const [showReportDialog, setShowReportDialog] = useState(false)
    //const [rentalToReport, setRentalToReport] = useState<Rental | null>(null)

    const formatVND = (amount: number): string => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    useEffect(() => {
        if (loading) return

        if (!isAuthenticated) {
            navigate('/auth/login')
            return
        }

        // https://sandbox.vnpayment.vn/tryitnow/Home/VnPayReturn?vnp_Amount=1000000&vnp_BankCode=VISA&vnp_BankTranNo=7521678280776603703607&vnp_CardType=VISA&vnp_OrderInfo=Thanh+toan+don+hang+thoi+gian%3A+2025-07-11+00%3A15%3A05&vnp_PayDate=20250711001754&vnp_ResponseCode=00&vnp_TmnCode=CTTVNP01&vnp_TransactionNo=15067165&vnp_TransactionStatus=00&vnp_TxnRef=259296

        const params = new URLSearchParams(location.search);

        const status: string | null = params.get("vnp_TransactionStatus")

        if (status === "00") {
            toast({
                title: "Booking Confirmed!",
                description: `Your rental has been confirmed.`,
            })
        } else if (status !== null) {
            toast({
                title: "Booking Failed",
                description: `There was an error processing your booking. Please try again.`,
                variant: "destructive",
            })
        }

        const fetchRentals = async () => {
            await fetch(`${API}/api/rentals/${user?.userId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch rentals: ' + response.statusText);
                return response.json();
            })
            .then((data: Rental[]) => {
                setRentals(() =>
                    data.map((rental) => {
                        const start = new Date(rental.startDate);
                        const end = new Date(rental.endDate);

                        const millisecondsPerDay = 1000 * 60 * 60 * 24;
                        const durationInDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / millisecondsPerDay));

                        const basePrice = rental.pricePerDay * durationInDays;

                        const peripheralsTotal =
                            rental.peripherals?.reduce((sum, peripheral) => {
                                const rate = peripheral.ratePerDay ?? 0;
                                return sum + rate * durationInDays;
                            }, 0) ?? 0;

                        const tax = rental.tax ?? 0;
                        const deposit = rental.deposit ?? 0;
                        const discount = rental.discount ?? 0;

                        const totalPrice = basePrice + peripheralsTotal + tax + deposit - discount;

                        return {
                            ...rental,
                            totalPrice: Math.max(0, totalPrice),
                        };
                    })
                );
            })
            .catch((err) => {
                setRentals([]);

                toast({
                    title: "Fetch failed",
                    description: `There was an error fetching bookings: ${err.message}. Please try again.`,
                    variant: "destructive",
                })
            })
            .finally(() => setIsLoading(false));
        }

        fetchRentals();

        

        // Filter rentals for current user
        //setTimeout(() => {
        //    const userRentals = MOCK_RENTALS.filter(r => r.userId === user?.userId)
        //        .sort((a, b) => a.orderDate && b.orderDate ? b.orderDate.getTime() - a.orderDate.getTime() : 0)

        //    setRentals(userRentals)
        //    setIsLoading(false)
        //}, 500)

        
            
    }, [user, isAuthenticated, loading, navigate, toast])

    const upcomingRentals = rentals.filter(r => r.status === 'Upcoming' || r.status === 'Active' || r.status === 'Awaiting Payment')
    const pastRentals = rentals.filter(r => r.status === 'Completed' || r.status === 'Cancelled')

    const handleCancelClick = (rental: Rental) => {
        setRentalToCancel(rental)
        setShowCancelDialog(true)
    }

    // Add report handler
    const handleReportClick = (rental: Rental) => {
        //setRentalToReport(rental)
        //setShowReportDialog(true)
        console.log(rental);
    }

    const handleConfirmCancel = async () => {
        if (!rentalToCancel) return

        setCancellingRental(rentalToCancel.id)
        setShowCancelDialog(false)

        try {
            let response: Response;
            try {
                response = await fetch(`${API}/api/rentals/cancel/${rentalToCancel.id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("token")}`
                    }
                });
            } catch (networkError) {
                console.error(networkError);
                toast({
                    title: 'Network Error',
                    description: 'Unable to reach server. Please try again later.',
                    variant: "destructive"
                });
                return;
            }

            if (response.status === 400) {
                toast({ title: 'Cancellation Failed', description: "Your data may be out of date, please refresh the page.", variant: "destructive" });
                return;
            }

            if (response.status !== 200) {
                toast({
                    title: 'Server Error',
                    description: `Unexpected response (${response.status}).`,
                    variant: "destructive"
                });
                return;
            }

            setRentals(prev => prev.map(rental =>
                rental.id === rentalToCancel.id
                    ? { ...rental, status: 'Cancelled' as const }
                    : rental
            ))

            const hoursUntilStart = differenceInHours(rentalToCancel.startDate, new Date())
            const refundPercentage = hoursUntilStart >= 24 ? 100 : hoursUntilStart >= 12 ? 50 : 0
            //const refundAmount = (rentalToCancel.totalPrice! * refundPercentage) / 100

            toast({
                title: "Rental Cancelled Successfully",
                description: refundPercentage > 0
                    ? `Your rental has been cancelled. You will receive a ${refundPercentage}% refund.`
                    : "Your rental has been cancelled. No refund is available for cancellations less than 12 hours before the start date.",
            })

        } catch (error) {
            console.error('Error cancelling rental:', error)
            toast({
                title: "Cancellation Failed",
                description: "Failed to cancel rental. Please try again or contact support.",
                variant: "destructive"
            })
        } finally {
            setCancellingRental(null)
            setRentalToCancel(null)
        }
    }

    const canCancelRental = (rental: Rental) => {
        // Can only cancel upcoming rentals, not active ones
        return rental.status === 'Upcoming'
    }

    // Add function to check if report is allowed
    const canReportIssue = (rental: Rental) => {
        // Allow reporting for active or completed rentals
        return rental.status === 'Active' || rental.status === 'Completed'
    }

    const getCancellationPolicy = (rental: Rental) => {
        const hoursUntilStart = differenceInHours(rental.startDate, new Date())

        if (hoursUntilStart >= 24) {
            return { refundPercentage: 100, message: "Full refund" }
        } else if (hoursUntilStart >= 12) {
            return { refundPercentage: 50, message: "50% refund" }
        } else {
            return { refundPercentage: 0, message: "No refund" }
        }
    }

    const RentalCard = ({ rental }: { rental: Rental }) => {
        const cancellationPolicy = getCancellationPolicy(rental)
        const isCancelling = cancellingRental === rental.id

        return (
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <CardHeader className="p-0 relative">
                    <div className="aspect-[16/7] relative w-full">
                        <img
                            src={'images/' + rental.bikeImageUrl.split('"')[0]}
                            alt={rental.bikeName}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <Badge
                        className="absolute top-2 right-2"
                        variant={
                            rental.status === 'Completed' ? 'default' :
                                rental.status === 'Upcoming' ? 'secondary' :
                                    rental.status === 'Active' ? 'default' :
                                        'destructive'
                        }
                        style={rental.status === 'Active' ? { backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' } : {}}
                    >
                        {rental.status}
                    </Badge>
                </CardHeader>
                <CardContent className="p-4">
                    <CardTitle className="text-xl font-semibold mb-1 text-primary truncate">
                        {rental.bikeName}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mb-2">
                        {rental.orderDate ? "Order Placed:" + format(rental.orderDate, "PPP") : "Not paid"}
                    </p>
                    <p className="text-sm text-foreground/80 mb-1">
                        <CalendarClock className="inline w-4 h-4 mr-1.5 text-muted-foreground" />
                        {format(rental.startDate, "MMM d, yyyy")} - {format(rental.endDate, "MMM d, yyyy")}
                    </p>
                    <p className="text-sm text-foreground/80 mb-2">
                        <DollarSign className="inline w-4 h-4 mr-1.5 text-muted-foreground" />
                        {/*Total: ${rental.totalPrice!.toFixed(2)}*/}
                        Total: {formatVND(rental.totalPrice || 0)}
                    </p>
                    {rental.peripherals.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                            Options: {rental.peripherals.map(p => p.name).join(', ')}
                        </p>
                    )}

                    {/* Cancellation Policy Info */}
                    {canCancelRental(rental) && (
                        <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
                            <p className="text-blue-800">
                                <strong>Cancellation:</strong> {cancellationPolicy.message}
                            </p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="p-4 border-t space-y-2">
                    <div className="flex gap-2 w-full">

                        {rental.status === 'Awaiting Payment' ?  
                            (
                                <Button variant="outline"
                                    size="sm"
                                    className="flex-1 text-orange-600 border-orange-200 hover:bg-orange-50" onClick={async () => {
                                    try {
                                        const response = await fetch(`${API}/api/rentals/pay`, {
                                            method: 'GET',
                                            headers: {
                                                Accept: 'text/plain',
                                                Authorization: `Bearer ${localStorage.getItem("token")}`
                                            }
                                        });

                                        if (!response.ok) {
                                            throw new Error(`API call failed with status ${response.status}`);
                                        }

                                        const rawText: string = await response.text();

                                        const result: string | null = rawText.trim().length > 0 ? rawText.trim() : null;

                                        if (result !== null) {
                                            window.location.href = result;
                                        } else {
                                            throw new Error("Cannot get payment URL.")
                                        }
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    } catch (error : any) {
                                        toast({
                                            title: "Payment link request failed",
                                            description: `There was an error requesting payment link: ${error.message}, please refresh the page.`,
                                            variant: "destructive",
                                        })
                                    }
                                }}>
                                Payment required
                                </Button>
                            )
                        :
                            (
                                <Button variant = "outline" size = "sm" className = "flex-1">
                                    <Link to={`/bikes/${rental.vehicleModelId}`}>View Details</Link>
                                </Button>
                            )}
                        

                        {/* Report Issue Button */}
                        {canReportIssue(rental) && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReportClick(rental)}
                                className="flex-1 text-orange-600 border-orange-200 hover:bg-orange-50"
                            >
                                <Bug className="w-4 w-4 mr-1" />
                                Report Issue
                            </Button>
                        )}

                        {canCancelRental(rental) && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleCancelClick(rental)}
                                disabled={isCancelling}
                                className="flex-1"
                            >
                                {isCancelling ? (
                                    <>Cancelling...</>
                                ) : (
                                    <>
                                        <X className="w-4 h-4 mr-1" />
                                        Cancel
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </CardFooter>
            </Card>
        )
    }

    if (loading || isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null // Will redirect
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-primary mb-2 flex items-center">
                    <History className="w-10 h-10 mr-3" />
                    Rental History
                </h1>
                <p className="text-muted-foreground text-lg">
                    View your past and upcoming motorbike rentals.
                </p>
            </div>

            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:w-1/2 mb-6">
                    <TabsTrigger value="upcoming">
                        <CalendarCheck2 className="w-4 h-4 mr-2" />
                        Upcoming/Active ({upcomingRentals.length})
                    </TabsTrigger>
                    <TabsTrigger value="past">
                        <CalendarX2 className="w-4 h-4 mr-2" />
                        Past Rentals ({pastRentals.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming">
                    {upcomingRentals.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {upcomingRentals.map(rental => (
                                <RentalCard key={rental.id} rental={rental} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-card rounded-lg shadow-md">
                            <BikeIcon className="mx-auto h-24 w-24 text-muted-foreground opacity-50 mb-4" />
                            <h2 className="text-2xl font-semibold text-muted-foreground">No Upcoming Rentals</h2>
                            <p className="text-foreground/70 mt-2">Ready for your next adventure?</p>
                            <Button onClick={() => navigate('/bikes')} className="mt-4">Browse Bikes</Button>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="past">
                    {pastRentals.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pastRentals.map(rental => (
                                <RentalCard key={rental.id} rental={rental} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-card rounded-lg shadow-md">
                            <History className="mx-auto h-24 w-24 text-muted-foreground opacity-50 mb-4" />
                            <h2 className="text-2xl font-semibold text-muted-foreground">No Past Rentals Yet</h2>
                            <p className="text-foreground/70 mt-2">Your completed rentals will appear here.</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Cancellation Confirmation Dialog */}
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Cancel Rental
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-3">
                            {rentalToCancel && (
                                <>
                                    <p>
                                        Are you sure you want to cancel your rental for <strong>{rentalToCancel.bikeName}</strong>?
                                    </p>
                                    <div className="p-3 bg-muted rounded-lg">
                                        <h4 className="font-medium mb-2">Rental Details:</h4>
                                        <p className="text-sm">
                                            <strong>Dates:</strong> {format(rentalToCancel.startDate, "MMM d, yyyy")} - {format(rentalToCancel.endDate, "MMM d, yyyy")}
                                        </p>
                                        <p className="text-sm">
                                            <strong>Total Paid:</strong> ${rentalToCancel.totalPrice!.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <h4 className="font-medium mb-2 text-blue-800">Refund Policy:</h4>
                                        <div className="text-sm text-blue-700">
                                            {(() => {
                                                const policy = getCancellationPolicy(rentalToCancel)
                                                //const refundAmount = (rentalToCancel.totalPrice! * policy.refundPercentage) / 100

                                                return (
                                                    <>
                                                        <p><strong>{policy.message}</strong></p>
                                                        {policy.refundPercentage > 0 && (
                                                            <p>You will receive:</p>
                                                        )}
                                                        <p className="mt-2 text-xs">
                                                            • 24+ hours before: 100% refund<br />
                                                            • 12-24 hours before: 50% refund<br />
                                                            • Less than 12 hours: No refund
                                                        </p>
                                                    </>
                                                )
                                            })()}
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        This action cannot be undone. The refund will be processed to your original payment method within 3-5 business days.
                                    </p>
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep Rental</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmCancel}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Yes, Cancel Rental
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Report Issue Dialog */}
            {/*TODO*/}
            {/*<ReportIssueDialog*/}
            {/*    isOpen={showReportDialog}*/}
            {/*    onClose={() => setShowReportDialog(false)}*/}
            {/*    rental={rentalToReport}*/}
            {/*    userInfo={{*/}
            {/*        id: String(user?.userId) || '',*/}
            {/*        name: user?.fullName || '',*/}
            {/*        email: user?.email || ''*/}
            {/*    }}*/}
            {/*/>*/}
        </div>
    )
}