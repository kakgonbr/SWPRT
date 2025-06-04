
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
import type { User, UserRole } from "@/lib/types";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const USER_ROLES: UserRole[] = ['renter', 'staff', 'admin'];

const userFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  role: z.enum(USER_ROLES, { required_error: "User role is required." }),
  dateOfBirth: z.string().optional().nullable(), // Can be empty or YYYY-MM-DD
  address: z.string().optional().nullable(),
  credentialIdNumber: z.string().optional().nullable(),
});

export type UserFormData = z.infer<typeof userFormSchema>;

interface UserEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UserFormData, userId: string) => Promise<void>;
  userToEdit: User | null;
  isLoading?: boolean;
}

export default function UserEditDialog({ open, onOpenChange, onSubmit, userToEdit, isLoading }: UserEditDialogProps) {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: undefined,
      dateOfBirth: "",
      address: "",
      credentialIdNumber: "",
    },
  });

  useEffect(() => {
    if (userToEdit) {
      form.reset({
        name: userToEdit.name || "",
        email: userToEdit.email || "",
        role: userToEdit.role,
        dateOfBirth: userToEdit.dateOfBirth || "",
        address: userToEdit.address || "",
        credentialIdNumber: userToEdit.credentialIdNumber || "",
      });
    } else {
      form.reset({ // Reset to truly empty defaults if no user is being edited
        name: "",
        email: "",
        role: undefined,
        dateOfBirth: "",
        address: "",
        credentialIdNumber: "",
      });
    }
  }, [userToEdit, form, open]);

  const handleSubmit = async (data: UserFormData) => {
    if (userToEdit) {
      await onSubmit(data, userToEdit.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        form.reset(); // Explicitly reset form on close to clear values
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User: {userToEdit?.name}</DialogTitle>
          <DialogDescription>
            Update the details for this user account.
          </DialogDescription>
        </DialogHeader>
        {userToEdit && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="e.g., user@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {USER_ROLES.map(role => (
                          <SelectItem key={role} value={role} className="capitalize">{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                       <Input type="date" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., 123 Main St, Anytown" {...field} value={field.value || ''} rows={3}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="credentialIdNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credential ID Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., ID123456" {...field} value={field.value || ''}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isLoading}>Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
