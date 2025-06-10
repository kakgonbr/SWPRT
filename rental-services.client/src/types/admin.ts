export interface SystemSettings {
    id: string
    siteName: string
    siteDescription: string
    contactEmail: string
    supportPhone: string
    maxRentalDays: number
    minRentalHours: number
    cancellationDeadlineHours: number
    defaultCurrency: string
    timezone: string
    maintenanceMode: boolean
    maintenanceMessage: string
    maintenanceStartTime?: string
    maintenanceEndTime?: string
    emailNotifications: boolean
    smsNotifications: boolean
    autoApprovalEnabled: boolean
    requireIdVerification: boolean
    maxConcurrentRentals: number
    updatedAt: string
    updatedBy: string
}

export interface PopupBanner {
    id: string
    title: string
    message: string
    type: 'info' | 'warning' | 'success' | 'error' | 'promotion'
    isActive: boolean
    startDate: string
    endDate: string
    displayPages: string[]
    buttonText?: string
    buttonLink?: string
    priority: number
    showOnce: boolean
    backgroundColor?: string
    textColor?: string
    createdAt: string
    updatedAt: string
}

export interface MaintenanceConfig {
    isEnabled: boolean
    message: string
    startTime?: string
    endTime?: string
    allowedUserRoles: string[]
    showCountdown: boolean
    redirectUrl?: string
}