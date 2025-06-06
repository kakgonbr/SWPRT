// src/pages/CheckoutPage.tsx
import {useState, useEffect} from 'react'
import {useNavigate, useSearchParams, Link} from 'react-router-dom'
import {
    ArrowLeft,
    Calendar,
    MapPin,
    CreditCard,
    Shield,
    //@ts-ignore

    Plus,
    //@ts-ignore

    Minus,
    //@ts-ignore

    Info
} from 'lucide-react'
import {Button} from '../components/ui/button'
import {Input} from '../components/ui/input'
import {Label} from '../components/ui/label'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../components/ui/card'
import {Checkbox} from '../components/ui/checkbox'
import {Separator} from '../components/ui/separator'
//@ts-ignore

import {Badge} from '../components/ui/badge'
import {Calendar as CalendarComponent} from '../components/ui/calendar'
import {Popover, PopoverContent, PopoverTrigger} from '../components/ui/popover'
import {useAuth} from '../contexts/auth-context'
import {useToast} from '../hooks/use-toast'
import {MOCK_BIKES, RENTAL_OPTIONS} from '../lib/mock-data'
import {format, addDays, differenceInDays} from 'date-fns'
import {cn} from '../lib/utils'

export default function CheckoutPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const {user, isAuthenticated, loading} = useAuth()
    const {toast} = useToast()

    const bikeId = searchParams.get('bikeId')
    const bike = MOCK_BIKES.find(b => b.id === bikeId)

    const [startDate, setStartDate] = useState<Date>()
    const [endDate, setEndDate] = useState<Date>()
    const [selectedOptions, setSelectedOptions] = useState(
        RENTAL_OPTIONS.map(option => ({...option, selected: false}))
    )
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [selectedLocation, setSelectedLocation] = useState<string>('')

    const LOCATIONS = [
        {id: "loc1", name: "Hanoi Downtown", address: "15 Tran Hung Dao St, Hoan Kiem"},
        {id: "loc2", name: "Hanoi West", address: "88 Cau Giay St, Cau Giay"},
        {id: "loc3", name: "Hanoi South", address: "102 Nguyen Van Cu St, Long Bien"},
    ]

    useEffect(() => {
        if (loading) return

        if (!isAuthenticated) {
            navigate('/auth/login')
            return
        }

        if (!bikeId || !bike) {
            navigate('/bikes')
            return
        }

        // Set default dates (today + 1 to today + 3)
        const tomorrow = addDays(new Date(), 1)
        const dayAfterTomorrow = addDays(new Date(), 3)
        setStartDate(tomorrow)
        setEndDate(dayAfterTomorrow)
    }, [bikeId, bike, isAuthenticated, loading, navigate])

    const handleOptionToggle = (optionId: string) => {
        setSelectedOptions(prev =>
            prev.map(option =>
                option.id === optionId
                    ? {...option, selected: !option.selected}
                    : option
            )
        )
    }

    const calculateTotal = () => {
        if (!startDate || !endDate || !bike) return 0

        const days = differenceInDays(endDate, startDate)
        const bikeTotal = bike.pricePerDay * days
        const optionsTotal = selectedOptions
            .filter(option => option.selected)
            .reduce((sum, option) => sum + (option.price * days), 0)

        return bikeTotal + optionsTotal
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!startDate || !endDate || !bike || !user || !selectedLocation) {
            toast({
                title: "Missing Information",
                description: "Please select dates and a pickup location.",
                variant: "destructive",
            })
            return
        }

        setIsSubmitting(true)

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000))
            const selectedOptionNames = selectedOptions
                .filter(option => option.selected)
                .map(option => option.name)

            const locationName = LOCATIONS.find(loc => loc.id === selectedLocation)?.name

            toast({
                title: "Booking Confirmed!",
                description: `Your rental for ${bike.name} has been confirmed for ${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')} at ${locationName}.`,
            })

            navigate('/rentals')
        } catch (error) {
            toast({
                title: "Booking Failed",
                description: "There was an error processing your booking. Please try again.",
                variant: "destructive",
            })
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

    if (!isAuthenticated || !bike) {
        return null // Will redirect
    }

    const days = startDate && endDate ? differenceInDays(endDate, startDate) : 0
    const total = calculateTotal()

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Back Button */}
            <Button variant="ghost" className="mb-6" asChild>
                <Link to={`/bikes/${bike.id}`}>
                    <ArrowLeft className="w-4 h-4 mr-2"/>
                    Back to Bike Details
                </Link>
            </Button>

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
                                            >
                                                <Calendar className="mr-2 h-4 w-4"/>
                                                {startDate ? format(startDate, "PPP") : "Pick a date"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <CalendarComponent
                                                mode="single"
                                                selected={startDate}
                                                onSelect={setStartDate}
                                                disabled={(date: Date) => date < new Date()}
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
                                            >
                                                <Calendar className="mr-2 h-4 w-4"/>
                                                {endDate ? format(endDate, "PPP") : "Pick a date"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <CalendarComponent
                                                mode="single"
                                                selected={endDate}
                                                onSelect={setEndDate}
                                                disabled={(date: Date) => date < (startDate || new Date())}
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
                                    {LOCATIONS.filter(location =>
                                        // This would ideally check which locations have this bike available
                                        bike.availableLocations?.includes(location.id) || true
                                    ).map((location) => (
                                        <div key={location.id} className="flex items-center space-x-3">
                                            <Checkbox
                                                id={location.id}
                                                checked={selectedLocation === location.id}
                                                onCheckedChange={() => setSelectedLocation(location.id)}
                                            />
                                            <div className="flex-1">
                                                <Label htmlFor={location.id} className="cursor-pointer font-medium">
                                                    {location.name}
                                                </Label>
                                                <p className="text-xs text-muted-foreground">{location.address}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator/>

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
                                    src={bike.imageUrl.split('"')[0]}
                                    alt={bike.name}
                                    className="w-20 h-20 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                    <h3 className="font-semibold">{bike.name}</h3>
                                    <p className="text-sm text-muted-foreground">{bike.type}</p>
                                    <div className="flex items-center mt-1">
                                        <MapPin className="w-3 h-3 mr-1"/>
                                        <span className="text-xs text-muted-foreground">{bike.location}</span>
                                    </div>
                                </div>
                            </div>

                            <Separator/>

                            {/* Pricing Breakdown */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Bike rental ({days} {days === 1 ? 'day' : 'days'})</span>
                                    <span>${(bike.pricePerDay * days).toFixed(2)}</span>
                                </div>

                                {selectedOptions
                                    .filter(option => option.selected)
                                    .map(option => (
                                        <div key={option.id} className="flex justify-between text-sm">
                                            <span>{option.name} ({days} {days === 1 ? 'day' : 'days'})</span>
                                            <span>${(option.price * days).toFixed(2)}</span>
                                        </div>
                                    ))}

                                <Separator/>

                                <div className="flex justify-between font-semibold">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>

                            <Separator/>

                            {/* Terms and Conditions */}
                            <div className="space-y-3">
                                <div className="flex items-start space-x-2">
                                    <Checkbox id="terms"/>
                                    <Label htmlFor="terms" className="text-sm cursor-pointer">
                                        I agree to the{' '}
                                        <Link to="/terms" className="text-primary underline">
                                            Terms and Conditions
                                        </Link>
                                    </Label>
                                </div>

                                <div className="flex items-start space-x-2">
                                    <Checkbox id="insurance"/>
                                    <Label htmlFor="insurance" className="text-sm cursor-pointer">
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
                                    <>Processing...</>
                                ) : (
                                    <>
                                        <CreditCard className="w-4 h-4 mr-2"/>
                                        Confirm Booking - ${total.toFixed(2)}
                                    </>
                                )}
                            </Button>

                            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                                <Shield className="w-4 h-4"/>
                                <span>Secure payment protected by SSL</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}