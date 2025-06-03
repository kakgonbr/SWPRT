
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MOCK_RENTALS, MOCK_USERS, MOCK_BIKES } from '@/lib/mock-data';
import type { Rental, User as AppUser, Bike } from '@/lib/types';
import { format, isValid, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { UserCheck, CalendarIcon, MapPin, MessageSquare, FilterX, Bike as BikeIconLucide, Users, Clock, ListChecks, CalendarClock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface EnrichedRental extends Rental {
  renterName?: string;
  bikeName?: string;
  bikeLocation?: string;
}

export default function StaffDashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [allRentals, setAllRentals] = useState<Rental[]>([]);
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [allBikes, setAllBikes] = useState<Bike[]>([]);

  const [filterDateRange, setFilterDateRange] = useState<DateRange | undefined>(undefined);
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace('/auth/login?redirect=/staff');
      } else if (user?.role !== 'staff' && user?.role !== 'admin') {
        router.replace('/');
      }
    }
  }, [user, isAuthenticated, loading, router]);

  useEffect(() => {
    // Simulate fetching data
    setAllRentals(MOCK_RENTALS);
    setAllUsers(MOCK_USERS);
    setAllBikes(MOCK_BIKES);
  }, []);

  const availableLocations = useMemo(() => {
    const locations = new Set(MOCK_BIKES.map(bike => bike.location));
    return ['all', ...Array.from(locations)];
  }, []);

  const enrichedRentals: EnrichedRental[] = useMemo(() => {
    return allRentals.map(r => {
      const renter = allUsers.find(u => u.id === r.userId);
      const bike = allBikes.find(b => b.id === r.bikeId);
      return {
        ...r,
        renterName: renter?.name || 'Unknown User',
        bikeName: bike?.name || r.bikeName || 'Unknown Bike',
        bikeLocation: bike?.location || 'Unknown Location',
      };
    });
  }, [allRentals, allUsers, allBikes]);

  const filteredEnrichedRentals = useMemo(() => {
    return enrichedRentals.filter(rental => {
      const matchesLocation = filterLocation === 'all' || rental.bikeLocation === filterLocation;

      let matchesDate = true;
      if (filterDateRange?.from && filterDateRange?.to) {
        const rentalStart = startOfDay(new Date(rental.startDate));
        const rentalEnd = endOfDay(new Date(rental.endDate));
        const filterStart = startOfDay(filterDateRange.from);
        const filterEnd = endOfDay(filterDateRange.to);

        matchesDate = isWithinInterval(rentalStart, { start: filterStart, end: filterEnd }) ||
                      isWithinInterval(rentalEnd, { start: filterStart, end: filterEnd }) ||
                      (rentalStart <= filterStart && rentalEnd >= filterEnd);
      } else if (filterDateRange?.from) { // Only start date selected
        const rentalEnd = endOfDay(new Date(rental.endDate));
        const filterStart = startOfDay(filterDateRange.from);
        matchesDate = rentalEnd >= filterStart;
      }
      return matchesLocation && matchesDate;
    });
  }, [enrichedRentals, filterDateRange, filterLocation]);


  const activeRentals = useMemo(() => {
    return filteredEnrichedRentals
      .filter(r => r.status === 'Active')
      .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
  }, [filteredEnrichedRentals]);

  const upcomingRentals = useMemo(() => {
    return filteredEnrichedRentals
      .filter(r => r.status === 'Upcoming')
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [filteredEnrichedRentals]);

  const resetFilters = () => {
    setFilterDateRange(undefined);
    setFilterLocation('all');
  };

  if (loading || !isAuthenticated || (user?.role !== 'staff' && user?.role !== 'admin')) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Loading or unauthorized...</p>
      </div>
    );
  }

  const RentalInfoCard = ({ rental }: { rental: EnrichedRental }) => (
    <Card className="bg-card-foreground/5 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-md font-semibold text-primary flex items-center">
          <BikeIconLucide className="w-4 h-4 mr-1.5" />{rental.bikeName}
        </CardTitle>
        <CardDescription className="text-xs">Location: {rental.bikeLocation}</CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-3 text-xs space-y-0.5">
        <p className="text-muted-foreground flex items-center"><Users className="w-3 h-3 mr-1"/>Rented by: {rental.renterName}</p>
        <p className="text-muted-foreground flex items-center">
            <Clock className="w-3 h-3 mr-1"/>
            {rental.status === 'Active' ? 'Return:' : 'Starts:'} {format(new Date(rental.status === 'Active' ? rental.endDate : rental.startDate), "PP")}
        </p>
        <p className="text-muted-foreground flex items-center"><CalendarIcon className="w-3 h-3 mr-1"/>Period: {format(new Date(rental.startDate), "PP")} - {format(new Date(rental.endDate), "PP")}</p>
        <p className="text-muted-foreground mt-1">ID: {rental.id}</p>
      </CardContent>
    </Card>
  );


  return (
    <div className="space-y-8">
      <div className="mb-6 p-4 md:p-6 bg-card rounded-lg shadow">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2 flex items-center">
          <UserCheck className="w-8 h-8 md:w-10 md:h-10 mr-3" /> Staff Dashboard
        </h1>
        <p className="text-muted-foreground text-md md:text-lg">Manage rentals, customer support, and bike maintenance.</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Rental Management</CardTitle>
          <CardDescription>View and filter active and upcoming rentals.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="p-4 border rounded-lg bg-background space-y-4 md:space-y-0 md:flex md:items-end md:space-x-4">
            <div className="flex-grow">
              <Label htmlFor="dateRangeStaff" className="text-sm font-medium">Filter by Date Range</Label>
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="dateRangeStaff"
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal mt-1"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filterDateRange?.from ? (
                      filterDateRange.to ? (
                        <>
                          {format(filterDateRange.from, "LLL dd, y")} - {format(filterDateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(filterDateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={filterDateRange?.from}
                    selected={filterDateRange}
                    onSelect={(range) => {
                      setFilterDateRange(range);
                      // setIsDatePickerOpen(false); // Optional: close on select
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex-grow">
              <Label htmlFor="locationFilterStaff" className="text-sm font-medium">Filter by Location</Label>
              <Select value={filterLocation} onValueChange={setFilterLocation}>
                <SelectTrigger id="locationFilterStaff" className="w-full mt-1">
                  <MapPin className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {availableLocations.map(loc => (
                    <SelectItem key={loc} value={loc} className="capitalize">
                      {loc === 'all' ? 'All Locations' : loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={resetFilters} variant="outline" className="md:ml-auto">
              <FilterX className="mr-2 h-4 w-4" /> Clear Filters
            </Button>
          </div>

          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active"><ListChecks className="mr-2 h-4 w-4"/>Active ({activeRentals.length})</TabsTrigger>
              <TabsTrigger value="upcoming"><CalendarClock className="mr-2 h-4 w-4"/>Upcoming ({upcomingRentals.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              {activeRentals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 max-h-[60vh] overflow-y-auto pr-2">
                  {activeRentals.map(rental => <RentalInfoCard key={rental.id} rental={rental} />)}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No active rentals match your filters.</p>
              )}
            </TabsContent>
            <TabsContent value="upcoming">
              {upcomingRentals.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 max-h-[60vh] overflow-y-auto pr-2">
                  {upcomingRentals.map(rental => <RentalInfoCard key={rental.id} rental={rental} />)}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No upcoming rentals match your filters.</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Separator />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-primary" />Customer Support
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Utilize the chat widget in the bottom-right corner to respond to live customer inquiries.
            For more complex issues or asynchronous communication, please use dedicated support ticketing tools (if applicable).
          </p>
           <Button variant="outline" className="mt-4" onClick={() => {
             // This is a placeholder. In a real app, this might open a dedicated staff chat interface
             // or focus the main chat widget if there's a way for staff to "take over".
             alert("Staff Chat Interface (Placeholder) - Staff would typically use a dedicated system or the main chat widget to interact with users.");
           }}>
            Open Support Interface (Placeholder)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
