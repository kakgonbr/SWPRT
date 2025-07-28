import { useEffect, useState } from 'react';
import type { AIChatMessageDTO } from '../lib/types';
import { cacheMessages, getCachedMessages } from '../utils/aiChatMessageCache';

const API = import.meta.env.VITE_API_BASE_URL;

export function useAIChatMessages(token: string, userId: number | null) {
    const [messages, setMessages] = useState<AIChatMessageDTO[]>([]);
    const [loading, setLoading] = useState(true);

    // Load messages from IndexedDB on mount or when userId changes
    useEffect(() => {
        if (!userId) {
            setMessages([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        (async () => {
            const cached = await getCachedMessages(userId);
            setMessages(cached);
            setLoading(false);
        })();
    }, [userId]);

    // Send a message to the AI and update state/cache
    const sendMessage = async (content: string) => {
        if (!userId || !content.trim()) return;
        // 1. Determine the next aiChatMessageId
        let nextId = 0;
        if (messages.length > 0) {
            nextId = messages[messages.length - 1].aiChatMessageId + 1;
        }
        // 2. Cache and display user's message
        const userMsg: AIChatMessageDTO = {
            aiChatMessageId: nextId,
            userId,
            isHuman: true,
            content: content.trim(),
        };
        await cacheMessages(userId, [userMsg]);
        setMessages(prev => [...prev, userMsg]);

        // 3. Call API to get AI response
        const res = await fetch(`${API}/api/chats/aichat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(userMsg),
        });
        if (res.ok) {
            const aiMsg: AIChatMessageDTO = await res.json();
            // The backend assigns aiChatMessageId = userMsg.aiChatMessageId + 1
            await cacheMessages(userId, [aiMsg]);
            setMessages(prev => [...prev, aiMsg]);
        } else {
            // Optionally handle error (e.g., show error message)
        }
    };

    return { messages, loading, sendMessage };
}
