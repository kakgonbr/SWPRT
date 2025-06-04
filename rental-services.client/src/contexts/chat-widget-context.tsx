
"use client";

import type { ChatMessage } from '@/lib/types';
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

interface ChatWidgetContextType {
  isChatWidgetOpen: boolean;
  openChatWidget: (initialMessages?: ChatMessage[]) => void;
  closeChatWidget: () => void;
  setInitialMessagesForWidget: (messages: ChatMessage[]) => void;
  initialMessagesForWidget: ChatMessage[] | null;
}

const ChatWidgetContext = createContext<ChatWidgetContextType | undefined>(undefined);

export const ChatWidgetProvider = ({ children }: { children: ReactNode }) => {
  const [isChatWidgetOpen, setIsChatWidgetOpen] = useState(false);
  const [initialMessages, setInitialMessages] = useState<ChatMessage[] | null>(null);

  const openChatWidget = useCallback((messages?: ChatMessage[]) => {
    if (messages) {
      setInitialMessages(messages);
    } else {
      setInitialMessages(null); // Clear any previous initial messages if none are provided
    }
    setIsChatWidgetOpen(true);
  }, []);

  const closeChatWidget = useCallback(() => {
    setIsChatWidgetOpen(false);
    setInitialMessages(null); // Clear initial messages on close
  }, []);

  const setInitialMessagesForWidget = useCallback((messages: ChatMessage[]) => {
    setInitialMessages(messages);
  }, []);

  return (
    <ChatWidgetContext.Provider value={{ 
      isChatWidgetOpen, 
      openChatWidget, 
      closeChatWidget, 
      setInitialMessagesForWidget,
      initialMessagesForWidget: initialMessages 
    }}>
      {children}
    </ChatWidgetContext.Provider>
  );
};

export const useChatWidget = () => {
  const context = useContext(ChatWidgetContext);
  if (context === undefined) {
    throw new Error('useChatWidget must be used within a ChatWidgetProvider');
  }
  return context;
};
