import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Calendar, MessageSquare } from 'lucide-react'

interface StaffStatsCardsProps {
    activeRentals: number
    pendingMessages: number
}

export default function StaffStatsCards({ activeRentals, pendingMessages }: StaffStatsCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{activeRentals}</div>
                    <p className="text-xs text-muted-foreground">Currently rented</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Messages</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">{pendingMessages}</div>
                    <p className="text-xs text-muted-foreground">Need attention</p>
                </CardContent>
            </Card>
        </div>
    )
}