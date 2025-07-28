export type UserRole = 'renter' | 'admin' | 'staff';

export interface User {
    userId: number;
    email: string;
    fullName: string;
    role: UserRole;
    isActive: boolean; //0: active, 1: deactive
    avatarUrl?: string;
    lastLogin?: Date;
    feedbackCount?: number;
    dateOfBirth?: string; // Ensure this can be string for form input
    address?: string;
    credentialIdNumber?: string;
    credentialIdImageUrl?: string;
    creationDate: Date; // Added to track user sign-up date
}

export interface DashboardStats {
    totalUsers: number
    totalBikes: number
    activeRentals: number
    monthlyRevenue: number
    recentUsers: number
    availableBikes: number
}

export interface VehicleModelDTO {
    modelId: number;
    displayName: string;
    description: string;
    ratePerDay: number;
    imageFile: string;
    upFrontPercentage: number; //deposit money when place a rental
    isAvailable: boolean;
    peripherals?: ServerPeripheral[];
    rating: number;
    vehicleType: string;
    shop: string;
}

export interface ServerPeripheral {
    peripheralId: number;
    name?: string,
    ratePerDay?: number
}

export interface Bike {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    userId: number
    startDate: Date;
    endDate: Date;
    totalPrice: number;
    options: string[];
    status: 'Awaiting Payment' | 'Upcoming' | 'Active' | 'Completed' | 'Cancelled';
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
    userId: number;
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
    hasNewCustomerMessage: boolean;
}

export interface ChatMessageDTO {
    chatMessageId: number;
    chatId: number;
    senderId: number;
    content: string;
    sendTime: string;
}

export interface ServerInfo {
    siteName: string,
    siteDescription: string,
    contactEmail: string,
    supportPhone: string
}

export interface ReportDTO {
    reportId: number;
    userId: number;
    typeId: number;
    title: string;
    body: string;
    imagePath?: string; 
    reportTime: string;
    status: string;
    typeName?: string;
    userName?: string;
    userEmail?: string;
}

export interface AIChatMessageDTO {
    aiChatMessageId: number;
    userId: number;
    isHuman: boolean;
    content: string;
}