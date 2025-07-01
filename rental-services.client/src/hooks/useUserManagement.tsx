import { useState } from 'react'
import { useToast } from './use-toast'
import type { User, UserRole } from '../lib/types'

const API = import.meta.env.VITE_API_BASE_URL;

interface UserFormData {
    userId: number
    fullName: string
    email: string
    role: 'renter' | 'admin' | 'staff'
    dateOfBirth: string
    address: string
    credentialIdNumber: string
    isActive: boolean
}

export const useUserManagement = () => {
    const { toast } = useToast()
    
    // User edit dialog state
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [editFormData, setEditFormData] = useState<UserFormData>({
        userId : -1,
        fullName: '',
        email: '',
        role: 'renter',
        dateOfBirth: '',
        address: '',
        credentialIdNumber: '',
        isActive: true
    })
    const [isSaving, setIsSaving] = useState(false)
    const [refreshToken, updateRefreshToken] = useState(0)

    const handleEditUser = (userToEdit: User) => {
        setSelectedUser(userToEdit)
        setEditFormData({
            userId: userToEdit.userId || -1,
            fullName: userToEdit.fullName,
            email: userToEdit.email,
            role: userToEdit.role.toLowerCase() as UserRole,
            dateOfBirth: userToEdit.dateOfBirth || '',
            address: userToEdit.address || '',
            credentialIdNumber: userToEdit.credentialIdNumber || '',
            isActive: userToEdit.isActive,
        })
        setIsEditDialogOpen(true)
    }

    const handleSaveUser = async () => {
        if (!selectedUser || selectedUser.userId == -1) return

        setIsSaving(true)        

        try {
            const response = await fetch(`${API}/api/users`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(editFormData)
            })

            if (response.ok) {
                updateRefreshToken(prev => prev + 1)
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
            userId: -1,
            fullName: '',
            email: '',
            role: 'renter',
            dateOfBirth: '',
            address: '',
            credentialIdNumber: '',
            isActive: true
        })
    }

    return {
        isEditDialogOpen,
        selectedUser,
        editFormData,
        setEditFormData,
        isSaving,
        handleEditUser,
        handleSaveUser,
        handleCancel,
        refreshToken
    }
}