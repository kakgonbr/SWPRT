import { useState, useEffect } from 'react'
import { type PopupBanner } from '../types/admin'
import { useToast } from './use-toast'

// Mock data for development
const MOCK_BANNERS: PopupBanner[] = [
    {
        id: 'banner-001',
        title: 'Summer Sale!',
        message: 'Get 20% off on all motorcycle rentals this summer. Book now and save!',
        type: 'promotion',
        isActive: true,
        startDate: '2024-06-01T00:00:00Z',
        endDate: '2024-08-31T23:59:59Z',
        displayPages: ['/', '/bikes'],
        buttonText: 'Book Now',
        buttonLink: '/bikes',
        priority: 1,
        showOnce: false,
        backgroundColor: '#ff6b35',
        textColor: '#ffffff',
        createdAt: '2024-06-01T10:00:00Z',
        updatedAt: '2024-06-01T10:00:00Z'
    },
    {
        id: 'banner-002',
        title: 'Maintenance Notice',
        message: 'Scheduled maintenance on June 15th from 2:00 AM to 4:00 AM. Services may be temporarily unavailable.',
        type: 'warning',
        isActive: false,
        startDate: '2024-06-14T00:00:00Z',
        endDate: '2024-06-16T00:00:00Z',
        displayPages: ['/'],
        priority: 2,
        showOnce: true,
        backgroundColor: '#fbbf24',
        textColor: '#1f2937',
        createdAt: '2024-06-01T10:00:00Z',
        updatedAt: '2024-06-01T10:00:00Z'
    }
]

export const usePopupBanner = () => {
    const [banners, setBanners] = useState<PopupBanner[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                setLoading(true)
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000))
                setBanners(MOCK_BANNERS)
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch banners'
                setError(errorMessage)
            } finally {
                setLoading(false)
            }
        }

        fetchBanners()
    }, [])

    const createBanner = async (bannerData: Omit<PopupBanner, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            setLoading(true)
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))

            const newBanner: PopupBanner = {
                ...bannerData,
                id: `banner-${Date.now()}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            setBanners(prev => [...prev, newBanner])

            toast({
                title: "Banner Created",
                description: "Popup banner has been successfully created.",
            })

            return newBanner
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create banner'
            toast({
                title: "Creation Failed",
                description: errorMessage,
                variant: "destructive"
            })
            throw err
        } finally {
            setLoading(false)
        }
    }

    const updateBanner = async (id: string, updates: Partial<PopupBanner>) => {
        try {
            setLoading(true)
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))

            setBanners(prev => prev.map(banner =>
                banner.id === id
                    ? { ...banner, ...updates, updatedAt: new Date().toISOString() }
                    : banner
            ))

            toast({
                title: "Banner Updated",
                description: "Popup banner has been successfully updated.",
            })
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update banner'
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

    const deleteBanner = async (id: string) => {
        try {
            setLoading(true)
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))

            setBanners(prev => prev.filter(banner => banner.id !== id))

            toast({
                title: "Banner Deleted",
                description: "Popup banner has been successfully deleted.",
            })
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete banner'
            toast({
                title: "Deletion Failed",
                description: errorMessage,
                variant: "destructive"
            })
            throw err
        } finally {
            setLoading(false)
        }
    }

    const toggleBannerStatus = async (id: string, isActive: boolean) => {
        return updateBanner(id, { isActive })
    }

    return {
        banners,
        loading,
        error,
        createBanner,
        updateBanner,
        deleteBanner,
        toggleBannerStatus
    }
}