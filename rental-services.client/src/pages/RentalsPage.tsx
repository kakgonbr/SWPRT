// src/pages/RentalsPage.tsx
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
    History,
    CalendarClock,
    Bike as BikeIcon,
    CalendarCheck2,
    CalendarX2,
    DollarSign
} from 'lucide-react'
import { Button } from '../components/ui/button'
// @ts-ignore
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Badge } from '../components/ui/badge'
import { format } from 'date-fns'
import { useAuth } from '../contexts/auth-context'
import { MOCK_RENTALS } from '../lib/mock-data'
import type { Rental } from '../lib/types'

export default function RentalsPage() {
    const navigate = useNavigate()
    const { user, isAuthenticated, loading } = useAuth()
    const [rentals, setRentals] = useState<Rental[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (loading) return

        if (!isAuthenticated) {
            navigate('/auth/login')
            return
        }

        // Filter rentals for current user
        setTimeout(() => {
            const userRentals = MOCK_RENTALS.filter(r => r.userId === user?.id)
                .sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime())

            setRentals(userRentals)
            setIsLoading(false)
        }, 500)
    }, [user, isAuthenticated, loading, navigate])

    const upcomingRentals = rentals.filter(r => r.status === 'Upcoming' || r.status === 'Active')
    const pastRentals = rentals.filter(r => r.status === 'Completed' || r.status === 'Cancelled')

    const RentalCard = ({ rental }: { rental: Rental }) => (
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <CardHeader className="p-0 relative">
                <div className="aspect-[16/7] relative w-full">
                    <img
                        src={rental.bikeImageUrl.split('"')[0]}
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
                    Order Placed: {format(rental.orderDate, "PPP")}
                </p>
                <p className="text-sm text-foreground/80 mb-1">
                    <CalendarClock className="inline w-4 h-4 mr-1.5 text-muted-foreground" />
                    {format(rental.startDate, "MMM d, yyyy")} - {format(rental.endDate, "MMM d, yyyy")}
                </p>
                <p className="text-sm text-foreground/80 mb-2">
                    <DollarSign className="inline w-4 h-4 mr-1.5 text-muted-foreground" />
                    Total: ${rental.totalPrice.toFixed(2)}
                </p>
                {rental.options.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                        Options: {rental.options.join(', ')}
                    </p>
                )}
            </CardContent>
            <CardFooter className="p-4 border-t">
                <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to={`/bikes/${rental.bikeId}`}>View Bike Details</Link>
                </Button>
            </CardFooter>
        </Card>
    )

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
        </div>
    )
}