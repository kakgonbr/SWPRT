import { useState, useEffect } from 'react'
import type { DashboardStats } from '../lib/types'
//import { subDays, startOfMonth, endOfMonth } from 'date-fns'
//import { MOCK_USERS, MOCK_BIKES, MOCK_RENTALS } from '../lib/mock-data'

const API = import.meta.env.VITE_API_BASE_URL;


export const useDashboardStats = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        totalBikes: 0,
        activeRentals: 0,
        monthlyRevenue: 0,
        recentUsers: 0,
        availableBikes: 0
    })

    const rawToken = localStorage.getItem('token');

    const [isLoading, setIsLoading] = useState(true)

    //useEffect(() => {
    //    //const calculateStats = () => {
    //    //    setIsLoading(true)

    //    //    try {
    //    //        // Calculate stats
    //    //        const currentMonth = new Date()
    //    //        const monthStart = startOfMonth(currentMonth)
    //    //        const monthEnd = endOfMonth(currentMonth)

    //    //        const monthlyRentals = MOCK_RENTALS.filter(rental =>
    //    //            rental.orderDate >= monthStart && rental.orderDate <= monthEnd
    //    //        )

    //    //        const recentUsers = MOCK_USERS.filter(user =>
    //    //            user.creationDate >= subDays(new Date(), 30)
    //    //        ).length

    //    //        setStats({
    //    //            totalUsers: MOCK_USERS.length,
    //    //            totalBikes: MOCK_BIKES.length,
    //    //            activeRentals: MOCK_RENTALS.filter(r => r.status === 'Active').length,
    //    //            monthlyRevenue: monthlyRentals.reduce((sum, rental) => sum + rental.totalPrice, 0),
    //    //            recentUsers,
    //    //            availableBikes: MOCK_BIKES.filter(b => b.isAvailable).length
    //    //        })
    //    //    } catch (error) {
    //    //        console.error('Error calculating dashboard stats:', error)
    //    //    } finally {
    //    //        setIsLoading(false)
    //    //    }
    //    //}

    //    //calculateStats()

            
    //}, [])

    useEffect(() => {
        if (!rawToken) {
            setIsLoading(false);
            return;
        }

        fetch(`${API}/api/admin/stats`, {
            headers: {
                Authorization: `Bearer ${rawToken}`
            }
        })
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch stats: ' + response.statusText);
                return response.json();
            })
            .then((data: DashboardStats) => {
                setStats(data);
            })
            .catch(() => {
            })
            .finally(() => setIsLoading(false));
    }, [rawToken]);


    return { stats, isLoading }
}