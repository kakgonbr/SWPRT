// src/pages/BikesPage.tsx
import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, MapPin, Star } from 'lucide-react'
import { Bike as BikeIcon } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import type { VehicleModelDTO, DriverLicenseDto } from '../lib/types'
import { bikeApi } from "../lib/api.ts";

const API = import.meta.env.VITE_API_BASE_URL;

export default function BikesPage() {
    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState('')
    const [driverLicenses, setDriverLicenses] = useState<DriverLicenseDto[]>([]);
    const [searchInputValue, setSearchInputValue] = useState('')
    const [selectedType, setSelectedType] = useState<string>('all')
    const [selectedLocation, setSelectedLocation] = useState<string>('all')
    const [sortBy, setSortBy] = useState<string>('name')
    const [loading, setLoading] = useState(false);
    const [bikes, setBikes] = useState<VehicleModelDTO[]>([]);
    const [error, setError] = useState<string>('');
    const [isShowingAll, setIsShowingAll] = useState<boolean>(false);

    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const location = searchParams.get('location');

    const handleSearch = () => {
        setSearchTerm(searchInputValue);
    }

    useEffect(() => {
        async function fetchData() {
            if (!startDate || !endDate) {
                return;
            }

            setLoading(true);
            try {
                // First, fetch the driver license data
                const licenseResponse = await fetch(`${API}/api/users/licenses`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    }
                });
                if (!licenseResponse.ok) {
                    const data = await bikeApi.getAvailableBike(
                        String(startDate),
                        String(endDate),
                        location || undefined,
                        searchTerm || undefined,
                        false
                    );
                    setBikes(data);

                    return;
                }

                const licenses: DriverLicenseDto[] = await licenseResponse.json();

                if (licenses.length === 0) {
                    setDriverLicenses([]);
                    setIsShowingAll(true);

                    const data = await bikeApi.getAvailableBike(
                        String(startDate),
                        String(endDate),
                        location || undefined,
                        searchTerm || undefined,
                        false
                    );
                    setBikes(data);

                    return;
                }

                setDriverLicenses(licenses);

                // Now proceed to fetch bikes
                const data = await bikeApi.getAvailableBike(
                    String(startDate),
                    String(endDate),
                    location || undefined,
                    searchTerm || undefined,
                    true
                );
                setBikes(data);
            } catch (error) {
                console.error('Error during data fetch:', error);
                setError('Failed to load data. Please try again later.');
            } finally {
                setLoading(false);
            }
        }

        // Debounce to avoid too many API calls
        const handler = setTimeout(() => {
            fetchData();
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [startDate, endDate, location, searchTerm]);


    //useEffect(() => {
    //    async function fetchBikeModels() {
    //        if (!startDate || !endDate) {
    //            return;
    //        }

    //        setLoading(true);
    //        try {
    //            //customer must type in start date and end date to be allowed to see bike list
    //            //TODO: add parameters to getAvailable method when this method updated
    //            const data = await bikeApi.getAvailableBike(
    //                String(startDate),
    //                String(endDate),
    //                location || undefined,
    //                searchTerm || undefined
    //            );
    //            setBikes(data);
    //        } catch (error) {
    //            console.error('Error fetching bikes:', error);
    //            setError('Failed to load bikes. Please try again later.');
    //        } finally {
    //            setLoading(false);
    //        }
    //    }

    //    //debounce implementation to void to many api calls
    //    const handler = setTimeout(() => {
    //        fetchBikeModels();
    //    }, 500);

    //    return () => {
    //        clearTimeout(handler);
    //    }
    //}, [startDate, endDate, location, searchTerm]);

    console.log(bikes)

    const bikeTypes = useMemo(() => {
        return Array.from(new Set(bikes.map(bike => bike.vehicleType)))
    }, [bikes]);

    const locations = useMemo(() => {
        return Array.from(new Set(bikes.map(bike => bike.shop)))
    }, [bikes]);

    const formatVND = (amount: number): string => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    // Filter and sort bikes
    const filteredBikes = useMemo(() => {
        console.log(Array.isArray(bikes))
        const bikesArray = Array.isArray(bikes) ? bikes : []
        const filtered = bikesArray
            .filter(bike => {
                //const matchesSearch = bike.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                //bike.description?.toLowerCase().includes(searchTerm.toLowerCase())
                const matchesType = selectedType === 'all' || bike.vehicleType === selectedType
                const matchesLocation = selectedLocation === 'all' || bike.shop === selectedLocation
                return matchesType && matchesLocation
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
                    return a.displayName.localeCompare(b.displayName);
            }
        })

        return filtered
    }, [bikes, selectedType, selectedLocation, sortBy])

    const BikeCard = ({ bikes }: { bikes: VehicleModelDTO }) => (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video relative">
                <img
                    src={'images/' + bikes.imageFile?.split('"')[0]}
                    alt={bikes.displayName}
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
                        <CardTitle className="text-lg">{bikes.displayName}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                            <Badge variant="outline" className="mr-2">{bikes.vehicleType}</Badge>
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                            {bikes.rating}
                        </CardDescription>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{formatVND(bikes.ratePerDay)}</p>
                        <p className="text-sm text-muted-foreground">per day</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    {bikes.shop}
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {bikes.description}
                </p>
                <div className="flex gap-2">
                    <Button className="flex-1" asChild disabled={!bikes.isAvailable}>
                        <Link
                            to={`/bikes/${bikes.modelId}`}
                            state={{
                                rentalParams: `startDate=${startDate}&endDate=${endDate}${location ? `&location=${location}` : ''}`
                            }}>
                            <BikeIcon className="w-4 h-4 mr-2" />
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
                {driverLicenses.length === 0 ? (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 px-4 py-3 rounded mt-4" role="alert">
                        <p className="font-semibold">No driver licenses found.</p>
                        <p>Showing all available bikes. Please add or verify your licenses before browsing available bikes.</p>
                    </div>
                ) : isShowingAll ? (
                    <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 px-4 py-3 rounded mt-4" role="alert">
                        <p className="font-semibold">Showing all bikes.</p>
                        <p>Your licenses may not allow you to rent a bike listed here.</p>
                        <Button
                            variant="outline"
                            className="mt-2"
                            onClick={() => {
                                setError('');
                                setLoading(true);
                                if (startDate && endDate) {
                                    bikeApi.getAvailableBike(
                                        String(startDate),
                                        String(endDate),
                                        location || undefined,
                                        undefined,
                                        true
                                    ).then(data => {
                                        setBikes(data);
                                        setLoading(false);
                                        setIsShowingAll(false);
                                    }).catch(err => {
                                        console.error('Error fetching bikes:', err);
                                        setError('Failed to load bikes. Please try again later.');
                                    });
                                }
                            }}
                        >
                            Show driver license specific
                        </Button>
                    </div>
                ) : (
                    <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 px-4 py-3 rounded mt-4" role="alert">
                        <p className="font-semibold">License-based filtering active.</p>
                        <p>We are showing bikes suitable for license types: <strong>{driverLicenses?.map(l => l.licenseTypeStr).filter(Boolean).join(', ')}</strong></p>
                        <Button
                            variant="outline"
                            className="mt-2"
                            onClick={() => {
                                setError('');
                                setLoading(true);
                                if (startDate && endDate) {
                                    bikeApi.getAvailableBike(
                                        String(startDate),
                                        String(endDate),
                                        location || undefined,
                                        undefined,
                                        false
                                    ).then(data => {
                                        setBikes(data);
                                        setLoading(false);
                                        setIsShowingAll(true);
                                    }).catch(err => {
                                        console.error('Error fetching bikes:', err);
                                        setError('Failed to load bikes. Please try again later.');
                                    });
                                }
                            }}
                        >
                            Show all
                        </Button>
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="relative w-full">
                    <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Search bikes..."
                        value={searchInputValue}
                        onChange={(e) => {
                            setSearchInputValue(e.target.value);
                            // Auto-search after typing stops
                            const handler = setTimeout(() => {
                                setSearchTerm(e.target.value);
                            }, 500);
                            return () => clearTimeout(handler);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                setSearchTerm(searchInputValue);
                            }
                        }}
                        className="pl-10 pr-10"
                    />
                    <Button
                        onClick={handleSearch}
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                    >
                        <Search className="h-4 w-4" />
                    </Button>
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
                            setLoading(true);
                            setError('');
                            if (startDate && endDate) {
                                // Retry loading
                                bikeApi.getAvailableBike(
                                    String(startDate),
                                    String(endDate),
                                    location || undefined,
                                    undefined,
                                    !isShowingAll
                                ).then(data => {
                                    setBikes(data);
                                    setLoading(false);
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
                        <BikeCard key={bike.modelId} bikes={bike} />
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