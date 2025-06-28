import { useEffect, useState } from 'react'
import type { ChatDTO, ChatMessageDTO } from '../lib/types'
import { ChatSignalRService } from '../services/chat-signalr'

const API = import.meta.env.VITE_API_BASE_URL;
/*const API = "http://localhost:5000";*/

export function useChatMessages(token: string, chat: ChatDTO | null) {
  const [messages, setMessages] = useState<ChatMessageDTO[]>([])
  const [signalR, setSignalR] = useState<ChatSignalRService | null>(null)

  useEffect(() => {
    if (!token || !chat) return;

    let isMounted = true;
    let s: ChatSignalRService | null = null;

    // Fetch messages
    fetch(`${API}/api/chats/${chat.chatId}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(msgs => { if (isMounted) setMessages(msgs); });

    // Setup SignalR
    s = new ChatSignalRService(token);
    s.start().then(() => {
      s!.joinChat(chat.chatId);
      s!.onReceiveMessage((msg: ChatMessageDTO) => {
        if (isMounted) setMessages(prev => [...prev, msg]);
      });
    });
    setSignalR(s);

    return () => {
      isMounted = false;
      s?.connection?.stop();
      setSignalR(null);
      setMessages([]); // Clear messages when switching chats
    };
  }, [token, chat]);

  return { messages, signalR }
}
