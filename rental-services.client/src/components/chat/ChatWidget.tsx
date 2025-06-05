// src/components/chat/ChatWidget.tsx
import { useState, useRef, useEffect } from 'react'
import {
    //@ts-ignore
    MessageSquare,
    X,
    Send,
    Bot,
    User,
    Minimize2,
    Maximize2
} from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { useChatWidget } from '../../contexts/chat-widget-context'
import { useAuth } from '../../contexts/auth-context'
import { useIsMobile } from '../../hooks/use-mobile'
import { format } from 'date-fns'

interface ChatMessage {
    id: string
    content: string
    sender: 'user' | 'bot'
    timestamp: Date
}

const CHAT_RESPONSES = [
    "Hello! I'm VroomBot, your virtual assistant. How can I help you today?",
    "I can help you with bike rentals, location information, pricing, and general questions about our services.",
    "For urgent matters, please call our 24/7 hotline: +84 123 456 789",
    "Would you like me to help you find the perfect bike for your trip?",
    "Our most popular bikes are the Honda Winner X and Yamaha Exciter. Both are great for city and highway riding.",
    "We have locations in Ho Chi Minh City, Hanoi, Da Nang, Hoi An, and Nha Trang.",
    "You can pick up and drop off bikes at any of our locations during business hours.",
    "Our rental rates start from $15/day for scooters and $25/day for motorcycles.",
    "All rentals include basic insurance. Additional coverage is available for $5/day.",
    "Is there anything specific about our bikes or services you'd like to know?"
]

export default function ChatWidget() {
    const { isOpen, closeChatWidget } = useChatWidget()
    const { user } = useAuth()
    const isMobile = useIsMobile()
    const [isMinimized, setIsMinimized] = useState(false)
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            content: "Hello! I'm VroomBot, your virtual assistant. How can I help you today?",
            sender: 'bot',
            timestamp: new Date()
        }
    ])
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSendMessage = async () => {
        if (!message.trim()) return

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            content: message.trim(),
            sender: 'user',
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setMessage('')
        setIsTyping(true)

        setTimeout(() => {
            const randomResponse = CHAT_RESPONSES[Math.floor(Math.random() * CHAT_RESPONSES.length)]
            const botMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                content: randomResponse,
                sender: 'bot',
                timestamp: new Date()
            }

            setMessages(prev => [...prev, botMessage])
            setIsTyping(false)
        }, 1000 + Math.random() * 2000)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    if (!isOpen) return null

    const widgetWidth = isMobile ? 'w-full max-w-sm' : 'w-80'
    const widgetHeight = isMinimized ? 'h-14' : (isMobile ? 'h-[85vh]' : 'h-96')
    const widgetPosition = isMobile ? 'bottom-4 left-4 right-4' : 'bottom-4 right-4'

    return (
        <div className={`fixed ${widgetPosition} z-50`}>
            <Card className={`${widgetWidth} ${widgetHeight} shadow-2xl transition-all duration-300`}>
                <CardHeader className="p-3 bg-primary text-primary-foreground">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-primary-foreground rounded-full flex items-center justify-center">
                                <Bot className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-sm">VroomBot</CardTitle>
                                <p className="text-xs opacity-80">Online now</p>
                            </div>
                        </div>
                        <div className="flex space-x-1">
                            {!isMobile && (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
                                    onClick={() => setIsMinimized(!isMinimized)}
                                >
                                    {isMinimized ? (
                                        <Maximize2 className="h-3 w-3" />
                                    ) : (
                                        <Minimize2 className="h-3 w-3" />
                                    )}
                                </Button>
                            )}
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
                                onClick={closeChatWidget}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                {!isMinimized && (
                    <CardContent className={`p-0 flex flex-col ${isMobile ? 'h-[calc(85vh-4rem)]' : 'h-80'}`}>
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-3">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className="flex items-start space-x-2 max-w-[85%]">
                                        {msg.sender === 'bot' && (
                                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                                                <Bot className="w-3 h-3 text-primary-foreground" />
                                            </div>
                                        )}
                                        <div>
                                            <div
                                                className={`p-2 rounded-lg text-sm ${msg.sender === 'user'
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted'
                                                    }`}
                                            >
                                                {msg.content}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {format(msg.timestamp, 'HH:mm')}
                                            </p>
                                        </div>
                                        {msg.sender === 'user' && (
                                            <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                                                <User className="w-3 h-3" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
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

                        {/* Input */}
                        <div className="p-3 border-t">
                            <div className="flex space-x-2">
                                <Input
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder={user ? `Hi ${user.name.split(' ')[0]}, ask me anything...` : "Ask me anything..."}
                                    className="flex-1"
                                // size={isMobile ? "sm" : "default"}
                                />
                                <Button size={isMobile ? "sm" : "icon"} onClick={handleSendMessage} disabled={!message.trim()}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                            {!isMobile && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Press Enter to send • For urgent matters call +84 123 456 789
                                </p>
                            )}
                        </div>
                    </CardContent>
                )}
            </Card>
        </div>
    )
}