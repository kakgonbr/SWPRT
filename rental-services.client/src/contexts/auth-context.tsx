
"use client";

import type { User, UserRole } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MOCK_USERS } from '@/lib/mock-data';
import { useRouter } from 'next/navigation';

interface CredentialsToUpdate {
  credentialIdNumber?: string;
  credentialIdImageUrl?: string;
}
interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (name: string, email: string, pass: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  loginWithGoogle: () => Promise<boolean>;
  updateUserCredentials: (credentials: CredentialsToUpdate) => Promise<boolean>;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('motoRentUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Ensure dates are correctly parsed
        if (parsedUser.lastLogin) parsedUser.lastLogin = new Date(parsedUser.lastLogin);
        if (parsedUser.createdAt) parsedUser.createdAt = new Date(parsedUser.createdAt);
        setUser(parsedUser);
      } catch (e) {
        console.error("Error parsing stored user:", e);
        localStorage.removeItem('motoRentUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, _pass: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    const foundUser = MOCK_USERS.find(u => u.email === email);
    if (foundUser) {
      const userToStore: User = {
        ...foundUser,
        lastLogin: new Date(),
        // Ensure createdAt is preserved if already exists, or set if missing (for older mock data)
        createdAt: foundUser.createdAt ? new Date(foundUser.createdAt) : new Date(),
      };
      setUser(userToStore);
      localStorage.setItem('motoRentUser', JSON.stringify(userToStore));
      setLoading(false);
      return true;
    }
    setLoading(false);
    return false;
  };

  const signup = async (name: string, email: string, _pass: string, role: UserRole) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let existingUser = MOCK_USERS.find(u => u.email === email);
    if (!existingUser) {
        const storedUserString = localStorage.getItem('motoRentUser');
        if (storedUserString) {
            try {
                const storedUser = JSON.parse(storedUserString);
                if (storedUser.email === email) {
                    existingUser = storedUser;
                }
            } catch (e) { /* ignore parsing error */ }
        }
    }

    if (existingUser) {
      setLoading(false);
      return false;
    }

    const newUser: User = { 
        id: `user${Date.now()}`, 
        name, 
        email, 
        role, 
        avatarUrl: 'https://placehold.co/100x100.png',
        lastLogin: new Date(),
        credentialIdNumber: undefined,
        credentialIdImageUrl: undefined,
        createdAt: new Date(), // Set createdAt on signup
    };
    setUser(newUser);
    localStorage.setItem('motoRentUser', JSON.stringify(newUser));
    // Optionally add to MOCK_USERS for current session consistency if desired
    // MOCK_USERS.push(newUser); 
    setLoading(false);
    return true;
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    const googleUserEmail = 'google.user@vroomvroom.vn';
    
    let foundUser = MOCK_USERS.find(u => u.email === googleUserEmail);
    // Check localStorage as well for this mock setup
    if (!foundUser) {
      const storedUserString = localStorage.getItem('motoRentUser');
      if (storedUserString) {
        try {
          const storedUser = JSON.parse(storedUserString);
          if (storedUser.email === googleUserEmail) foundUser = storedUser;
        } catch (e) { /* ignore */ }
      }
    }

    let userToLogin: User;
    if (foundUser) {
        userToLogin = { ...foundUser, lastLogin: new Date(), createdAt: foundUser.createdAt ? new Date(foundUser.createdAt) : new Date() };
    } else {
        userToLogin = { 
          id: `user-google-${Date.now()}`, 
          name: 'Google User', 
          email: googleUserEmail, 
          role: 'renter', 
          avatarUrl: 'https://placehold.co/100x100.png',
          credentialIdNumber: undefined,
          credentialIdImageUrl: undefined,
          createdAt: new Date(), // Set createdAt for new Google user
          lastLogin: new Date(),
        };
        // Optionally add to MOCK_USERS for current session consistency
        // MOCK_USERS.push(userToLogin);
    }
    
    setUser(userToLogin);
    localStorage.setItem('motoRentUser', JSON.stringify(userToLogin));
    setLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('motoRentUser');
    router.push('/auth/login');
  };

  const updateUserCredentials = async (credentials: CredentialsToUpdate) => {
    if (!user) return false;
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    const updatedUser = { 
      ...user, 
      ...credentials 
    };
    setUser(updatedUser);
    localStorage.setItem('motoRentUser', JSON.stringify(updatedUser));

    const userIndex = MOCK_USERS.findIndex(u => u.id === user.id);
    if (userIndex > -1) {
      MOCK_USERS[userIndex] = { ...MOCK_USERS[userIndex], ...credentials };
    }
    
    setLoading(false);
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loginWithGoogle, updateUserCredentials, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
