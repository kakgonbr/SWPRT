import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Users, Bike, Calendar, Heart } from 'lucide-react'
import UsersTab from './UsersTab'
import BikesTab from './BikesTab'
import RentalsTab from './RentalsTab'
import FeedbackManagement from './FeedbackManagement'

interface DashboardTabsProps {
    onEditUser: (user: any) => void
}

export default function DashboardTabs({ onEditUser }: DashboardTabsProps) {
    return (
        <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="users" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Users
                </TabsTrigger>
                <TabsTrigger value="bikes" className="flex items-center gap-2">
                    <Bike className="h-4 w-4" />
                    Bikes
                </TabsTrigger>
                <TabsTrigger value="rentals" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Rentals
                </TabsTrigger>
                <TabsTrigger value="feedback" className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Feedback
                </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-6">
                <UsersTab onEditUser={onEditUser} />
            </TabsContent>

            <TabsContent value="bikes" className="mt-6">
                <BikesTab />
            </TabsContent>

            <TabsContent value="rentals" className="mt-6">
                <RentalsTab />
            </TabsContent>

            <TabsContent value="feedback" className="mt-6">
                <FeedbackManagement />
            </TabsContent>
        </Tabs>
    )
}