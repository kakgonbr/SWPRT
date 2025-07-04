import { useState } from 'react'
import { useAuth } from '../contexts/auth-context'
import { useToast } from '../contexts/toast-context'
import {
    MOCK_CUSTOMER_MESSAGES,
    MOCK_STAFF_STATS,
    MOCK_STAFF_RENTALS,
    type CustomerMessage,
    type ConversationMessage,
    type StaffDashboardStats
} from '../lib/mock-staff-data'

interface Rental {
    id: string
    customerId: string
    customerName: string
    customerEmail: string
    bikeName: string
    bikeId: string
    startDate: string
    endDate: string
    status: 'pending' | 'active' | 'completed' | 'cancelled'
    totalCost: number
    location: string
    orderDate: string
}

export const useStaffDashboard = () => {
    const { user } = useAuth()
    const { toast } = useToast()

    // State
    const [stats, setStats] = useState<StaffDashboardStats>(MOCK_STAFF_STATS)
    const [messages, setMessages] = useState<CustomerMessage[]>(MOCK_CUSTOMER_MESSAGES)
    const [rentals, setRentals] = useState<Rental[]>([...MOCK_STAFF_RENTALS])
    const [selectedMessage, setSelectedMessage] = useState<CustomerMessage | null>(null)
    const [selectedRental, setSelectedRental] = useState<Rental | null>(null)
    const [replyText, setReplyText] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false)

    // Handle reply to message
    const handleReplyToMessage = async (messageId: string) => {
        if (!replyText.trim()) return

        try {
            const staffReply: ConversationMessage = {
                id: `reply-${Date.now()}`,
                senderId: String(user?.userId) || 'staff-current',
                senderName: user?.fullName || 'Staff Member',
                senderType: 'staff',
                message: replyText,
                timestamp: new Date().toISOString()
            }

            setMessages(prevMessages =>
                prevMessages.map(msg => {
                    if (msg.id === messageId) {
                        return {
                            ...msg,
                            status: 'replied' as const,
                            lastReplyAt: new Date().toISOString(),
                            conversationHistory: [...msg.conversationHistory, staffReply]
                        }
                    }
                    return msg
                })
            )

            if (selectedMessage?.id === messageId) {
                setSelectedMessage(prev => prev ? {
                    ...prev,
                    status: 'replied' as const,
                    lastReplyAt: new Date().toISOString(),
                    conversationHistory: [...prev.conversationHistory, staffReply]
                } : null)
            }

            setStats(prevStats => ({
                ...prevStats,
                pendingMessages: Math.max(0, prevStats.pendingMessages - 1)
            }))

            toast({
                title: "Reply Sent",
                description: "Your reply has been sent to the customer",
            })
            setReplyText('')

        } catch (error) {
            console.error('Error sending reply:', error)
            toast({
                title: "Error",
                description: "Failed to send reply",
                variant: "destructive"
            })
        }
    }

    // Handle rental approval
    const handleApproveRental = async (rentalId: string) => {
        try {
            setIsLoading(true)
            await new Promise(resolve => setTimeout(resolve, 1000))

            setRentals(prevRentals =>
                prevRentals.map(rental => {
                    if (rental.id === rentalId) {
                        return { ...rental, status: 'active' as const }
                    }
                    return rental
                })
            )

            setStats(prevStats => ({
                ...prevStats,
                totalRentals: prevStats.totalRentals + 1
            }))

            toast({
                title: "Rental Approved",
                description: "The rental has been approved and is now active.",
            })

            setIsApprovalDialogOpen(false)
            setSelectedRental(null)

        } catch (error) {
            console.error('Error approving rental:', error)
            toast({
                title: "Approval Failed",
                description: "Failed to approve rental. Please try again.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Handle rental rejection
    const handleRejectRental = async (rentalId: string) => {
        try {
            setIsLoading(true)
            await new Promise(resolve => setTimeout(resolve, 1000))

            setRentals(prevRentals =>
                prevRentals.map(rental => {
                    if (rental.id === rentalId) {
                        return { ...rental, status: 'cancelled' as const }
                    }
                    return rental
                })
            )

            toast({
                title: "Rental Rejected",
                description: "The rental has been cancelled.",
                variant: "destructive"
            })

            setIsApprovalDialogOpen(false)
            setSelectedRental(null)

        } catch (error) {
            console.error('Error rejecting rental:', error)
            toast({
                title: "Rejection Failed",
                description: "Failed to reject rental. Please try again.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Mark message as read
    const markMessageAsRead = (messageId: string) => {
        setMessages(prevMessages =>
            prevMessages.map(msg => {
                if (msg.id === messageId && msg.status === 'unread') {
                    setStats(prevStats => ({
                        ...prevStats,
                        pendingMessages: Math.max(0, prevStats.pendingMessages - 1)
                    }))
                    return { ...msg, status: 'read' as const }
                }
                return msg
            })
        )
    }

    // Open chat dialog
    const openChatDialog = (message: CustomerMessage) => {
        setSelectedMessage(message)
        setIsChatOpen(true)
        if (message.status === 'unread') {
            markMessageAsRead(message.id)
        }
    }

    // Open approval dialog
    const openApprovalDialog = (rental: Rental) => {
        setSelectedRental(rental)
        setIsApprovalDialogOpen(true)
    }

    return {
        // State
        stats,
        messages,
        rentals,
        selectedMessage,
        selectedRental,
        replyText,
        setReplyText,
        isLoading,
        isChatOpen,
        setIsChatOpen,
        isApprovalDialogOpen,
        setIsApprovalDialogOpen,

        // Actions
        handleReplyToMessage,
        handleApproveRental,
        handleRejectRental,
        openChatDialog,
        openApprovalDialog,

        // Computed values
        activeRentals: rentals.filter(r => r.status === 'active').length,
        pendingRentalsCount: rentals.filter(r => r.status === 'pending').length
    }
}