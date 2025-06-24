// src/pages/BikesPage.tsx
import {useState, useMemo, useEffect} from 'react'
import {Link, useSearchParams} from 'react-router-dom'
import {Search, MapPin, Star} from 'lucide-react'
import {Bike as BikeIcon} from 'lucide-react'
import {Button} from '../components/ui/button'
import {Input} from '../components/ui/input'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../components/ui/card'
import {Badge} from '../components/ui/badge'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../components/ui/select'
import type {VehicleModelDTO} from '../lib/types'
import {bikeApi} from "../lib/api.ts";

export default function BikesPage() {
    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedType, setSelectedType] = useState<string>('all')
    const [selectedLocation, setSelectedLocation] = useState<string>('all')
    const [sortBy, setSortBy] = useState<string>('name')
    const [loading, setLoading] = useState(false);
    const [bikes, setBikes] = useState<VehicleModelDTO[]>([]);
    const [error, setError] = useState<string>('');

    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const location = searchParams.get('location');

    useEffect(() => {
        async function fetchBikeModels() {
            if (!startDate || !endDate) {
                return;
            }

            setLoading(true);
            try {
                //customer must type in start date and end date to be allowed to see bike list
                //TODO: add parameters to getAvailable method when this method updated
                const data = await bikeApi.getAvailableBike(
                    String(startDate),
                    String(endDate),
                    location || undefined
                );
                setBikes(data);
            } catch (error) {
                console.error('Error fetching bikes:', error);
                setError('Failed to load bikes. Please try again later.');
            } finally {
                setLoading(false);
            }
        }

        fetchBikeModels();
    }, [startDate, endDate, location]);

    console.log(bikes)


    //// Get unique types and locations for filters
    //const bikeTypes = Array.from(new Set(MOCK_BIKES.map(bike => bike.type)))
    //const locations = Array.from(new Set(MOCK_BIKES.map(bike => bike.location)))

    // Filter and sort bikes
    const filteredBikes = useMemo(() => {
        console.log(Array.isArray(bikes))
        const bikesArray = Array.isArray(bikes) ? bikes : []
        const filtered = bikesArray
            .filter(bike => {
            const matchesSearch = bike.modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                bike.description?.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesType = selectedType === 'all' || bike.vehicleType === selectedType
            const matchesLocation = selectedLocation === 'all' || bike.shop === selectedLocation

            return matchesSearch && matchesType && matchesLocation
        })

        //Sort bikes
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return a.ratePerDay - b.ratePerDay;
                case 'price-high':
                    return b.ratePerDay - a.ratePerDay;
                // case 'rating':
                //     return (b.rating ?? 0) - (a.rating ?? 0)
                case 'name':
                default:
                    return a.modelName.localeCompare(b.modelName);
            }
        })

        return filtered
    }, [bikes, searchTerm, selectedType, selectedLocation, sortBy])

    const BikeCard = ({bikes}: { bikes: VehicleModelDTO }) => (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video relative">
                <img
                    src={bikes.imageFile?.split('"')[0]}
                    alt={bikes.modelName}
                    className="w-full h-full object-cover"
                />
                {!bikes.isAvailable && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="destructive">Not Available</Badge>
                    </div>
                )}
            </div>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{bikes.modelName}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                            <Badge variant="outline" className="mr-2">{bikes.vehicleType}</Badge>
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1"/>
                            {bikes.rating}
                        </CardDescription>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-primary">${bikes.ratePerDay}</p>
                        <p className="text-sm text-muted-foreground">per day</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4 mr-1"/>
                    {bikes.shop}
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {bikes.description}
                </p>
                <div className="flex gap-2">
                    <Button className="flex-1" asChild disabled={!bikes.isAvailable}>
                        <Link to={`/bikes/${bikes.modelId}`}>
                            <BikeIcon className="w-4 h-4 mr-2"/>
                            {bikes.isAvailable ? 'View Details' : 'Unavailable'}
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
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4"/>
                    <Input
                        placeholder="Search bikes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                        <SelectValue placeholder="All Types"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {/*{bikeTypes.map(type => (*/}
                        {/*    <SelectItem key={type} value={type}>{type}</SelectItem>*/}
                        {/*))}*/}
                    </SelectContent>
                </Select>

                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                        <SelectValue placeholder="All Locations"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        {/*{locations.map(location => (*/}
                        {/*    <SelectItem key={location} value={location}>{location}</SelectItem>*/}
                        {/*))}*/}
                    </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                        <SelectValue placeholder="Sort by"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="name">Name A-Z</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/*Results*/}
            <div className="mb-4">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
                        <p>Loading bikes...</p>
                    </div>
                ) : (
                    <p className="text-muted-foreground">
                        Showing {bikes.length} of {bikes.length} bikes
                    </p>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded mb-6">
                    <p className="font-medium">Error</p>
                    <p>{error}</p>
                    <Button
                        variant="outline"
                        className="mt-2"
                        onClick={() => {
                            setError('');
                            if (startDate && endDate) {
                                // Retry loading
                                bikeApi.getAvailableBike(
                                    String(startDate),
                                    String(endDate),
                                    location || undefined
                                ).then(data => {
                                    setBikes(data);
                                }).catch(err => {
                                    console.error('Error fetching bikes:', err);
                                    setError('Failed to load bikes. Please try again later.');
                                });
                            }
                        }}
                    >
                        Retry
                    </Button>
                </div>
            )}

            {/*Bikes Grid */}
            {filteredBikes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBikes.map(bike => (
                        <BikeCard key={bike.modelId} bikes={bike}/>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <BikeIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4"/>
                    <h3 className="text-lg font-semibold mb-2">No bikes found</h3>
                    <p className="text-muted-foreground">
                        Try adjusting your search criteria
                    </p>
                </div>
            )}
            
        </div>
    )
}