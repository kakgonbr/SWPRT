"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'

export interface Toast {
    id: string
    title?: string
    description?: string
    variant?: 'default' | 'destructive'
}

interface ToastContextType {
    toasts: Toast[]
    toast: (props: Omit<Toast, 'id'>) => { id: string; dismiss: () => void }
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

let count = 0

function genId() {
    count = (count + 1) % Number.MAX_VALUE
    return count.toString()
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    console.log("ToastProvider - Current toasts state:", toasts) // Debug log

    const toast = useCallback(({ ...props }: Omit<Toast, 'id'>) => {
        const id = genId()

        const newToast: Toast = {
            id,
            ...props,
        }

        console.log("ToastProvider - Adding new toast:", newToast) // Debug log

        setToasts((prev) => {
            console.log("ToastProvider - Previous toasts:", prev) // Debug log
            const newToasts = [newToast, ...prev]
            console.log("ToastProvider - New toasts array:", newToasts) // Debug log
            return newToasts
        })

        // Auto dismiss after 5 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 5000)

        return {
            id,
            dismiss: () => {
                setToasts((prev) => prev.filter((t) => t.id !== id))
            },
        }
    }, [])

    return (
        <ToastContext.Provider value={{ toasts, toast }}>
            {children}
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}