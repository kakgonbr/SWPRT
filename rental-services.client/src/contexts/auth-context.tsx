// src/contexts/auth-context.tsx
//@ts-ignore
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { MOCK_USERS } from '../lib/mock-data'
import type { User } from '../lib/types'

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    login: (email: string, password: string) => Promise<boolean>
    logout: () => void
    register: (userData: RegisterData) => Promise<boolean>
    loading: boolean
}

interface RegisterData {
    name: string
    email: string
    password: string
    dateOfBirth: string
    address: string
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
    const login = async (email: string, password: string): Promise<boolean> => {
        // Mock login - in real app this would be an API call
        const foundUser = MOCK_USERS.find(u => u.email === email)

        if (foundUser) {
            // For demo purposes, any password works
            const userWithoutSensitiveData = { ...foundUser }
            setUser(userWithoutSensitiveData)
            localStorage.setItem('user', JSON.stringify(userWithoutSensitiveData))
            return true
        }

        return false
    }

    const register = async (userData: RegisterData): Promise<boolean> => {
        // Mock registration - in real app this would be an API call
        const newUser: User = {
            id: `user${Date.now()}`,
            email: userData.email,
            name: userData.name,
            role: 'renter',
            avatarUrl: 'https://placehold.co/100x100.png',
            lastLogin: new Date(),
            feedbackCount: 0,
            dateOfBirth: userData.dateOfBirth,
            address: userData.address,
            credentialIdNumber: '',
            credentialIdImageUrl: undefined,
            createdAt: new Date(),
            status: true
        }

        setUser(newUser)
        localStorage.setItem('user', JSON.stringify(newUser))
        return true
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