// src/pages/LocationFinderPage.tsx
import { useState } from 'react'
import {
    MapPin,
    Clock,
    Phone,
    Navigation,
    Search,
    //@ts-ignore

    Filter
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'

// Mock location data
const MOCK_LOCATIONS = [
    {
        id: 'loc1',
        name: 'VroomVroom Ho Chi Minh Center',
        address: '123 Nguyen Hue Street, District 1, Ho Chi Minh City',
        city: 'Ho Chi Minh City',
        phone: '+84 28 1234 5678',
        hours: 'Mon-Sun: 7:00 AM - 10:00 PM',
        coordinates: { lat: 10.7769, lng: 106.7009 },
        bikeCount: 25,
        services: ['Pickup', 'Drop-off', 'Maintenance', '24/7 Support'],
        type: 'main'
    },
    {
        id: 'loc2',
        name: 'VroomVroom Hanoi Old Quarter',
        address: '456 Hang Bac Street, Hoan Kiem District, Hanoi',
        city: 'Hanoi',
        phone: '+84 24 9876 5432',
        hours: 'Mon-Sun: 6:00 AM - 11:00 PM',
        coordinates: { lat: 21.0285, lng: 105.8542 },
        bikeCount: 18,
        services: ['Pickup', 'Drop-off', 'Tourist Info'],
        type: 'branch'
    },
    {
        id: 'loc3',
        name: 'VroomVroom Da Nang Beach',
        address: '789 Vo Nguyen Giap Street, Ngu Hanh Son District, Da Nang',
        city: 'Da Nang',
        phone: '+84 236 555 1234',
        hours: 'Mon-Sun: 8:00 AM - 9:00 PM',
        coordinates: { lat: 16.0471, lng: 108.2068 },
        bikeCount: 12,
        services: ['Pickup', 'Drop-off', 'Beach Tours'],
        type: 'branch'
    },
    {
        id: 'loc4',
        name: 'VroomVroom Hoi An Ancient Town',
        address: '321 Tran Phu Street, Hoi An Ancient Town, Quang Nam',
        city: 'Hoi An',
        phone: '+84 235 987 6543',
        hours: 'Mon-Sun: 7:00 AM - 8:00 PM',
        coordinates: { lat: 15.8801, lng: 108.3380 },
        bikeCount: 8,
        services: ['Pickup', 'Drop-off', 'Cultural Tours'],
        type: 'partner'
    },
    {
        id: 'loc5',
        name: 'VroomVroom Nha Trang Bay',
        address: '654 Tran Phu Street, Nha Trang City, Khanh Hoa',
        city: 'Nha Trang',
        phone: '+84 258 123 4567',
        hours: 'Mon-Sun: 8:00 AM - 10:00 PM',
        coordinates: { lat: 12.2388, lng: 109.1967 },
        bikeCount: 15,
        services: ['Pickup', 'Drop-off', 'Island Tours'],
        type: 'branch'
    }
]

export default function LocationFinderPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCity, setSelectedCity] = useState('all')
    const [selectedType, setSelectedType] = useState('all')

    const cities = Array.from(new Set(MOCK_LOCATIONS.map(loc => loc.city)))
    const types = Array.from(new Set(MOCK_LOCATIONS.map(loc => loc.type)))

    const filteredLocations = MOCK_LOCATIONS.filter(location => {
        const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
            location.city.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCity = selectedCity === 'all' || location.city === selectedCity
        const matchesType = selectedType === 'all' || location.type === selectedType

        return matchesSearch && matchesCity && matchesType
    })

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'main':
                return 'default'
            case 'branch':
                return 'secondary'
            case 'partner':
                return 'outline'
            default:
                return 'outline'
        }
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'main':
                return 'Main Location'
            case 'branch':
                return 'Branch Office'
            case 'partner':
                return 'Partner Location'
            default:
                return type
        }
    }

    const LocationCard = ({ location }: { location: typeof MOCK_LOCATIONS[0] }) => (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{location.name}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                            <MapPin className="w-4 h-4 mr-1" />
                            {location.city}
                        </CardDescription>
                    </div>
                    <Badge variant={getTypeColor(location.type)}>
                        {getTypeLabel(location.type)}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                        <p className="text-sm">{location.address}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm">{location.phone}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm">{location.hours}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-sm font-medium">Available Services:</p>
                    <div className="flex flex-wrap gap-1">
                        {location.services.map((service, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                                {service}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                    <p className="text-sm text-muted-foreground">
                        {location.bikeCount} bikes available
                    </p>
                    <Button size="sm">
                        <Navigation className="w-4 h-4 mr-2" />
                        Get Directions
                    </Button>
                </div>
            </CardContent>
        </Card>
    )

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">Find Our Locations</h1>
                <p className="text-muted-foreground">
                    Discover VroomVroom rental locations across Vietnam for convenient pickup and drop-off
                </p>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Search locations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger>
                        <SelectValue placeholder="All Cities" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Cities</SelectItem>
                        {cities.map(city => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {types.map(type => (
                            <SelectItem key={type} value={type}>{getTypeLabel(type)}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Results */}
            <div className="mb-4">
                <p className="text-muted-foreground">
                    Showing {filteredLocations.length} of {MOCK_LOCATIONS.length} locations
                </p>
            </div>

            {/* Map Placeholder */}
            <Card className="mb-8">
                <CardContent className="p-6">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <div className="text-center">
                            <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                            <p className="text-muted-foreground">Interactive map will be displayed here</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Integration with Google Maps or similar service
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Locations Grid */}
            {filteredLocations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLocations.map(location => (
                        <LocationCard key={location.id} location={location} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <MapPin className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No locations found</h3>
                    <p className="text-muted-foreground">
                        Try adjusting your search criteria
                    </p>
                </div>
            )}
        </div>
    )
}