// src/pages/HomePage.tsx
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Search, Bike, MapPin, Star, Shield, Clock, Calendar, ArrowRight } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { useToast } from '../contexts/toast-context'
import { MOCK_BIKES } from '../lib/mock-data'

export default function HomePage() {
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [location, setLocation] = useState('')
    const navigate = useNavigate()
    const { toast } = useToast()
    const featuredBikes = MOCK_BIKES.slice(0, 3)

    const calculateDays = () => {
        if (!startDate || !endDate) return 0
        const start = new Date(startDate)
        const end = new Date(endDate)
        const diffTime = Math.abs(end.getTime() - start.getTime())
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    const handleSearchBikes = () => {
        if (!startDate || !endDate) {
            toast({
                title: "Please select dates",
                description: "Choose your rental start and end dates to continue.",
                variant: "destructive"
            })
            return
        }

        if (new Date(startDate) >= new Date(endDate)) {
            toast({
                title: "Invalid dates",
                description: "End date must be after start date.",
                variant: "destructive"
            })
            return
        }

        // Navigate to bikes page with search parameters
        const searchParams = new URLSearchParams({
            startDate,
            endDate,
            ...(location && { location })
        })
        navigate(`/bikes?${searchParams.toString()}`)
    }

    const totalDays = calculateDays()

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        Explore Vietnam on Two Wheels
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Discover the freedom of the open road with our premium motorbike rentals.
                        From city scooters to adventure bikes, we have the perfect ride for every journey.
                    </p>

                    {/* Enhanced Rental Booking Card */}
                    <Card className="max-w-4xl mx-auto mb-8 shadow-xl bg-white/95 backdrop-blur-sm">
                        <CardHeader className="text-center pb-4">
                            <CardTitle className="text-2xl text-primary flex items-center justify-center gap-2">
                                <Calendar className="w-6 h-6" />
                                Plan Your Adventure
                            </CardTitle>
                            <CardDescription className="text-base">
                                Choose your dates and location to find the perfect bike
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Date Selection Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="start-date" className="text-sm font-semibold">
                                        Pickup Date
                                    </Label>
                                    <Input
                                        id="start-date"
                                        type="date"
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="h-12 text-base"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end-date" className="text-sm font-semibold">
                                        Return Date
                                    </Label>
                                    <Input
                                        id="end-date"
                                        type="date"
                                        value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                        min={startDate || new Date().toISOString().split('T')[0]}
                                        disabled={!startDate}
                                        className="h-12 text-base"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location" className="text-sm font-semibold">
                                        Pickup Location (Optional)
                                    </Label>
                                    <Input
                                        id="location"
                                        type="text"
                                        placeholder="Ho Chi Minh City, Hanoi..."
                                        value={location}
                                        onChange={e => setLocation(e.target.value)}
                                        className="h-12 text-base"
                                    />
                                </div>
                            </div>

                            {/* Rental Summary */}
                            {totalDays > 0 && (
                                <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Rental Duration:</span>
                                        <span className="font-semibold text-primary">
                                            {totalDays} day{totalDays !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    {location && (
                                        <div className="flex items-center justify-between text-sm mt-1">
                                            <span className="text-muted-foreground">Location:</span>
                                            <span className="font-medium">{location}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    size="lg"
                                    onClick={handleSearchBikes}
                                    className="flex-1 h-14 text-lg font-semibold"
                                >
                                    <Search className="w-5 h-5 mr-2" />
                                    Find Available Bikes
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    asChild
                                    className="flex-1 h-14 text-lg"
                                >
                                    <Link to="/location-finder">
                                        <MapPin className="w-5 h-5 mr-2" />
                                        View Locations
                                    </Link>
                                </Button>
                            </div>

                            {/* Quick Tips */}
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    💡 <strong>Pro tip:</strong> Book 24+ hours in advance for the best selection and prices
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary">100+</div>
                            <div className="text-sm text-muted-foreground">Bikes Available</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary">15+</div>
                            <div className="text-sm text-muted-foreground">Cities Covered</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary">4.8★</div>
                            <div className="text-sm text-muted-foreground">Customer Rating</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Why Choose VroomVroom?</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            We make motorbike rental simple, safe, and affordable for everyone.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card>
                            <CardHeader>
                                <Shield className="w-10 h-10 text-primary mb-4" />
                                <CardTitle>Safe & Reliable</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>
                                    All our bikes are regularly maintained and safety-checked.
                                    Full insurance coverage available.
                                </CardDescription>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <Clock className="w-10 h-10 text-primary mb-4" />
                                <CardTitle>Quick & Easy</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>
                                    Book online in minutes. Skip the paperwork with our
                                    streamlined digital rental process.
                                </CardDescription>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <MapPin className="w-10 h-10 text-primary mb-4" />
                                <CardTitle>Multiple Locations</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>
                                    Pick up and drop off at convenient locations across Vietnam.
                                    City centers to mountain passes.
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Featured Bikes Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Featured Bikes</h2>
                        <p className="text-muted-foreground">
                            Popular choices for every type of rider
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {featuredBikes.map((bike) => (
                            <Card key={bike.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="aspect-video relative">
                                    <img
                                        src={bike.imageUrl.split('"')[0]}
                                        alt={bike.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <CardHeader>
                                    <CardTitle className="flex justify-between items-start">
                                        <span>{bike.name}</span>
                                        <span className="text-primary font-bold">${bike.pricePerDay}/day</span>
                                    </CardTitle>
                                    <CardDescription className="flex items-center">
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                                        {bike.rating}
                                        <span className="mx-2">•</span>
                                        <MapPin className="w-4 h-4 mr-1" />
                                        {bike.location}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                        {bike.description}
                                    </p>
                                    <Button className="w-full" asChild>
                                        <Link to={`/bikes/${bike.id}`}>
                                            <Bike className="w-4 h-4 mr-2" />
                                            View Details
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="text-center mt-8">
                        <Button variant="outline" size="lg" asChild>
                            <Link to="/bikes">View All Bikes</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-primary">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-primary-foreground mb-4">
                        Ready to Start Your Adventure?
                    </h2>
                    <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                        Join thousands of riders who trust VroomVroom for their Vietnamese adventures.
                        Book your perfect bike today!
                    </p>
                    <Button size="lg" variant="secondary" asChild>
                        <Link to="/auth/signup">
                            Get Started Now
                        </Link>
                    </Button>
                </div>
            </section>
        </div>
    )
}