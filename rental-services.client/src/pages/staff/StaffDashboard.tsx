import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/auth-context'
import { useStaffDashboard } from '../../hooks/useStaffDashboard'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '../../components/ui/tabs'
import { Badge } from '../../components/ui/badge'
import { MessageCircle, Calendar } from 'lucide-react'

import StaffStatsCards from '../../components/staff/StaffStatsCards'
import CustomerMessagesTab from '../../components/staff/CustomerMessagesTab'
import RentalManagementTab from '../../components/staff/RentalManagementTab'
import ChatDialog from '../../components/staff/ChatDialog'
import RentalApprovalDialog from '../../components/staff/RentalApprovalDialog'

export default function StaffDashboard() {
    const navigate = useNavigate()
    const { user, isAuthenticated, loading } = useAuth()
    const {
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
        handleReplyToMessage,
        handleApproveRental,
        handleRejectRental,
        openChatDialog,
        openApprovalDialog,
        activeRentals,
        pendingRentalsCount
    } = useStaffDashboard()

    // Authentication check
    useEffect(() => {
        if (loading) return

        if (!isAuthenticated || !user || (user.role !== 'staff' && user.role !== 'admin')) {
            navigate('/')
            return
        }
    }, [user, isAuthenticated, loading, navigate])

    // Loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        )
    }

    // Unauthorized access
    if (!isAuthenticated || !user || (user.role !== 'staff' && user.role !== 'admin')) {
        return null
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Staff Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back, {user?.name}! Manage customers and support requests.
                </p>
            </div>

            {/* Stats Cards */}
            <StaffStatsCards
                activeRentals={activeRentals}
                pendingMessages={stats.pendingMessages}
            />

            {/* Main Content Tabs */}
            <Tabs defaultValue="messages" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="messages" className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Customer Messages
                        {stats.pendingMessages > 0 && (
                            <Badge variant="destructive" className="ml-1 px-1 py-0 text-xs">
                                {stats.pendingMessages}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="rentals" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Rental Management
                        {pendingRentalsCount > 0 && (
                            <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                                {pendingRentalsCount}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="messages" className="space-y-4">
                    <CustomerMessagesTab
                        messages={messages}
                        onOpenChat={openChatDialog}
                    />
                </TabsContent>

                <TabsContent value="rentals" className="space-y-4">
                    <RentalManagementTab
                        rentals={rentals}
                        onOpenApproval={openApprovalDialog}
                        onRejectRental={handleRejectRental}
                    />
                </TabsContent>
            </Tabs>

            {/* Chat Dialog */}
            <ChatDialog
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                selectedMessage={selectedMessage}
                replyText={replyText}
                setReplyText={setReplyText}
                onSendReply={handleReplyToMessage}
            />

            {/* Rental Approval Dialog */}
            <RentalApprovalDialog
                isOpen={isApprovalDialogOpen}
                onClose={() => setIsApprovalDialogOpen(false)}
                selectedRental={selectedRental}
                onApprove={handleApproveRental}
                onReject={handleRejectRental}
                isLoading={isLoading}
            />
        </div>
    )
}