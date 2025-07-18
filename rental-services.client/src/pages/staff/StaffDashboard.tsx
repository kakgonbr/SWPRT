import { useEffect, useState } from 'react'
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
import { usePendingMessages } from '../../hooks/usePendingMessages'
import { useStaffReport } from '../../contexts/StaffReportProvider';
import { rentalAPI } from '../../lib/api'
import { type Booking } from '../../types/booking'

export default function StaffDashboard() {
    const navigate = useNavigate()
    const { user, isAuthenticated, loading } = useAuth()
    const token = localStorage.getItem('token') || '';
    const { pendingCount } = usePendingMessages(token);
    const { unresolvedCount } = useStaffReport();
    const [ rentals, setRentals ] = useState<Booking[]>([]);

    const needResolvedReportsCount =  unresolvedCount ;

    // Authentication check
    useEffect(() => {
        if (loading) return
        // Only allow staff (case-insensitive)
        const role = user?.role?.toLowerCase?.() || ''
        if (!isAuthenticated || !user || role !== 'staff') {
            navigate('/')
            return
        }
    }, [user, isAuthenticated, loading, navigate]);

    useEffect(() => {
        async function fetchRentals() {
            try {
                const rentals = await rentalAPI.getRentals();
                setRentals(rentals);
                console.log('Complete rental info:', JSON.stringify(rentals, null, 2));
            } catch (error) {
                console.error(`error fetching rentals (staff page): ${error}`);
            }
        }
        //debounce implementation to void to many api calls
        const handler = setTimeout(() => {
            fetchRentals();
        }, 500);

        return () => {
            clearTimeout(handler);
        }
    }, []);



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
                activeRentals={rentals.length}
                //TODO: UPDATE PENDING MESSAGE NUMBER
                pendingMessages={pendingCount}
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
                            <Badge variant="destructive" className="ml-1 px-1 py-0 text-xs">
                                { needResolvedReportsCount }
                            </Badge>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="messages" className="space-y-4">
                    <CustomerMessagesTab/>
                </TabsContent>

                <TabsContent value="rentals" className="space-y-4">
                    <RentalManagementTab
                        rentals={rentals}
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