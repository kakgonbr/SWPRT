import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '../ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../ui/table'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useToast } from '../../contexts/toast-context'
import ReportDetailDialog from './ReportDetailDialog'
import { useCustomerReport } from '../../hooks/useCustomerReport'
import type { ReportDTO } from '../../lib/types'    

const STATUS_OPTIONS = [
    { value: 'Unresolved', label: 'Unresolved' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Resolved', label: 'Resolved' }
];

export default function ReportsManagementTab() {
    const token = localStorage.getItem('token') || '';
    const { fetchReportsPaginated, updateReportStatus } = useCustomerReport(token);
    const { toast } = useToast();
    const [reports, setReports] = useState<ReportDTO[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

    const noMoreReports = !loading && reports.length === 0 && page > 1;

    useEffect(() => {
        let ignore = false;
        const loadReports = async () => {
            setLoading(true);
            const res = await fetchReportsPaginated(page);
            if (!ignore) {
                if (res.success) {
                    setReports(res.data);
                } 
                setLoading(false);
            }
        };
        loadReports();
        return () => { ignore = true; };
    }, [page]);

    const handleViewDetails = (reportId: number) => {
        const id = Number(reportId);
        setSelectedReportId(Number.isNaN(id) ? null : id);
        setIsDetailDialogOpen(true);
    };

    const handleStatusChange = async (report: ReportDTO, newStatus: string) => {
        const updatedReport = { ...report, status: newStatus };
        const res = await updateReportStatus(updatedReport);
        if (res.success) {
            setReports(prev => prev.map(r => r.reportId === report.reportId ? { ...r, status: newStatus } : r));
            toast({ title: 'Success', description: 'Status updated successfully.' });
        } else {
            toast({ title: 'Error', description: res.message, variant: 'destructive' });
        }
    };

    const handlePrevPage = () => setPage(Math.max(1, page - 1));
    const handleNextPage = () => {
        if (!noMoreReports)
            setPage(page + 1);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Customer Issue Reports
                    </CardTitle>
                    <CardDescription>
                        Manage and resolve customer-reported issues
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>User Name</TableHead>
                                    <TableHead>User Email</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Report Time</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                                ) : reports.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            No reports found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    reports.map((report) => (
                                        <TableRow key={report.reportId}>
                                            <TableCell>{report.title}</TableCell>
                                            <TableCell>{report.userName}</TableCell>
                                            <TableCell>{report.userEmail}</TableCell>
                                            <TableCell>{report.typeName}</TableCell>
                                            <TableCell>
                                                <Select value={report.status} onValueChange={val => handleStatusChange(report, val)}>
                                                    <SelectTrigger className="w-[140px]">
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {STATUS_OPTIONS.map(opt => (
                                                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>{format(new Date(report.reportTime), 'MMM d, yyyy HH:mm')}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm" onClick={() => handleViewDetails(Number(report.reportId))}>
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-center mt-4">
                <div className="flex gap-2 items-center">
                    <button className="px-2 py-1 border rounded" onClick={handlePrevPage} disabled={page === 1 || loading}>Prev</button>
                    <span>Page {page}</span>
                    <button className="px-2 py-1 border rounded" onClick={handleNextPage} disabled={loading || noMoreReports}>Next</button>
                </div>
            </div>
            {noMoreReports && (
                <div className="text-center text-muted-foreground mt-2">No more reports to load</div>
            )}
            <ReportDetailDialog
                isOpen={isDetailDialogOpen}
                onClose={() => {
                    setIsDetailDialogOpen(false);
                    setSelectedReportId(null);
                }}
                reportId={selectedReportId}
                onStatusChange={newStatus => {
                    if (typeof selectedReportId === 'number') {
                        setReports(prev => prev.map(r => r.reportId === selectedReportId ? { ...r, status: newStatus } : r));
                    }
                }}
            />
        </div>
    )
}