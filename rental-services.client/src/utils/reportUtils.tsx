import { subDays, startOfMonth, endOfMonth, subMonths, format } from 'date-fns'
import { MOCK_USERS, MOCK_BIKES, MOCK_RENTALS } from '../lib/mock-data'

// Time period options for reports
export const TIME_PERIODS = [
    { value: 'last7days', label: 'Last 7 Days', days: 7 },
    { value: 'last30days', label: 'Last 30 Days', days: 30 },
    { value: 'last3months', label: 'Last 3 Months', days: 90 },
    { value: 'last6months', label: 'Last 6 Months', days: 180 },
    { value: 'lastyear', label: 'Last Year', days: 365 },
    { value: 'currentmonth', label: 'Current Month', days: 0 },
    { value: 'previousmonth', label: 'Previous Month', days: 0 },
    { value: 'alltime', label: 'All Time', days: 0 }
]

// Get date range based on selected time period
export const getDateRange = (period: string) => {
    const now = new Date()
    const timePeriod = TIME_PERIODS.find(p => p.value === period)

    switch (period) {
        case 'currentmonth':
            return {
                start: startOfMonth(now),
                end: endOfMonth(now)
            }
        case 'previousmonth':
            const prevMonth = subMonths(now, 1)
            return {
                start: startOfMonth(prevMonth),
                end: endOfMonth(prevMonth)
            }
        case 'alltime':
            return {
                start: new Date('2020-01-01'), // Arbitrary start date
                end: now
            }
        default:
            return {
                start: subDays(now, timePeriod?.days || 30),
                end: now
            }
    }
}

