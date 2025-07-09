import { useState } from 'react';
import { format } from 'date-fns';
import type { ChatDTO } from '../../lib/types';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useAuth } from '../../contexts/auth-context';
import ChatDialog from './ChatDialog';
import { useStaffChats } from '../../hooks/useStaffChats';

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

export default function CustomerMessagesTab() {
    const { user } = useAuth();
    const token = localStorage.getItem('token') || '';
    const { chats, setChats, loading, page, setPage, newCustomerMessages, clearNewCustomerMessage } = useStaffChats(token);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [openChat, setOpenChat] = useState<ChatDTO | null>(null);
    const [updatingChatId, setUpdatingChatId] = useState<number | null>(null);
    
    const noMoreChats = !loading && chats.length === 0 && page > 1;

    // search chat on chat subject and filter by status
    const filteredChats = chats.filter(chat => {
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
                const API = import.meta.env.VITE_API_BASE_URL;
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
        // Mark as read in backend
        const API = import.meta.env.VITE_API_BASE_URL;
        await fetch(`${API}/api/chats/${chat.chatId}/read`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        clearNewCustomerMessage(chat.chatId);
    };

    const handleUpdateChat = async (chat: ChatDTO, updates: Partial<ChatDTO>) => {
        setUpdatingChatId(chat.chatId);
        try {
            const API = import.meta.env.VITE_API_BASE_URL;
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
            }
            else {
                // Update the chat in the local state immediately
                setChats(prevChats => prevChats.map(c => c.chatId === chat.chatId ? { ...c, ...updates } : c));
            }
        } catch {
            setErrorMsg('Failed to update chat.');
        } finally {
            setUpdatingChatId(null);
        }
    };

    const handlePrevPage = () => setPage(Math.max(1, page - 1));
    const handleNextPage = () => {
        if (!noMoreChats) 
            setPage(page + 1);
    };

    const showBadge = (chat: ChatDTO) => chat.hasNewCustomerMessage || newCustomerMessages[chat.chatId];

    return (
        <div className="card">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <div className="font-bold text-lg">Customer Messages</div>
                    <div className="text-xs text-muted-foreground">Manage customer support requests and conversations</div>
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
                        {loading ? (
                            <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
                        ) : sortedChats.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No chats found matching your criteria
                                </td>
                            </tr>
                        ) : (
                            sortedChats.map((chat) => (
                                <tr
                                    key={chat.chatId}
                                    className="relative hover:bg-muted/50 cursor-pointer"
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
                                                <div className="font-medium">
                                                    {chat.userName ? chat.userName : `User #${chat.userId}`}
                                                </div>
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
                                    {showBadge(chat) && (
                                        <span
                                            className="absolute top-2 right-2 w-3 h-3 rounded-full bg-red-500"
                                            title="New customer message"
                                        />
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {/* Pagination Controls */}
            <div className="flex justify-center mt-4">
                <div className="flex gap-2 items-center">
                    <button className="px-2 py-1 border rounded" onClick={handlePrevPage} disabled={page === 1 || loading}>Prev</button>
                    <span>Page {page}</span>
                    <button className="px-2 py-1 border rounded" onClick={handleNextPage} disabled={loading || noMoreChats}>Next</button>
                </div>
            </div>
            {noMoreChats && (
                <div className="text-center text-muted-foreground mt-2">No more chat to load</div>
            )}
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