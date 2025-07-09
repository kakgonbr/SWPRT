import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/auth-context'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '../../components/ui/tabs'
import { Badge } from '../../components/ui/badge'
import { MessageCircle, Calendar, AlertTriangle } from 'lucide-react'

import StaffStatsCards from '../../components/staff/StaffStatsCards'
import CustomerMessagesTab from '../../components/staff/CustomerMessagesTab'
import RentalManagementTab from '../../components/staff/RentalManagementTab'
import ReportsManagementTab from '../../components/staff/ReportsManagementTab'
import RentalApprovalDialog from '../../components/staff/RentalApprovalDialog'

export default function StaffDashboard() {
    const navigate = useNavigate()
    const { user, isAuthenticated, loading } = useAuth()
    

    // Mock new reports count for demonstration
    const newReportsCount = 2

    // Authentication check
    useEffect(() => {
        if (loading) return
        // Only allow staff (case-insensitive)
        const role = user?.role?.toLowerCase?.() || ''
        if (!isAuthenticated || !user || role !== 'staff') {
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
    const role = user?.role?.toLowerCase?.() || ''
    if (!isAuthenticated || !user || role !== 'staff') {
        return null
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Staff Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back, {user?.fullName}! Manage customers and support requests.
                </p>
            </div>

            {/* Stats Cards */}
            <StaffStatsCards
                activeRentals={0}
                pendingMessages={0} // may want to update this if needed
            />

            {/* Main Content Tabs */}
            <Tabs defaultValue="messages" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="messages" className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Customer Messages
                    </TabsTrigger>
                    <TabsTrigger value="rentals" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Rental Management
                    </TabsTrigger>
                    <TabsTrigger value="reports" className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Issue Reports
                        {newReportsCount > 0 && (
                            <Badge variant="destructive" className="ml-1 px-1 py-0 text-xs">
                                {newReportsCount}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="messages" className="space-y-4">
                    <CustomerMessagesTab/>
                </TabsContent>

                <TabsContent value="rentals" className="space-y-4">
                    <RentalManagementTab
                        rentals={[]}
                        onOpenApproval={() => {}}
                        onRejectRental={() => {}}
                    />
                </TabsContent>

                <TabsContent value="reports" className="space-y-4">
                    <ReportsManagementTab />
                </TabsContent>
            </Tabs>

            {/* Rental Approval Dialog */}
            <RentalApprovalDialog
                isOpen={false}
                onClose={() => {}}
                selectedRental={null}
                onApprove={() => {}}
                onReject={() => {}}
                isLoading={false}
            />
        </div>
    )
}