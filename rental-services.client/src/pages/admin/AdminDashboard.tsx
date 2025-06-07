// src/pages/admin/AdminDashboard.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Users,
    Bike,
    Calendar,
    DollarSign,
    TrendingUp,
    AlertTriangle,
    MessageSquare,
    BarChart3,
    Edit,
    Save,
    X
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { useAuth } from '../../contexts/auth-context'
import { useToast } from '../../hooks/use-toast'
import { MOCK_USERS, MOCK_BIKES, MOCK_RENTALS } from '../../lib/mock-data'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'

interface User {
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
            isActive: value === 'active'
        }))
    }

    const handleSaveUser = async () => {
        if (!selectedUser) return

        setIsSaving(true)
        try {
            // In a real app, you would make an API call here
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
                // In a real app, you would refetch the users data here
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

    const recentRentals = MOCK_RENTALS
        .sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime())
        .slice(0, 5)

    const recentUsers = MOCK_USERS
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5)

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
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                    Overview of VroomVroom operations and key metrics
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                        <p className="text-xs text-muted-foreground">
                            +{stats.recentUsers} new this month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bikes</CardTitle>
                        <Bike className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalBikes}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.availableBikes} available now
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeRentals}</div>
                        <p className="text-xs text-muted-foreground">
                            Currently ongoing
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.monthlyRevenue.toFixed(0)}</div>
                        <p className="text-xs text-muted-foreground">
                            This month
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="bikes">Bikes</TabsTrigger>
                    <TabsTrigger value="rentals">Rentals</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Rentals */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Rentals</CardTitle>
                                <CardDescription>Latest rental activities</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentRentals.map((rental) => (
                                        <div key={rental.id} className="flex items-center space-x-4">
                                            <img
                                                src={rental.bikeImageUrl.split('"')[0]}
                                                alt={rental.bikeName}
                                                className="w-12 h-12 object-cover rounded"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {rental.bikeName}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(rental.orderDate, 'MMM d, yyyy')}
                                                </p>
                                            </div>
                                            <Badge variant={
                                                rental.status === 'Active' ? 'default' :
                                                    rental.status === 'Completed' ? 'secondary' :
                                                        rental.status === 'Upcoming' ? 'outline' :
                                                            'destructive'
                                            }>
                                                {rental.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Users */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Users</CardTitle>
                                <CardDescription>Newly registered users</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentUsers.map((user) => (
                                        <div key={user.id} className="flex items-center space-x-4">
                                            <img
                                                src={user.avatarUrl}
                                                alt={user.name}
                                                className="w-10 h-10 rounded-full"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{user.name}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                            <Badge variant={
                                                user.role === 'admin' ? 'default' :
                                                    user.role === 'staff' ? 'secondary' :
                                                        'outline'
                                            }>
                                                {user.role}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="users">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Management</CardTitle>
                            <CardDescription>Manage user accounts and permissions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {MOCK_USERS.map((user) => (
                                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center space-x-4">
                                            <Avatar className="w-12 h-12">
                                                <AvatarImage src={user.avatarUrl} alt={user.name} />
                                                <AvatarFallback>
                                                    {user.name.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Joined {format(user.createdAt, 'MMM yyyy')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge variant={user.status ? 'default' : 'destructive'}>
                                                {user.status ? 'Active' : 'Inactive'}
                                            </Badge>
                                            <Badge variant={
                                                user.role === 'admin' ? 'default' :
                                                    user.role === 'staff' ? 'secondary' :
                                                        'outline'
                                            }>
                                                {user.role}
                                            </Badge>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEditUser(user)}
                                            >
                                                <Edit className="h-4 w-4 mr-1" />
                                                Edit
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="bikes">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bike Management</CardTitle>
                            <CardDescription>Manage bike inventory and availability</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {MOCK_BIKES.slice(0, 10).map((bike) => (
                                    <div key={bike.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center space-x-4">
                                            <img
                                                src={bike.imageUrl.split('"')[0]}
                                                alt={bike.name}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                            <div>
                                                <p className="font-medium">{bike.name}</p>
                                                <p className="text-sm text-muted-foreground">{bike.type}</p>
                                                <p className="text-sm">${bike.pricePerDay}/day</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge variant={bike.isAvailable ? 'default' : 'destructive'}>
                                                {bike.isAvailable ? 'Available' : 'Unavailable'}
                                            </Badge>
                                            <Button variant="outline" size="sm">
                                                Edit
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="rentals">
                    <Card>
                        <CardHeader>
                            <CardTitle>Rental Management</CardTitle>
                            <CardDescription>Monitor and manage all rentals</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {MOCK_RENTALS.slice(0, 10).map((rental) => (
                                    <div key={rental.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center space-x-4">
                                            <img
                                                src={rental.bikeImageUrl.split('"')[0]}
                                                alt={rental.bikeName}
                                                className="w-12 h-12 object-cover rounded"
                                            />
                                            <div>
                                                <p className="font-medium">{rental.bikeName}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {format(rental.startDate, 'MMM d')} - {format(rental.endDate, 'MMM d, yyyy')}
                                                </p>
                                                <p className="text-sm">${rental.totalPrice}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge variant={
                                                rental.status === 'Active' ? 'default' :
                                                    rental.status === 'Completed' ? 'secondary' :
                                                        rental.status === 'Upcoming' ? 'outline' :
                                                            'destructive'
                                            }>
                                                {rental.status}
                                            </Badge>
                                            <Button variant="outline" size="sm">
                                                Details
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* User Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
                                    <AvatarImage src={selectedUser.avatarUrl} alt={selectedUser.name} />
                                    <AvatarFallback>
                                        {selectedUser.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-lg font-medium">{selectedUser.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Member since {format(selectedUser.createdAt, 'MMM yyyy')}
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
                                            <SelectItem value="customer">Customer</SelectItem>
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
                            onClick={handleCancel}
                            disabled={isSaving}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveUser}
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
        </div>
    )
}