// Generate comprehensive report data
export const generateReportData = (period: string) => {
    const { start, end } = getDateRange(period)

    // Filter data by date range
    const filteredRentals = MOCK_RENTALS.filter(rental =>
        rental.orderDate >= start && rental.orderDate <= end
    )

    const filteredUsers = MOCK_USERS.filter(user =>
        user.createdAt >= start && user.createdAt <= end
    )

    // Calculate metrics
    const totalRevenue = filteredRentals.reduce((sum, rental) => sum + rental.totalPrice, 0)
    const completedRentals = filteredRentals.filter(r => r.status === 'Completed')
    const activeRentals = filteredRentals.filter(r => r.status === 'Active')
    const cancelledRentals = filteredRentals.filter(r => r.status === 'Cancelled')

    // Bike utilization
    const bikeRentalCounts = filteredRentals.reduce((acc, rental) => {
        acc[rental.bikeId] = (acc[rental.bikeId] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    // Popular bikes
    const popularBikes = Object.entries(bikeRentalCounts)
        .map(([bikeId, count]) => {
            const bike = MOCK_BIKES.find(b => b.id === bikeId)
            return {
                bikeName: bike?.name || 'Unknown',
                bikeType: bike?.type || 'Unknown',
                rentalCount: count,
                revenue: filteredRentals
                    .filter(r => r.bikeId === bikeId)
                    .reduce((sum, r) => sum + r.totalPrice, 0)
            }
        })
        .sort((a, b) => b.rentalCount - a.rentalCount)

    // User statistics
    const usersByRole = filteredUsers.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    return {
        period: TIME_PERIODS.find(p => p.value === period)?.label || period,
        dateRange: `${format(start, 'yyyy-MM-dd')} to ${format(end, 'yyyy-MM-dd')}`,
        summary: {
            totalRentals: filteredRentals.length,
            totalRevenue,
            averageRentalValue: filteredRentals.length > 0 ? totalRevenue / filteredRentals.length : 0,
            completedRentals: completedRentals.length,
            activeRentals: activeRentals.length,
            cancelledRentals: cancelledRentals.length,
            newUsers: filteredUsers.length,
            totalUsers: MOCK_USERS.length,
            totalBikes: MOCK_BIKES.length,
            availableBikes: MOCK_BIKES.filter(b => b.isAvailable).length
        },
        rentals: filteredRentals.map(rental => {
            const bike = MOCK_BIKES.find(b => b.id === rental.bikeId)
            const user = MOCK_USERS.find(u => u.id === rental.userId)
            return {
                rentalId: rental.id,
                userName: user?.name || 'Unknown',
                userEmail: user?.email || 'Unknown',
                bikeName: bike?.name || 'Unknown',
                bikeType: bike?.type || 'Unknown',
                startDate: format(rental.startDate, 'yyyy-MM-dd'),
                endDate: format(rental.endDate, 'yyyy-MM-dd'),
                duration: Math.ceil((rental.endDate.getTime() - rental.startDate.getTime()) / (1000 * 60 * 60 * 24)),
                totalPrice: rental.totalPrice,
                status: rental.status,
                orderDate: format(rental.orderDate, 'yyyy-MM-dd HH:mm:ss')
            }
        }),
        popularBikes,
        usersByRole,
        users: filteredUsers.map(user => ({
            userId: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status ? 'Active' : 'Inactive',
            createdAt: format(user.createdAt, 'yyyy-MM-dd HH:mm:ss'),
            totalRentals: filteredRentals.filter(r => r.userId === user.id).length,
            totalSpent: filteredRentals
                .filter(r => r.userId === user.id)
                .reduce((sum, r) => sum + r.totalPrice, 0)
        }))
    }
}

// Convert data to CSV format
export const convertToCSV = (data: any) => {
    const csvRows = []

    // Add header information
    csvRows.push('BIKE RENTAL SERVICE - COMPREHENSIVE REPORT')
    csvRows.push(`Report Period: ${data.period}`)
    csvRows.push(`Date Range: ${data.dateRange}`)
    csvRows.push(`Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`)
    csvRows.push('')

    // Summary Section
    csvRows.push('SUMMARY STATISTICS')
    csvRows.push('Metric,Value')
    csvRows.push(`Total Rentals,${data.summary.totalRentals}`)
    csvRows.push(`Total Revenue,$${data.summary.totalRevenue.toFixed(2)}`)
    csvRows.push(`Average Rental Value,$${data.summary.averageRentalValue.toFixed(2)}`)
    csvRows.push(`Completed Rentals,${data.summary.completedRentals}`)
    csvRows.push(`Active Rentals,${data.summary.activeRentals}`)
    csvRows.push(`Cancelled Rentals,${data.summary.cancelledRentals}`)
    csvRows.push(`New Users (Period),${data.summary.newUsers}`)
    csvRows.push(`Total Users,${data.summary.totalUsers}`)
    csvRows.push(`Total Bikes,${data.summary.totalBikes}`)
    csvRows.push(`Available Bikes,${data.summary.availableBikes}`)
    csvRows.push('')

    // Rentals Section
    csvRows.push('RENTAL DETAILS')
    csvRows.push('Rental ID,User Name,User Email,Bike Name,Bike Type,Start Date,End Date,Duration (Days),Total Price,Status,Order Date')
    data.rentals.forEach((rental: any) => {
        csvRows.push(`${rental.rentalId},${rental.userName},${rental.userEmail},${rental.bikeName},${rental.bikeType},${rental.startDate},${rental.endDate},${rental.duration},$${rental.totalPrice},${rental.status},${rental.orderDate}`)
    })
    csvRows.push('')

    // Popular Bikes Section
    csvRows.push('POPULAR BIKES')
    csvRows.push('Bike Name,Bike Type,Rental Count,Revenue')
    data.popularBikes.forEach((bike: any) => {
        csvRows.push(`${bike.bikeName},${bike.bikeType},${bike.rentalCount},$${bike.revenue.toFixed(2)}`)
    })
    csvRows.push('')

    // Users Section
    csvRows.push('USER DETAILS')
    csvRows.push('User ID,Name,Email,Role,Status,Created At,Total Rentals,Total Spent')
    data.users.forEach((user: any) => {
        csvRows.push(`${user.userId},${user.name},${user.email},${user.role},${user.status},${user.createdAt},${user.totalRentals},$${user.totalSpent.toFixed(2)}`)
    })

    return csvRows.join('\n')
}