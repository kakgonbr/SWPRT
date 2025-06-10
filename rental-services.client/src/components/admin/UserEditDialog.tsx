import { Save, X } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { format } from 'date-fns'


// Define proper types instead of importing from AdminDashboard
interface User {
    id: string
    name: string
    email: string
    role: 'renter' | 'admin' | 'staff'
    dateOfBirth: string
    address: string
    credentialIdNumber: string
    status: boolean
    avatarUrl?: string
    createdAt: string | Date
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

interface UserEditDialogProps {
    isOpen: boolean
    onClose: () => void
    selectedUser: User | null
    editFormData: UserFormData
    setEditFormData: React.Dispatch<React.SetStateAction<UserFormData>>
    onSave: () => void
    isSaving: boolean
}

export default function UserEditDialog({
    isOpen,
    onClose,
    selectedUser,
    editFormData,
    setEditFormData,
    onSave,
    isSaving
}: UserEditDialogProps) {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleRoleChange = (value: string) => {
        setEditFormData(prev => ({
            ...prev,
            role: value as 'renter' | 'admin' | 'staff'
        }))
    }

    const handleStatusChange = (value: string) => {
        setEditFormData(prev => ({
            ...prev,
            status: value === 'active'
        }))
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Edit User Information</DialogTitle>
                    <DialogDescription>
                        Update user details and account settings for {selectedUser?.name}
                    </DialogDescription>
                </DialogHeader>

                {selectedUser && (
                    <div className="grid gap-4 py-4">
                        {/* User Avatar and Basic Info */}
                        <div className="flex items-center space-x-4 pb-4 border-b">
                            <Avatar className="w-16 h-16">
                                <AvatarImage src={selectedUser.avatarUrl || undefined} alt={selectedUser.name} />
                                <AvatarFallback>
                                    {selectedUser.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-lg font-medium">{selectedUser.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                    Member since {format(new Date(selectedUser.createdAt), 'MMM yyyy')}
                                </p>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Full Name</Label>
                                <Input
                                    id="edit-name"
                                    name="name"
                                    value={editFormData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter full name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                    id="edit-email"
                                    name="email"
                                    type="email"
                                    value={editFormData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter email address"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-role">Role</Label>
                                <Select value={editFormData.role} onValueChange={handleRoleChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="renter">Customer</SelectItem>
                                        <SelectItem value="staff">Staff</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-status">Account Status</Label>
                                <Select
                                    value={editFormData.status ? 'active' : 'inactive'}
                                    onValueChange={handleStatusChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-dob">Date of Birth</Label>
                            <Input
                                id="edit-dob"
                                name="dateOfBirth"
                                type="date"
                                value={editFormData.dateOfBirth}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-address">Address</Label>
                            <Input
                                id="edit-address"
                                name="address"
                                value={editFormData.address}
                                onChange={handleInputChange}
                                placeholder="Enter address"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-id">Credential ID Number</Label>
                            <Input
                                id="edit-id"
                                name="credentialIdNumber"
                                value={editFormData.credentialIdNumber}
                                onChange={handleInputChange}
                                placeholder="Enter ID number"
                            />
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isSaving}
                    >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                    </Button>
                    <Button
                        onClick={onSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>Saving...</>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// Export types for use in other components
export type { User, UserFormData }