// src/contexts/auth-context.tsx

//@ts-ignore
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '../lib/types'
const API = import.meta.env.VITE_API_BASE_URL;

interface AuthContextType {
    user: User | null,
    isAuthenticated: boolean,
    login: (data: LoginRequest) => Promise<LoginResponse>,
    logout: () => void,
    register: (data: SignupRequest) => Promise<any>,
    loading: boolean,
}

export interface LoginRequest {
    email: string,
    password: string
}
interface LoginResponse {
    AccessToken: string,
    ExpiresAt: Date,
    User: User
}

export interface SignupRequest {
    email: string,
    password: string,
    phone: string,
    name: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check for stored user on app start
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
        setLoading(false)
    }, [])
    //@ts-ignore
    const login = async (data: LoginRequest): Promise<LoginResponse> => {
        const response = await fetch(`${API}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error('Login failed: ' + response.statusText);
        }
        return response.json();
    }

    const register = async (data: SignupRequest) => {
        const response = await fetch(`${API}/api/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error('Sign up failed: ' + error.Message);
        }
        return response.json();
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('user')
    }

    const value = {
        user,
        isAuthenticated: !!user,
        login,
        logout,
        register,
        loading,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}