
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { Bike } from "@/lib/types";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const bikeTypes = ['Scooter', 'Sport', 'Cruiser', 'Adventure', 'Electric'] as const;

const bikeFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  type: z.enum(bikeTypes, { required_error: "Bike type is required." }),
  imageUrl: z.string().url({ message: "Please enter a valid image URL." }).or(z.string().startsWith("https://placehold.co")),
  pricePerDay: z.coerce.number().positive({ message: "Price must be a positive number." }),
  amount: z.coerce.number().int().min(0, { message: "Amount must be a non-negative integer." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  features: z.string().min(1, { message: "Please list at least one feature." }), // Comma-separated string
  location: z.string().min(3, { message: "Location must be at least 3 characters." }),
  isAvailable: z.boolean().default(true),
  rating: z.coerce.number().min(0).max(5).optional().nullable(),
});

export type BikeFormData = z.infer<typeof bikeFormSchema>;

interface BikeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: BikeFormData, bikeId?: string) => Promise<void>;
  bikeToEdit?: Bike | null;
  isLoading?: boolean;
}

export default function BikeFormDialog({ open, onOpenChange, onSubmit, bikeToEdit, isLoading }: BikeFormDialogProps) {
  const form = useForm<BikeFormData>({
    resolver: zodResolver(bikeFormSchema),
    defaultValues: {
      name: "",
      type: undefined,
      imageUrl: "https://placehold.co/600x400.png",
      pricePerDay: 0,
      amount: 0,
      description: "",
      features: "",
      location: "",
      isAvailable: true,
      rating: null,
    },
  });

  useEffect(() => {
    if (bikeToEdit) {
      form.reset({
        ...bikeToEdit,
        features: bikeToEdit.features.join(', '),
        rating: bikeToEdit.rating ?? null,
        amount: bikeToEdit.amount ?? 0,
      });
    } else {
      form.reset({
        name: "",
        type: undefined,
        imageUrl: "https://placehold.co/600x400.png",
        pricePerDay: 0,
        amount: 0,
        description: "",
        features: "",
        location: "",
        isAvailable: true,
        rating: null,
      });
    }
  }, [bikeToEdit, form, open]); // Reset form when dialog opens or bikeToEdit changes

  const handleSubmit = async (data: BikeFormData) => {
    await onSubmit(data, bikeToEdit?.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{bikeToEdit ? "Edit Bike" : "Add New Bike"}</DialogTitle>
          <DialogDescription>
            {bikeToEdit ? "Update the details of this bike." : "Fill in the details for the new bike."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bike Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Urban Sprinter Z250" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select bike type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bikeTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pricePerDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Per Day ($)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.png" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Brief description of the bike..." {...field} rows={3}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="features"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Features (comma-separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., ABS, LED Headlights, USB Charger" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Downtown Central" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Rating (0-5, optional)</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 4.5" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="isAvailable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Available for Rent
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isLoading}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {bikeToEdit ? "Save Changes" : "Add Bike"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
