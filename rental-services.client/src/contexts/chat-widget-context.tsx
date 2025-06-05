// src/contexts/chat-widget-context.tsx
//@ts-ignore
import React, { createContext, useContext, useState, type ReactNode } from 'react'

interface ChatWidgetContextType {
    isOpen: boolean
    openChatWidget: () => void
    closeChatWidget: () => void
    toggleChatWidget: () => void
}

const ChatWidgetContext = createContext<ChatWidgetContextType | undefined>(undefined)

export function ChatWidgetProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)

    const openChatWidget = () => setIsOpen(true)
    const closeChatWidget = () => setIsOpen(false)
    const toggleChatWidget = () => setIsOpen(!isOpen)

    const value = {
        isOpen,
        openChatWidget,
        closeChatWidget,
        toggleChatWidget,
    }

    return (
        <ChatWidgetContext.Provider value={value}>
            {children}
        </ChatWidgetContext.Provider>
    )
}

export function useChatWidget() {
    const context = useContext(ChatWidgetContext)
    if (context === undefined) {
        throw new Error('useChatWidget must be used within a ChatWidgetProvider')
    }
    return context
}