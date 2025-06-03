
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Rental } from '@/lib/types';
import { MOCK_RENTALS, MOCK_BIKES } from '@/lib/mock-data'; // Assuming MOCK_RENTALS uses bikeId
// import MainLayout from '@/components/layout/main-layout'; // Removed
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { History, CalendarClock, Bike as BikeIcon, Info, CalendarCheck2, CalendarX2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';

export default function RentalHistoryPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/auth/login?redirect=/rentals');
      return;
    }
    if (user) {
      // Simulate fetching user-specific rentals
      const userRentals = MOCK_RENTALS.filter(r => r.userId === user.id)
        .map(r => { // Ensure bike details are present
            const bike = MOCK_BIKES.find(b => b.id === r.bikeId);
            return {
                ...r,
                bikeName: bike?.name || 'Unknown Bike',
                bikeImageUrl: bike?.imageUrl || 'https://placehold.co/300x200.png',
            };
        })
        .sort((a,b) => b.orderDate.getTime() - a.orderDate.getTime()); // Sort by most recent order
      setRentals(userRentals);
    }
    setIsLoading(false);
  }, [user, isAuthenticated, authLoading, router]);

  const upcomingRentals = rentals.filter(r => r.status === 'Upcoming' || r.status === 'Active');
  const pastRentals = rentals.filter(r => r.status === 'Completed' || r.status === 'Cancelled');

  const RentalCard = ({ rental }: { rental: Rental }) => (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <CardHeader className="p-0 relative">
        <div className="aspect-[16/7] relative w-full"> {/* Adjusted aspect ratio for rental card images */}
         <Image
            src={rental.bikeImageUrl.split('"')[0]} // Handle potential data-ai-hint in URL
            alt={rental.bikeName}
            layout="fill"
            objectFit="cover"
             {...(rental.bikeImageUrl.includes('data-ai-hint') ? { 'data-ai-hint': rental.bikeImageUrl.split('data-ai-hint="')[1].split('"')[0] } : {})}
          />
        </div>
        <Badge
          className="absolute top-2 right-2"
          variant={
            rental.status === 'Completed' ? 'default' :
            rental.status === 'Upcoming' ? 'secondary' :
            rental.status === 'Active' ? 'default' : // Active could be primary-like
            'destructive'
          }
          style={rental.status === 'Active' ? { backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))'} : {}}
        >
          {rental.status}
        </Badge>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-xl font-semibold mb-1 text-primary truncate">{rental.bikeName}</CardTitle>
        <p className="text-xs text-muted-foreground mb-2">Order Placed: {format(rental.orderDate, "PPP")}</p>
        <p className="text-sm text-foreground/80">
          <CalendarClock className="inline w-4 h-4 mr-1.5 text-muted-foreground" />
          {format(rental.startDate, "MMM d, yyyy")} - {format(rental.endDate, "MMM d, yyyy")}
        </p>
        <p className="text-sm text-foreground/80">
          <DollarSign className="inline w-4 h-4 mr-1.5 text-muted-foreground" />
          Total: ${rental.totalPrice.toFixed(2)}
        </p>
        {rental.options.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">Options: {rental.options.join(', ')}</p>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/bikes/${rental.bikeId}`}>View Bike Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );

  if (authLoading || isLoading) {
    return (
        <div className="flex justify-center items-center h-full">
          <p>Loading your rental history...</p>
        </div>
    );
  }

  if (!isAuthenticated) {
    // This case should ideally be handled by the useEffect redirect,
    // but as a fallback:
    return (
        <div className="text-center py-10">
           <Info className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="text-2xl font-semibold">Please Log In</h1>
          <p className="text-muted-foreground">Log in to view your rental history.</p>
          <Button onClick={() => router.push('/auth/login')} className="mt-4">Login</Button>
        </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2 flex items-center"><History className="w-10 h-10 mr-3" />Rental History</h1>
        <p className="text-muted-foreground text-lg">View your past and upcoming motorbike rentals.</p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-1/2 mb-6">
          <TabsTrigger value="upcoming"><CalendarCheck2 className="w-4 h-4 mr-2"/>Upcoming/Active</TabsTrigger>
          <TabsTrigger value="past"><CalendarX2 className="w-4 h-4 mr-2"/>Past Rentals</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          {upcomingRentals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingRentals.map(rental => <RentalCard key={rental.id} rental={rental} />)}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-lg shadow-md">
              <BikeIcon className="mx-auto h-24 w-24 text-muted-foreground opacity-50 mb-4" />
              <h2 className="text-2xl font-semibold text-muted-foreground">No Upcoming Rentals</h2>
              <p className="text-foreground/70 mt-2">Ready for your next adventure?</p>
              <Button onClick={() => router.push('/')} className="mt-4">Browse Bikes</Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="past">
          {pastRentals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastRentals.map(rental => <RentalCard key={rental.id} rental={rental} />)}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-lg shadow-md">
              <History className="mx-auto h-24 w-24 text-muted-foreground opacity-50 mb-4" />
              <h2 className="text-2xl font-semibold text-muted-foreground">No Past Rentals Yet</h2>
              <p className="text-foreground/70 mt-2">Your completed rentals will appear here.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}

// Helper to get a shade of primary color for Active badge
const DollarSign = ({ className }: {className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);
