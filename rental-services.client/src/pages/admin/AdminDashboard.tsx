// src/pages/admin/AdminDashboard.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Users,
    Bike,
    Calendar,
    DollarSign,
    //@ts-ignore
    TrendingUp,
    //@ts-ignore

    AlertTriangle,
    //@ts-ignore

    MessageSquare,
    //@ts-ignore
    BarChart3
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { useAuth } from '../../contexts/auth-context'
import { MOCK_USERS, MOCK_BIKES, MOCK_RENTALS } from '../../lib/mock-data'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'

export default function AdminDashboard() {
    const navigate = useNavigate()
    const { user, isAuthenticated, loading } = useAuth()
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalBikes: 0,
        activeRentals: 0,
        monthlyRevenue: 0,
        recentUsers: 0,
        availableBikes: 0
    })

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
                                            <img
                                                src={user.avatarUrl}
                                                alt={user.name}
                                                className="w-12 h-12 rounded-full"
                                            />
                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Joined {format(user.createdAt, 'MMM yyyy')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge variant={
                                                user.role === 'admin' ? 'default' :
                                                    user.role === 'staff' ? 'secondary' :
                                                        'outline'
                                            }>
                                                {user.role}
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
        </div>
    )
}