import { useEffect, useState, useRef } from 'react'
import type { ChatDTO } from '../lib/types'
import { ChatSignalRService } from '../services/chat-signalr'

const API = import.meta.env.VITE_API_BASE_URL;
/*const API = "http://localhost:5000";*/

export function useStaffChats(token: string) {
    const [chats, setChats] = useState<ChatDTO[]>([])
    const [loading, setLoading] = useState(true)
    const signalRRef = useRef<ChatSignalRService | null>(null)

    useEffect(() => {
        if (!token)
            return
        fetch(`${API}/api/chats`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => res.json()).then(setChats).finally(() => setLoading(false))
    }, [token])

    useEffect(() => {
        if (!token)
            return
        const signalR = new ChatSignalRService(token)
        signalRRef.current = signalR
        signalR.start().then(() => {
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
        })
        return () => {
            signalR.connection.stop()
        }
    }, [token])

    return { chats, loading }
}
