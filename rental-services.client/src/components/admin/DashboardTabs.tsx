import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import OverviewTab from './OverviewTab'
import UsersTab from './UsersTab'
import BikesTab from './BikesTab'
import RentalsTab from './RentalsTab'

import { type User } from '../../pages/admin/AdminDashboard'

interface DashboardTabsProps {
    onEditUser: (user: User) => void
}

export default function DashboardTabs({ onEditUser }: DashboardTabsProps) {
    return (
        <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="bikes">Bikes</TabsTrigger>
                <TabsTrigger value="rentals">Rentals</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
                <OverviewTab />
            </TabsContent>

            <TabsContent value="users">
                <UsersTab onEditUser={onEditUser} />
            </TabsContent>

            <TabsContent value="bikes">
                <BikesTab />
            </TabsContent>

            <TabsContent value="rentals">
                <RentalsTab />
            </TabsContent>
        </Tabs>
    )
}