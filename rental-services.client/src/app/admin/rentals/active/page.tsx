
"use client";

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ListChecks, Users, Clock } from 'lucide-react';
import { MOCK_BIKES, MOCK_RENTALS, MOCK_USERS } from '@/lib/mock-data';
import type { Bike, Rental, User as AppUser } from '@/lib/types';
import { format } from 'date-fns';

interface EnrichedRental extends Rental {
  renterName?: string;
  bikeName?: string;
}

export default function ActiveRentalsPage() {
  const [allRentals, setAllRentals] = useState<Rental[]>([]);
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [bikes, setBikes] = useState<Bike[]>([]);

  useEffect(() => {
    // Simulate fetching data
    setBikes(MOCK_BIKES);
    setAllRentals(MOCK_RENTALS);
    setAllUsers(MOCK_USERS);
  }, []);

  const activeRentals: EnrichedRental[] = useMemo(() => {
    return allRentals
      .filter(r => r.status === 'Active')
      .map(r => ({
        ...r,
        renterName: allUsers.find(u => u.id === r.userId)?.name || 'Unknown User',
        bikeName: bikes.find(b => b.id === r.bikeId)?.name || r.bikeName || 'Unknown Bike',
      }))
      .sort((a,b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
  }, [allRentals, allUsers, bikes]);

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-2xl font-semibold flex items-center">
            <ListChecks className="h-7 w-7 mr-2 text-primary" />Current Rental Status
          </CardTitle>
          <CardDescription>Monitor bikes that are currently rented out.</CardDescription>
        </div>
        <Badge variant="outline">{activeRentals.length} Active</Badge>
      </CardHeader>
      <CardContent>
        {activeRentals.length > 0 ? (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {activeRentals.map(rental => (
              <div key={rental.id} className="p-4 border rounded-lg shadow-sm bg-card-foreground/5">
                <h3 className="font-semibold text-lg text-primary">{rental.bikeName}</h3>
                <p className="text-sm text-muted-foreground flex items-center mt-1">
                  <Users className="w-4 h-4 mr-1.5"/> Rented by: {rental.renterName}
                </p>
                <p className="text-sm text-muted-foreground flex items-center">
                  <Clock className="w-4 h-4 mr-1.5"/>Return: {format(new Date(rental.endDate), "PPP 'at' p")}
                </p>
                 <p className="text-xs text-muted-foreground mt-1">Rental ID: {rental.id}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-md text-muted-foreground text-center py-10">
            No bikes are currently rented out.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
