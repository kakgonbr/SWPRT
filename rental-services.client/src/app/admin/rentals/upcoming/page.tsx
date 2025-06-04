
"use client";

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button'; // Added
import { useToast } from '@/hooks/use-toast'; // Added
import { CalendarClock, Users, Clock, CheckCircle } from 'lucide-react'; // Added CheckCircle
import { MOCK_BIKES, MOCK_RENTALS, MOCK_USERS } from '@/lib/mock-data';
import type { Bike, Rental, User as AppUser } from '@/lib/types';
import { format } from 'date-fns';

interface EnrichedRental extends Rental {
  renterName?: string;
  bikeName?: string;
}

export default function UpcomingRentalsPage() {
  const [allRentalsData, setAllRentalsData] = useState<Rental[]>(MOCK_RENTALS); // Initialize with mock data
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const { toast } = useToast(); // Added

  useEffect(() => {
    // Simulate fetching data - MOCK_RENTALS is already in allRentalsData
    setBikes(MOCK_BIKES);
    setAllUsers(MOCK_USERS);
  }, []);

  const upcomingAppointments: EnrichedRental[] = useMemo(() => {
    return allRentalsData // Use allRentalsData
      .filter(r => r.status === 'Upcoming')
      .map(r => ({
        ...r,
        renterName: allUsers.find(u => u.id === r.userId)?.name || 'Unknown User',
        bikeName: bikes.find(b => b.id === r.bikeId)?.name || r.bikeName || 'Unknown Bike',
      }))
      .sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [allRentalsData, allUsers, bikes]);

  const handleConfirmPickup = (rentalId: string) => {
    setAllRentalsData(prevRentals =>
      prevRentals.map(r =>
        r.id === rentalId ? { ...r, status: 'Active' } : r
      )
    );
    const confirmedRental = upcomingAppointments.find(r => r.id === rentalId);
    toast({
      title: "Pickup Confirmed",
      description: `${confirmedRental?.bikeName || 'Bike'} pickup by ${confirmedRental?.renterName || 'user'} confirmed. Status set to Active.`,
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-2xl font-semibold flex items-center">
            <CalendarClock className="h-7 w-7 mr-2 text-primary" />Upcoming Rental Appointments
          </CardTitle>
          <CardDescription>View future rental bookings and prepare accordingly. Confirm pickup to move to active rentals.</CardDescription>
        </div>
        <Badge variant="outline">{upcomingAppointments.length} Upcoming</Badge>
      </CardHeader>
      <CardContent>
        {upcomingAppointments.length > 0 ? (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {upcomingAppointments.map(rental => (
              <div key={rental.id} className="p-4 border rounded-lg shadow-sm bg-card-foreground/5">
                <h3 className="font-semibold text-lg text-primary">{rental.bikeName}</h3>
                <p className="text-sm text-muted-foreground flex items-center mt-1">
                  <Users className="w-4 h-4 mr-1.5"/> Booked by: {rental.renterName}
                </p>
                <p className="text-sm text-muted-foreground flex items-center">
                  <Clock className="w-4 h-4 mr-1.5"/> Period: {format(new Date(rental.startDate), "PPP")} - {format(new Date(rental.endDate), "PPP")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Rental ID: {rental.id}</p>
                {rental.status === 'Upcoming' && (
                  <Button 
                    onClick={() => handleConfirmPickup(rental.id)} 
                    size="sm" 
                    variant="outline" 
                    className="mt-3 w-full sm:w-auto"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Bike Pickup
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-md text-muted-foreground text-center py-10">
            No upcoming rental bookings found.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
