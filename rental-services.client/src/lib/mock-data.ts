import type { Bike, User, Rental, AdminSupportMessage } from './types';
import { addDays, subDays, subMonths, subYears, startOfMonth, startOfQuarter, startOfYear } from 'date-fns';

const now = new Date();

export const MOCK_USERS: User[] = [
    {
        id: 'user1',
        email: 'renter@motorent.com',
        name: 'Alice Wonderland',
        role: 'renter',
        status: true,
        avatarUrl: 'https://placehold.co/100x100.png',
        lastLogin: subDays(now, 2),
        feedbackCount: 3,
        dateOfBirth: '1990-05-15',
        address: '123 Main St, Wonderland',
        credentialIdNumber: 'CW1234567',
        credentialIdImageUrl: 'https://placehold.co/300x200.png" data-ai-hint="id card',
        createdAt: startOfMonth(now),
    },
    {
        id: 'user2',
        email: 'admin@motorent.com',
        name: 'Bob The Builder',
        role: 'admin',
        status: true,
        avatarUrl: 'https://placehold.co/100x100.png',
        lastLogin: subDays(now, 1),
        feedbackCount: 0,
        dateOfBirth: '1985-10-20',
        address: '456 Tool Ave, Build City',
        credentialIdNumber: 'BBT789012',
        credentialIdImageUrl: undefined,
        createdAt: subMonths(startOfQuarter(now), 1),
    },
    {
        id: 'user3',
        email: 'staff@motorent.com',
        name: 'Charlie Brown',
        role: 'staff',
        status: true,
        avatarUrl: 'https://placehold.co/100x100.png',
        lastLogin: now,
        feedbackCount: 1,
        dateOfBirth: '1995-02-10',
        address: '789 Comic Strip, Peanuts Town',
        credentialIdNumber: 'CBZ345678',
        credentialIdImageUrl: 'https://placehold.co/300x200.png" data-ai-hint="license driver',
        createdAt: subMonths(now, 2),
    },
    {
        id: 'user4',
        email: 'new.renter@example.com',
        name: 'Diana Prince',
        role: 'renter',
        status: true,
        avatarUrl: 'https://placehold.co/100x100.png',
        lastLogin: subDays(now, 5),
        feedbackCount: 0,
        dateOfBirth: '1980-03-22',
        address: '1 Justice Way, Themyscira',
        credentialIdNumber: 'AMZ987654',
        credentialIdImageUrl: undefined,
        createdAt: subYears(startOfYear(now), 1),
    },
    {
        id: 'user5',
        email: 'early.bird@example.com',
        name: 'Early Bird',
        role: 'renter',
        avatarUrl: 'https://placehold.co/100x100.png',
        lastLogin: subDays(now, 10),
        feedbackCount: 2,
        status: true,

        dateOfBirth: '1975-01-01',
        address: '1 Dawn Rd, Sun City',
        credentialIdNumber: 'EB0000001',
        credentialIdImageUrl: 'https://placehold.co/300x200.png" data-ai-hint="passport photo',
        createdAt: subMonths(now, 5),
    },
];

