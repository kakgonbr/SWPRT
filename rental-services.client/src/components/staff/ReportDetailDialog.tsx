import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useToast } from '../../contexts/toast-context';
import { useCustomerReport } from '../../hooks/useCustomerReport';
import type { ReportDTO } from '../../lib/types';

const STATUS_OPTIONS = [
    { value: 'Unresolved', label: 'Unresolved' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Resolved', label: 'Resolved' }
];

export default function ReportDetailDialog({
    isOpen,
    onClose,
    reportId,
    onStatusChange
}: {
    isOpen: boolean;
    onClose: () => void;
    reportId: number | null;
    onStatusChange?: (newStatus: string) => void;
}) {
    const token = localStorage.getItem('token') || '';
    const { fetchReportById, updateReportStatus } = useCustomerReport(token);
    
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<ReportDTO | null>(null);
    const [status, setStatus] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (isOpen && reportId) {
            setLoading(true);
            fetchReportById(reportId).then((res: any) => {
                if (res.success) {
                    setReport(res.data);
                    setStatus(res.data.status || '');
                } else {
                    toast({ title: 'Error', description: res.message, variant: 'destructive' });
                }
                setLoading(false);
            });
        } else {
            setReport(null);
            setStatus('');
        }
    }, [isOpen, reportId]);

    const handleStatusChange = async (newStatus: string) => {
        if (!report) return;
        setUpdating(true);
        const updatedReport = { ...report, status: newStatus };
        const res = await updateReportStatus(updatedReport);
        if (res.success) {
            setStatus(newStatus);
            setReport(updatedReport);
            toast({ title: 'Success', description: 'Status updated successfully.' });
            if (onStatusChange) onStatusChange(newStatus);
        } else {
            toast({ title: 'Error', description: res.message, variant: 'destructive' });
        }
        setUpdating(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Report Details</DialogTitle>
                    <DialogDescription>View and update report information</DialogDescription>
                </DialogHeader>
                {loading ? (
                    <div className="py-8 text-center">Loading...</div>
                ) : report ? (
                    <div className="space-y-4">
                        <div>
                            <Label>Title</Label>
                            <div className="font-semibold mt-1">{report.title}</div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>User Name</Label>
                                <div>{report.userName}</div>
                            </div>
                            <div>
                                <Label>User Email</Label>
                                <div>{report.userEmail}</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Type</Label>
                                <div>{report.typeName}</div>
                            </div>
                            <div>
                                <Label>Report Time</Label>
                                <div>{new Date(report.reportTime).toLocaleString()}</div>
                            </div>
                        </div>
                        <div>
                            <Label>Status</Label>
                            <Select value={status} onValueChange={handleStatusChange} disabled={updating}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Textarea value={report.body} readOnly rows={5} />
                        </div>
                        {report.imagePath && (
                            <div>
                                <Label>Image</Label>
                                <img src={report.imagePath} alt="Report" className="max-h-60 rounded border mt-2" />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="py-8 text-center text-muted-foreground">No report data</div>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={updating}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
