import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useParams, useLocation } from 'react-router-dom'
import {
    ArrowLeft,
    Calendar,
    MapPin,
    CreditCard,
    Shield
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Checkbox } from '../components/ui/checkbox'
import { Separator } from '../components/ui/separator'
import { Calendar as CalendarComponent } from '../components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover'
import { useAuth } from '../contexts/auth-context'
import { useToast } from '../contexts/toast-context.tsx'
import { RENTAL_OPTIONS } from '../lib/mock-data'
import { format, differenceInDays } from 'date-fns'
import { cn } from '../lib/utils'
import { bikeApi, rentalAPI } from "../lib/api.ts";
import { type VehicleModelDTO } from '../lib/types'
import type { Booking } from '../types/booking.ts'

const API = import.meta.env.VITE_API_BASE_URL;

export default function CheckoutPage() {
    const navigate = useNavigate()
    const { user, isAuthenticated, loading } = useAuth()
    const { toast } = useToast()
    const [error, setError] = useState<string>('');
    const [loadingState, setLoadingState] = useState(true);
    const { id } = useParams<{ id: string }>();
    const [termsTick, setTermsTick] = useState<boolean>(false);
    const [bike, setBike] = useState<VehicleModelDTO>();
    const location = useLocation();
    const [startDate, setStartDate] = useState<Date>()
    const [endDate, setEndDate] = useState<Date>()

    const rentalParams = location.state?.rentalParams;

    console.log(`RENTAL PARAMS OF CHECKOUT: ${rentalParams}`);

    useEffect(() => {
        if (rentalParams) {
            const params = new URLSearchParams(rentalParams);
            const startDateStr = params.get(`startDate`);
            const endDateStr = params.get(`endDate`);
            
            if (startDateStr) {
                setStartDate(new Date(startDateStr));
            }
            
            if (endDateStr) {
                setEndDate(new Date(endDateStr));
            }
        }
    }, [rentalParams]);
    
    console.log(`start date: ${startDate}, end date: ${endDate} in checkout page`);


    console.log(`bike id: ${id}`);

    const getVehicleModelDetailById = async () => {
        if (!id) return;
        setLoadingState(true);
        setError('');

        try {
            const bikeId = parseInt(id, 10);
            if (isNaN(bikeId)) {
                setError("Invalid bike ID");
                setLoadingState(false);
                return;
            }
            const data = await bikeApi.getBikeById(bikeId);
            setBike(data);
            // Auto-select the bike's shop location when data is loaded
            setSelectedLocation("bikeShop");
        } catch (error) {
            console.error(`Error fetching bike details: `, error);
            setError("Failed to load bike details. Please try again later.");
        } finally {
            setLoadingState(false);
        }
    };

    useEffect(() => {
        getVehicleModelDetailById();
    }, [id]);

    // Add a retry function
    const retryFetch = () => {
        setError('');
        getVehicleModelDetailById();
    };

    const handleTermsChange = (checked: boolean) => {
        setTermsTick(checked);
    }


    const [selectedOptions, setSelectedOptions] = useState(
        RENTAL_OPTIONS.map(option => ({ ...option, selected: false }))
    )
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [selectedLocation, setSelectedLocation] = useState<string>('')

    useEffect(() => {
        if (loading) return

        if (!isAuthenticated) {
            navigate('/auth/login')
            return
        }

        // if (!bikeId || !bike) {
        //     navigate('/')
        //     return
        // }

    }, [id, bike, isAuthenticated, loading, navigate])

    const handleOptionToggle = (optionId: string) => {
        setSelectedOptions(prev =>
            prev.map(option =>
                option.id === optionId
                    ? { ...option, selected: !option.selected }
                    : option
            )
        )
    }

    const calculateTotal = () => {
        if (!startDate || !endDate || !bike) return 0
        const days = differenceInDays(endDate, startDate)
        const bikeTotal = bike.ratePerDay * days
        const optionsTotal = selectedOptions
            .filter(option => option.selected)
            .reduce((sum, option) => sum + (option.price * days), 0)

        return bikeTotal + optionsTotal
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        //TODO: update the terms tick and payment information when done

        if (!termsTick) {
            console.log("Terms not checked, showing toast") // Debug log
            console.log("Current termsTick value: ", termsTick);
            const toastResult = toast({
                title: "Terms Agreement Required",
                description: "Please agree to the Terms and Conditions to proceed.",
                variant: "destructive",
            });
            console.log("Toast result: ", toastResult);
            return
        }

        if (!startDate || !endDate || !bike || !user || !selectedLocation || !termsTick) {
            toast({
                title: "Missing Information",
                description: "Please select dates and a pickup location.",
                variant: "destructive",
            })
            return
        }

        setIsSubmitting(true)

        try {
            const booking: Booking = {
                Id: '',
                CustomerId: user.userId,
                CustomerName: user.fullName,
                CustomerEmail: user.email,
                VehicleModelId: bike.modelId,
                BikeName: bike.displayName,
                BikeImageUrl: bike.imageFile,
                StartDate: startDate.toISOString().split('T')[0],
                EndDate: endDate.toISOString().split('T')[0],
                Status: 'Awaiting Payment',
                PricePerDay: bike.ratePerDay,
                //TODO: change the up front percentage to fixed deposit price for each bike
                Deposit: bike.upFrontPercentage,
                PickupLocation: selectedLocation === "bikeShop" ? bike.shop : selectedLocation,
                ReturnLocation: selectedLocation === "bikeShop" ? bike.shop : selectedLocation,
                PaymentMethod: 'Credit Card'
            };         

            console.log(`passing booking api data: ${booking.CustomerId, booking.CustomerName, booking.VehicleModelId, booking.StartDate}`)

            //payment should be complete in order to call this api
            //update the booking status before calling the api
            const bookingResult = await rentalAPI.createBooking(booking);

            console.log(`booking result ${bookingResult}`);

            toast({
                title: "Booking Confirmed!",
                description: `Your rental for ${bike.displayName} has been confirmed for ${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')} at ${location}.`,
            })

            // TODO
            const response = await fetch(`${API}/api/rentals/pay`, {
                method: 'GET',
                headers: {
                    Accept: 'text/plain',
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            if (!response.ok) {
                throw new Error(`API call failed with status ${response.status}`);
            }

            // Read plain text response
            const rawText: string = await response.text();

            // Handle possible null or empty string
            const result: string | null = rawText.trim().length > 0 ? rawText.trim() : null;

            if (result !== null) {
                window.location.href = result;
            } else {
                throw new Error("Cannot get payment URL.")
            }
        } catch (error) {
            toast({
                title: "Booking Failed",
                description: "There was an error processing your booking. Please try again.",
                variant: "destructive",
            })
            console.error(`Error booking bike:`, error);
            setError("Booking failed, There was an error processing your booking. Please try again.");
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (loadingState) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <Button variant="ghost" className="mb-6" asChild>
                    <Link to="/bikes">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Bikes
                    </Link>
                </Button>

                <div className="flex flex-col items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
                    <p className="text-muted-foreground">Loading bike details...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated || !bike) {
        return null // Will redirect
    }

    const days = startDate && endDate ? differenceInDays(endDate, startDate) : 0
    const total = calculateTotal()

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Back Button */}
            <Button variant="ghost" className="mb-6" asChild>
                <Link
                    to={`/bikes/${bike.modelId}`}
                    state={{
                        rentalParams: rentalParams
                    }}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Bike Details
                </Link>
            </Button>

            {/* Error Message */}
            {error && (
                <div
                    className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded-md mb-6 flex items-start justify-between">
                    <div className="flex items-start">
                        <div className="mr-2 mt-0.5">⚠️</div>
                        <div>
                            <p className="font-medium">Error</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={retryFetch} className="ml-4">
                        Retry
                    </Button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Booking Form */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Booking Details</CardTitle>
                            <CardDescription>
                                Select your rental dates and options
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Date Selection */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !startDate && "text-muted-foreground"
                                                )}
                                                disabled={!!rentalParams}
                                            >
                                                <Calendar className="mr-2 h-4 w-4" />
                                                {startDate ? format(startDate, "PPP") : "Pick a date"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <CalendarComponent
                                                mode="single"
                                                selected={startDate}
                                                onSelect={setStartDate}
                                                disabled={(date: Date) => date < new Date() || !!rentalParams}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <Label>End Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !endDate && "text-muted-foreground"
                                                )}
                                                disabled={!!rentalParams}
                                            >
                                                <Calendar className="mr-2 h-4 w-4" />
                                                {endDate ? format(endDate, "PPP") : "Pick a date"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <CalendarComponent
                                                mode="single"
                                                selected={endDate}
                                                onSelect={setEndDate}
                                                disabled={(date: Date) => date < (startDate || new Date()) || !!rentalParams}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            {days > 0 && (
                                <div className="p-3 bg-muted rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                        Rental duration: <span
                                            className="font-medium">{days} {days === 1 ? 'day' : 'days'}</span>
                                    </p>
                                </div>
                            )}

                            {/* Location Selection */}
                            <div className="space-y-2 mt-4">
                                <Label>Pickup Location</Label>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <Checkbox
                                            id="bikeShop"
                                            checked={selectedLocation === "bikeShop"}
                                            onCheckedChange={() => setSelectedLocation("bikeShop")}
                                        />
                                        <div className="flex-1">
                                            <Label htmlFor="bikeShop" className="cursor-pointer font-medium">
                                                {bike.shop}
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                {bike.vehicleType} pickup location
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Rental Options */}
                            <div className="space-y-4">
                                <Label className="text-base font-semibold">Additional Options</Label>
                                <div className="space-y-3">
                                    {selectedOptions.map((option) => (
                                        <div key={option.id} className="flex items-center space-x-3">
                                            <Checkbox
                                                id={option.id}
                                                checked={option.selected}
                                                onCheckedChange={() => handleOptionToggle(option.id)}
                                            />
                                            <div className="flex-1 flex justify-between items-center">
                                                <Label htmlFor={option.id} className="cursor-pointer">
                                                    {option.name}
                                                </Label>
                                                <span className="text-sm font-medium">
                                                    ${option.price}/day
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Information</CardTitle>
                            <CardDescription>
                                Enter your payment details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cardNumber">Card Number</Label>
                                    <Input
                                        id="cardNumber"
                                        placeholder="1234 5678 9012 3456"
                                        type="text"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="expiryDate">Expiry Date</Label>
                                    <Input
                                        id="expiryDate"
                                        placeholder="MM/YY"
                                        type="text"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cvv">CVV</Label>
                                    <Input
                                        id="cvv"
                                        placeholder="123"
                                        type="text"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cardName">Cardholder Name</Label>
                                    <Input
                                        id="cardName"
                                        placeholder="John Doe"
                                        type="text"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Order Summary */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Bike Details */}
                            <div className="flex space-x-4">
                                <img
                                    src={bike.imageFile.split('"')[0]}
                                    alt={bike.displayName}
                                    className="w-20 h-20 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                    <h3 className="font-semibold">{bike.displayName}</h3>
                                    <p className="text-sm text-muted-foreground">{bike.vehicleType}</p>
                                    <div className="flex items-center mt-1">
                                        <MapPin className="w-3 h-3 mr-1" />
                                        <span className="text-xs text-muted-foreground">{bike.shop}</span>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Pricing Breakdown */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Bike rental ({days} {days === 1 ? 'day' : 'days'})</span>
                                    <span>${(bike.ratePerDay * days).toFixed(2)}</span>
                                </div>

                                {selectedOptions
                                    .filter(option => option.selected)
                                    .map(option => (
                                        <div key={option.id} className="flex justify-between text-sm">
                                            <span>{option.name} ({days} {days === 1 ? 'day' : 'days'})</span>
                                            <span>${(option.price * days).toFixed(2)}</span>
                                        </div>
                                    ))}

                                <Separator />

                                <div className="flex justify-between font-semibold">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>

                            <Separator />

                            {/* Terms and Conditions */}
                            <div className="space-y-3">
                                <div className="flex items-start space-x-2">
                                    <Checkbox id="terms" checked={termsTick} onCheckedChange={(checked) => handleTermsChange(checked === true)} />
                                    <Label htmlFor="terms" className="text-sm cursor-pointer">
                                        I agree to the{' '}
                                        <Link to="/terms" className="text-primary underline">
                                            Terms and Conditions
                                        </Link>
                                    </Label>
                                </div>

                                <div className="flex items-start space-x-2">
                                    <Checkbox id="understandInsurance" />
                                    <Label htmlFor="understandInsurance" className="text-sm cursor-pointer">
                                        I understand the insurance coverage and liability
                                    </Label>
                                </div>
                            </div>

                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handleSubmit}
                                disabled={isSubmitting || !startDate || !endDate || !selectedLocation}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center">
                                        <div
                                            className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                                        Processing...
                                    </div>
                                ) : (
                                    <>
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        Confirm Booking - ${total.toFixed(2)}
                                    </>
                                )}
                            </Button>

                            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                                <Shield className="w-4 h-4" />
                                <span>Secure payment protected by SSL</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}