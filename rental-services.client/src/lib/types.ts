export type UserRole = 'renter' | 'admin' | 'staff';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    status: boolean; //0: active, 1: deactive
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
    availableLocations: any;
    id: string
    name: string
    type: string
    imageUrl: string
    location: string
    rating: number
    pricePerDay: number
    isAvailable: boolean
    fuelType?: string
    capacity?: number
    discountPercentage?: number
    amount: number
    cylinderVolume?: number
    // Optional additional properties
    description?: string
    features?: string[]
    ownerId?: string
    createdAt?: string
    updatedAt?: string
}

export interface Rental {
    id: string;
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

export interface ChatDTO {
    chatId: number;
    userId: number;
    staffId?: number;
    status: string;
    priority: string;
    openTime: string;
    subject: string;
    userName: string;
    staffName: string;
}

export interface ChatMessageDTO {
    chatMessageId: number;
    chatId: number;
    senderId: number;
    content: string;
    timestamp: string;
}