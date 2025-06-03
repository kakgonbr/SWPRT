import type { Bike } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag, Star, DollarSign, MapPinIcon } from 'lucide-react';
// Removed Badge import as it's no longer used here

interface BikeCardProps {
  bike: Bike;
}

export default function BikeCard({ bike }: BikeCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="p-0">
        <div className="aspect-video relative w-full">
          <Image
            src={bike.imageUrl.split('"')[0]} // Handle potential data-ai-hint in URL
            alt={bike.name}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-105"
            {...(bike.imageUrl.includes('data-ai-hint') ? { 'data-ai-hint': bike.imageUrl.split('data-ai-hint="')[1].split('"')[0] } : {})}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl font-semibold mb-2 text-primary truncate">{bike.name}</CardTitle>
        <div className="flex items-center text-sm text-muted-foreground mb-1">
          <Tag className="w-4 h-4 mr-1.5" /> {bike.type}
        </div>
        <div className="flex items-center text-sm text-muted-foreground mb-1">
          <MapPinIcon className="w-4 h-4 mr-1.5" /> {bike.location}
        </div>
        {bike.rating && (
          <div className="flex items-center text-sm text-amber-400 mb-2">
            {[...Array(Math.floor(bike.rating))].map((_, i) => (
              <Star key={`full-${i}`} className="w-4 h-4 fill-current" />
            ))}
            {bike.rating % 1 !== 0 && <Star key="half" className="w-4 h-4 fill-current opacity-50" />} 
            {[...Array(5 - Math.ceil(bike.rating))].map((_, i) => (
              <Star key={`empty-${i}`} className="w-4 h-4 text-muted-foreground" />
            ))}
            <span className="ml-1.5 text-muted-foreground">({bike.rating.toFixed(1)})</span>
          </div>
        )}
        <p className="text-sm text-foreground/80 line-clamp-2 mb-3">{bike.description}</p>
        {/* Removed the Badge component that displayed bike.isAvailable */}
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center border-t">
        <div className="flex items-center font-semibold text-lg">
          <DollarSign className="w-5 h-5 mr-1 text-primary" />
          {bike.pricePerDay} <span className="text-xs text-muted-foreground ml-1">/ day</span>
        </div>
        <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href={`/bikes/${bike.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
