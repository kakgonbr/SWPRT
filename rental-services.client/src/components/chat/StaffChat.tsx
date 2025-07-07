import { useState, useRef, useEffect } from 'react'
import type { UIEvent } from 'react'
import { Send, User } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useAuth } from '../../contexts/auth-context'
import { format } from 'date-fns'
import { useChatMessages } from '../../hooks/useChatMessages'
import type { ChatDTO } from '../../lib/types'

const API = import.meta.env.VITE_API_BASE_URL;
/*const API = "http://localhost:5000";*/

export default function StaffChat({ onBack }: { onBack: () => void }) {
    const { user } = useAuth()
    const [message, setMessage] = useState('')
    const [chat, setChat] = useState<ChatDTO | null>(null)
    const [loadingChat, setLoadingChat] = useState(true)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const messagesContainerRef = useRef<HTMLDivElement>(null)
    const loadingOlderRef = useRef(false)
    const token = localStorage.getItem('token') || ''
    const { messages, signalR, loading, hasMore, loadOlderMessages } = useChatMessages(token, chat)

    // Track previous first and last message IDs:
    //if last message changes (new messages), scroll to bottom
    //if first message changes (load older messages), not scroll
    const prevFirstMsgId = useRef<number | null>(null);
    const prevLastMsgId = useRef<number | null>(null);

    const firstLoadDone = useRef(false);

    useEffect(() => {
        if (messages.length === 0) {
            // No messages, reset
            prevFirstMsgId.current = null;
            prevLastMsgId.current = null;
            firstLoadDone.current = false;
            return;
        }

        // Scroll to bottom on FIRST LOAD
        if (!firstLoadDone.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
            firstLoadDone.current = true;
        } else {
            // Dynamic scroll for new incoming message at bottom
            const firstMsgId = messages[0].chatMessageId;
            const lastMsgId = messages[messages.length - 1].chatMessageId;
            if (
                prevLastMsgId.current !== null &&
                lastMsgId !== prevLastMsgId.current &&
                (prevFirstMsgId.current === firstMsgId || messages.length === 1)
            ) {
                // New message at the end, scroll to bottom
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
            prevFirstMsgId.current = firstMsgId;
            prevLastMsgId.current = lastMsgId;
        }
    }, [messages]);

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
            setLoadingChat(false)
        }
        chatApi()
    }, [user])

    // Infinite scroll-up handler
    const handleScroll = async (e: UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget
        if (container.scrollTop === 0 && hasMore && !loading && !loadingOlderRef.current) {
            loadingOlderRef.current = true
            const prevHeight = container.scrollHeight
            await loadOlderMessages()
            setTimeout(() => {
                if (container) {
                    container.scrollTop = container.scrollHeight - prevHeight
                }
                loadingOlderRef.current = false
            }, 0)
        }
    }

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
            <div
                className="flex-1 overflow-y-auto p-3 space-y-3"
                ref={messagesContainerRef}
                onScroll={handleScroll}
            >
                {loadingChat || loading ? (
                    <div className="text-center text-muted-foreground py-4">Loading conversation...</div>
                ) : null}
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
                                    {format(new Date(msg.sendTime), 'yyyy-MM-dd HH:mm')}
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
                        onKeyDown={handleKeyPress}
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
