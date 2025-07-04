import { Construction } from "lucide-react";
import {useEffect, useState } from "react";

export function MaintenanceBanner() {
    const [maintenanceMessage, setMaintenanceMessage] = useState("");
    const [isScheduled, setIsScheduled] = useState(false);

    useEffect(() => {
        let mounted = true;

        async function checkMaintenance() {
            try {
                const res = await fetch("/api/serverinfo/maintenance");
                const data = await res.json();
                if (mounted) {
                    setMaintenanceMessage(data.message);
                    const startDate = data.start ? new Date(data.start) : null;
                    setIsScheduled(startDate ? startDate && startDate > new Date() : false)
                } 
            } catch {
                if (mounted) setMaintenanceMessage("");
            }
        }

        checkMaintenance();
        const interval = setInterval(checkMaintenance, 60000);
        return () => { mounted = false; clearInterval(interval); };
    }, []);

    return (
        <>
        {!!maintenanceMessage && (
            <div className="w-full bg-yellow-100 border-b-2 border-yellow-400 text-yellow-900 py-4 px-6 flex items-center justify-center shadow z-50">
                <Construction className="h-6 w-6 mr-3 text-yellow-500" />
                <div>
                        <span className="font-semibold">  {isScheduled ? "Scheduled Maintenance" : "Site Under Maintenance"}</span>
                    <span className="ml-2">{maintenanceMessage}</span>
                </div>
            </div>
            )}
        </>
    );
}
