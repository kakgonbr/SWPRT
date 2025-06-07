// src/pages/admin/AdminDashboard.tsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/auth-context'
import { useDashboardStats } from '../../hooks/useDashboardStats'
import { useUserManagement } from '../../hooks/useUserManagement'

import DashboardHeader from '../../components/admin/DashboardHeader'
import StatsCards from '../../components/admin/StartCards'
import DashboardTabs from '../../components/admin/DashboardTabs'
import UserEditDialog from '../../components/admin/UserEditDialog'
import ExportReportSection from '../../components/admin/ExportReportSection'

export default function AdminDashboard() {
    const navigate = useNavigate()
    const { user, isAuthenticated, loading } = useAuth()
    const { stats, isLoading: statsLoading } = useDashboardStats()
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
    if (loading || statsLoading) {
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
            {/* Header with Export Section */}
            <div className="flex justify-between items-center mb-6">
                <DashboardHeader />
                <ExportReportSection />
            </div>

            {/* Dashboard Content */}
            <StatsCards stats={stats} />
            <DashboardTabs onEditUser={handleEditUser} />

            {/* User Edit Modal */}
            <UserEditDialog
                isOpen={isEditDialogOpen}
                onClose={handleCancel}
                selectedUser={selectedUser}
                editFormData={editFormData}
                setEditFormData={setEditFormData}
                onSave={handleSaveUser}
                isSaving={isSaving}
            />
        </div>
    )
}