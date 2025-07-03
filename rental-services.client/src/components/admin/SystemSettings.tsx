import { useState, useEffect } from 'react'
import { useSystemSettings } from '../../hooks/useSystemSettings'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Switch } from '../ui/switch'
//import {
//    Select,
//    SelectContent,
//    SelectItem,
//    SelectTrigger,
//    SelectValue,
//} from '../ui/select'
import { Separator } from '../ui/separator'
import { Settings, Save, RefreshCw } from 'lucide-react'
import { type SystemSettings as SystemSettingsType } from '../../types/admin'

export default function SystemSettings() {
    const { settings, loading, updateSettings } = useSystemSettings()
    const [formData, setFormData] = useState<Partial<SystemSettingsType>>({})
    const [isSaving, setIsSaving] = useState(false)

    // Initialize form data when settings load
    useEffect(() => {
        if (settings) {
            setFormData(settings)
        }
    }, [settings])

    const handleInputChange = (field: keyof SystemSettingsType, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSave = async () => {
        if (!formData) return

        setIsSaving(true)
        try {
            await updateSettings(formData)
        } catch (error) {
            console.error('Failed to save settings:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleReset = () => {
        if (settings) {
            setFormData(settings)
        }
    }

    if (loading && !settings) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Settings className="h-6 w-6" />
                        System Settings
                    </h2>
                    <p className="text-muted-foreground">
                        Configure global system settings and preferences
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleReset}>
                        Reset
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>
                            General site information and contact details
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="siteName">Site Name</Label>
                            <Input
                                id="siteName"
                                value={formData.siteName || ''}
                                onChange={(e) => handleInputChange('siteName', e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="siteDescription">Site Description</Label>
                            <Textarea
                                id="siteDescription"
                                value={formData.siteDescription || ''}
                                onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label htmlFor="contactEmail">Contact Email</Label>
                            <Input
                                id="contactEmail"
                                type="email"
                                value={formData.contactEmail || ''}
                                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="supportPhone">Support Phone</Label>
                            <Input
                                id="supportPhone"
                                value={formData.supportPhone || ''}
                                onChange={(e) => handleInputChange('supportPhone', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Rental Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Rental Configuration</CardTitle>
                        <CardDescription>
                            Configure rental rules and limitations
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="maxRentalDays">Maximum Rental Days (1 - 365)</Label>
                            <Input
                                id="maxRentalDays"
                                type="number"
                                value={formData.maxRentalDays || ''}
                                onChange={(e) => handleInputChange('maxRentalDays', parseInt(e.target.value))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="minRentalHours">Minimum Rental Hours (3 - 24)</Label>
                            <Input
                                id="minRentalHours"
                                type="number"
                                value={formData.minRentalHours || ''}
                                onChange={(e) => handleInputChange('minRentalHours', parseInt(e.target.value))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="cancellationDeadline">Cancellation Deadline (1 - 240 Hours)</Label>
                            <Input
                                id="cancellationDeadline"
                                type="number"
                                value={formData.cancellationDeadlineHours || ''}
                                onChange={(e) => handleInputChange('cancellationDeadlineHours', parseInt(e.target.value))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="maxConcurrentRentals">Max Concurrent Rentals per User (3 - 10)</Label>
                            <Input
                                id="maxConcurrentRentals"
                                type="number"
                                value={formData.maxConcurrentRentals || ''}
                                onChange={(e) => handleInputChange('maxConcurrentRentals', parseInt(e.target.value))}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* System Configuration */}
                {/*<Card>*/}
                {/*    <CardHeader>*/}
                {/*        <CardTitle>System Configuration</CardTitle>*/}
                {/*        <CardDescription>*/}
                {/*            Regional and currency settings*/}
                {/*        </CardDescription>*/}
                {/*    </CardHeader>*/}
                {/*    <CardContent className="space-y-4">*/}
                {/*        <div>*/}
                {/*            <Label htmlFor="defaultCurrency">Default Currency</Label>*/}
                {/*            <Select*/}
                {/*                value={formData.defaultCurrency || ''}*/}
                {/*                onValueChange={(value) => handleInputChange('defaultCurrency', value)}*/}
                {/*            >*/}
                {/*                <SelectTrigger>*/}
                {/*                    <SelectValue placeholder="Select currency" />*/}
                {/*                </SelectTrigger>*/}
                {/*                <SelectContent>*/}
                {/*                    <SelectItem value="VND">Vietnamese Dong (VND)</SelectItem>*/}
                {/*                    <SelectItem value="USD">US Dollar (USD)</SelectItem>*/}
                {/*                    <SelectItem value="EUR">Euro (EUR)</SelectItem>*/}
                {/*                </SelectContent>*/}
                {/*            </Select>*/}
                {/*        </div>*/}

                {/*        <div>*/}
                {/*            <Label htmlFor="timezone">Timezone</Label>*/}
                {/*            <Select*/}
                {/*                value={formData.timezone || ''}*/}
                {/*                onValueChange={(value) => handleInputChange('timezone', value)}*/}
                {/*            >*/}
                {/*                <SelectTrigger>*/}
                {/*                    <SelectValue placeholder="Select timezone" />*/}
                {/*                </SelectTrigger>*/}
                {/*                <SelectContent>*/}
                {/*                    <SelectItem value="Asia/Ho_Chi_Minh">Ho Chi Minh (UTC+7)</SelectItem>*/}
                {/*                    <SelectItem value="Asia/Bangkok">Bangkok (UTC+7)</SelectItem>*/}
                {/*                    <SelectItem value="Asia/Singapore">Singapore (UTC+8)</SelectItem>*/}
                {/*                </SelectContent>*/}
                {/*            </Select>*/}
                {/*        </div>*/}
                {/*    </CardContent>*/}
                {/*</Card>*/}

                {/* Features & Notifications */}
                <Card>
                    <CardHeader>
                        <CardTitle>Features & Notifications</CardTitle>
                        <CardDescription>
                            Enable or disable system features
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="emailNotifications">Email Notifications</Label>
                                <p className="text-sm text-muted-foreground">Send email notifications to users</p>
                            </div>
                            <Switch
                                id="emailNotifications"
                                checked={formData.emailNotifications || false}
                                onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
                            />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="smsNotifications">SMS Notifications</Label>
                                <p className="text-sm text-muted-foreground">Send SMS notifications to users</p>
                            </div>
                            <Switch
                                id="smsNotifications"
                                checked={formData.smsNotifications || false}
                                onCheckedChange={(checked) => handleInputChange('smsNotifications', checked)}
                            />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="autoApproval">Auto Approval</Label>
                                <p className="text-sm text-muted-foreground">Automatically approve rental requests</p>
                            </div>
                            <Switch
                                id="autoApproval"
                                checked={formData.autoApprovalEnabled || false}
                                onCheckedChange={(checked) => handleInputChange('autoApprovalEnabled', checked)}
                            />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="requireIdVerification">ID Verification Required</Label>
                                <p className="text-sm text-muted-foreground">Require ID verification for rentals</p>
                            </div>
                            <Switch
                                id="requireIdVerification"
                                checked={formData.requireIdVerification || false}
                                onCheckedChange={(checked) => handleInputChange('requireIdVerification', checked)}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}