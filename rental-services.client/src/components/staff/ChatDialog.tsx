import { useEffect, useRef, useState } from 'react'
import type { ChatDTO } from '../../lib/types'
import { useAuth } from '../../contexts/auth-context'
import { useChatMessages } from '../../hooks/useChatMessages'
import { User, X } from 'lucide-react'

interface ChatDialogProps {
    isOpen: boolean
    onClose: () => void
    chat: ChatDTO | null
}

export default function ChatDialog({ isOpen, onClose, chat }: ChatDialogProps) {
    const { user } = useAuth()
    const token = localStorage.getItem('token') || ''
    const { messages, signalR } = useChatMessages(token, chat)
    const [reply, setReply] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async () => {
        if (!reply.trim() || !chat || !signalR) return
        await signalR.sendMessage(chat.chatId, reply.trim())
        setReply('')
    }

    if (!isOpen || !chat) return null
    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded shadow-lg w-full max-w-lg flex flex-col relative" style={{ height: 500 }}>
                <button
                    className="absolute top-2 right-2 p-1 rounded hover:bg-muted focus:outline-none"
                    onClick={onClose}
                    aria-label="Close chat dialog"
                >
                    <X className="w-5 h-5" />
                </button>
                <div className="flex items-center justify-between mb-2 p-4 border-b">
                    <div>
                        <div className="font-bold text-lg">Chat: {chat.subject}</div>
                        <div className="text-sm text-muted-foreground">Customer: {chat.userName ? chat.userName : `User #${chat.userId}`}</div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ minHeight: 0 }}>
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
                        <input
                            className="flex-1 border rounded px-2 py-1"
                            value={reply}
                            onChange={e => setReply(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
                            placeholder="Type your reply..."
                        />
                        <button className="bg-primary text-white px-3 py-1 rounded" onClick={handleSend} disabled={!reply.trim()}>Send</button>
                    </div>
                </div>
            </div>
        </div>
    )
}