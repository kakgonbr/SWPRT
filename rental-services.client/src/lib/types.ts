
export type UserRole = 'renter' | 'admin' | 'staff';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  lastLogin?: Date;
  feedbackCount?: number;
  dateOfBirth?: string; // Ensure this can be string for form input
  address?: string;
  credentialIdNumber?: string;
  credentialIdImageUrl?: string;
  createdAt: Date; // Added to track user sign-up date
}

export interface Bike {
  id: string;
  name: string;
  type: 'Scooter' | 'Sport' | 'Cruiser' | 'Adventure' | 'Electric';
  imageUrl: string;
  pricePerDay: number;
  description: string;
  features: string[];
  location: string;
  rating?: number;
  isAvailable?: boolean;
  amount: number;
  cylinderVolume?: number;
}

export interface Rental {
  id:string;
  bikeId: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  options: string[];
  status: 'Upcoming' | 'Active' | 'Completed' | 'Cancelled';
  bikeName: string;
  bikeImageUrl: string;
  orderDate: Date;
}

export interface OrderDetails {
  bike: Bike;
  startDate: Date;
  endDate: Date;
  options: { id: string, name: string, price: number, selected: boolean }[];
  totalPrice: number;
  numDays: number;
  quantityRented: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'staff' | 'system';
  timestamp: Date;
}

export type AdminSupportMessageStatus = 'New' | 'In Progress' | 'Replied' | 'Resolved';

// This type is not used in the admin panel anymore, but staff panel might still use it or a similar one.
// Kept for staff panel reference if needed.
export interface AdminSupportMessage {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  messageContent: string;
  timestamp: Date;
  status: AdminSupportMessageStatus;
}

