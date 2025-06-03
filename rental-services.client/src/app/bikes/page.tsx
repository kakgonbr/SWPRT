
"use client";

import BikeCard from '@/components/bikes/bike-card';
import { MOCK_BIKES } from '@/lib/mock-data';
import type { Bike } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ListFilter, RefreshCw, Bike as BikeIcon, CalendarDays, Menu, CalendarX, Gauge } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';

interface SelectedDates extends DateRange {
  from: Date;
  to: Date;
}

const CYLINDER_VOLUME_CATEGORIES = [
  { value: 'all', label: 'All Volumes' },
  { value: 'electric', label: 'Electric / N/A' },
  { value: 'under-150', label: '< 150cc' },
  { value: '150-300', label: '150cc - 300cc' },
  { value: '301-500', label: '301cc - 500cc' },
  { value: 'over-500', label: '> 500cc' },
];

export default function BikesPage() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [bikeTypeFilter, setBikeTypeFilter] = useState('all');
  const [cylinderVolumeFilter, setCylinderVolumeFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDates, setSelectedDates] = useState<SelectedDates | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedDatesString = localStorage.getItem('motoRentSelectedDates');
    const storedLocationString = localStorage.getItem('motoRentSelectedLocation');

    if (!storedDatesString || !storedLocationString) {
      router.replace('/'); 
      return;
    }

    try {
      const parsedDates = JSON.parse(storedDatesString);
      if (parsedDates.from && parsedDates.to) {
        setSelectedDates({
          from: new Date(parsedDates.from),
          to: new Date(parsedDates.to),
        });
        setSelectedLocation(storedLocationString);
      } else {
        throw new Error("Invalid date format in localStorage");
      }
    } catch (error) {
      console.error("Failed to parse dates/location from localStorage:", error);
      localStorage.removeItem('motoRentSelectedDates');
      localStorage.removeItem('motoRentSelectedLocation');
      router.replace('/');
      return;
    }
    
    setTimeout(() => {
      const bikesForLocation = selectedLocation && selectedLocation !== 'Any Location'
        ? MOCK_BIKES.filter(bike => bike.location === selectedLocation)
        : MOCK_BIKES;
      setBikes(bikesForLocation);
      setIsLoading(false);
    }, 500);
  }, [router, selectedLocation]); 

  const bikeTypes = useMemo(() => {
     const allTypes = new Set(MOCK_BIKES.map(bike => bike.type));
    return ['all', ...Array.from(allTypes)];
  }, []);

  const filteredBikes = useMemo(() => {
    return bikes.filter(bike => {
      const matchesType = bikeTypeFilter === 'all' || bike.type === bikeTypeFilter;
      
      let matchesCylinderVolume = true;
      if (cylinderVolumeFilter !== 'all') {
        if (cylinderVolumeFilter === 'electric') {
          matchesCylinderVolume = bike.type === 'Electric' || !bike.cylinderVolume;
        } else if (bike.cylinderVolume) {
          const volume = bike.cylinderVolume;
          if (cylinderVolumeFilter === 'under-150') matchesCylinderVolume = volume < 150;
          else if (cylinderVolumeFilter === '150-300') matchesCylinderVolume = volume >= 150 && volume <= 300;
          else if (cylinderVolumeFilter === '301-500') matchesCylinderVolume = volume >= 301 && volume <= 500;
          else if (cylinderVolumeFilter === 'over-500') matchesCylinderVolume = volume > 500;
          else matchesCylinderVolume = false; // if bike has volume but filter is not for electric
        } else { // bike has no cylinder volume, but filter is not 'electric' or 'all'
          matchesCylinderVolume = false;
        }
      }
      
      return matchesType && matchesCylinderVolume;
    });
  }, [bikes, bikeTypeFilter, cylinderVolumeFilter]);

  const resetFilters = () => {
    setBikeTypeFilter('all');
    setCylinderVolumeFilter('all');
  };

  const handleChangeDatesAndLocation = () => {
    localStorage.removeItem('motoRentSelectedDates');
    localStorage.removeItem('motoRentSelectedLocation');
    router.push('/');
  };
  
  if ((!selectedDates || !selectedLocation) && !isLoading) { 
    return (
        <div className="flex justify-center items-center h-full">
          <p>Redirecting to select dates & location...</p>
        </div>
    );
  }
  
  const FiltersComponent = () => (
    <>
      <div className="space-y-4">
        <div>
          <Label htmlFor="bikeTypeFilter" className="text-sm font-medium text-muted-foreground">Filter by Type</Label>
          <Select value={bikeTypeFilter} onValueChange={setBikeTypeFilter}>
            <SelectTrigger id="bikeTypeFilter" className="w-full mt-1">
              <ListFilter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              {bikeTypes.map(type => (
                <SelectItem key={type} value={type} className="capitalize">
                  {type === 'all' ? 'All Types' : type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="cylinderVolumeFilter" className="text-sm font-medium text-muted-foreground">Filter by Cylinder Volume</Label>
          <Select value={cylinderVolumeFilter} onValueChange={setCylinderVolumeFilter}>
            <SelectTrigger id="cylinderVolumeFilter" className="w-full mt-1">
              <Gauge className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter by Cylinder Volume" />
            </SelectTrigger>
            <SelectContent>
              {CYLINDER_VOLUME_CATEGORIES.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );


  return (
      <SidebarProvider defaultOpen={true}> 
        <Sidebar side="left" variant="sidebar" collapsible="icon" className="border-r bg-card">
          <SidebarHeader className="p-4">
            <h2 className="text-xl font-semibold text-primary">Filters</h2>
          </SidebarHeader>
          <Separator className="mb-2"/>
          <SidebarContent className="p-4">
            <FiltersComponent />
          </SidebarContent>
          <Separator className="mt-auto"/>
          <SidebarFooter className="p-4 space-y-2">
            <Button onClick={resetFilters} variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" /> Reset Filters
            </Button>
            <Button onClick={handleChangeDatesAndLocation} variant="outline" className="w-full">
              <CalendarX className="h-4 w-4 mr-2" /> Change Dates/Location
            </Button>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <div className="p-1 md:p-0"> 
            <div className="mb-6 p-4 bg-card rounded-lg shadow md:p-6">
              <div className="flex justify-between items-center mb-2">
                <h1 className="text-3xl font-bold text-primary md:text-4xl">Find Your Next Ride</h1>
                <div className="md:hidden">
                  <SidebarTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Toggle Filters</span>
                    </Button>
                  </SidebarTrigger>
                </div>
              </div>
              <p className="text-muted-foreground text-base md:text-lg">Browse our extensive catalog of motorbikes available for rent.</p>
              {selectedDates?.from && selectedDates?.to && selectedLocation && (
                <Alert className="mt-4 text-sm">
                  <CalendarDays className="h-4 w-4" />
                  <AlertTitle className="font-semibold">Selected Rental Details</AlertTitle>
                  <AlertDescription>
                    Location: {selectedLocation} <br/>
                    Period: {format(selectedDates.from, "PPP")} to {format(selectedDates.to, "PPP")}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"> 
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm animate-pulse">
                    <div className="aspect-video bg-muted rounded-t-lg"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-6 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-10 bg-muted rounded w-full mt-2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredBikes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"> 
                {filteredBikes.map(bike => (
                  <BikeCard key={bike.id} bike={bike} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BikeIcon className="mx-auto h-24 w-24 text-muted-foreground opacity-50 mb-4" />
                <h2 className="text-2xl font-semibold text-muted-foreground">No Motorbikes Found</h2>
                <p className="text-foreground/70 mt-2">
                  No bikes match your current filters or selected location. Try adjusting your criteria.
                </p>
                <Button onClick={resetFilters} variant="link" className="mt-2 text-primary">
                  Clear all filters
                </Button>
                 <Button onClick={handleChangeDatesAndLocation} variant="link" className="mt-2 text-primary">
                  Change dates or location
                </Button>
              </div>
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
  );
}
