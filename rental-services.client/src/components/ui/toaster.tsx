// src/components/ui/toaster.tsx
"use client"

import { useToast } from "../../contexts/toast-context"
import {
    Toast,
    ToastClose,
    ToastDescription,
    ToastTitle,
    ToastViewport,
} from "./toast"

export function Toaster() {
    const { toasts } = useToast()

    console.log("Toaster - Current toasts:", toasts) // Debug log
    console.log("Toaster - Number of toasts:", toasts.length) // Additional debug

    return (
        <>
            {toasts.map(({ id, title, description, variant }) => {
                console.log("Rendering toast:", { id, title, description, variant })
                return (
                    <Toast
                        key={id}
                        variant={variant}
                        duration={5000}
                        style={{
                            backgroundColor: 'red',
                            color: 'white',
                            zIndex: 99999,
                            position: 'fixed',
                            top: '20px',
                            right: '20px',
                            border: '3px solid yellow',
                            padding: '20px',
                            minWidth: '300px'
                        }}
                    >
                        <div className="grid gap-1">
                            {title && <ToastTitle>{title}</ToastTitle>}
                            {description && (
                                <ToastDescription>{description}</ToastDescription>
                            )}
                        </div>
                        <ToastClose />
                    </Toast>
                )
            })}
            <ToastViewport />
        </>
    )
}