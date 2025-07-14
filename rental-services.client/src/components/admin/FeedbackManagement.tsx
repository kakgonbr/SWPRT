import { useState, useEffect } from 'react'
// import {
//     Card,
//     CardContent,
//     CardDescription,
//     CardHeader,
//     CardTitle,
// } from '../ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../ui/table'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from '../ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog'
import { Label } from '../ui/label'
import {
    Heart,
    Search,
    Eye,
    MessageSquare,
    User,
} from 'lucide-react'
import { useToast } from '../../contexts/toast-context'
interface CustomerFeedback {
    id: number;
    title: string;
    description: string;
    customerName: string;
    customerEmail: string;
    imagePath?: string;
}

export default function FeedbackManagement() {
    const [feedback, setFeedback] = useState<CustomerFeedback[]>([]);
    const [filteredFeedback, setFilteredFeedback] = useState<CustomerFeedback[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFeedback, setSelectedFeedback] = useState<CustomerFeedback | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        // Gọi API lấy dữ liệu thật
        const fetchFeedback = async () => {
            try {
                const res = await fetch('/api/feedback', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    const mapped = data.map((item: any) => ({
                        ...item,
                        description: item.body // map body từ BE sang description cho FE
                    }));
                    setFeedback(mapped);
                    setFilteredFeedback(mapped);
                } else {
                    setFeedback([]);
                    setFilteredFeedback([]);
                    toast({ title: 'Error', description: 'Failed to fetch feedback', variant: 'destructive' });
                }
            } catch (error) {
                setFeedback([]);
                setFilteredFeedback([]);
                toast({ title: 'Error', description: 'Failed to fetch feedback', variant: 'destructive' });
            }
        };
        fetchFeedback();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (searchTerm.trim() === '') {
                try {
                    const res = await fetch('/api/feedback', {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        const mapped = data.map((item: any) => ({
                            ...item,
                            description: item.body
                        }));
                        setFilteredFeedback(mapped);
                    } else {
                        setFilteredFeedback([]);
                    }
                } catch {
                    setFilteredFeedback([]);
                }
            } else {
                // Nếu có searchTerm, gọi API search
                try {
                    const res = await fetch(`/api/feedback/search?query=${encodeURIComponent(searchTerm)}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        const mapped = data.map((item: any) => ({
                            ...item,
                            description: item.body
                        }));
                        setFilteredFeedback(mapped);
                    } else {
                        setFilteredFeedback([]);
                    }
                } catch {
                    setFilteredFeedback([]);
                }
            }
        };
        fetchData();
    }, [searchTerm, feedback]);

    const handleViewDetails = (feedbackItem: CustomerFeedback) => {
        setSelectedFeedback(feedbackItem);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium">Total Feedback</h2>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">{feedback.length}</div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search feedback by title, description, or customer name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredFeedback.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8">
                                        <div className="flex flex-col items-center gap-2">
                                            <MessageSquare className="h-8 w-8 text-muted-foreground" />
                                            <p className="text-muted-foreground">No feedback found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredFeedback.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div className="font-medium">{item.title}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">{item.customerName}</div>
                                                    <div className="text-sm text-muted-foreground">{item.customerEmail}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                                                {item.description}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleViewDetails(item)}
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Heart className="h-5 w-5 text-red-500" />
                            Feedback Details
                        </DialogTitle>
                        <DialogDescription>
                            View customer feedback details
                        </DialogDescription>
                    </DialogHeader>
                    {selectedFeedback && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <div className="font-medium">{selectedFeedback.customerName}</div>
                                    <div className="text-sm text-muted-foreground">{selectedFeedback.customerEmail}</div>
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Title</Label>
                                <p className="text-lg font-semibold">{selectedFeedback.title}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Description</Label>
                                <p className="mt-1 p-3 bg-muted rounded text-sm leading-relaxed">
                                    {selectedFeedback.description}
                                </p>
                            </div>
                            {selectedFeedback.imagePath && (
                                <div>
                                    <Label className="text-sm font-medium">Image</Label>
                                    <img src={selectedFeedback.imagePath} alt="Feedback" className="max-w-xs rounded mt-2" />
                                </div>
                            )}
                            <div className="flex justify-end pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedFeedback(null)}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}