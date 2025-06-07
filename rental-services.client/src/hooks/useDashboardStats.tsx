import { useState, useEffect } from 'react'
import { subDays, startOfMonth, endOfMonth } from 'date-fns'
import { MOCK_USERS, MOCK_BIKES, MOCK_RENTALS } from '../lib/mock-data'

interface DashboardStats {
    totalUsers: number
    totalBikes: number
    activeRentals: number
    monthlyRevenue: number
    recentUsers: number
    availableBikes: number
}

export const useDashboardStats = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        totalBikes: 0,
        activeRentals: 0,
        monthlyRevenue: 0,
        recentUsers: 0,
        availableBikes: 0
    })

    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const calculateStats = () => {
            setIsLoading(true)

            try {
                // Calculate stats
                const currentMonth = new Date()
                const monthStart = startOfMonth(currentMonth)
                const monthEnd = endOfMonth(currentMonth)

                const monthlyRentals = MOCK_RENTALS.filter(rental =>
                    rental.orderDate >= monthStart && rental.orderDate <= monthEnd
                )

                const recentUsers = MOCK_USERS.filter(user =>
                    user.createdAt >= subDays(new Date(), 30)
                ).length

                setStats({
                    totalUsers: MOCK_USERS.length,
                    totalBikes: MOCK_BIKES.length,
                    activeRentals: MOCK_RENTALS.filter(r => r.status === 'Active').length,
                    monthlyRevenue: monthlyRentals.reduce((sum, rental) => sum + rental.totalPrice, 0),
                    recentUsers,
                    availableBikes: MOCK_BIKES.filter(b => b.isAvailable).length
                })
            } catch (error) {
                console.error('Error calculating dashboard stats:', error)
            } finally {
                setIsLoading(false)
            }
        }

        calculateStats()
    }, [])

    return { stats, isLoading }
}