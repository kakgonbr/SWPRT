import { useState, useRef, useEffect } from 'react'
import { Send, User } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useAuth } from '../../contexts/auth-context'
import { format } from 'date-fns'
import { ChatSignalRService } from '../../services/chat-signalr'
import type { ChatDTO, ChatMessageDTO } from '../../lib/types'

/*const API = import.meta.env.VITE_API_BASE_URL;*/
const API = "http://localhost:5000";

export default function StaffChat({ onBack }: { onBack: () => void }) {
    const { user } = useAuth()
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState<ChatMessageDTO[]>([])
    const [chat, setChat] = useState<ChatDTO | null>(null)
    const [signalR, setSignalR] = useState<ChatSignalRService | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    useEffect(() => {
        if (!user) return
        const token = localStorage.getItem('token') || ''
        const chatApi = async () => {
            // 1. Fetch chat by userId using /api/chats/mychat endpoint
            const chatRes = await fetch(`${API}/api/chats/mychat`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            let myChat: ChatDTO | null = null
            if (chatRes.ok) {
                myChat = await chatRes.json()
            }
            if (!myChat) {
                //2. Create new chat if none exists
                const res = await fetch(`${API}/api/chats`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ subject: 'Customer Chat', priority: 'Low' })
                })
                myChat = await res.json()
            }
            if (!myChat) return
            setChat(myChat)
            //3. Fetch messages for this chat
            const msgRes = await fetch(`${API}/api/chats/${myChat.chatId}/messages`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const msgs: ChatMessageDTO[] = await msgRes.json()
            setMessages(msgs)
            //4. Setup SignalR
            const s = new ChatSignalRService(token)
            await s.start()
            await s.joinChat(myChat.chatId)
            s.onReceiveMessage((msg: ChatMessageDTO) => setMessages(prev => [...prev, msg]))
            setSignalR(s)
        }
        chatApi()
        // Cleanup
        return () => { signalR?.connection?.stop() }
    }, [user])

    const handleSendMessage = async () => {
        if (!message.trim() || !chat || !signalR) return
        await signalR.sendMessage(chat.chatId, message.trim())
        setMessage('')
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const chatPlaceholder = user ? `Hi ${(user.fullName?.split(' ')[0]) || 'User'}, type your message...` : "Type your message..."

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.map((msg) => (
                    <div
                        key={msg.chatMessageId}
                        className={`flex ${msg.senderId === user?.userId ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className="flex items-start space-x-2 max-w-[85%]">
                            {msg.senderId !== user?.userId && (
                                <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                                    <User className="w-3 h-3" />
                                </div>
                            )}
                            <div>
                                <div
                                    className={`p-2 rounded-lg text-sm ${msg.senderId === user?.userId
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {format(new Date(msg.timestamp), 'HH:mm')}
                                </p>
                            </div>
                            {msg.senderId === user?.userId && (
                                <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                                    <User className="w-3 h-3" />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-3 border-t">
                <div className="flex space-x-2">
                    <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={chatPlaceholder}
                        className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!message.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex justify-between mt-1">
                    <Button variant="link" size="sm" className="px-0 text-xs" onClick={onBack}>
                        ? Change your chat partner
                    </Button>
                </div>
            </div>
        </div>
    )
}
