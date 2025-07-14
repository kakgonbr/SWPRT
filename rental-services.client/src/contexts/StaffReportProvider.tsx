import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { StaffSignalRService } from '../services/staff-signalr';

const API = import.meta.env.VITE_API_BASE_URL;

const StaffReportContext = createContext<any>(null);

export function StaffReportProvider({ children }: { children: React.ReactNode }) {
    const [unresolvedCount, setUnresolvedCount] = useState(0);
    const signalRRef = useRef<StaffSignalRService | null>(null);
    const token = localStorage.getItem('token') || '';

    const fetchUnresolved = async () => {
        const res = await fetch(`${API}/api/report/unresolved`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setUnresolvedCount(data);
        }
    };

    useEffect(() => {
        if (!token) return;
        fetchUnresolved();
        const signalR = new StaffSignalRService(token);
        signalRRef.current = signalR;
        signalR.start().then(() => {
            signalR.connection.on('ReportUpdated', () => {
                fetchUnresolved();
            });
            signalR.connection.on('ReportCreated', () => {
                fetchUnresolved();
            });
        });
        return () => {
            signalR.connection.stop();
        };
    }, [token]);

    const fetchReportsPaginated = async (page: number) => {
        const res = await fetch(`${API}/api/report/paginated?page=${page}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok)
            return { success: false, message: 'Failed to fetch reports.' };
        const data = await res.json();
        return { success: true, data };
    };

    const fetchReportById = async (id: number) => {
        const res = await fetch(`${API}/api/report/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok)
            return { success: false, message: 'Failed to fetch report.' };
        const data = await res.json();
        return { success: true, data };
    };

    const updateReportStatus = async (reportDTO: any) => {
        const res = await fetch(`${API}/api/report/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(reportDTO)
        });
        if (!res.ok)
            return { success: false, message: 'Failed to update report.' };
        return { success: true };
    };

    return (
        <StaffReportContext.Provider value={{
            unresolvedCount,
            fetchUnresolved,
            fetchReportsPaginated,
            fetchReportById,
            updateReportStatus
        }}>
            {children}
        </StaffReportContext.Provider>
    );
}

export function useStaffReport() {
    return useContext(StaffReportContext);
}
