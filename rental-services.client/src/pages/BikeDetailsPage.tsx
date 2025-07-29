import {useParams, Link, useNavigate, useLocation} from 'react-router-dom'
import {ArrowLeft, Star, MapPin, Calendar, Gauge} from 'lucide-react'
import {Button} from '../components/ui/button'
import {Badge} from '../components/ui/badge'
import {Separator} from '../components/ui/separator'
import {MOCK_BIKE_REVIEWS} from '../lib/mock-data'
import {BikeReviews} from '../components/BikeReviews'
import {useEffect, useState} from "react";
import type {VehicleModelDTO} from "../lib/types.ts";
import {bikeApi} from "../lib/api.ts";

const API = import.meta.env.VITE_API_BASE_URL;

export default function BikeDetailsPage() {
    const {id} = useParams<{ id: string }>();
    const [bike, setBike] = useState<VehicleModelDTO>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();
    //location of the pages
    const location = useLocation();
    const rentalParams = location.state?.rentalParams;
    const [rentalParamsFromState, setRentalParamsFromState] = useState<string | undefined>();

    useEffect(() => {
        if (rentalParams) {
            setRentalParamsFromState(rentalParams);
        }
    }, [rentalParams]);

    console.log(`RENTAL PARAMS: ${rentalParamsFromState}`);

    useEffect(() => {
        async function getVehicleModelDetailById() {
            if (!id) return;
            setLoading(true);
            setError('');

            try {
                const bikeId = parseInt(id, 10);
                if (isNaN(bikeId)) {
                    setError("Invalid bike ID");
                    setLoading(false);
                    return;
                }
                const data = await bikeApi.getBikeById(bikeId);
                setBike(data);
            } catch (error) {
                console.error(`Error fetching bike details: `, error);
                setError("Failed to load bike details. Please try again later.");
            } finally {
                setLoading(false);
            }
        }

        getVehicleModelDetailById();
    }, [id]);

    const handleGoBack = () => {
        navigate(`/bikes?${rentalParamsFromState}`);
    };

    const formatVND = (amount: number): string => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    // Get reviews for this bike
    const bikeReviews = MOCK_BIKE_REVIEWS.filter(review => review.bikeId === id)
    const averageRating = bikeReviews.length > 0
        ? bikeReviews.reduce((sum, review) => sum + review.rating, 0) / bikeReviews.length
        : 0

    // Loading state
    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Button variant="ghost" className="mb-6" onClick={handleGoBack}>
                    <ArrowLeft className="w-4 h-4 mr-2"/>
                    Back to Bikes
                </Button>
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                    <p className="text-muted-foreground">Loading bike details...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Button variant="ghost" className="mb-6" onClick={handleGoBack}>
                    <ArrowLeft className="w-4 h-4 mr-2"/>
                    Back to Bikes
                </Button>
                <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded mb-6">
                    <p className="font-medium">Error</p>
                    <p>{error}</p>
                    <Button
                        variant="outline"
                        className="mt-2"
                        onClick={() => {
                            setError('');
                            if (id) {
                                const bikeId = parseInt(id, 10);
                                if (!isNaN(bikeId)) {
                                    setLoading(true);
                                    bikeApi.getBikeById(bikeId)
                                        .then(data => setBike(data))
                                        .catch(err => {
                                            console.error(`Error fetching bike details: `, err);
                                            setError("Failed to load bike details. Please try again later.");
                                        })
                                        .finally(() => setLoading(false));
                                }
                            }
                        }}
                    >
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    // Not found state (no error but no bike data)
    if (!bike) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <Button variant="ghost" className="mb-6" onClick={handleGoBack}>
                    <ArrowLeft className="w-4 h-4 mr-2"/>
                    Back to Bikes
                </Button>
                <h1 className="text-2xl font-bold mb-4">Bike Not Found</h1>
                <Button asChild>
                    <Link to="/bikes">Browse All Bikes</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Back Button */}
            <Button variant="ghost" className="mb-6" onClick={handleGoBack}>
                <ArrowLeft className="w-4 h-4 mr-2"/>
                Back to Bikes
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image */}
                <div className="space-y-4">
                    <div className="aspect-video rounded-lg overflow-hidden">
                        <img
                            src={`${API}/images/` + bike.imageFile.split('"')[0]}
                            alt={bike.displayName}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Details */}
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{bike.vehicleType}</Badge>
                            {!bike.isAvailable && <Badge variant="destructive">Not Available</Badge>}
                        </div>
                        <h1 className="text-3xl font-bold mb-2">{bike.displayName}</h1>
                        <div className="flex items-center gap-4 text-muted-foreground">
                            <div className="flex items-center">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1"/>
                                <span>{averageRating.toFixed(1)} ({bikeReviews.length} reviews)</span>
                            </div>
                            <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1"/>
                                <span>{bike.shops && bike.shops.length > 0 ? bike.shops[0] : 'Unknown'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-4xl font-bold text-primary">
                        {formatVND(bike.ratePerDay)}
                        <span className="text-lg font-normal text-muted-foreground">/day</span>
                    </div>

                    <Separator/>

                    <div>
                        <h3 className="font-semibold mb-2">Description</h3>
                        <p className="text-muted-foreground">{bike.description}</p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-3">Specifications</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center">
                                <Gauge className="w-4 h-4 mr-2 text-muted-foreground"/>
                                <span className="text-sm">
                                    {bike.vehicleType}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-3">Features</h3>
                        <div className="grid grid-cols-1 gap-2">
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-primary rounded-full mr-3"/>
                                <span className="text-sm">{bike.description}</span>
                            </div>
                        </div>
                    </div>

                    <Separator/>

                    <div className="space-y-3">
                        {bike.isAvailable ? (
                            <Button
                                className="w-full"
                                size="lg"
                                asChild
                            >
                                <Link
                                    to={`/checkout/${bike.modelId}`}
                                    state={{
                                        from: 'bikeDetails',
                                        rentalParams: rentalParams || rentalParamsFromState
                                    }}
                                >
                                    <Calendar className="w-4 h-4 mr-2"/>
                                    Book Now
                                </Link>
                            </Button>
                        ) : (
                            <Button
                                className="w-full"
                                size="lg"
                                disabled
                            >
                                Not Available
                            </Button>
                        )}

                        <Button variant="outline" className="w-full" asChild>
                            <Link to="/location-finder">
                                <MapPin className="w-4 h-4 mr-2"/>
                                Find Pickup Location
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-12">
                <BikeReviews
                    bikeId={id!}
                    reviews={bikeReviews}
                    averageRating={averageRating}
                    totalReviews={bikeReviews.length}
                />
            </div>
        </div>
    )
}