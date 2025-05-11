'use client';

import type { User, UserRole } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  login: (role: UserRole, name?: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useLocalStorage<User | null>('studyquest-user', null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate loading user data from storage
    setIsLoading(false);
  }, []);

  const login = (role: UserRole, name: string = 'User') => {
    const userId = role === 'admin' ? 'admin001' : `user-${Date.now()}`;
    const loggedInUser: User = { id: userId, role, name: role === 'admin' ? 'Administrator' : name };
    setUser(loggedInUser);
    setIsLoading(false);
    if (role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  const logout = () => {
    setUser(null);
    router.push('/login');
  };
  
  // Effect to handle redirection if user state changes (e.g. manual localStorage clear)
  useEffect(() => {
    if (!isLoading && !user && window.location.pathname !== '/login') {
      // router.push('/login'); // Commented out to avoid hydration issues during initial render. Redirection handled by pages.
    }
  }, [user, isLoading, router]);


  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
