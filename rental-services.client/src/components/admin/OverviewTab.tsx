import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { MOCK_RENTALS, MOCK_USERS } from '../../lib/mock-data'
import { format } from 'date-fns'

export default function OverviewTab() {
    const recentRentals = MOCK_RENTALS
        .sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime())
        .slice(0, 5)

    const recentUsers = MOCK_USERS
        .sort((a, b) => b.creationDate.getTime() - a.creationDate.getTime())
        .slice(0, 5)

    return (
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
                            <div key={user.userId} className="flex items-center space-x-4">
                                <img
                                    src={user.avatarUrl || '/default-avatar.png'}
                                    alt={user.fullName}
                                    className="w-10 h-10 rounded-full"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{user.fullName}</p>
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
    )
}