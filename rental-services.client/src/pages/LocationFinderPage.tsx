// src/pages/LocationFinderPage.tsx
import { useRef, useState } from 'react'
import {
    MapPin,
    Clock,
    Phone,
    Navigation
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import MapboxMap, { type MapboxMapRef } from '../components/MapboxMap'
import { Button } from '../components/ui/button'

// Location data
const locations = [
    {
        id: 'loc1',
        name: 'VroomVroom Da Nang Center',
        address: '40 Trần Văn Giàu, Xã Hòa Châu, Huyện Hòa Vang, Đà Nẵng',
        city: 'Da Nang',
        phone: '+84 357 116 420',
        hours: 'Mon-Sun: 7:00 AM - 10:00 PM',
        coordinates: { lat: 15.99690873000003, lng: 108.20516433800009 },
        type: 'main'
    },
    {
        id: 'loc2',
        name: 'VroomVroom Da Nang Tran Cao Van',
        address: '678 Trần Cao Vân, Xuân Hà, Thanh Khê, Đà Nẵng',
        city: 'Da Nang',
        phone: '+84 420 420 420',
        hours: 'Mon-Sun: 7:00 AM - 10:00 PM',
        coordinates: { lat: 16.071385183000075, lng: 108.18880229500007 },
        type: 'main'
    },
    {
        id: 'loc3',
        name: 'VroomVroom Hanoi Hong Ha',
        address: '1081 Hồng Hà, Chương Dương, Hoàn Kiếm, Hà Nội',
        city: 'Hanoi',
        phone: '+84 392 858 123',
        hours: 'Mon-Sun: 6:00 AM - 11:00 PM',
        coordinates: { lat: 21.019667490000074, lng: 105.86210827700006 },
        type: 'branch'
    },
    {
        id: 'loc4',
        name: 'VroomVroom HCM Pham The Hien',
        address: '1191 Phạm Thế Hiển, Phường 5, Quận 8, Hồ Chí Minh',
        city: 'Ho Chi Minh',
        phone: '+84 696 969 696',
        hours: 'Mon-Sun: 8:00 AM - 9:00 PM',
        coordinates: { lat: 10.741587712000069, lng: 106.66011329300005 },
        type: 'branch'
    }
]

export default function LocationFinderPage() {
    const mapRef = useRef<MapboxMapRef>(null);
    const [isGettingLocation, setIsGettingLocation] = useState(false);

    // Function to get user's current location
    const getCurrentLocation = (): Promise<string> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser.'));
                return;
            }

            setIsGettingLocation(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setIsGettingLocation(false);
                    resolve(`${latitude},${longitude}`);
                },
                (error) => {
                    setIsGettingLocation(false);
                    console.error('Error getting location:', error);
                    // Fallback to a default location (Da Nang center)
                    resolve('16.047079,108.206230');
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        });
    };

    // Function to handle "Get Directions" button click
    const handleGetDirections = async (location: typeof locations[0]) => {
        try {
            const currentLocation = await getCurrentLocation();
            const destination = location.address;

            // Use the map's setDirections method via ref
            if (mapRef.current?.setDirections) {
                mapRef.current.setDirections(currentLocation, destination);
            }
        } catch (error) {
            console.error('Error getting directions:', error);
            alert('Could not get your current location. Please enter it manually in the map.');
        }
    };

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

    const LocationCard = ({ location }: { location: typeof locations[0] }) => (
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

                    <div className="flex items-center space-x-2">
                        <Button
                            size="sm"
                            onClick={() => handleGetDirections(location)}
                            disabled={isGettingLocation}
                        >
                            <Navigation className="w-4 h-4 mr-2" />
                            {isGettingLocation ? 'Getting Location...' : 'Get Directions'}
                        </Button>
                    </div>
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

            {/* Interactive Map */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Interactive Map</CardTitle>
                    <CardDescription>
                        Search locations, get directions, and explore our rental points
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <MapboxMap
                        ref={mapRef}
                        locations={locations}
                        center={[108.2068, 16.0471]} // Da Nang center coordinates
                        zoom={11}
                        height="500px"
                    />
                </CardContent>
            </Card>

            {/* Locations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {locations.map(location => (
                    <LocationCard key={location.id} location={location} />
                ))}
            </div>
        </div>
    )
}