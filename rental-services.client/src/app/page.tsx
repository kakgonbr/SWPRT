"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, startOfDay, addDays, isValid, parse } from 'date-fns';
import { CalendarCheck, Search, CalendarIcon, MapPin } from 'lucide-react';
import { MOCK_BIKES } from '@/lib/mock-data';

export default function SelectDatesAndLocationPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>(undefined);

  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);

  // Initialize dates on the client-side to avoid hydration mismatch
  useEffect(() => {
    const today = startOfDay(new Date());
    setStartDate(today);
    setEndDate(addDays(today, 3));
  }, []);

  // Effect to ensure endDate is not before startDate if startDate changes
  useEffect(() => {
    if (startDate && endDate && isValid(startDate) && isValid(endDate) && startOfDay(endDate) < startOfDay(startDate)) {
      setEndDate(undefined); 
      toast({
        title: "End Date Adjusted",
        description: "End date cannot be before the start date. Please re-select.",
        variant: "destructive",
      });
    }
  }, [startDate, endDate, toast]);

  const availableLocations = useMemo(() => {
    const locations = new Set(MOCK_BIKES.map(bike => bike.location));
    return ['Any Location', ...Array.from(locations)];
  }, []);

  useEffect(() => {
    if (availableLocations.length > 0 && !selectedLocation) {
      setSelectedLocation(availableLocations[0]); // Default to "Any Location" or first actual location
    }
  }, [availableLocations, selectedLocation]);


  const handleFindBikes = () => {
    if (!startDate || !endDate || !isValid(startDate) || !isValid(endDate)) {
      toast({
        title: "Invalid Date Range",
        description: "Please select both a valid start and end date for your rental.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedLocation) {
      toast({
        title: "Location Not Selected",
        description: "Please select a rental location.",
        variant: "destructive",
      });
      return;
    }

    const today = startOfDay(new Date());

    if (startOfDay(startDate) < today) {
      toast({
        title: "Invalid Start Date",
        description: "The start date cannot be in the past.",
        variant: "destructive",
      });
      return;
    }
    
    if (startOfDay(startDate) > startOfDay(endDate)) {
      toast({
        title: "Invalid Date Order",
        description: "The start date cannot be after the end date.",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('motoRentSelectedDates', JSON.stringify({
      from: startDate.toISOString(),
      to: endDate.toISOString(),
    }));
    localStorage.setItem('motoRentSelectedLocation', selectedLocation);
    router.push('/bikes');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] py-12">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <CalendarCheck className="w-12 h-12 mx-auto text-primary mb-4" />
          <CardTitle className="text-3xl font-bold">Welcome to VroomVroom.vn!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Select your rental dates and location to find available motorbikes.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6 px-4 md:px-6">
          <div className="w-full space-y-4">
            <div>
              <Label htmlFor="locationSelect" className="mb-1.5 block text-sm font-medium">Rental Location</Label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger id="locationSelect" className="w-full">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {availableLocations.map(loc => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <div>
                <Label htmlFor="startDatePopover" className="mb-1.5 block text-sm font-medium">Start Date</Label>
                <Popover open={isStartDatePickerOpen} onOpenChange={setIsStartDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="startDatePopover"
                      variant={"outline"}
                      className="w-full justify-start text-left font-normal"
                      disabled={startDate === undefined} // Disable button until date is initialized client-side
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate && isValid(startDate) ? format(startDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        const newStartDate = date ? startOfDay(date) : undefined;
                        setStartDate(newStartDate);
                        if (newStartDate && endDate && isValid(newStartDate) && isValid(endDate) && startOfDay(newStartDate) > startOfDay(endDate)) {
                           setEndDate(undefined);
                           toast({
                                title: "End Date Cleared",
                                description: "End date was before the new start date and has been cleared.",
                                variant: "destructive", 
                            });
                        }
                        setIsStartDatePickerOpen(false);
                      }}
                      disabled={{ before: startOfDay(new Date()) }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="endDatePopover" className="mb-1.5 block text-sm font-medium">End Date</Label>
                <Popover open={isEndDatePickerOpen} onOpenChange={setIsEndDatePickerOpen}>
                  <PopoverTrigger asChild>
                     <Button
                      id="endDatePopover"
                      variant={"outline"}
                      className="w-full justify-start text-left font-normal"
                      disabled={!startDate} 
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate && isValid(endDate) ? format(endDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        const newEndDate = date ? startOfDay(date) : undefined;
                        setEndDate(newEndDate);
                        setIsEndDatePickerOpen(false);
                      }}
                      disabled={ (startDate && isValid(startDate)) ? { before: startOfDay(startDate) } : { before: startOfDay(new Date()) }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          
          {startDate && endDate && isValid(startDate) && isValid(endDate) && selectedLocation && (
            <p className="text-sm text-muted-foreground pt-4">
              Location: {selectedLocation} <br />
              Period: {format(startDate, "PPP")} - {format(endDate, "PPP")}
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button
            size="lg"
            className="w-full"
            onClick={handleFindBikes}
            disabled={!startDate || !endDate || !isValid(startDate) || !isValid(endDate) || !selectedLocation}
          >
            <Search className="w-5 h-5 mr-2" />
            Find Bikes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
