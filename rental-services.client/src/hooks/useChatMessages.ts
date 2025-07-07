import { useEffect, useState, useRef } from 'react';
import type { ChatDTO, ChatMessageDTO } from '../lib/types';
import { ChatSignalRService } from '../services/chat-signalr';
import {
  cacheMessages,
  getCachedMessages
} from '../utils/chatMessageCache';

const API = import.meta.env.VITE_API_BASE_URL;
/*const API = "http://localhost:5000";*/

export function useChatMessages(token: string, chat: ChatDTO | null) {
    const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
    const [signalR, setSignalR] = useState<ChatSignalRService | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const oldestLoadedRef = useRef<string | undefined>(undefined);

  // Initial load: from cache, then fetch new from backend
    useEffect(() => {
        if (!token || !chat)
            return;
        let isMounted = true;
        setLoading(true);
   
        (async () => {
            // Load latest 6 from cache
            const cached = await getCachedMessages(chat.chatId, 6);
            // Fetch new messages from backend (newer than latest in cache)
            const latest = cached.length > 0 ? cached[cached.length - 1].sendTime : undefined;
            let url = `${API}/api/chats/${chat.chatId}/messages?limit=6`;
            if (latest)
                url += `&after=${encodeURIComponent(latest)}`;
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const newMsgs: ChatMessageDTO[] = await res.json();

            if (newMsgs.length > 0) {
                await cacheMessages(chat.chatId, newMsgs);
            }

            // Combine all loaded messages (oldest first)
            let allMsgs: ChatMessageDTO[] = [];
            if (cached.length === 0 && newMsgs.length > 0) {
                // If no cache, only newMsgs exist
                allMsgs = [...newMsgs];
            } else if (cached.length > 0 && newMsgs.length > 0) {
                allMsgs = [...cached, ...newMsgs];
            } else if (cached.length > 0) {
                allMsgs = [...cached];
            }

            if (isMounted) {
                setMessages(allMsgs);
                // Set oldestLoadedRef.current to the oldest message's sendTime (if any messages exist)
                if (allMsgs.length > 0) {
                    oldestLoadedRef.current = allMsgs[0].sendTime;
                } else {
                    oldestLoadedRef.current = undefined;
                }
                setHasMore(true); // always true for now
            }
            setLoading(false);
        })();

        // Setup SignalR
        const s = new ChatSignalRService(token);
        s.start().then(() => {
            s.joinChat(chat.chatId);
            s.onReceiveMessage(async (msg: ChatMessageDTO) => {
                await cacheMessages(chat.chatId, [msg]);
                setMessages(prev => [...prev, msg]);
            });
        });
        setSignalR(s);

        return () => {
            isMounted = false;
            s.connection.stop();
            setSignalR(null);
            setMessages([]);
            setLoading(false);
        };
    }, [token, chat]);

  // Load older messages (pagination)
    const loadOlderMessages = async () => {
        if (!chat || !oldestLoadedRef.current)
            return;
        const cached = await getCachedMessages(chat.chatId, 6, oldestLoadedRef.current);
        if (cached.length > 0) {
            setMessages(prev => [...cached, ...prev]);
            oldestLoadedRef.current = cached[0].sendTime;
            setHasMore(true); 
        }
        else {
            // Fetch from backend if cache runs out
            const url = `${API}/api/chats/${chat.chatId}/messages?limit=6&before=${encodeURIComponent(oldestLoadedRef.current)}`;
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const oldMsgs: ChatMessageDTO[] = await res.json();
            if (oldMsgs.length > 0) {
                await cacheMessages(chat.chatId, oldMsgs);
                setMessages(prev => [...oldMsgs, ...prev]);
                oldestLoadedRef.current = oldMsgs[0].sendTime;
                setHasMore(true); 
            }
            else {
                setHasMore(true); 
            }
        }
    };

    return { messages, signalR, loading, hasMore, loadOlderMessages };
}
