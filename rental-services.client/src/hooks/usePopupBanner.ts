import { useState, useEffect } from 'react'
import { type PopupBanner } from '../types/admin'
import { useToast } from '../contexts/toast-context'

const API = import.meta.env.VITE_API_BASE_URL;

// Mock data for development
//const MOCK_BANNERS: PopupBanner[] = [
//    {
//        bannerId: 'banner-001',
//        title: 'Summer Sale!',
//        message: 'Get 20% off on all motorcycle rentals this summer. Book now and save!',
//        type: 'promotion',
//        isActive: true,
//        startDate: '2024-06-01T00:00:00Z',
//        endDate: '2024-08-31T23:59:59Z',
//        //displayPages: ['/', '/bikes'],
//        buttonText: 'Book Now',
//        buttonLink: '/bikes',
//        priority: 1,
//        showOnce: false,
//        backgroundColor: '#ff6b35',
//        textColor: '#ffffff',
//        createdAt: '2024-06-01T10:00:00Z',
//        updatedAt: '2024-06-01T10:00:00Z'
//    },
//    {
//        bannerId: 'banner-002',
//        title: 'Maintenance Notice',
//        message: 'Scheduled maintenance on June 15th from 2:00 AM to 4:00 AM. Services may be temporarily unavailable.',
//        type: 'warning',
//        isActive: false,
//        startDate: '2024-06-14T00:00:00Z',
//        endDate: '2024-06-16T00:00:00Z',
//        //displayPages: ['/'],
//        priority: 2,
//        showOnce: true,
//        backgroundColor: '#fbbf24',
//        textColor: '#1f2937',
//        createdAt: '2024-06-01T10:00:00Z',
//        updatedAt: '2024-06-01T10:00:00Z'
//    }
//]

export const usePopupBanner = () => {
    const [banners, setBanners] = useState<PopupBanner[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { toast } = useToast()
    const rawToken = localStorage.getItem("token")

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                setLoading(true)
                setError(null)
                const res = await fetch(`${API}/api/admin/banners`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${rawToken}`},
                });
                if (!res.ok) throw new Error("Failed to fetch banners")
                const data = await res.json()
                setBanners(data)
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch banners'
                setError(errorMessage)
            } finally {
                setLoading(false)
            }
        }
        fetchBanners()
    }, [])

    const createBanner = async (bannerData: Omit<PopupBanner, 'bannerId' | 'createdAt' | 'updatedAt'>) => {
        try {
            setLoading(true)
            setError(null)
            const res = await fetch(`${API}/api/admin/banners`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${rawToken}`
                },
                body: JSON.stringify(bannerData),
            })
            if (!res.ok) throw new Error("Failed to create banner")
            const newBanner: PopupBanner = await res.json()
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
            setError(null)
            const res = await fetch(`${API}/api/admin/banners`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${rawToken}`
                },
                body: JSON.stringify({ ...updates, bannerId: id }),
            })
            if (!res.ok) throw new Error("Failed to update banner")
            const updatedBanner: PopupBanner = await res.json()
            setBanners(prev => prev.map(banner =>
                banner.bannerId === id ? updatedBanner : banner
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
            setError(null)
            const res = await fetch(`${API}/api/admin/banners/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${rawToken}`
                }
            })
            if (!res.ok) throw new Error("Failed to delete banner")
            setBanners(prev => prev.filter(banner => banner.bannerId !== id))
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

    const toggleBannerStatus = async (id: string) => {
        try {
            setLoading(true);
            setError(null);

            const res = await fetch(`${API}/api/admin/banners/${id}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${rawToken}`,
                }
            });

            const result: string = await res.text();

            if (result !== "Updated.") throw new Error("Failed to toggle banner status");

            setBanners(prev =>
                prev.map(banner =>
                    banner.bannerId === id
                        ? { ...banner, isActive: !banner.isActive }
                        : banner
                )
            );

            toast({
                title: "Status Toggled",
                description: "Popup banner status updated.",
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to update banner status";
            toast({
                title: "Update Failed",
                description: errorMessage,
                variant: "destructive",
            });
            throw err;
        } finally {
            setLoading(false);
        }
    };


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