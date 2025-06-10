export interface CustomerMessage {
    id: string
    customerId: string
    customerName: string
    customerEmail: string
    customerAvatar?: string
    subject: string
    message: string
    status: 'unread' | 'read' | 'replied'
    priority: 'low' | 'medium' | 'high'
    createdAt: string
    lastReplyAt?: string
    conversationHistory: ConversationMessage[]
}

export interface ConversationMessage {
    id: string
    senderId: string
    senderName: string
    senderType: 'customer' | 'staff' | 'ai'
    message: string
    timestamp: string
}

export interface StaffDashboardStats {
    totalRentals: number
    pendingMessages: number
}

export const MOCK_CUSTOMER_MESSAGES: CustomerMessage[] = [
    {
        id: 'msg-001',
        customerId: 'user-001',
        customerName: 'John Smith',
        customerEmail: 'john.smith@email.com',
        customerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
        subject: 'Bike not starting - Need urgent help',
        message: 'Hi, I rented a Honda CBR600 yesterday and now it won\'t start. I\'m stranded at the mall parking lot. Please help urgently!',
        status: 'unread',
        priority: 'high',
        createdAt: '2024-12-07T10:30:00Z',
        conversationHistory: [
            {
                id: 'conv-001-1',
                senderId: 'user-001',
                senderName: 'John Smith',
                senderType: 'customer',
                message: 'Hi, I rented a Honda CBR600 yesterday and now it won\'t start. I\'m stranded at the mall parking lot. Please help urgently!',
                timestamp: '2024-12-07T10:30:00Z'
            },
            {
                id: 'conv-001-2',
                senderId: 'ai-bot',
                senderName: 'Support Assistant',
                senderType: 'ai',
                message: 'I\'m sorry to hear about the trouble with your bike. I\'ve forwarded your message to our technical support team. In the meantime, please check if the bike is in neutral and the kill switch is in the correct position.',
                timestamp: '2024-12-07T10:31:00Z'
            }
        ]
    },
    {
        id: 'msg-002',
        customerId: 'user-002',
        customerName: 'Emily Johnson',
        customerEmail: 'emily.johnson@email.com',
        customerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
        subject: 'Question about extending rental period',
        message: 'Hello, I currently have a Yamaha YZF-R3 rented until tomorrow. Is it possible to extend the rental for 3 more days? What would be the additional cost?',
        status: 'replied',
        priority: 'medium',
        createdAt: '2024-12-06T14:22:00Z',
        lastReplyAt: '2024-12-06T15:45:00Z',
        conversationHistory: [
            {
                id: 'conv-002-1',
                senderId: 'user-002',
                senderName: 'Emily Johnson',
                senderType: 'customer',
                message: 'Hello, I currently have a Yamaha YZF-R3 rented until tomorrow. Is it possible to extend the rental for 3 more days? What would be the additional cost?',
                timestamp: '2024-12-06T14:22:00Z'
            },
            {
                id: 'conv-002-2',
                senderId: 'staff-001',
                senderName: 'Sarah Wilson',
                senderType: 'staff',
                message: 'Hi Emily! Yes, you can definitely extend your rental. The YZF-R3 is available for the next 3 days. The additional cost would be $150 ($50/day). Would you like me to process the extension?',
                timestamp: '2024-12-06T15:45:00Z'
            },
            {
                id: 'conv-002-3',
                senderId: 'user-002',
                senderName: 'Emily Johnson',
                senderType: 'customer',
                message: 'Perfect! Yes, please go ahead and extend it. Should I pay online or when I return the bike?',
                timestamp: '2024-12-06T16:10:00Z'
            },
            {
                id: 'conv-002-4',
                senderId: 'staff-001',
                senderName: 'Sarah Wilson',
                senderType: 'staff',
                message: 'Great! I\'ve extended your rental until December 10th. You can pay online through your account dashboard or when you return. I\'ve sent you an updated rental agreement via email.',
                timestamp: '2024-12-06T16:15:00Z'
            }
        ]
    },
    {
        id: 'msg-003',
        customerId: 'user-003',
        customerName: 'Michael Chen',
        customerEmail: 'michael.chen@email.com',
        customerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
        subject: 'Billing inquiry - Unexpected charges',
        message: 'I was charged $75 extra on my rental. My original quote was $200 for 4 days, but I was charged $275. Can you please explain these additional charges?',
        status: 'read',
        priority: 'medium',
        createdAt: '2024-12-05T09:15:00Z',
        conversationHistory: [
            {
                id: 'conv-003-1',
                senderId: 'user-003',
                senderName: 'Michael Chen',
                senderType: 'customer',
                message: 'I was charged $75 extra on my rental. My original quote was $200 for 4 days, but I was charged $275. Can you please explain these additional charges?',
                timestamp: '2024-12-05T09:15:00Z'
            },
            {
                id: 'conv-003-2',
                senderId: 'ai-bot',
                senderName: 'Billing Assistant',
                senderType: 'ai',
                message: 'I understand your concern about the billing. Let me review your rental details. The additional charges may include insurance, fuel charges, or late return fees. A staff member will review your case shortly.',
                timestamp: '2024-12-05T09:16:00Z'
            }
        ]
    },
    {
        id: 'msg-004',
        customerId: 'user-004',
        customerName: 'Sarah Davis',
        customerEmail: 'sarah.davis@email.com',
        customerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        subject: 'Great service - Thank you!',
        message: 'I just wanted to say thank you for the excellent service. The bike was in perfect condition and the staff at the downtown location were very helpful. Will definitely rent again!',
        status: 'replied',
        priority: 'low',
        createdAt: '2024-12-04T16:45:00Z',
        lastReplyAt: '2024-12-04T17:20:00Z',
        conversationHistory: [
            {
                id: 'conv-004-1',
                senderId: 'user-004',
                senderName: 'Sarah Davis',
                senderType: 'customer',
                message: 'I just wanted to say thank you for the excellent service. The bike was in perfect condition and the staff at the downtown location were very helpful. Will definitely rent again!',
                timestamp: '2024-12-04T16:45:00Z'
            },
            {
                id: 'conv-004-2',
                senderId: 'staff-002',
                senderName: 'Mark Thompson',
                senderType: 'staff',
                message: 'Thank you so much for your kind words, Sarah! We\'re thrilled to hear you had a great experience. We look forward to serving you again. Don\'t forget to check out our loyalty program for returning customers!',
                timestamp: '2024-12-04T17:20:00Z'
            }
        ]
    },
    {
        id: 'msg-005',
        customerId: 'user-005',
        customerName: 'David Rodriguez',
        customerEmail: 'david.rodriguez@email.com',
        customerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
        subject: 'Minor accident - Need assistance',
        message: 'Hi, I had a minor accident with the rented Ducati Monster. No one was hurt, but there\'s a small scratch on the side panel. What should I do? Do I need to file a police report?',
        status: 'unread',
        priority: 'high',
        createdAt: '2024-12-07T11:45:00Z',
        conversationHistory: [
            {
                id: 'conv-005-1',
                senderId: 'user-005',
                senderName: 'David Rodriguez',
                senderType: 'customer',
                message: 'Hi, I had a minor accident with the rented Ducati Monster. No one was hurt, but there\'s a small scratch on the side panel. What should I do? Do I need to file a police report?',
                timestamp: '2024-12-07T11:45:00Z'
            }
        ]
    },
    {
        id: 'msg-006',
        customerId: 'user-006',
        customerName: 'Lisa Wang',
        customerEmail: 'lisa.wang@email.com',
        customerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
        subject: 'Helmet size exchange',
        message: 'The helmet provided with my rental is too small. Can I exchange it for a larger size? I\'m currently at the airport location.',
        status: 'unread',
        priority: 'medium',
        createdAt: '2024-12-07T08:20:00Z',
        conversationHistory: [
            {
                id: 'conv-006-1',
                senderId: 'user-006',
                senderName: 'Lisa Wang',
                senderType: 'customer',
                message: 'The helmet provided with my rental is too small. Can I exchange it for a larger size? I\'m currently at the airport location.',
                timestamp: '2024-12-07T08:20:00Z'
            },
            {
                id: 'conv-006-2',
                senderId: 'ai-bot',
                senderName: 'Support Assistant',
                senderType: 'ai',
                message: 'Of course! Please visit our airport location counter with your rental agreement. Our staff will exchange the helmet for a proper size at no additional cost. Safety is our priority!',
                timestamp: '2024-12-07T08:21:00Z'
            }
        ]
    },
    {
        id: 'msg-007',
        customerId: 'user-007',
        customerName: 'Robert Thompson',
        customerEmail: 'robert.thompson@email.com',
        customerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
        subject: 'Fuel level question',
        message: 'When I picked up the bike, it had a half tank of fuel. Do I need to return it with the same fuel level, or can I return it empty and pay for fuel?',
        status: 'replied',
        priority: 'low',
        createdAt: '2024-12-03T13:30:00Z',
        lastReplyAt: '2024-12-03T14:15:00Z',
        conversationHistory: [
            {
                id: 'conv-007-1',
                senderId: 'user-007',
                senderName: 'Robert Thompson',
                senderType: 'customer',
                message: 'When I picked up the bike, it had a half tank of fuel. Do I need to return it with the same fuel level, or can I return it empty and pay for fuel?',
                timestamp: '2024-12-03T13:30:00Z'
            },
            {
                id: 'conv-007-2',
                senderId: 'staff-003',
                senderName: 'Jennifer Lee',
                senderType: 'staff',
                message: 'Hi Robert! You can choose either option: return with the same fuel level (half tank) or return empty and we\'ll charge you $25 for refueling. Many customers find it more convenient to return empty. Your choice!',
                timestamp: '2024-12-03T14:15:00Z'
            },
            {
                id: 'conv-007-3',
                senderId: 'user-007',
                senderName: 'Robert Thompson',
                senderType: 'customer',
                message: 'Perfect! I\'ll go with the refueling option. Much more convenient. Thanks!',
                timestamp: '2024-12-03T14:45:00Z'
            }
        ]
    },
    {
        id: 'msg-008',
        customerId: 'user-008',
        customerName: 'Amanda Foster',
        customerEmail: 'amanda.foster@email.com',
        customerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amanda',
        subject: 'Lost key - Emergency!',
        message: 'URGENT: I lost the key to my rented Kawasaki Ninja at the beach. The bike is locked and I can\'t move it. What should I do? This is an emergency!',
        status: 'unread',
        priority: 'high',
        createdAt: '2024-12-07T12:15:00Z',
        conversationHistory: [
            {
                id: 'conv-008-1',
                senderId: 'user-008',
                senderName: 'Amanda Foster',
                senderType: 'customer',
                message: 'URGENT: I lost the key to my rented Kawasaki Ninja at the beach. The bike is locked and I can\'t move it. What should I do? This is an emergency!',
                timestamp: '2024-12-07T12:15:00Z'
            }
        ]
    },
    {
        id: 'msg-009',
        customerId: 'user-009',
        customerName: 'Kevin Park',
        customerEmail: 'kevin.park@email.com',
        customerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin',
        subject: 'Discount for group rental',
        message: 'Hi, I\'m planning to rent 5 bikes for a group tour next weekend. Do you offer any group discounts? We need them for 2 days.',
        status: 'read',
        priority: 'medium',
        createdAt: '2024-12-02T10:20:00Z',
        conversationHistory: [
            {
                id: 'conv-009-1',
                senderId: 'user-009',
                senderName: 'Kevin Park',
                senderType: 'customer',
                message: 'Hi, I\'m planning to rent 5 bikes for a group tour next weekend. Do you offer any group discounts? We need them for 2 days.',
                timestamp: '2024-12-02T10:20:00Z'
            },
            {
                id: 'conv-009-2',
                senderId: 'ai-bot',
                senderName: 'Sales Assistant',
                senderType: 'ai',
                message: 'Great! We do offer group discounts. For 5+ bikes, you get 15% off the total rental cost. I\'ve notified our sales team to prepare a custom quote for your group tour.',
                timestamp: '2024-12-02T10:21:00Z'
            }
        ]
    },
    {
        id: 'msg-010',
        customerId: 'user-010',
        customerName: 'Jessica Martinez',
        customerEmail: 'jessica.martinez@email.com',
        customerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica',
        subject: 'Recommendation for beginner bike',
        message: 'I\'m a beginner rider and want to rent a bike for the weekend. Can you recommend something suitable for a new rider? I have a basic license.',
        status: 'replied',
        priority: 'low',
        createdAt: '2024-12-01T15:30:00Z',
        lastReplyAt: '2024-12-01T16:45:00Z',
        conversationHistory: [
            {
                id: 'conv-010-1',
                senderId: 'user-010',
                senderName: 'Jessica Martinez',
                senderType: 'customer',
                message: 'I\'m a beginner rider and want to rent a bike for the weekend. Can you recommend something suitable for a new rider? I have a basic license.',
                timestamp: '2024-12-01T15:30:00Z'
            },
            {
                id: 'conv-010-2',
                senderId: 'staff-001',
                senderName: 'Sarah Wilson',
                senderType: 'staff',
                message: 'Perfect! For beginners, I\'d recommend our Honda CB300R or Yamaha MT-03. They\'re lightweight, easy to handle, and very forgiving for new riders. Both have excellent safety features and are very popular with beginners.',
                timestamp: '2024-12-01T16:45:00Z'
            },
            {
                id: 'conv-010-3',
                senderId: 'user-010',
                senderName: 'Jessica Martinez',
                senderType: 'customer',
                message: 'That sounds perfect! Can I book the Honda CB300R for this Saturday and Sunday? Also, do you provide any beginner riding tips?',
                timestamp: '2024-12-01T17:10:00Z'
            },
            {
                id: 'conv-010-4',
                senderId: 'staff-001',
                senderName: 'Sarah Wilson',
                senderType: 'staff',
                message: 'Absolutely! I\'ve reserved the CB300R for you this weekend. We also provide a complimentary 30-minute orientation session for first-time renters. I\'ll include some safety pamphlets and local route recommendations too!',
                timestamp: '2024-12-01T17:15:00Z'
            }
        ]
    }
]

