import { useEffect, useState, useRef } from 'react';
import { ChatSignalRService } from '../services/chat-signalr';

const API = import.meta.env.VITE_API_BASE_URL;

export function usePendingMessages(token: string) {
    const [pendingCount, setPendingCount] = useState(0);
    const signalRRef = useRef<ChatSignalRService | null>(null);

    const fetchPending = async () => {
        const res = await fetch(`${API}/api/chats/pending`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setPendingCount(data);
        }
    };

    useEffect(() => {
        if (!token) return;
        fetchPending();
        // Setup SignalR for real-time updates
        const signalR = new ChatSignalRService(token);
        signalRRef.current = signalR;
        signalR.start().then(() => {
            signalR.connection.on("NewCustomerMessage", () => {
                fetchPending();
            });
            signalR.connection.on("ChatRead", () => {
                fetchPending();
            });
        });
        return () => {
            signalR.connection.stop();
        };
    }, [token]);

    return { pendingCount, fetchPending };
}