import { useState, useEffect } from 'react'
//import { useSystemSettings } from '../../hooks/useSystemSettings'
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
//import { Switch } from '../ui/switch'
import { Badge } from '../ui/badge'
//import {
//    AlertDialog,
//    AlertDialogAction,
//    AlertDialogCancel,
//    AlertDialogContent,
//    AlertDialogDescription,
//    AlertDialogFooter,
//    AlertDialogHeader,
//    AlertDialogTitle,
//    AlertDialogTrigger,
//} from '../ui/alert-dialog'
import {
    Construction,
    Power,
    PowerOff,
    Clock,
    AlertTriangle,
    Calendar,
    //Save
} from 'lucide-react'
import { useToast } from '../../contexts/toast-context'
export interface MaintenanceInfo {
    start: string | null
    end: string | null
    message: string
}
export default function MaintenanceMode() {
    const [maintenanceMessage, setMaintenanceMessage] = useState<string>("")
    const [startTime, setStartTime] = useState<string>("")
    const [endTime, setEndTime] = useState<string>("")
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const rawToken = localStorage.getItem("token");
    const [isMaintenanceActive, setMaintenanceActive] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setIsLoading(true)
        fetchMaintenanceInfo()
            .then(data => {
                setMaintenanceMessage(data.message || "")
                setStartTime(data.start ? data.start.slice(0, 16) : "")
                setEndTime(data.end ? data.end.slice(0, 16) : "")
                setMaintenanceActive(!!data.message || !!data.start || !!data.end)
            })
            .catch(() => {
                setMaintenanceMessage("")
                setStartTime("")
                setEndTime("")
            })
            .finally(() => setIsLoading(false))
    }, [rawToken])

    const handleSetMaintenance = async () => {
        setIsSaving(true)
        try {
            await setMaintenancePeriod({
                message: maintenanceMessage,
                start: startTime && startTime.trim() !== "" ? startTime : null,
                end: endTime && endTime.trim() !== "" ? endTime : null,
            }, rawToken!)
        } catch (e) {
            //alert("Failed to set maintenance period.")
            toast({
                title: "Failed to set maintenance period.",
                description: "Please recheck maintenance information.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false)
            fetchMaintenanceInfo().then(data => {
                setMaintenanceMessage(data.message || "")
                setStartTime(data.start ? data.start.slice(0, 16) : "")
                setEndTime(data.end ? data.end.slice(0, 16) : "")
                setMaintenanceActive(!!data.message || !!data.start || !!data.end)
            })
        }
    }

    const handleClearMaintenance = async () => {
        setIsSaving(true)
        try {
            await clearMaintenancePeriod(rawToken!)
            setMaintenanceMessage("")
            setStartTime("")
            setEndTime("")
            setMaintenanceActive(false)
        } catch (e) {
            //alert("Failed to clear maintenance period.")
            toast({
                title: "Failed to clear maintenance period.",
                description: "Please refresh the page.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Construction className="h-6 w-6" />
                    Maintenance Mode
                </h2>
                <p className="text-muted-foreground">
                    Control site maintenance mode and maintenance windows
                </p>
            </div>

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
                            onChange={e => setMaintenanceMessage(e.target.value)}
                            rows={4}
                            disabled={isLoading}
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                            This message will be displayed on the maintenance page
                        </p>
                    </div>
                    {maintenanceMessage && (
                        <div className="border rounded-lg p-4 bg-muted">
                            <h4 className="font-medium mb-2">Preview:</h4>
                            <div className="w-full bg-yellow-100 border-b-2 border-yellow-400 text-yellow-900 py-4 px-6 flex items-center justify-center shadow z-50">
                                <Construction className="h-6 w-6 mr-3 text-yellow-500" />
                                <div>
                                    <span className="font-semibold">Site Under Maintenance</span>
                                    <span className="ml-2">{maintenanceMessage}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Maintenance Period
                    </CardTitle>
                    <CardDescription>
                        Optionally set the maintenance window (start and end time)
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="startTime">Start Time</Label>
                            <Input
                                id="startTime"
                                type="datetime-local"
                                value={startTime}
                                onChange={e => setStartTime(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <Label htmlFor="endTime">End Time</Label>
                            <Input
                                id="endTime"
                                type="datetime-local"
                                value={endTime}
                                onChange={e => setEndTime(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    {(startTime || endTime) && (
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleClearMaintenance} disabled={isSaving || isLoading}>
                                Clear Maintenance Period
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {isMaintenanceActive ? (
                            <PowerOff className="h-5 w-5 text-red-500" />
                        ) : (
                            <Power className="h-5 w-5 text-green-500" />
                        )}
                        {isMaintenanceActive ? "Maintenance Enabled" : "Maintenance Disabled"}
                    </CardTitle>
                    <CardDescription>
                        {isMaintenanceActive
                            ? "The site is currently in maintenance mode."
                            : "The site is currently online."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-3">
                        <Badge variant={isMaintenanceActive ? "destructive" : "default"} className="flex items-center gap-1">
                            {isMaintenanceActive
                                ? <Construction className="h-3 w-3" />
                                : <Power className="h-3 w-3" />}
                            {isMaintenanceActive ? "Under Maintenance" : "Online"}
                        </Badge>
                        <Button
                            onClick={handleSetMaintenance}
                            disabled={isSaving || isLoading}
                            className={isMaintenanceActive
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-red-600 hover:bg-red-700"}
                        >
                            {isSaving
                                ? "Updating..."
                                : isMaintenanceActive
                                    ? <>
                                        <Power className="h-4 w-4 mr-2" />
                                        Update Maintenance
                                    </>
                                    : <>
                                        <PowerOff className="h-4 w-4 mr-2" />
                                        Enable Maintenance
                                    </>
                            }
                        </Button>
                        {isMaintenanceActive && (
                            <Button variant="outline" onClick={handleClearMaintenance} disabled={isSaving || isLoading}>
                                Disable Maintenance
                            </Button>
                        )}
                    </div>
                    {(startTime || endTime) && (
                        <div className="mt-2 text-sm text-muted-foreground flex gap-4">
                            {startTime && (
                                <span>
                                    <Clock className="h-4 w-4 inline" /> Start: {format(new Date(startTime), "PPP p")}
                                </span>
                            )}
                            {endTime && (
                                <span>
                                    <Clock className="h-4 w-4 inline" /> End: {format(new Date(endTime), "PPP p")}
                                </span>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

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

// ---- Helper functions here! ----

async function fetchMaintenanceInfo(): Promise<MaintenanceInfo> {
    const res = await fetch("/api/serverinfo/maintenance")
    if (!res.ok) throw new Error("Failed to fetch maintenance info")
    try {
        return res.json();
    } catch (err) {
        return { message: "", start: null, end: null }
    }
}

async function setMaintenancePeriod(data: MaintenanceInfo, token: string): Promise<void> {
    const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to set maintenance period")
    //return res.body?.getReader.toString
}


async function clearMaintenancePeriod(token?: string): Promise<void> {
    const res = await fetch("/api/admin/maintenance", {
        method: "DELETE", headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
    if (!res.ok) throw new Error("Failed to clear maintenance period")
}