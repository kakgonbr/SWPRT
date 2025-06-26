// src/pages/BikeDetailsPage.tsx
import {useParams, Link, useNavigate} from 'react-router-dom'
//@ts-ignore

import {ArrowLeft, Star, MapPin, Calendar, Users, Fuel, Gauge} from 'lucide-react'
import {Button} from '../components/ui/button'
//@ts-ignore
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../components/ui/card'
import {Badge} from '../components/ui/badge'
import {Separator} from '../components/ui/separator'
import {MOCK_BIKE_REVIEWS} from '../lib/mock-data'
import {BikeReviews} from '../components/BikeReviews'
import {useEffect, useState} from "react";
import type {VehicleModelDTO} from "../lib/types.ts";
import {bikeApi} from "../lib/api.ts";

export default function BikeDetailsPage() {
    const {id} = useParams<{ id: string }>();
    const [bike, setBike] = useState<VehicleModelDTO>();
    const navigate = useNavigate();

    useEffect(() => {
        // @ts-ignore
        async function getVehicleModelDetailById() {
            if (!id) return;
            try {
                const bikeId = parseInt(id, 10);
                if (isNaN(bikeId)) {
                    console.log("this is not a bike id");
                    return;
                }
                const data = await bikeApi.getBikeById(bikeId);
                setBike(data);
            } catch (error) {
                console.error(`Error fetching bike details: `, error);
            }
        }
        getVehicleModelDetailById();
    }, [id]);

    const handleGoBack = () => {
        navigate(-1);
    };


    // Get reviews for this bike
    const bikeReviews = MOCK_BIKE_REVIEWS.filter(review => review.bikeId === id)
    const averageRating = bikeReviews.length > 0
        ? bikeReviews.reduce((sum, review) => sum + review.rating, 0) / bikeReviews.length
        : 0

    if (!bike) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Bike Not Found</h1>
                <Button asChild>
                    <Link to="/bikes">Back to Bikes</Link>
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
                            src={bike.imageFile.split('"')[0]}
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
                                <span>{bike.shop}</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-4xl font-bold text-primary">
                        ${bike.ratePerDay}
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
                                {/*<span className="text-sm">*/}
                                {/*    {bike.cylinderVolume ? `${bike.cylinderVolume}cc` : 'Electric'}*/}
                                {/*</span>*/}
                            </div>
                            {/*<div className="flex items-center">*/}
                            {/*    <Users className="w-4 h-4 mr-2 text-muted-foreground" />*/}
                            {/*    <span className="text-sm">{bike.} available</span>*/}
                            {/*</div>*/}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-3">Features</h3>
                        <div className="grid grid-cols-1 gap-2">
                            {/*{bike.features?.map((feature, index) => (*/}
                            {/*    <div key={index} className="flex items-center">*/}
                            {/*        <div className="w-2 h-2 bg-primary rounded-full mr-3" />*/}
                            {/*        <span className="text-sm">{feature}</span>*/}
                            {/*    </div>*/}
                            {/*))}*/}
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-primary rounded-full mr-3"/>
                                <span className="text-sm">{bike.description}</span>
                            </div>
                        </div>
                    </div>

                    <Separator/>

                    <div className="space-y-3">
                        <Button
                            className="w-full"
                            size="lg"
                            disabled={!bike.isAvailable}
                            asChild={bike.isAvailable}
                        >
                            {bike.isAvailable ? (
                                <Link to={`/checkout?bikeId=${bike.modelId}`}>
                                    <Calendar className="w-4 h-4 mr-2"/>
                                    Book Now
                                </Link>
                            ) : (
                                <>Not Available</>
                            )}
                        </Button>

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