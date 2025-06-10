import { useState } from 'react'
import { useToast } from './use-toast'
import { type CustomerReport, type ReportFormData } from '../types/customer-reports'
import type { Rental } from '../lib/types'

export const useCustomerReport = () => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { toast } = useToast()

    const submitReport = async (rental: Rental, formData: ReportFormData, userInfo: { id: string, name: string, email: string }) => {
        setIsSubmitting(true)
        try {
            // Simulate API call - replace with actual API endpoint
            await new Promise(resolve => setTimeout(resolve, 2000))

            const newReport: CustomerReport = {
                id: `report-${Date.now()}`,
                rentalId: rental.id,
                bikeId: rental.bikeId,
                bikeName: rental.bikeName,
                userId: userInfo.id,
                userName: userInfo.name,
                userEmail: userInfo.email,
                issueType: formData.issueType as any,
                severity: formData.severity as any,
                title: formData.title,
                description: formData.description,
                location: formData.location,
                imageUrls: formData.imageUrls,
                submittedAt: new Date().toISOString(),
                status: 'new',
                priority: formData.severity as any,
            }

            // TODO: Send to API and add to staff reports system
            console.log('New customer report:', newReport)

            toast({
                title: "Report Submitted Successfully",
                description: "Your issue has been reported to our staff. We'll contact you soon with updates.",
            })

            return newReport
        } catch (error) {
            console.error('Error submitting report:', error)
            toast({
                title: "Submission Failed",
                description: "Failed to submit your report. Please try again or contact support.",
                variant: "destructive"
            })
            throw error
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        submitReport,
        isSubmitting
    }
}