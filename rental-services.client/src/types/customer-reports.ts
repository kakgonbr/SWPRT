export interface CustomerReport {
    id: string
    rentalId: string
    bikeId: string
    bikeName: string
    userId: string
    userName: string
    userEmail: string
    issueType: 'mechanical' | 'safety' | 'damage' | 'performance' | 'electrical' | 'other'
    severity: 'low' | 'medium' | 'high' | 'critical'
    title: string
    description: string
    location?: string
    imageUrls?: string[]
    submittedAt: string
    status: 'new' | 'acknowledged' | 'in-progress' | 'resolved' | 'closed'
    priority: 'low' | 'medium' | 'high' | 'critical'
    staffNotes?: string
    resolutionNotes?: string
    assignedTo?: string
    resolvedAt?: string
}

export interface ReportFormData {
    issueType: string
    severity: string
    title: string
    description: string
    location?: string
    imageUrls?: string[]
}