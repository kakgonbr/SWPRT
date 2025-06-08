// src/pages/admin/AdminDashboard.tsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/auth-context'
import { useDashboardStats } from '../../hooks/useDashboardStats'
import { useUserManagement } from '../../hooks/useUserManagement'
import { type User } from '../../components/admin/UserEditDialog'

import DashboardHeader from '../../components/admin/DashboardHeader'
import StatsCards from '../../components/admin/StartCards'
import DashboardTabs from '../../components/admin/DashboardTabs'
import UserEditDialog from '../../components/admin/UserEditDialog'
import ExportReportSection from '../../components/admin/ExportReportSection'
import { Button } from '../../components/ui/button'
import { Shield } from 'lucide-react'

export default function AdminDashboard() {
    const navigate = useNavigate()
    const { user, isAuthenticated, loading } = useAuth()
    const { stats } = useDashboardStats()
    const {
        isEditDialogOpen,
        selectedUser,
        editFormData,
        setEditFormData,
        isSaving,
        handleEditUser,
        handleSaveUser,
        handleCancel
    } = useUserManagement()

    // Authentication and authorization check
    useEffect(() => {
        if (loading) return

        if (!isAuthenticated || !user || (user.role !== 'admin' && user.role !== 'staff')) {
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
    if (!isAuthenticated || !user || (user.role !== 'admin' && user.role !== 'staff')) {
        return null
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header with Control Panel Access */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome back, {user?.name}! Manage your rental platform.
                    </p>
                </div>

                {/* Control Panel Button - Only for Admin */}
                {user.role === 'admin' && (
                    <Button
                        onClick={() => navigate('/admin/control-panel')}
                        className="flex items-center gap-2"
                        variant="outline"
                    >
                        <Shield className="h-4 w-4" />
                        Control Panel
                    </Button>
                )}
            </div>

            {/* Dashboard Header */}
            <DashboardHeader />

            {/* Stats Cards */}
            <StatsCards stats={stats} />

            {/* Dashboard Tabs */}
            <DashboardTabs onEditUser={handleEditUser} />

            {/* Export Report Section */}
            <ExportReportSection />

            {/* User Edit Dialog */}
            <UserEditDialog
                isOpen={isEditDialogOpen}
                selectedUser={selectedUser as User | null}
                editFormData={editFormData}
                setEditFormData={setEditFormData}
                isSaving={isSaving}
                onSave={handleSaveUser}
                onClose={handleCancel}
            />
        </div>
    )
}