export const MOCK_BIKES: Bike[] = [
    {
        id: 'bike1',
        name: 'Urban Sprinter Z250',
        type: 'Scooter',
        availableLocations: "hanoi",
        imageUrl: 'https://placehold.co/600x400.png" data-ai-hint="scooter city',
        pricePerDay: 45,
        description: 'Navigate the city streets with ease on this agile and fuel-efficient scooter. Perfect for daily commutes and quick errands.',
        features: ['Automatic Transmission', 'ABS', 'LED Headlights', 'USB Charger', 'Under-seat Storage'],
        location: 'Downtown Central',
        rating: 4.5,
        isAvailable: true,
        amount: 10,
        cylinderVolume: 249,
    },
    {
        id: 'bike2',
        name: 'Adventure Pro 500X',
        type: 'Adventure',
        imageUrl: 'https://placehold.co/600x400.png" data-ai-hint="adventure motorcycle',
        pricePerDay: 75,
        availableLocations: "hanoi",
        description: 'Conquer any terrain with this rugged adventure bike. Equipped for long journeys and off-road exploration.',
        features: ['Manual 6-Speed', 'Switchable ABS', 'Spoke Wheels', 'Luggage Racks', 'Windscreen'],
        location: 'Mountain Pass Rentals',
        rating: 4.8,
        isAvailable: true,
        amount: 5,
        cylinderVolume: 471,
    },
    {
        id: 'bike3',
        name: 'Speedster R1000',
        type: 'Sport',
        imageUrl: 'https://placehold.co/600x400.png" data-ai-hint="sport motorcycle',
        pricePerDay: 120,
        availableLocations: "hanoi",

        description: 'Experience thrilling performance with this high-powered sportbike. Precision handling and blistering acceleration.',
        features: ['Manual 6-Speed', 'Quick Shifter', 'Traction Control', 'Full Fairing', 'Performance Exhaust'],
        location: 'Speedway Rentals Co.',
        rating: 4.9,
        isAvailable: false,
        amount: 3,
        cylinderVolume: 999,
    },
    {
        id: 'bike4',
        name: 'Classic Rider V-Twin',
        type: 'Cruiser',
        imageUrl: 'https://placehold.co/600x400.png" data-ai-hint="classic motorcycle',
        pricePerDay: 90,
        availableLocations: "hanoi",

        description: 'Ride in style with this iconic V-twin cruiser. Timeless design combined with modern comfort for the open road.',
        features: ['Manual 5-Speed', 'Chrome Accents', 'Leather Saddlebags', 'Comfort Seat', 'Loud Pipes'],
        location: 'Route 66 Motorbikes',
        rating: 4.7,
        isAvailable: true,
        amount: 7,
        cylinderVolume: 1200,
    },
    {
        id: 'bike5',
        name: 'EcoVolt Commuter',
        type: 'Electric',
        imageUrl: 'https://placehold.co/600x400.png" data-ai-hint="electric scooter',
        pricePerDay: 55,
        availableLocations: "hanoi",

        description: 'Silent, eco-friendly, and zippy. The ideal electric scooter for sustainable urban mobility.',
        features: ['Automatic', 'Regenerative Braking', 'Digital Display', 'Removable Battery', 'Quiet Operation'],
        location: 'GreenWheels Hub',
        rating: 4.3,
        isAvailable: true,
        amount: 12,
    },
    {
        id: 'bike6',
        name: 'CityHopper 125',
        type: 'Scooter',
        imageUrl: 'https://placehold.co/600x400.png" data-ai-hint="small scooter',
        pricePerDay: 35,
        availableLocations: "hanoi",

        description: 'A nimble and affordable 125cc scooter for zipping through city traffic.',
        features: ['Automatic', 'Lightweight', 'Fuel Efficient'],
        location: 'Downtown Central',
        rating: 4.1,
        isAvailable: true,
        amount: 8,
        cylinderVolume: 125,
    },
    {
        id: 'bike7',
        name: 'Tourer Max 750',
        type: 'Adventure',
        imageUrl: 'https://placehold.co/600x400.png" data-ai-hint="touring motorcycle',
        pricePerDay: 85,
        availableLocations: "hanoi",

        description: 'Comfortable and capable tourer for long distance rides with ample storage.',
        features: ['Manual 6-Speed', 'Heated Grips', 'Large Panniers', 'Comfort Seat'],
        location: 'Mountain Pass Rentals',
        rating: 4.6,
        isAvailable: true,
        amount: 4,
        cylinderVolume: 749,
    },
];


export const MOCK_RENTALS: Rental[] = [
    {
        id: 'rental1',
        bikeId: 'bike1',
        userId: 'user1',
        startDate: addDays(new Date(), -10),
        endDate: addDays(new Date(), -7),
        totalPrice: 45 * 3,
        options: ['helmet'],
        status: 'Completed',
        bikeName: MOCK_BIKES.find(b => b.id === 'bike1')!.name,
        bikeImageUrl: MOCK_BIKES.find(b => b.id === 'bike1')!.imageUrl,
        orderDate: addDays(new Date(), -12),
    },
    {
        id: 'rental2',
        bikeId: 'bike2',
        userId: 'user1',
        startDate: addDays(new Date(), 2),
        endDate: addDays(new Date(), 5),
        totalPrice: 75 * 3,
        options: ['helmet', 'insurance'],
        status: 'Upcoming',
        bikeName: MOCK_BIKES.find(b => b.id === 'bike2')!.name,
        bikeImageUrl: MOCK_BIKES.find(b => b.id === 'bike2')!.imageUrl,
        orderDate: addDays(new Date(), -1),
    },
    {
        id: 'rental3',
        bikeId: 'bike4',
        userId: 'user1',
        startDate: addDays(new Date(), -30),
        endDate: addDays(new Date(), -25),
        totalPrice: 90 * 5,
        options: ['helmet', 'saddlebags'],
        status: 'Completed',
        bikeName: MOCK_BIKES.find(b => b.id === 'bike4')!.name,
        bikeImageUrl: MOCK_BIKES.find(b => b.id === 'bike4')!.imageUrl,
        orderDate: addDays(new Date(), -32),
    },
    {
        id: 'rental4',
        bikeId: 'bike5', // EcoVolt Commuter
        userId: 'user2', // Admin user
        startDate: addDays(now, -2), // Active rental
        endDate: addDays(now, 3),
        totalPrice: 55 * 5,
        options: ['helmet', 'gps'],
        status: 'Active',
        bikeName: MOCK_BIKES.find(b => b.id === 'bike5')!.name,
        bikeImageUrl: MOCK_BIKES.find(b => b.id === 'bike5')!.imageUrl,
        orderDate: addDays(now, -3),
    },
    {
        id: 'rental5',
        bikeId: 'bike6', // CityHopper 125
        userId: 'user3', // Staff user
        startDate: addDays(now, 7), // Upcoming rental
        endDate: addDays(now, 10),
        totalPrice: 35 * 3,
        options: [],
        status: 'Upcoming',
        bikeName: MOCK_BIKES.find(b => b.id === 'bike6')!.name,
        bikeImageUrl: MOCK_BIKES.find(b => b.id === 'bike6')!.imageUrl,
        orderDate: now,
    },
];

