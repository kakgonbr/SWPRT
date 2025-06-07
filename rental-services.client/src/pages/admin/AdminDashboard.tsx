// src/pages/admin/AdminDashboard.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/auth-context'
import { useToast } from '../../hooks/use-toast'
import { MOCK_USERS, MOCK_BIKES, MOCK_RENTALS } from '../../lib/mock-data'
import { subDays, startOfMonth, endOfMonth } from 'date-fns'

import DashboardHeader from '../../components/admin/DashboardHeader'
import StatsCards from '../../components/admin/StartCards'
import DashboardTabs from '../../components/admin/DashboardTabs'
import UserEditDialog from '../../components/admin/UserEditDialog'

export interface User {
    id: string
    name: string
    email: string
    role: 'renter' | 'admin' | 'staff'
    avatarUrl?: string
    createdAt: Date
    dateOfBirth?: string
    address?: string
    credentialIdNumber?: string
    status: boolean
}

export default function AdminDashboard() {
    const navigate = useNavigate()
    const { user, isAuthenticated, loading } = useAuth()
    const { toast } = useToast()

    const [stats, setStats] = useState({
        totalUsers: 0,
        totalBikes: 0,
        activeRentals: 0,
        monthlyRevenue: 0,
        recentUsers: 0,
        availableBikes: 0
    })

    // User edit dialog state
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [editFormData, setEditFormData] = useState({
        name: '',
        email: '',
        role: 'renter' as 'renter' | 'admin' | 'staff',
        dateOfBirth: '',
        address: '',
        credentialIdNumber: '',
        status: true
    })
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (loading) return

        if (!isAuthenticated || !user || (user.role !== 'admin' && user.role !== 'staff')) {
            navigate('/')
            return
        }

        // Calculate stats
        const currentMonth = new Date()
        const monthStart = startOfMonth(currentMonth)
        const monthEnd = endOfMonth(currentMonth)

        const monthlyRentals = MOCK_RENTALS.filter(rental =>
            rental.orderDate >= monthStart && rental.orderDate <= monthEnd
        )

        const recentUsers = MOCK_USERS.filter(user =>
            user.createdAt >= subDays(new Date(), 30)
        ).length

        setStats({
            totalUsers: MOCK_USERS.length,
            totalBikes: MOCK_BIKES.length,
            activeRentals: MOCK_RENTALS.filter(r => r.status === 'Active').length,
            monthlyRevenue: monthlyRentals.reduce((sum, rental) => sum + rental.totalPrice, 0),
            recentUsers,
            availableBikes: MOCK_BIKES.filter(b => b.isAvailable).length
        })
    }, [user, isAuthenticated, loading, navigate])

    const handleEditUser = (userToEdit: User) => {
        setSelectedUser(userToEdit)
        setEditFormData({
            name: userToEdit.name,
            email: userToEdit.email,
            role: userToEdit.role,
            dateOfBirth: userToEdit.dateOfBirth || '',
            address: userToEdit.address || '',
            credentialIdNumber: userToEdit.credentialIdNumber || '',
            status: userToEdit.status,
        })
        setIsEditDialogOpen(true)
    }

    const handleSaveUser = async () => {
        if (!selectedUser) return

        setIsSaving(true)
        try {
            const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(editFormData)
            })

            if (response.ok) {
                toast({
                    title: "User Updated",
                    description: "User information has been updated successfully.",
                })
                setIsEditDialogOpen(false)
                setSelectedUser(null)
            } else {
                throw new Error('Failed to update user')
            }
        } catch (error) {
            console.error('Error updating user:', error)
            toast({
                title: "Update Failed",
                description: "Failed to update user information. Please try again.",
                variant: "destructive"
            })
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        setIsEditDialogOpen(false)
        setSelectedUser(null)
        setEditFormData({
            name: '',
            email: '',
            role: 'renter',
            dateOfBirth: '',
            address: '',
            credentialIdNumber: '',
            status: true
        })
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!isAuthenticated || !user || (user.role !== 'admin' && user.role !== 'staff')) {
        return null
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <DashboardHeader />
            <StatsCards stats={stats} />
            <DashboardTabs onEditUser={handleEditUser} />

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