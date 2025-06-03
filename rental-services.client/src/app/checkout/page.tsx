
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { OrderDetails } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CalendarDays, Tag, DollarSign, CheckCircle, List, CreditCard, ShoppingCart, AlertTriangle, PackageIcon } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/auth/login?redirect=/checkout');
      return;
    }

    const storedOrder = localStorage.getItem('currentOrder');
    if (storedOrder) {
      try {
        const parsedOrder = JSON.parse(storedOrder);
        // Ensure dates are Date objects
        parsedOrder.startDate = new Date(parsedOrder.startDate);
        parsedOrder.endDate = new Date(parsedOrder.endDate);
        setOrderDetails(parsedOrder);
      } catch (error) {
        console.error("Error parsing order details from localStorage:", error);
        localStorage.removeItem('currentOrder'); // Clear corrupted data
      }
    }
    setIsLoading(false);
  }, [router, isAuthenticated, authLoading]);

  const handleConfirmPayment = () => {
    if (!orderDetails) return;

    toast({
      title: "Payment Processing...",
      description: "Please wait while we confirm your rental.",
    });

    setTimeout(() => {
      localStorage.removeItem('currentOrder');
      toast({
        title: "Rental Confirmed!",
        description: `Your rental of ${orderDetails.quantityRented} x ${orderDetails.bike.name} is confirmed from ${format(orderDetails.startDate, "PPP")} to ${format(orderDetails.endDate, "PPP")}.`,
        action: (
          <Button variant="outline" size="sm" onClick={() => router.push('/rentals')}>
            View Rentals
          </Button>
        ),
      });
      router.push('/rentals');
    }, 2000);
  };

  if (authLoading || isLoading) {
    return (
        <div className="flex justify-center items-center h-full">
          <p>Loading checkout details...</p>
        </div>
    );
  }

  if (!orderDetails) {
    return (
        <div className="text-center py-10">
          <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-semibold">Your Cart is Empty</h1>
          <p className="text-muted-foreground">Please select a motorbike to rent first.</p>
          <Button onClick={() => router.push('/')} className="mt-4">Browse Bikes</Button>
        </div>
    );
  }

  const { bike, startDate, endDate, options, totalPrice, numDays, quantityRented } = orderDetails;
  const bikeSubtotal = bike.pricePerDay * numDays * quantityRented;
  const optionsSubtotal = options.reduce((sum, opt) => sum + opt.price, 0) * numDays;


  return (
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary">Order Summary</CardTitle>
            <CardDescription>Please review your rental details before confirming payment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6 p-4 border rounded-lg bg-card-foreground/5">
              <div className="md:col-span-1 aspect-video relative w-full rounded-md overflow-hidden">
                <Image
                  src={bike.imageUrl.split('"')[0]}
                  alt={bike.name}
                  layout="fill"
                  objectFit="cover"
                  {...(bike.imageUrl.includes('data-ai-hint') ? { 'data-ai-hint': bike.imageUrl.split('data-ai-hint="')[1].split('"')[0] } : {})}
                />
              </div>
              <div className="md:col-span-2">
                <h2 className="text-2xl font-semibold">{bike.name}</h2>
                <p className="text-muted-foreground flex items-center"><Tag className="w-4 h-4 mr-2" />{bike.type}</p>
                 <p className="text-muted-foreground flex items-center"><PackageIcon className="w-4 h-4 mr-2" />Quantity: {quantityRented}</p>
                <p className="text-muted-foreground flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  ${bike.pricePerDay.toFixed(2)}/day per unit
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center"><CalendarDays className="w-5 h-5 mr-2 text-primary" />Rental Period</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <p><strong className="font-medium">Start Date:</strong> {format(startDate, "EEEE, MMMM d, yyyy")}</p>
                <p><strong className="font-medium">End Date:</strong> {format(endDate, "EEEE, MMMM d, yyyy")}</p>
                <p className="sm:col-span-2"><strong className="font-medium">Duration:</strong> {numDays} {numDays === 1 ? 'day' : 'days'}</p>
              </div>
            </div>

            {options.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-xl font-semibold mb-3 flex items-center"><List className="w-5 h-5 mr-2 text-primary" />Selected Options</h3>
                  <ul className="space-y-1 text-sm list-disc list-inside pl-1">
                    {options.map(opt => (
                      <li key={opt.id}>{opt.name} (+${opt.price.toFixed(2)}/day for the rental period)</li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            <Separator />

            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center"><CreditCard className="w-5 h-5 mr-2 text-primary" />Payment Details</h3>
              <Alert>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertTitle className="text-amber-500">Demo Payment</AlertTitle>
                <AlertDescription>
                  This is a demo. No actual payment will be processed. Click "Confirm & Pay" to simulate a successful rental.
                </AlertDescription>
              </Alert>
              <div className="mt-4 p-4 border rounded-lg bg-card-foreground/5">
                <div className="flex justify-between text-sm mb-1">
                  <span>Bike Rental ({numDays} {numDays === 1 ? 'day' : 'days'} x {quantityRented} unit(s)):</span>
                  <span>${bikeSubtotal.toFixed(2)}</span>
                </div>
                {options.length > 0 && (
                  <div className="flex justify-between text-sm mb-1">
                    <span>Options ({numDays} {numDays === 1 ? 'day' : 'days'}):</span>
                    <span>${optionsSubtotal.toFixed(2)}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-primary">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

          </CardContent>
          <CardFooter>
            <Button size="lg" className="w-full" onClick={handleConfirmPayment}>
              <CheckCircle className="w-5 h-5 mr-2" /> Confirm & Pay
            </Button>
          </CardFooter>
        </Card>
      </div>
  );
}
