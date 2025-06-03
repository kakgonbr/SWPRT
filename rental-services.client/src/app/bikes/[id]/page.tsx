
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { MOCK_BIKES, MOCK_RENTALS, RENTAL_OPTIONS } from '@/lib/mock-data';
import type { Bike, OrderDetails } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { addDays, differenceInDays, format, isValid, startOfDay } from 'date-fns';
import { Tag, Star, DollarSign, MapPinIcon, Settings, CalendarDays, ShoppingCart, AlertCircle, CheckCircle, PackageIcon, UserCheck2, CalendarIcon } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export default function BikeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [bike, setBike] = useState<Bike | null>(null);

  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);

  const [selectedOptions, setSelectedOptions] = useState<typeof RENTAL_OPTIONS>(
    RENTAL_OPTIONS.map(opt => ({ ...opt, selected: false }))
  );
  const [totalPrice, setTotalPrice] = useState(0);
  const [numberOfDays, setNumberOfDays] = useState(0);
  const [isAvailableForDates, setIsAvailableForDates] = useState<boolean | null>(null);
  const [quantityAvailableForDates, setQuantityAvailableForDates] = useState(0);
  const [desiredQuantity, setDesiredQuantity] = useState(1);

  useEffect(() => {
    if (params.id) {
      const foundBike = MOCK_BIKES.find(b => b.id === params.id);
      setBike(foundBike || null);
    }
  }, [params.id]);

  // Initialize dates on the client-side
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


  // Calculate quantity available for dates
  useEffect(() => {
    if (!bike || !startDate || !endDate || !isValid(startDate) || !isValid(endDate)) {
      setIsAvailableForDates(null);
      setQuantityAvailableForDates(0);
      return;
    }

    if (!bike.isAvailable) {
      setIsAvailableForDates(false);
      setQuantityAvailableForDates(0);
      return;
    }

    const selectedStartTime = startDate.getTime();
    const selectedEndTime = endDate.getTime();
    let rentedCountDuringPeriod = 0;

    MOCK_RENTALS.forEach(rental => {
      if (rental.bikeId === bike.id && (rental.status === 'Active' || rental.status === 'Upcoming')) {
        const rentalStartTime = new Date(rental.startDate).getTime();
        const rentalEndTime = new Date(rental.endDate).getTime();
        if (selectedStartTime <= rentalEndTime && selectedEndTime >= rentalStartTime) {
          rentedCountDuringPeriod++;
        }
      }
    });

    const calculatedQuantityAvailable = bike.amount - rentedCountDuringPeriod;
    setQuantityAvailableForDates(Math.max(0, calculatedQuantityAvailable));
    setIsAvailableForDates(calculatedQuantityAvailable > 0);

  }, [bike, startDate, endDate]);

   useEffect(() => {
    if (quantityAvailableForDates === 0) {
      setDesiredQuantity(0);
    } else if (desiredQuantity > quantityAvailableForDates) {
      setDesiredQuantity(quantityAvailableForDates);
    } else if (desiredQuantity <= 0 && quantityAvailableForDates > 0) {
      setDesiredQuantity(1);
    }
  }, [quantityAvailableForDates, desiredQuantity]);


  useEffect(() => {
    if (bike && startDate && endDate && isValid(startDate) && isValid(endDate) && desiredQuantity > 0 && numberOfDays > 0) {
      const baseBikeCost = bike.pricePerDay * numberOfDays * desiredQuantity;
      const optionsCostPerDay = selectedOptions.reduce((sum, opt) => opt.selected ? sum + opt.price : sum, 0);
      const totalOptionsCost = optionsCostPerDay * numberOfDays;
      setTotalPrice(baseBikeCost + totalOptionsCost);
    } else {
      setTotalPrice(0);
    }
  }, [bike, startDate, endDate, selectedOptions, desiredQuantity, numberOfDays]);

  useEffect(() => {
    if (startDate && endDate && isValid(startDate) && isValid(endDate)) {
        const days = differenceInDays(endDate, startDate) + 1;
        setNumberOfDays(days > 0 ? days : 0);
    } else {
        setNumberOfDays(0);
    }
  }, [startDate, endDate]);


  const handleOptionChange = (optionId: string) => {
    setSelectedOptions(prevOptions =>
      prevOptions.map(opt =>
        opt.id === optionId ? { ...opt, selected: !opt.selected } : opt
      )
    );
  };

  const handleDesiredQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newQuantity = parseInt(e.target.value, 10);
    if (isNaN(newQuantity)) {
      newQuantity = 0; 
    }
    if (newQuantity < 0) newQuantity = 0;
    if (quantityAvailableForDates > 0 && newQuantity > quantityAvailableForDates) {
      newQuantity = quantityAvailableForDates;
    }
     if (quantityAvailableForDates === 0 && newQuantity > 0) {
        newQuantity = 0;
    }
    setDesiredQuantity(newQuantity);
  };

  const hasCredentials = !!(user?.credentialIdNumber && user.credentialIdImageUrl);

  const canProceedToRent = 
    bike &&
    bike.isAvailable &&
    startDate && endDate && isValid(startDate) && isValid(endDate) && // Check dates
    numberOfDays > 0 &&
    isAvailableForDates === true &&
    desiredQuantity > 0 &&
    desiredQuantity <= quantityAvailableForDates;

  const handleRentAction = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to rent a motorbike.",
        variant: "destructive",
      });
      router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }

    if (!hasCredentials) {
      toast({
        title: "Credentials Required",
        description: "Please update your profile with your credential ID and ID image to rent a motorbike.",
        variant: "destructive",
        action: <Button onClick={() => router.push('/profile?redirect=' + encodeURIComponent(window.location.pathname + window.location.search))}>Go to Profile</Button>
      });
      return;
    }

    if (!canProceedToRent || !bike || !startDate || !endDate) {
      toast({
        title: "Rental Not Possible",
        description: "Please select a valid date range, ensure bike availability, and set a valid quantity.",
        variant: "destructive",
      });
      return;
    }

    const orderDetails: OrderDetails = {
      bike,
      startDate: startDate,
      endDate: endDate,
      options: selectedOptions.filter(opt => opt.selected),
      totalPrice,
      numDays: numberOfDays,
      quantityRented: desiredQuantity,
    };
    localStorage.setItem('currentOrder', JSON.stringify(orderDetails));
    router.push('/checkout');
  };


  if (!bike) {
    return (
        <div className="text-center py-10">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h1 className="text-2xl font-semibold">Motorbike Not Found</h1>
          <p className="text-muted-foreground">The motorbike you are looking for does not exist or is currently unavailable.</p>
          <Button onClick={() => router.push('/')} className="mt-4">Back to Catalog</Button>
        </div>
    );
  }

  let rentButtonText = "Rent Now & Proceed to Checkout";
  let rentButtonDisabled = false;
  let rentButtonIcon = <ShoppingCart className="w-5 h-5 mr-2" />;

  if (!isAuthenticated) {
    rentButtonText = "Login to Rent";
    rentButtonIcon = <UserCheck2 className="w-5 h-5 mr-2" />;
    rentButtonDisabled = false;
  } else if (!hasCredentials) {
    rentButtonText = "Update Profile to Rent";
    rentButtonIcon = <UserCheck2 className="w-5 h-5 mr-2" />;
    rentButtonDisabled = false;
  } else if (!canProceedToRent) {
    rentButtonDisabled = true;
    if (!bike.isAvailable) rentButtonText = 'Bike Model Unavailable';
    else if (!startDate || !endDate || (numberOfDays <=0 && startDate && endDate)) rentButtonText = 'Select Valid Dates';
    else if (!isAvailableForDates && startDate && endDate) rentButtonText = 'Unavailable for Dates';
    else if (quantityAvailableForDates > 0 && desiredQuantity <= 0) rentButtonText = 'Select Quantity';
    else if (desiredQuantity > quantityAvailableForDates) rentButtonText = 'Quantity Exceeds Stock';
    else rentButtonText = 'Check Rental Details';
  }


  return (
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
        <Card className="shadow-xl">
          <CardHeader className="p-0">
            <div className="aspect-video relative w-full rounded-t-lg overflow-hidden">
              <Image
                src={bike.imageUrl.split('"')[0]} 
                alt={bike.name}
                layout="fill"
                objectFit="cover"
                 {...(bike.imageUrl.includes('data-ai-hint') ? { 'data-ai-hint': bike.imageUrl.split('data-ai-hint="')[1].split('"')[0] } : {})}
              />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <h1 className="text-3xl font-bold text-primary mb-2">{bike.name}</h1>
            <div className="flex items-center text-sm text-muted-foreground mb-1">
              <Tag className="w-4 h-4 mr-1.5" /> {bike.type}
            </div>
            <div className="flex items-center text-sm text-muted-foreground mb-3">
              <MapPinIcon className="w-4 h-4 mr-1.5" /> {bike.location}
            </div>
            {bike.rating && (
              <div className="flex items-center text-amber-400 mb-3">
                {[...Array(Math.floor(bike.rating))].map((_, i) => (
                  <Star key={`full-${i}`} className="w-5 h-5 fill-current" />
                ))}
                {bike.rating % 1 !== 0 && <Star key="half" className="w-5 h-5 fill-current opacity-50" />}
                {[...Array(5 - Math.ceil(bike.rating))].map((_, i) => (
                  <Star key={`empty-${i}`} className="w-5 h-5 text-muted-foreground" />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">({bike.rating.toFixed(1)} rating)</span>
              </div>
            )}
            <p className="text-foreground/80 mb-4">{bike.description}</p>

            <h3 className="font-semibold text-lg mb-2 flex items-center"><Settings className="w-5 h-5 mr-2 text-primary" />Features:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-foreground/70">
              {bike.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
             {!bike.isAvailable && ( 
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Currently Unavailable</AlertTitle>
                <AlertDescription>
                  This motorbike model is not available for rent at the moment.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-xl sticky top-24">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center"><CalendarDays className="w-6 h-6 mr-2 text-primary" />Rental Options</CardTitle>
            <CardDescription>Select your rental period, quantity, and additional options.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium mb-2 block">Rental Dates</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDateBikeDetails" className="text-sm font-medium mb-1.5 block">Start Date</Label>
                   <Popover open={isStartDatePickerOpen} onOpenChange={setIsStartDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        id="startDateBikeDetails"
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal"
                        disabled={startDate === undefined}
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
                  <Label htmlFor="endDateBikeDetails" className="text-sm font-medium mb-1.5 block">End Date</Label>
                  <Popover open={isEndDatePickerOpen} onOpenChange={setIsEndDatePickerOpen}>
                    <PopoverTrigger asChild>
                       <Button
                        id="endDateBikeDetails"
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal"
                        disabled={!startDate || endDate === undefined} 
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
              {startDate && endDate && isValid(startDate) && isValid(endDate) && (
                <p className="text-sm text-muted-foreground mt-2">
                  Selected: {format(startDate, "PPP")} - {format(endDate, "PPP")} ({numberOfDays} {numberOfDays === 1 ? 'day' : 'days'})
                </p>
              )}
            </div>
            
            {isAvailableForDates !== null && startDate && endDate && isValid(startDate) && isValid(endDate) && bike.isAvailable && (
              <Alert variant={isAvailableForDates && quantityAvailableForDates > 0 ? "default" : "destructive"} className="mb-0">
                {isAvailableForDates && quantityAvailableForDates > 0 ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>
                  {isAvailableForDates && quantityAvailableForDates > 0 ? "Bike Availability" : "Bike Not Available"}
                </AlertTitle>
                <AlertDescription>
                  {isAvailableForDates && quantityAvailableForDates > 0
                    ? `${quantityAvailableForDates} unit(s) of this motorbike ${quantityAvailableForDates === 1 ? 'is' : 'are'} available for your selected dates.`
                    : "This motorbike is not available for the selected period, or not enough units are available. Please choose different dates or another bike."}
                </AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="quantity" className="text-base font-medium mb-2 block flex items-center">
                <PackageIcon className="w-5 h-5 mr-2 text-primary" /> Quantity
              </Label>
              <Input
                type="number"
                id="quantity"
                value={desiredQuantity}
                onChange={handleDesiredQuantityChange}
                min={bike.isAvailable && quantityAvailableForDates > 0 ? 1 : 0}
                max={quantityAvailableForDates}
                className="w-full"
                disabled={!bike.isAvailable || !isAvailableForDates || quantityAvailableForDates === 0}
              />
              {bike.isAvailable && isAvailableForDates && quantityAvailableForDates > 0 && (
                 <p className="text-xs text-muted-foreground mt-1">Max available: {quantityAvailableForDates}</p>
              )}
            </div>

            <div>
              <h3 className="text-base font-medium mb-3 mt-4">Additional Options</h3>
              <div className="space-y-3">
                {selectedOptions.map(option => (
                  <div key={option.id} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-muted/50 transition-colors">
                    <Checkbox
                      id={option.id}
                      checked={option.selected}
                      onCheckedChange={() => handleOptionChange(option.id)}
                      disabled={!bike.isAvailable || !isAvailableForDates}
                    />
                    <Label htmlFor={option.id} className="flex-grow text-sm font-normal cursor-pointer">
                      {option.name}
                    </Label>
                    <span className="text-sm text-muted-foreground">+ ${option.price}/day</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <Separator />
          <CardFooter className="p-6 flex flex-col items-stretch space-y-4">
            <div className="flex justify-between items-center text-2xl font-bold">
              <span>Total Price:</span>
              <span className="text-primary">${totalPrice.toFixed(2)}</span>
            </div>
             <p className="text-sm text-muted-foreground text-right">
              Bike(s): ${bike.pricePerDay}/day/unit. Options priced per day for the rental period.
            </p>
            <Button
              size="lg"
              className="w-full"
              onClick={handleRentAction}
              disabled={rentButtonDisabled}
            >
              {rentButtonIcon}
              {rentButtonText}
            </Button>
             {!isAuthenticated && (
                <p className="text-xs text-muted-foreground text-center">Log in to see personalized rental options.</p>
            )}
            {isAuthenticated && !hasCredentials && (
                <p className="text-xs text-destructive text-center">Please complete your profile with ID credentials to enable rentals.</p>
            )}
          </CardFooter>
        </Card>
      </div>
  );
}

    