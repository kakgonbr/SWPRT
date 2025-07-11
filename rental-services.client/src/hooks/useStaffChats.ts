import { useEffect, useState, useRef } from 'react'
import type { ChatDTO } from '../lib/types'
import { ChatSignalRService } from '../services/chat-signalr'

const API = import.meta.env.VITE_API_BASE_URL;

export function useStaffChats(token: string) {
    const [chats, setChats] = useState<ChatDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [newCustomerMessages, setNewCustomerMessages] = useState<{ [chatId: number]: boolean }>({})
    const signalRRef = useRef<ChatSignalRService | null>(null)

    // useEffect(() => {
    //     if (!token)
    //         return
    //     fetch(`${API}/api/chats`, {
    //         headers: { Authorization: `Bearer ${token}` }
    //     }).then(res => res.json()).then(setChats).finally(() => setLoading(false))
    // }, [token])

    useEffect(() => {
        if (!token) return;
        setLoading(true);
        fetch(`${API}/api/chats/paginated?page=${page}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(async res => {
                const data = await res.json();
                setChats(data);
                // Optionally, update newCustomerMessages from data.HasNewCustomerMessage
                const newMsgs: { [chatId: number]: boolean } = {};
                data.forEach((chat: ChatDTO) => {
                    if (chat.hasNewCustomerMessage) newMsgs[chat.chatId] = true;
                });
                setNewCustomerMessages(newMsgs);
            })
            .finally(() => setLoading(false));
    }, [token, page]);

    useEffect(() => {
        if (!token)
            return
        const signalR = new ChatSignalRService(token)
        signalRRef.current = signalR
        signalR.start().then(() => {
            // chat updated event handler
            signalR.connection.on("ChatUpdated", (updatedChat: ChatDTO) => {
                setChats(prevChats => {
                    const idx = prevChats.findIndex(c => c.chatId === updatedChat.chatId)
                    if (idx !== -1) {
                        // Update existing chat
                        const newChats = [...prevChats]
                        newChats[idx] = updatedChat
                        return newChats
                    }
                    else {
                        // Add new chat
                        return [updatedChat, ...prevChats]
                    }
                })
            })
            // new customer message event handler
            signalR.connection.on("NewCustomerMessage", (chatId: number) => {
                setNewCustomerMessages(prev => ({ ...prev, [chatId]: true }));
            });
        })
        return () => {
            signalR.connection.stop()
        }
    }, [token])

    // Expose a function to clear the badge when staff opens the chat
    const clearNewCustomerMessage = (chatId: number) => {
        setNewCustomerMessages(prev => ({ ...prev, [chatId]: false }));
    };

    return {
        chats, setChats, loading, page, setPage, newCustomerMessages, clearNewCustomerMessage
    }
}
