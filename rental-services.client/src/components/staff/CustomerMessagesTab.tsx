import { useState } from 'react'
import { format } from 'date-fns'
import type { ChatDTO } from '../../lib/types'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'

interface CustomerMessagesTabProps {
    chats: ChatDTO[]
    onOpenChat: (chat: ChatDTO) => void
}

function getStatusBadgeVariant(status: string) {
    switch (status) {
        case 'Unresolved': return 'destructive'
        case 'Resolved': return 'default'
        default: return 'outline'
    }
}

function getPriorityBadgeVariant(priority: string) {
    switch (priority.toLowerCase()) {
        case 'high': return 'destructive'
        case 'medium': return 'default'
        case 'low': return 'secondary'
        default: return 'outline'
    }
}

export default function CustomerMessagesTab({ chats, onOpenChat }: CustomerMessagesTabProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    const filteredChats = chats.filter(chat => {
        const matchesSearch = chat.subject.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || chat.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const sortedChats = filteredChats.sort((a, b) => {
        // Prioritize unresolved, then by openTime desc
        if (a.status !== b.status) {
            return a.status === 'Unresolved' ? -1 : 1
        }
        return new Date(b.openTime).getTime() - new Date(a.openTime).getTime()
    })

    return (
        <div className="card">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <div className="font-bold text-lg">Customer Messages</div>
                    <div className="text-xs text-muted-foreground">Manage customer support requests and conversations ({filteredChats.length} chats)</div>
                </div>
                <div className="flex gap-2">
                    <input
                        className="border rounded px-2 py-1"
                        placeholder="Search subject..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="px-2 py-1 border rounded"
                    >
                        <option value="all">All</option>
                        <option value="Unresolved">Unresolved</option>
                        <option value="Resolved">Resolved</option>
                    </select>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr>
                            <th className="text-left">Customer</th>
                            <th className="text-left">Staff</th>
                            <th className="text-left">Subject</th>
                            <th className="text-left">Priority</th>
                            <th className="text-left">Status</th>
                            <th className="text-left">Opened</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedChats.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No chats found matching your criteria
                                </td>
                            </tr>
                        ) : (
                            sortedChats.map((chat) => (
                                <tr
                                    key={chat.chatId}
                                    className="hover:bg-muted/50 cursor-pointer"
                                    onClick={() => onOpenChat(chat)}
                                >
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>
                                                    {chat.userName ? chat.userName[0] : chat.userId}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{chat.userName ? chat.userName : `User #${chat.userId}`}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>
                                                    {chat.staffName ? chat.staffName[0] : (chat.staffId ?? '?')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{chat.staffName ? chat.staffName : (chat.staffId ? `Staff #${chat.staffId}` : 'Unassigned')}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="font-medium">{chat.subject}</td>
                                    <td>
                                        <Badge variant={getPriorityBadgeVariant(chat.priority)}>{chat.priority}</Badge>
                                    </td>
                                    <td>
                                        <Badge variant={getStatusBadgeVariant(chat.status)}>{chat.status}</Badge>
                                    </td>
                                    <td>
                                        <div className="text-xs">
                                            {format(new Date(chat.openTime), "MMM d, yyyy HH:mm")}
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <Button
                                            size="sm"
                                            onClick={e => { e.stopPropagation(); onOpenChat(chat) }}
                                            variant="outline"
                                        >
                                            Open
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}