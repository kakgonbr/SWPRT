import { useState } from 'react'
import { useToast } from './use-toast'

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

interface UserFormData {
    name: string
    email: string
    role: 'renter' | 'admin' | 'staff'
    dateOfBirth: string
    address: string
    credentialIdNumber: string
    status: boolean
}

export const useUserManagement = () => {
    const { toast } = useToast()
    
    // User edit dialog state
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [editFormData, setEditFormData] = useState<UserFormData>({
        name: '',
        email: '',
        role: 'renter',
        dateOfBirth: '',
        address: '',
        credentialIdNumber: '',
        status: true
    })
    const [isSaving, setIsSaving] = useState(false)

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

    return {
        isEditDialogOpen,
        selectedUser,
        editFormData,
        setEditFormData,
        isSaving,
        handleEditUser,
        handleSaveUser,
        handleCancel
    }
}