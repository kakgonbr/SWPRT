import { useState, useEffect } from 'react'
import { type SystemSettings } from '../types/admin'
import { useToast } from '../contexts/toast-context'

// Mock data for development
const MOCK_SETTINGS: SystemSettings = {
    id: 'sys-001',
    siteName: 'VroomVroom.vn',
    siteDescription: 'Premium motorcycle rental service in Vietnam',
    contactEmail: 'support@vroomvroom.vn',
    supportPhone: '+84-123-456-789',
    maxRentalDays: 30,
    minRentalHours: 4,
    cancellationDeadlineHours: 24,
    defaultCurrency: 'VND',
    timezone: 'Asia/Ho_Chi_Minh',
    maintenanceMode: false,
    maintenanceMessage: 'We are currently performing scheduled maintenance. Please check back soon.',
    emailNotifications: true,
    smsNotifications: false,
    autoApprovalEnabled: false,
    requireIdVerification: true,
    maxConcurrentRentals: 3,
    updatedAt: '2024-06-08T10:00:00Z',
    updatedBy: 'admin@vroomvroom.vn'
}

export const useSystemSettings = () => {
    const [settings, setSettings] = useState<SystemSettings | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true)
                // Simulate API call - replace with actual API endpoint
                await new Promise(resolve => setTimeout(resolve, 1000))
                setSettings(MOCK_SETTINGS)
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch settings'
                setError(errorMessage)
                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive"
                })
            } finally {
                setLoading(false)
            }
        }

        fetchSettings()
    }, [toast])

    const updateSettings = async (newSettings: Partial<SystemSettings>) => {
        setLoading(true)
        try {
            // Simulate API call - replace with actual API endpoint
            await new Promise(resolve => setTimeout(resolve, 1000))

            const updatedSettings = {
                ...settings!,
                ...newSettings,
                updatedAt: new Date().toISOString()
            }

            setSettings(updatedSettings)

            toast({
                title: "Settings Updated",
                description: "System settings have been successfully updated.",
            })

            return updatedSettings
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update settings'
            setError(errorMessage)
            toast({
                title: "Update Failed",
                description: errorMessage,
                variant: "destructive"
            })
            throw err
        } finally {
            setLoading(false)
        }
    }

    const toggleMaintenanceMode = async (enabled: boolean, message?: string) => {
        return updateSettings({
            maintenanceMode: enabled,
            maintenanceMessage: message || settings?.maintenanceMessage
        })
    }

    return {
        settings,
        loading,
        error,
        updateSettings,
        toggleMaintenanceMode
    }
}