export const MOCK_STAFF_STATS: StaffDashboardStats = {
    totalRentals: 34,
    pendingMessages: 4, // Unread messages count
}

export const MOCK_STAFF_RENTALS = [
    {
        id: 'rental-001',
        customerId: 'user-001',
        customerName: 'John Smith',
        customerEmail: 'john.smith@email.com',
        bikeName: 'Honda CBR600RR',
        bikeId: 'bike-001',
        startDate: '2024-12-05',
        endDate: '2024-12-08',
        status: 'pending' as const, // Changed to pending for approval demo
        totalCost: 450,
        location: 'Downtown',
        orderDate: '2024-12-04T10:30:00Z'
    },
    {
        id: 'rental-002',
        customerId: 'user-002',
        customerName: 'Emily Johnson',
        customerEmail: 'emily.johnson@email.com',
        bikeName: 'Yamaha YZF-R3',
        bikeId: 'bike-002',
        startDate: '2024-12-03',
        endDate: '2024-12-10',
        status: 'active' as const,
        totalCost: 350,
        location: 'Airport',
        orderDate: '2024-12-02T14:22:00Z'
    },
    {
        id: 'rental-003',
        customerId: 'user-005',
        customerName: 'David Rodriguez',
        customerEmail: 'david.rodriguez@email.com',
        bikeName: 'Ducati Monster',
        bikeId: 'bike-003',
        startDate: '2024-12-06',
        endDate: '2024-12-09',
        status: 'active' as const,
        totalCost: 600,
        location: 'Beach',
        orderDate: '2024-12-05T09:15:00Z'
    },
    {
        id: 'rental-004',
        customerId: 'user-004',
        customerName: 'Sarah Davis',
        customerEmail: 'sarah.davis@email.com',
        bikeName: 'Kawasaki Ninja 400',
        bikeId: 'bike-004',
        startDate: '2024-12-01',
        endDate: '2024-12-04',
        status: 'completed' as const,
        totalCost: 320,
        location: 'Mall',
        orderDate: '2024-11-30T16:45:00Z'
    },
    {
        id: 'rental-005',
        customerId: 'user-003',
        customerName: 'Michael Chen',
        customerEmail: 'michael.chen@email.com',
        bikeName: 'BMW R1250GS',
        bikeId: 'bike-005',
        startDate: '2024-11-28',
        endDate: '2024-12-02',
        status: 'completed' as const,
        totalCost: 800,
        location: 'University',
        orderDate: '2024-11-27T13:30:00Z'
    },
    {
        id: 'rental-006',
        customerId: 'user-006',
        customerName: 'Lisa Wang',
        customerEmail: 'lisa.wang@email.com',
        bikeName: 'Honda CB300R',
        bikeId: 'bike-006',
        startDate: '2024-12-07',
        endDate: '2024-12-09',
        status: 'pending' as const,
        totalCost: 200,
        location: 'Train Station',
        orderDate: '2024-12-06T08:20:00Z'
    },
    {
        id: 'rental-007',
        customerId: 'user-010',
        customerName: 'Jessica Martinez',
        customerEmail: 'jessica.martinez@email.com',
        bikeName: 'Yamaha MT-03',
        bikeId: 'bike-007',
        startDate: '2024-12-08',
        endDate: '2024-12-10',
        status: 'pending' as const,
        totalCost: 250,
        location: 'Business District',
        orderDate: '2024-12-07T15:30:00Z'
    }
] as const