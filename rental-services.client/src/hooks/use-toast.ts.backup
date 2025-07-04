// src/hooks/use-toast.ts
import { useState, useCallback } from 'react'

export interface Toast {
    id: string
    title?: string
    description?: string
    variant?: 'default' | 'destructive'
}

interface ToastState {
    toasts: Toast[]
}

const initialState: ToastState = {
    toasts: [],
}

let count = 0

function genId() {
    count = (count + 1) % Number.MAX_VALUE
    return count.toString()
}

export function useToast() {
    const [state, setState] = useState<ToastState>(initialState)

    const toast = useCallback(
        ({ ...props }: Omit<Toast, 'id'>) => {
            const id = genId()

            const newToast: Toast = {
                id,
                ...props,
            }

            setState((state) => ({
                ...state,
                toasts: [newToast, ...state.toasts],
            }))

            // Auto dismiss after 5 seconds
            setTimeout(() => {
                setState((state) => ({
                    ...state,
                    toasts: state.toasts.filter((t) => t.id !== id),
                }))
            }, 5000)

            return {
                id,
                dismiss: () => {
                    setState((state) => ({
                        ...state,
                        toasts: state.toasts.filter((t) => t.id !== id),
                    }))
                },
            }
        },
        []
    )

    return {
        ...state,
        toast,
    }
}