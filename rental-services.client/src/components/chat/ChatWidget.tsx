import { useState } from 'react'
import {
    X,
    Bot,
    User,
    Minimize2,
    Maximize2
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { useChatWidget } from '../../contexts/chat-widget-context'
import { useIsMobile } from '../../hooks/use-mobile'
import AIChat from './AIChat'
import StaffChat from './StaffChat'

export type ChatMode = 'ai' | 'staff' | null

export default function ChatWidget() {
    const { isOpen, closeChatWidget } = useChatWidget()
    const isMobile = useIsMobile()
    const [isMinimized, setIsMinimized] = useState(false)
    const [chatMode, setChatMode] = useState<ChatMode>(null)

    if (!isOpen) return null

    // Make the widget bigger for easier use
    const widgetWidth = isMobile ? 'w-full max-w-md' : 'w-[28rem]'
    const widgetHeight = isMinimized ? 'h-16' : (isMobile ? 'h-[90vh]' : 'h-[34rem]')
    const widgetPosition = isMobile ? 'bottom-4 left-4 right-4' : 'bottom-6 right-6'

    // Card title based on chat mode
    let cardTitle = 'VroomBot';
    let cardSubtitle = 'Online now';
    let cardIcon = <Bot className="w-4 h-4 text-primary" />;
    if (chatMode === 'staff') {
        cardTitle = 'Staff Support';
        cardSubtitle = 'A staff member will assist you';
        cardIcon = <User className="w-4 h-4 text-primary" />;
    }

    return (
        <div className={`fixed ${widgetPosition} z-50`}>
            <Card className={`${widgetWidth} ${widgetHeight} shadow-2xl transition-all duration-300`}>
                <CardHeader className="p-3 bg-primary text-primary-foreground">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-primary-foreground rounded-full flex items-center justify-center">
                                {cardIcon}
                            </div>
                            <div>
                                <CardTitle className="text-sm">{cardTitle}</CardTitle>
                                <p className="text-xs opacity-80">{cardSubtitle}</p>
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
                    <CardContent className={`p-0 flex flex-col ${isMobile ? 'h-[calc(90vh-4rem)]' : 'h-[30rem]'}`}>
                        {/* Chat Mode Selection */}
                        {chatMode === null && (
                            <div className="flex flex-col items-center justify-center h-full gap-4">
                                <p className="text-base font-medium">Who would you like to chat with?</p>
                                <div className="flex gap-4">
                                    <Button variant="default" onClick={() => setChatMode('ai')}>
                                        <Bot className="w-4 h-4 mr-2" /> AI bot
                                    </Button>
                                    <Button variant="secondary" onClick={() => setChatMode('staff')}>
                                        <User className="w-4 h-4 mr-2" /> Staff
                                    </Button>
                                </div>
                            </div>
                        )}
                        {chatMode === 'ai' && <AIChat onBack={() => setChatMode(null)} />}
                        {chatMode === 'staff' && <StaffChat onBack={() => setChatMode(null)} />}
                    </CardContent>
                )}
            </Card>
        </div>
    )
}