// src/pages/BikesPage.tsx
import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
//@ts-ignore

import { Search, Filter, MapPin, Star } from 'lucide-react'
import { Bike as BikeIcon } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { MOCK_BIKES } from '../lib/mock-data'
import type { Bike } from '../lib/types'

export default function BikesPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedType, setSelectedType] = useState<string>('all')
    const [selectedLocation, setSelectedLocation] = useState<string>('all')
    const [sortBy, setSortBy] = useState<string>('name')

    // Get unique types and locations for filters
    const bikeTypes = Array.from(new Set(MOCK_BIKES.map(bike => bike.type)))
    const locations = Array.from(new Set(MOCK_BIKES.map(bike => bike.location)))

    // Filter and sort bikes
    const filteredBikes = useMemo(() => {
        const filtered = MOCK_BIKES.filter(bike => {
            const matchesSearch = bike.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                bike.description?.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesType = selectedType === 'all' || bike.type === selectedType
            const matchesLocation = selectedLocation === 'all' || bike.location === selectedLocation

            return matchesSearch && matchesType && matchesLocation
        })

        // Sort bikes
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return a.pricePerDay - b.pricePerDay
                case 'price-high':
                    return b.pricePerDay - a.pricePerDay
                // case 'rating':
                //     return (b.rating ?? 0) - (a.rating ?? 0)
                case 'name':
                default:
                    return a.name.localeCompare(b.name)
            }
        })

        return filtered
    }, [searchTerm, selectedType, selectedLocation, sortBy])

    const BikeCard = ({ bike }: { bike: Bike }) => (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video relative">
                <img
                    src={bike.imageUrl.split('"')[0]}
                    alt={bike.name}
                    className="w-full h-full object-cover"
                />
                {!bike.isAvailable && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="destructive">Not Available</Badge>
                    </div>
                )}
            </div>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{bike.name}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                            <Badge variant="outline" className="mr-2">{bike.type}</Badge>
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                            {bike.rating}
                        </CardDescription>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-primary">${bike.pricePerDay}</p>
                        <p className="text-sm text-muted-foreground">per day</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    {bike.location}
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {bike.description}
                </p>
                <div className="flex gap-2">
                    <Button className="flex-1" asChild disabled={!bike.isAvailable}>
                        <Link to={`/bikes/${bike.id}`}>
                            <BikeIcon className="w-4 h-4 mr-2" />
                            {bike.isAvailable ? 'View Details' : 'Unavailable'}
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">Browse Our Bikes</h1>
                <p className="text-muted-foreground">
                    Find the perfect motorbike for your Vietnamese adventure
                </p>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="relative">
                    <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Search bikes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {bikeTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                        <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        {locations.map(location => (
                            <SelectItem key={location} value={location}>{location}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="name">Name A-Z</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Results */}
            <div className="mb-4">
                <p className="text-muted-foreground">
                    Showing {filteredBikes.length} of {MOCK_BIKES.length} bikes
                </p>
            </div>

            {/* Bikes Grid */}
            {filteredBikes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBikes.map(bike => (
                        <BikeCard key={bike.id} bike={bike} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <BikeIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No bikes found</h3>
                    <p className="text-muted-foreground">
                        Try adjusting your search criteria
                    </p>
                </div>
            )}
        </div>
    )
}