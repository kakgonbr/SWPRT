import { useState } from 'react'
import { format } from 'date-fns'
import { Download } from 'lucide-react'
import { useToast } from '../../hooks/use-toast'
import { Button } from '../ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { generateReportData, convertToCSV } from '../../utils/reportUtils'

// Time period options for reports
const TIME_PERIODS = [
    { value: 'last7days', label: 'Last 7 Days', days: 7 },
    { value: 'last30days', label: 'Last 30 Days', days: 30 },
    { value: 'last3months', label: 'Last 3 Months', days: 90 },
    { value: 'last6months', label: 'Last 6 Months', days: 180 },
    { value: 'lastyear', label: 'Last Year', days: 365 },
    { value: 'currentmonth', label: 'Current Month', days: 0 },
    { value: 'previousmonth', label: 'Previous Month', days: 0 },
    { value: 'alltime', label: 'All Time', days: 0 }
]

interface ExportReportSectionProps {
    className?: string
}

export default function ExportReportSection({ className }: ExportReportSectionProps) {
    const { toast } = useToast()
    const [selectedTimePeriod, setSelectedTimePeriod] = useState('last30days')
    const [isExporting, setIsExporting] = useState(false)

    // Handle export functionality
    const handleExportReport = async (reportType: string) => {
        setIsExporting(true)

        try {
            const reportData = generateReportData(selectedTimePeriod)
            let csvContent = ''
            let filename = ''

            const timePeriodLabel = TIME_PERIODS.find(p => p.value === selectedTimePeriod)?.label || selectedTimePeriod
            const dateStr = format(new Date(), 'yyyy-MM-dd')

            switch (reportType) {
                case 'comprehensive':
                    csvContent = convertToCSV(reportData)
                    filename = `bike-rental-comprehensive-report-${selectedTimePeriod}-${dateStr}.csv`
                    break

                case 'rentals':
                    csvContent = [
                        'BIKE RENTAL SERVICE - RENTALS REPORT',
                        `Period: ${timePeriodLabel}`,
                        `Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`,
                        '',
                        'Rental ID,User Name,User Email,Bike Name,Bike Type,Start Date,End Date,Duration (Days),Total Price,Status,Order Date',
                        ...reportData.rentals.map((r: any) =>
                            `${r.rentalId},${r.userName},${r.userEmail},${r.bikeName},${r.bikeType},${r.startDate},${r.endDate},${r.duration},$${r.totalPrice},${r.status},${r.orderDate}`
                        )
                    ].join('\n')
                    filename = `bike-rental-rentals-${selectedTimePeriod}-${dateStr}.csv`
                    break

                case 'users':
                    csvContent = [
                        'BIKE RENTAL SERVICE - USERS REPORT',
                        `Period: ${timePeriodLabel}`,
                        `Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`,
                        '',
                        'User ID,Name,Email,Role,Status,Created At,Total Rentals,Total Spent',
                        ...reportData.users.map((u: any) =>
                            `${u.userId},${u.name},${u.email},${u.role},${u.status},${u.createdAt},${u.totalRentals},$${u.totalSpent.toFixed(2)}`
                        )
                    ].join('\n')
                    filename = `bike-rental-users-${selectedTimePeriod}-${dateStr}.csv`
                    break

                case 'revenue':
                    csvContent = [
                        'BIKE RENTAL SERVICE - REVENUE REPORT',
                        `Period: ${timePeriodLabel}`,
                        `Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`,
                        '',
                        'Summary',
                        `Total Revenue,$${reportData.summary.totalRevenue.toFixed(2)}`,
                        `Total Rentals,${reportData.summary.totalRentals}`,
                        `Average Rental Value,$${reportData.summary.averageRentalValue.toFixed(2)}`,
                        '',
                        'Popular Bikes by Revenue',
                        'Bike Name,Bike Type,Rental Count,Revenue',
                        ...reportData.popularBikes.map((b: any) =>
                            `${b.bikeName},${b.bikeType},${b.rentalCount},$${b.revenue.toFixed(2)}`
                        )
                    ].join('\n')
                    filename = `bike-rental-revenue-${selectedTimePeriod}-${dateStr}.csv`
                    break

                default:
                    throw new Error('Invalid report type')
            }

            // Create and download the file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const link = document.createElement('a')

            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob)
                link.setAttribute('href', url)
                link.setAttribute('download', filename)
                link.style.visibility = 'hidden'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
            }

            toast({
                title: "Export Successful",
                description: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report has been exported successfully.`,
            })

        } catch (error) {
            console.error('Error exporting report:', error)
            toast({
                title: "Export Failed",
                description: "Failed to export report. Please try again.",
                variant: "destructive"
            })
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* Time Period Selector */}
            <Select value={selectedTimePeriod} onValueChange={setSelectedTimePeriod}>
                <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                    {TIME_PERIODS.map((period) => (
                        <SelectItem key={period.value} value={period.value}>
                            {period.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Export Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        disabled={isExporting}
                        className="flex items-center gap-2"
                    >
                        <Download className="h-4 w-4" />
                        {isExporting ? 'Exporting...' : 'Export Report'}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => handleExportReport('comprehensive')}>
                        <Download className="h-4 w-4 mr-2" />
                        Comprehensive Report
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportReport('rentals')}>
                        <Download className="h-4 w-4 mr-2" />
                        Rentals Report
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportReport('users')}>
                        <Download className="h-4 w-4 mr-2" />
                        Users Report
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportReport('revenue')}>
                        <Download className="h-4 w-4 mr-2" />
                        Revenue Report
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}