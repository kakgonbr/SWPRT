import { useState, useEffect } from 'react'
import { useSystemSettings } from '../../hooks/useSystemSettings'
import { format } from 'date-fns'
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
import { Badge } from '../ui/badge'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '../ui/alert-dialog'
import {
    Construction,
    Power,
    PowerOff,
    Clock,
    AlertTriangle,
    Calendar,
    Save
} from 'lucide-react'

export default function MaintenanceMode() {
    const { settings, loading, toggleMaintenanceMode, updateSettings } = useSystemSettings()
    const [maintenanceMessage, setMaintenanceMessage] = useState('')
    const [startTime, setStartTime] = useState('')
    const [endTime, setEndTime] = useState('')
    const [isScheduled, setIsScheduled] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (settings) {
            setMaintenanceMessage(settings.maintenanceMessage || '')
            setStartTime(settings.maintenanceStartTime || '')
            setEndTime(settings.maintenanceEndTime || '')
            setIsScheduled(!!(settings.maintenanceStartTime && settings.maintenanceEndTime))
        }
    }, [settings])

    const handleToggleMaintenance = async (enabled: boolean) => {
        setIsSaving(true)
        try {
            await toggleMaintenanceMode(enabled, maintenanceMessage)
        } catch (error) {
            console.error('Failed to toggle maintenance mode:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleScheduleMaintenance = async () => {
        setIsSaving(true)
        try {
            await updateSettings({
                maintenanceMessage,
                maintenanceStartTime: startTime,
                maintenanceEndTime: endTime
            })
        } catch (error) {
            console.error('Failed to schedule maintenance:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleClearSchedule = async () => {
        setIsSaving(true)
        try {
            await updateSettings({
                maintenanceStartTime: undefined,
                maintenanceEndTime: undefined
            })
            setStartTime('')
            setEndTime('')
            setIsScheduled(false)
        } catch (error) {
            console.error('Failed to clear schedule:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const isMaintenanceActive = settings?.maintenanceMode || false
    const hasScheduledMaintenance = !!(settings?.maintenanceStartTime && settings?.maintenanceEndTime)

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Construction className="h-6 w-6" />
                    Maintenance Mode
                </h2>
                <p className="text-muted-foreground">
                    Control site maintenance mode and schedule maintenance windows
                </p>
            </div>

            {/* Current Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {isMaintenanceActive ? (
                            <PowerOff className="h-5 w-5 text-red-500" />
                        ) : (
                            <Power className="h-5 w-5 text-green-500" />
                        )}
                        Current Status
                    </CardTitle>
                    <CardDescription>
                        Current maintenance mode status and quick controls
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Site Status:</span>
                                {isMaintenanceActive ? (
                                    <Badge variant="destructive" className="flex items-center gap-1">
                                        <Construction className="h-3 w-3" />
                                        Under Maintenance
                                    </Badge>
                                ) : (
                                    <Badge variant="default" className="bg-green-500 flex items-center gap-1">
                                        <Power className="h-3 w-3" />
                                        Online
                                    </Badge>
                                )}
                            </div>
                            {isMaintenanceActive && (
                                <p className="text-sm text-muted-foreground">
                                    Users are currently seeing the maintenance page
                                </p>
                            )}
                        </div>

                        <div className="flex gap-2">
                            {isMaintenanceActive ? (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline" className="text-green-600 border-green-600">
                                            <Power className="h-4 w-4 mr-2" />
                                            Bring Site Online
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Bring Site Online?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will disable maintenance mode and make the site accessible to all users.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleToggleMaintenance(false)}
                                                disabled={isSaving}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                {isSaving ? 'Updating...' : 'Bring Online'}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            ) : (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive">
                                            <PowerOff className="h-4 w-4 mr-2" />
                                            Enable Maintenance
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Enable Maintenance Mode?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will immediately put the site into maintenance mode. Only admins will be able to access the site.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleToggleMaintenance(true)}
                                                disabled={isSaving}
                                                className="bg-red-600 hover:bg-red-700"
                                            >
                                                {isSaving ? 'Updating...' : 'Enable Maintenance'}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Maintenance Message */}
            <Card>
                <CardHeader>
                    <CardTitle>Maintenance Message</CardTitle>
                    <CardDescription>
                        Configure the message shown to users during maintenance
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="maintenanceMessage">Message to Display</Label>
                        <Textarea
                            id="maintenanceMessage"
                            placeholder="Enter the message users will see during maintenance..."
                            value={maintenanceMessage}
                            onChange={(e) => setMaintenanceMessage(e.target.value)}
                            rows={4}
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                            This message will be displayed on the maintenance page
                        </p>
                    </div>

                    {/* Preview */}
                    {maintenanceMessage && (
                        <div className="border rounded-lg p-4 bg-muted">
                            <h4 className="font-medium mb-2">Preview:</h4>
                            <div className="bg-background border rounded p-4">
                                <div className="text-center space-y-2">
                                    <Construction className="h-12 w-12 mx-auto text-orange-500" />
                                    <h3 className="text-lg font-semibold">Site Under Maintenance</h3>
                                    <p className="text-muted-foreground">{maintenanceMessage}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Scheduled Maintenance */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Scheduled Maintenance
                    </CardTitle>
                    <CardDescription>
                        Schedule maintenance windows in advance
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {hasScheduledMaintenance && (
                        <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-blue-900">Scheduled Maintenance</h4>
                                    <div className="text-sm text-blue-700 space-y-1 mt-1">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            Start: {format(new Date(settings?.maintenanceStartTime!), 'PPP p')}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            End: {format(new Date(settings?.maintenanceEndTime!), 'PPP p')}
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClearSchedule}
                                    disabled={isSaving}
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                    Clear Schedule
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <Label htmlFor="scheduleToggle">Schedule Maintenance Window</Label>
                        <Switch
                            id="scheduleToggle"
                            checked={isScheduled}
                            onCheckedChange={setIsScheduled}
                        />
                    </div>

                    {isScheduled && (
                        <div className="space-y-4 p-4 border rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="startTime">Start Time</Label>
                                    <Input
                                        id="startTime"
                                        type="datetime-local"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="endTime">End Time</Label>
                                    <Input
                                        id="endTime"
                                        type="datetime-local"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsScheduled(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleScheduleMaintenance}
                                    disabled={!startTime || !endTime || isSaving}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {isSaving ? 'Saving...' : 'Schedule Maintenance'}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Maintenance Tips */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        Important Notes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                        <p>• Maintenance mode will display a custom page to all non-admin users</p>
                        <p>• Admin users can still access the site normally during maintenance</p>
                        <p>• Scheduled maintenance will automatically enable/disable based on the time window</p>
                        <p>• Always test your maintenance page before enabling maintenance mode</p>
                        <p>• Consider notifying users in advance about scheduled maintenance</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}