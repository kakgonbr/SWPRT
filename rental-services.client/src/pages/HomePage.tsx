// src/pages/HomePage.tsx
import {Link} from 'react-router-dom'
import {Search, Bike, MapPin, Star, Shield, Clock} from 'lucide-react'
import {Button} from '../components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../components/ui/card'
import {MOCK_BIKES} from '../lib/mock-data'

export default function HomePage() {
    const featuredBikes = MOCK_BIKES.slice(0, 3)

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
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" asChild>
                            <Link to="/bikes">
                                <Search className="w-5 h-5 mr-2"/>
                                Browse Bikes
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link to="/location-finder">
                                <MapPin className="w-5 h-5 mr-2"/>
                                Find Locations
                            </Link>
                        </Button>
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
                                <Shield className="w-10 h-10 text-primary mb-4"/>
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
                                <Clock className="w-10 h-10 text-primary mb-4"/>
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
                                <MapPin className="w-10 h-10 text-primary mb-4"/>
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
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1"/>
                                        {bike.rating}
                                        <span className="mx-2">•</span>
                                        <MapPin className="w-4 h-4 mr-1"/>
                                        {bike.location}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                        {bike.description}
                                    </p>
                                    <Button className="w-full" asChild>
                                        <Link to={`/bikes/${bike.id}`}>
                                            <Bike className="w-4 h-4 mr-2"/>
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