import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import type { ChatDTO } from '../../lib/types';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useAuth } from '../../contexts/auth-context';
import ChatDialog from './ChatDialog';

const API = import.meta.env.VITE_API_BASE_URL;
/*const API = "http://localhost:5000";*/

const STATUS_OPTIONS = [
    { value: 'Unresolved', label: 'Unresolved' },
    { value: 'Resolved', label: 'Resolved' }
];
const PRIORITY_OPTIONS = [
    { value: 'Critical', label: 'Critical' },
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' }
];

interface CustomerMessagesTabProps {
    chats: ChatDTO[];
    onOpenChat?: (chat: ChatDTO) => void;
}


export default function CustomerMessagesTab({ chats: initialChats }: CustomerMessagesTabProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const { user } = useAuth();
    const token = localStorage.getItem('token') || '';
    const [openChat, setOpenChat] = useState<ChatDTO | null>(null);
    const [updatingChatId, setUpdatingChatId] = useState<number | null>(null);
    const [localChats, setLocalChats] = useState<ChatDTO[]>(initialChats);

    useEffect(() => {
        setLocalChats(initialChats);
    }, [initialChats]);

    // search chat on chat subject and filter by status
    const filteredChats = localChats.filter(chat => {
        const matchesSearch = chat.subject.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || chat.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const sortedChats = filteredChats.sort((a, b) => {
        // Prioritize unresolved, then by openTime desc
        if (a.status !== b.status) {
            return a.status === 'Unresolved' ? -1 : 1;
        }
        return new Date(b.openTime).getTime() - new Date(a.openTime).getTime();
    });

    const handleOpenChat = async (chat: ChatDTO) => {
        setErrorMsg(null);
        // If chat is assigned to another staff
        if (chat.staffId && chat.staffId !== user?.userId) {
            setErrorMsg('This chat is not assigned to you');
            return;
        }
        // If chat is unassigned, assign it to this staff
        if (!chat.staffId) {
            try {
                const res = await fetch(`${API}/api/chats/${chat.chatId}/assign`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) {
                    setErrorMsg('Failed to assign this chat to you.');
                    return;
                }
            } catch {
                setErrorMsg('Failed to assign this chat to you.');
                return;
            }
        }
        setOpenChat(chat);
    };

    const handleUpdateChat = async (chat: ChatDTO, updates: Partial<ChatDTO>) => {
        setUpdatingChatId(chat.chatId);
        try {
            const res = await fetch(`${API}/api/chats/${chat.chatId}/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...chat, ...updates })
            });
            if (!res.ok) {
                setErrorMsg('Failed to update chat.');
            } else {
                // Update local chat state
                setLocalChats(prev => prev.map(c => c.chatId === chat.chatId ? { ...c, ...updates } : c));
            }
        } catch {
            setErrorMsg('Failed to update chat.');
        } finally {
            setUpdatingChatId(null);
        }
    };

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
            {errorMsg && <div className="text-red-500 text-xs mb-2">{errorMsg}</div>}
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
                        </tr>
                    </thead>
                    <tbody>
                        {sortedChats.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No chats found matching your criteria
                                </td>
                            </tr>
                        ) : (
                            sortedChats.map((chat) => (
                                <tr
                                    key={chat.chatId}
                                    className="hover:bg-muted/50 cursor-pointer"
                                    onClick={() => handleOpenChat(chat)}
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
                                        <select
                                            className="border rounded px-1 py-1 text-xs"
                                            value={chat.priority}
                                            disabled={updatingChatId === chat.chatId}
                                            onClick={e => e.stopPropagation()}
                                            onChange={e => {
                                                e.stopPropagation();
                                                handleUpdateChat(chat, { priority: e.target.value });
                                            }}
                                        >
                                            {PRIORITY_OPTIONS.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <select
                                            className="border rounded px-1 py-1 text-xs"
                                            value={chat.status}
                                            disabled={updatingChatId === chat.chatId}
                                            onClick={e => e.stopPropagation()}
                                            onChange={e => {
                                                e.stopPropagation();
                                                handleUpdateChat(chat, { status: e.target.value });
                                            }}
                                        >
                                            {STATUS_OPTIONS.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <div className="text-xs">
                                            {format(new Date(chat.openTime), "MMM d, yyyy HH:mm")}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {openChat && (
                <ChatDialog
                    isOpen={!!openChat}
                    onClose={() => setOpenChat(null)}
                    chat={openChat}
                />
            )}
        </div>
    );
}