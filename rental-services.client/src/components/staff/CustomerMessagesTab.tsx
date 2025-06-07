import { useState } from 'react'
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
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import {
    Search,
    Reply,
    AlertCircle,
    Clock,
    CheckCircle2,
} from 'lucide-react'
import { type CustomerMessage } from '../../lib/mock-staff-data'

interface CustomerMessagesTabProps {
    messages: CustomerMessage[]
    onOpenChat: (message: CustomerMessage) => void
}

export default function CustomerMessagesTab({ messages, onOpenChat }: CustomerMessagesTabProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [messageFilter, setMessageFilter] = useState<'all' | 'unread' | 'read' | 'replied'>('all')

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'unread': return 'destructive'
            case 'read': return 'secondary'
            case 'replied': return 'default'
            default: return 'outline'
        }
    }

    const getPriorityBadgeVariant = (priority: string) => {
        switch (priority) {
            case 'high': return 'destructive'
            case 'medium': return 'default'
            case 'low': return 'secondary'
            default: return 'outline'
        }
    }

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'high': return <AlertCircle className="h-3 w-3" />
            case 'medium': return <Clock className="h-3 w-3" />
            case 'low': return <CheckCircle2 className="h-3 w-3" />
            default: return null
        }
    }

    const filteredMessages = messages.filter(message => {
        const matchesSearch = message.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            message.message.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFilter = messageFilter === 'all' || message.status === messageFilter

        return matchesSearch && matchesFilter
    })

    const sortedMessages = filteredMessages.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        const statusOrder = { unread: 3, read: 2, replied: 1 }

        if (a.status !== b.status) {
            return statusOrder[b.status] - statusOrder[a.status]
        }

        if (a.priority !== b.priority) {
            return priorityOrder[b.priority] - priorityOrder[a.priority]
        }

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Customer Messages</CardTitle>
                        <CardDescription>
                            Manage customer support requests and conversations ({filteredMessages.length} messages)
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search messages..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8 w-64"
                            />
                        </div>
                        <select
                            value={messageFilter}
                            onChange={(e) => setMessageFilter(e.target.value as any)}
                            className="px-3 py-2 border rounded-md"
                        >
                            <option value="all">All Messages</option>
                            <option value="unread">Unread ({messages.filter(m => m.status === 'unread').length})</option>
                            <option value="read">Read ({messages.filter(m => m.status === 'read').length})</option>
                            <option value="replied">Replied ({messages.filter(m => m.status === 'replied').length})</option>
                        </select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Message Preview</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedMessages.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No messages found matching your criteria
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedMessages.map((message) => (
                                <TableRow
                                    key={message.id}
                                    className={`${message.status === 'unread' ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-muted/50'} cursor-pointer`}
                                    onClick={() => onOpenChat(message)}
                                >
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={message.customerAvatar} />
                                                <AvatarFallback>
                                                    {message.customerName.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{message.customerName}</div>
                                                <div className="text-sm text-muted-foreground">{message.customerEmail}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {message.status === 'unread' && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            )}
                                            {message.subject}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">{message.message}</TableCell>
                                    <TableCell>
                                        <Badge variant={getPriorityBadgeVariant(message.priority)} className="flex items-center gap-1 w-fit">
                                            {getPriorityIcon(message.priority)}
                                            {message.priority}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusBadgeVariant(message.status)}>
                                            {message.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            {format(new Date(message.createdAt), "MMM d, yyyy")}
                                            <div className="text-xs text-muted-foreground">
                                                {format(new Date(message.createdAt), "HH:mm")}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onOpenChat(message)
                                            }}
                                            variant={message.status === 'unread' ? 'default' : 'outline'}
                                        >
                                            <Reply className="h-4 w-4 mr-1" />
                                            {message.conversationHistory.length > 1 ? 'Continue' : 'Reply'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}