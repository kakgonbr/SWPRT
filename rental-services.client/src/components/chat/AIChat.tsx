import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useAuth } from '../../contexts/auth-context'
import { useAIChatMessages } from '../../hooks/useAIChatMessages'

export default function AIChat({ onBack }: { onBack: () => void }) {
    const { user } = useAuth()
    const [message, setMessage] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const token = localStorage.getItem('token') || ''
    const userId = user?.userId ?? null
    const { messages, loading, sendMessage } = useAIChatMessages(token, userId)
    const [sending, setSending] = useState(false)

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSendMessage = async () => {
        if (!message.trim() || !userId) return
        setSending(true)
        await sendMessage(message)
        setMessage('')
        setSending(false)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const chatPlaceholder = user ? `Hi ${user.fullName.split(' ')[0]}, ask me anything...` : "Ask me anything..."

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {loading ? (
                    <div className="text-center text-muted-foreground py-4">Loading conversation...</div>
                ) : null}
                {messages.map((msg) => (
                    <div
                        key={msg.aiChatMessageId}
                        className={`flex ${msg.isHuman ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className="flex items-start space-x-2 max-w-[85%]">
                            {!msg.isHuman && (
                                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-3 h-3 text-primary-foreground" />
                                </div>
                            )}
                            <div>
                                <div
                                    className={`p-2 rounded-lg text-sm ${msg.isHuman
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {/* No timestamp in AIChatMessageDTO, so we could use aiChatMessageId as a fallback */}
                                </p>
                            </div>
                            {msg.isHuman && (
                                <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                                    <User className="w-3 h-3" />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {sending && (
                    <div className="flex justify-start">
                        <div className="flex items-start space-x-2">
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                <Bot className="w-3 h-3 text-primary-foreground" />
                            </div>
                            <div className="bg-muted p-2 rounded-lg">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
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
                        disabled={loading || sending}
                    />
                    <Button onClick={handleSendMessage} disabled={!message.trim() || loading || sending}>
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