export const RENTAL_OPTIONS = [
    { id: 'helmet', name: 'Helmet', price: 5, selected: false },
    { id: 'insurance', name: 'Full Coverage Insurance', price: 15, selected: false },
    { id: 'gps', name: 'GPS Navigation', price: 10, selected: false },
    { id: 'luggage', name: 'Side Luggage Panniers', price: 12, selected: false },
];

export const MOCK_ADMIN_SUPPORT_MESSAGES: AdminSupportMessage[] = [
    {
        id: 'msg1',
        userId: 'user1',
        userName: 'Alice Wonderland',
        userEmail: 'renter@motorent.com',
        subject: 'Question about rental duration',
        messageContent: 'Can I extend my rental for the Urban Sprinter Z250 by two more days? My current rental ID is rental1 (though it is completed in mock data, assume it was active).',
        timestamp: subDays(new Date(), 1),
        status: 'New',
    },
    {
        id: 'msg2',
        userId: 'user4',
        userName: 'Diana Prince',
        userEmail: 'new.renter@example.com',
        subject: 'Issue with bike lock',
        messageContent: "I'm having trouble with the lock on the Classic Rider V-Twin. It seems jammed. What should I do?",
        timestamp: subHours(new Date(), 3),
        status: 'In Progress',
    },
    {
        id: 'msg3',
        userId: 'user5',
        userName: 'Early Bird',
        userEmail: 'early.bird@example.com',
        subject: 'Feedback on EcoVolt Commuter',
        messageContent: "Just wanted to say I loved the EcoVolt Commuter! The battery life was excellent. Will definitely rent again.",
        timestamp: subDays(new Date(), 2),
        status: 'Resolved',
    },
    {
        id: 'msg4',
        userId: 'user1',
        userName: 'Alice Wonderland',
        userEmail: 'renter@motorent.com',
        subject: 'Lost helmet query',
        messageContent: "I think I might have left the helmet I rented at the pickup location. Is there a lost and found?",
        timestamp: subHours(new Date(), 1),
        status: 'New',
    }
];

// Add this to your mock-data.ts file or create a separate reviews file
export interface BikeReview {
    id: string
    bikeId: string
    userId: string
    userName: string
    userAvatar?: string
    rating: number
    title: string
    comment: string
    createdAt: string
    isVerifiedRental: boolean
    helpfulCount: number
    images?: string[]
}

export const MOCK_BIKE_REVIEWS: BikeReview[] = [
    {
        id: "review-1",
        bikeId: "bike1",
        userId: "user-1",
        userName: "Sarah Johnson",
        userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        rating: 5,
        title: "Excellent bike for city tours!",
        comment: "I rented this bike for a week-long trip around the city. The performance was outstanding, fuel efficient, and very comfortable for long rides. The bike was in perfect condition when I picked it up. Highly recommend!",
        createdAt: "2024-03-15T10:30:00Z",
        isVerifiedRental: true,
        helpfulCount: 12,
        images: ["https://picsum.photos/400/300?random=1", "https://picsum.photos/400/300?random=2"]
    },
    {
        id: "review-2",
        bikeId: "bike1",
        userId: "user-2",
        userName: "Mike Chen",
        userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
        rating: 4,
        title: "Good value for money",
        comment: "Solid bike with good performance. The only minor issue was that the seat could be more comfortable for longer rides. Staff was very helpful during pickup and return.",
        createdAt: "2024-03-10T14:22:00Z",
        isVerifiedRental: true,
        helpfulCount: 8
    },
    {
        id: "review-3",
        bikeId: "bike1",
        userId: "user-3",
        userName: "Emma Wilson",
        userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
        rating: 5,
        title: "Perfect for beginners",
        comment: "As a new rider, this bike was perfect for me. Easy to handle, responsive, and the rental process was smooth. Great customer service too!",
        createdAt: "2024-03-05T09:15:00Z",
        isVerifiedRental: true,
        helpfulCount: 15
    }
]

// Helper function to get hours (not exported, just for mock data)
function subHours(date: Date, hours: number): Date {
    const newDate = new Date(date);
    newDate.setHours(date.getHours() - hours);
    return newDate;
}
