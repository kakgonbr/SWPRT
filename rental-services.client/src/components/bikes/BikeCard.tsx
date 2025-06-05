// src/components/BikeCard.tsx
import { Link } from 'react-router-dom'
import { Star, MapPin, Fuel, Users, Calendar, Heart } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardFooter } from '../ui/card'
import { Badge } from '../ui/badge'
import { type Bike } from '../../lib/types'
import { useIsMobile } from '../../hooks/use-mobile'

interface BikeCardProps {
    bike: Bike
}

export default function BikeCard({ bike }: BikeCardProps) {
    const isMobile = useIsMobile()

    return (
        <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
            <div className="relative">
                <div className={`aspect-video relative overflow-hidden ${isMobile ? 'aspect-[4/3]' : ''}`}>
                    <img
                        src={bike.imageUrl?.replace(/["']/g, '') || '/placeholder-bike.jpg'}
                        alt={bike.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                            e.currentTarget.src = '/placeholder-bike.jpg'
                        }}
                    />
                    <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    >
                        <Heart className="h-4 w-4" />
                    </Button>
                </div>

                <Badge
                    className="absolute top-2 left-2"
                    variant={bike.isAvailable ? "default" : "destructive"}
                >
                    {bike.isAvailable ? "Available" : "Unavailable"}
                </Badge>
            </div>

            <CardContent className={`p-4 ${isMobile ? 'p-3' : ''}`}>
                <div className="space-y-2">
                    <div className="flex justify-between items-start">
                        <h3 className={`font-semibold text-primary group-hover:text-primary/80 transition-colors ${isMobile ? 'text-sm' : 'text-lg'}`}>
                            {bike.name || 'Unknown Bike'}
                        </h3>
                        <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                {bike.rating?.toFixed(1) || '0.0'}
                            </span>
                        </div>
                    </div>

                    <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        {bike.type}
                    </p>

                    <div className="flex items-center text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>
                            {bike.location || 'Location not specified'}
                        </span>
                    </div>

                    {!isMobile && (
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                                <Fuel className="w-4 h-4 mr-2" />
                                <span>{bike.fuelType}</span>
                            </div>
                            <div className="flex items-center">
                                <Users className="w-4 h-4 mr-2" />
                                <span>{bike.capacity} riders</span>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center">
                        <div>
                            <span className={`font-bold text-primary ${isMobile ? 'text-lg' : 'text-xl'}`}>
                                ${bike.pricePerDay}
                            </span>
                            <span className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                /day
                            </span>
                        </div>
                        {bike.discountPercentage && bike.discountPercentage > 0 && (
                            <Badge variant="secondary" className={isMobile ? 'text-xs' : ''}>
                                {bike.discountPercentage}% OFF
                            </Badge>
                        )}
                    </div>
                </div>
            </CardContent>

            <CardFooter className={`p-4 pt-0 ${isMobile ? 'p-3 pt-0' : ''}`}>
                <div className="flex gap-2 w-full">
                    <Button
                        asChild
                        className="flex-1"
                        size={isMobile ? "sm" : "default"}
                    >
                        <Link to={`/bikes/${bike.id}`}>
                            <Calendar className="w-4 h-4 mr-2" />
                            {isMobile ? 'Rent' : 'Rent Now'}
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        asChild
                        size={isMobile ? "sm" : "default"}
                    >
                        <Link to={`/bikes/${bike.id}`}>
                            {isMobile ? 'Details' : 'View Details'}
                        </Link>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}