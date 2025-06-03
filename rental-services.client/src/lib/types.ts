
export type UserRole = 'renter' | 'admin' | 'staff';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  lastLogin?: Date;
  feedbackCount?: number;
  dateOfBirth?: string;
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
