// context/ServerInfoContext.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom'; // 1. Import useLocation
import type { ServerInfo } from '../lib/types';

const API = import.meta.env.VITE_API_BASE_URL;

type ServerInfoContextType = {
    serverInfo: ServerInfo | null;
    loading: boolean;
    error: string | null;
};

const ServerInfoContext = createContext<ServerInfoContextType | undefined>(undefined);

export const useServerInfo = () => {
    const context = useContext(ServerInfoContext);
    if (!context) {
        throw new Error('useServerInfo must be used within a ServerInfoProvider');
    }
    return context;
};

export function ServerInfoProvider({ children }: { children: ReactNode }) {
    const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const location = useLocation(); // 2. Call useLocation

    useEffect(() => {
        setLoading(true);
        setError(null);

        fetch(`${API}/api/serverinfo`)
            .then(res => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then(data => {
                setServerInfo(data as ServerInfo);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [location.pathname]); // 3. Add location.pathname to dependencies

    return (
        <ServerInfoContext.Provider value={{ serverInfo, loading, error }}>
            {children}
        </ServerInfoContext.Provider>
    );
}
