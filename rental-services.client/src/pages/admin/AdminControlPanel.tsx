import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/auth-context'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '../../components/ui/tabs'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { ArrowLeft, Settings, Construction, Megaphone, Shield } from 'lucide-react'

import SystemSettings from '../../components/admin/SystemSettings'
import MaintenanceMode from '../../components/admin/MaintenanceMode'
import PopupBannerConfig from '../../components/admin/PopupBannerConfig'

export default function AdminControlPanel() {
    const navigate = useNavigate()
    const { user, isAuthenticated, loading } = useAuth()
    const [activeTab, setActiveTab] = useState('settings')

    // Authentication and authorization check
    useEffect(() => {
        if (loading) return

        if (!isAuthenticated || !user || user.role !== 'admin') {
            navigate('/')
            return
        }
    }, [user, isAuthenticated, loading, navigate])

    // Loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        )
    }

    // Unauthorized access
    if (!isAuthenticated || !user || user.role !== 'admin') {
        return null
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/admin')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            <Shield className="h-8 w-8 text-blue-600" />
                            Admin Control Panel
                        </h1>
                        <p className="text-muted-foreground">
                            Configure system settings, maintenance mode, and website banners
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="default" className="bg-green-500">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin Access
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Main Control Panel Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="settings" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        System Settings
                    </TabsTrigger>
                    <TabsTrigger value="maintenance" className="flex items-center gap-2">
                        <Construction className="h-4 w-4" />
                        Maintenance Mode
                    </TabsTrigger>
                    <TabsTrigger value="banners" className="flex items-center gap-2">
                        <Megaphone className="h-4 w-4" />
                        Popup Banners
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="settings" className="space-y-4">
                    <SystemSettings />
                </TabsContent>

                <TabsContent value="maintenance" className="space-y-4">
                    <MaintenanceMode />
                </TabsContent>

                <TabsContent value="banners" className="space-y-4">
                    <PopupBannerConfig />
                </TabsContent>
            </Tabs>
        </div>
    )
}